import { openDB, IDBPDatabase } from 'idb';
import { AttemptRecord, EvidenceType, SessionState, StampRecord, TargetProgress } from '../content/types';

const DB_NAME = 'un-ratito-db';
const DB_VERSION = 1;

export interface AppSettings {
  soundEnabled: boolean;
  selectedChapterId: string;
  supportLevel: 'supported' | 'standard' | 'stretch';
  speechRate: number; // 0.8 to 1.1
}

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  selectedChapterId: 'chapter-a',
  supportLevel: 'standard',
  speechRate: 0.9,
};

let dbPromise: Promise<IDBPDatabase> | null = null;
let inMemoryFallback = false;
const inMemoryStore = {
  progress: new Map<string, TargetProgress>(),
  attempts: new Map<string, AttemptRecord>(),
  sessions: new Map<string, SessionState>(),
  stamps: new Map<string, StampRecord>(),
  settings: new Map<string, any>(),
};

export function getDB(): Promise<IDBPDatabase | null> {
  if (inMemoryFallback || typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Target progress store: compound key 'targetId::channel'
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'key' });
        }
        // Attempts store
        if (!db.objectStoreNames.contains('attempts')) {
          const attemptStore = db.createObjectStore('attempts', { keyPath: 'attemptId' });
          attemptStore.createIndex('sessionId', 'sessionId', { unique: false });
          attemptStore.createIndex('targetId', 'targetId', { unique: false });
        }
        // Session states
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'sessionId' });
        }
        // Stamps
        if (!db.objectStoreNames.contains('stamps')) {
          db.createObjectStore('stamps', { keyPath: 'id' });
        }
        // Settings
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    }).catch(err => {
      console.warn('IndexedDB unavailable, falling back to memory store:', err);
      inMemoryFallback = true;
      return null as any;
    });
  }
  return dbPromise;
}

// -------------------------------------------------------------
// Progress operations
// -------------------------------------------------------------

function progressKey(targetId: string, channel: EvidenceType): string {
  return `${targetId}::${channel}`;
}

export async function getTargetProgress(targetId: string, channel: EvidenceType): Promise<TargetProgress | null> {
  const db = await getDB();
  const key = progressKey(targetId, channel);
  if (!db) {
    return inMemoryStore.progress.get(key) || null;
  }
  const rec = await db.get('progress', key);
  return rec ? rec.data : null;
}

export async function getAllProgress(): Promise<TargetProgress[]> {
  const db = await getDB();
  if (!db) {
    return Array.from(inMemoryStore.progress.values());
  }
  const all = await db.getAll('progress');
  return all.map(item => item.data);
}

export async function saveTargetProgress(progress: TargetProgress): Promise<void> {
  const db = await getDB();
  const key = progressKey(progress.targetId, progress.channel);
  if (!db) {
    inMemoryStore.progress.set(key, progress);
    return;
  }
  await db.put('progress', { key, data: progress });
}

// -------------------------------------------------------------
// Attempts operations
// -------------------------------------------------------------

export async function recordAttempt(attempt: AttemptRecord): Promise<void> {
  const db = await getDB();
  if (!db) {
    inMemoryStore.attempts.set(attempt.attemptId, attempt);
    return;
  }
  await db.put('attempts', attempt);
}

export async function getRecentAttempts(limit: number = 50): Promise<AttemptRecord[]> {
  const db = await getDB();
  if (!db) {
    return Array.from(inMemoryStore.attempts.values()).slice(-limit);
  }
  const all = await db.getAll('attempts');
  return all.slice(-limit);
}

// -------------------------------------------------------------
// Session state operations
// -------------------------------------------------------------

export async function saveSessionState(session: SessionState): Promise<void> {
  const db = await getDB();
  if (!db) {
    inMemoryStore.sessions.set(session.sessionId, session);
    return;
  }
  await db.put('sessions', session);
}

export async function getLatestActiveSession(): Promise<SessionState | null> {
  const db = await getDB();
  let sessions: SessionState[] = [];
  if (!db) {
    sessions = Array.from(inMemoryStore.sessions.values());
  } else {
    sessions = await db.getAll('sessions');
  }
  const active = sessions.filter(s => !s.isCompleted);
  if (active.length === 0) return null;
  active.sort((a, b) => b.startTime - a.startTime);
  return active[0];
}

export async function markSessionCompleted(sessionId: string): Promise<void> {
  const db = await getDB();
  if (!db) {
    const s = inMemoryStore.sessions.get(sessionId);
    if (s) {
      s.isCompleted = true;
      inMemoryStore.sessions.set(sessionId, s);
    }
    return;
  }
  const s: SessionState | undefined = await db.get('sessions', sessionId);
  if (s) {
    s.isCompleted = true;
    await db.put('sessions', s);
  }
}

// -------------------------------------------------------------
// Stamp operations
// -------------------------------------------------------------

export async function getAllStamps(): Promise<StampRecord[]> {
  const db = await getDB();
  if (!db) {
    return Array.from(inMemoryStore.stamps.values());
  }
  return await db.getAll('stamps');
}

export async function awardStamp(stampId: string): Promise<StampRecord> {
  const db = await getDB();
  if (!db) {
    const existing = inMemoryStore.stamps.get(stampId) || { id: stampId, unlockedAt: Date.now(), count: 0 };
    existing.count += 1;
    existing.unlockedAt = Date.now();
    inMemoryStore.stamps.set(stampId, existing);
    return existing;
  }
  const existing: StampRecord | undefined = await db.get('stamps', stampId);
  const record: StampRecord = existing
    ? { ...existing, count: existing.count + 1, unlockedAt: Date.now() }
    : { id: stampId, count: 1, unlockedAt: Date.now() };
  await db.put('stamps', record);
  return record;
}

// -------------------------------------------------------------
// Settings operations
// -------------------------------------------------------------

export async function getSettings(): Promise<AppSettings> {
  try {
    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem('un_ratito_settings');
      if (local) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(local) };
      }
    } else {
      const mem = inMemoryStore.settings.get('config');
      if (mem) {
        return { ...DEFAULT_SETTINGS, ...mem };
      }
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('un_ratito_settings', JSON.stringify(updated));
    } else {
      inMemoryStore.settings.set('config', updated);
    }
  } catch (e) {
    // storage disabled
  }
  return updated;
}

// -------------------------------------------------------------
// Export / Import / Reset
// -------------------------------------------------------------

export async function exportLearnerData(): Promise<string> {
  const progress = await getAllProgress();
  const stamps = await getAllStamps();
  const settings = await getSettings();
  const exportPayload = {
    version: 1,
    exportTimestamp: Date.now(),
    settings,
    progress,
    stamps,
  };
  return JSON.stringify(exportPayload, null, 2);
}

export async function importLearnerData(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') return false;

    if (data.settings) {
      await saveSettings(data.settings);
    }
    if (Array.isArray(data.progress)) {
      for (const p of data.progress) {
        if (p && p.targetId && p.channel) {
          await saveTargetProgress(p);
        }
      }
    }
    if (Array.isArray(data.stamps)) {
      const db = await getDB();
      for (const s of data.stamps) {
        if (s && s.id) {
          if (db) {
            await db.put('stamps', s);
          } else {
            inMemoryStore.stamps.set(s.id, s);
          }
        }
      }
    }
    return true;
  } catch (e) {
    console.error('Failed to import learner data:', e);
    return false;
  }
}

export async function clearAllLearnerData(): Promise<void> {
  const db = await getDB();
  if (db) {
    await db.clear('progress');
    await db.clear('attempts');
    await db.clear('sessions');
    await db.clear('stamps');
  }
  inMemoryStore.progress.clear();
  inMemoryStore.attempts.clear();
  inMemoryStore.sessions.clear();
  inMemoryStore.stamps.clear();
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('un_ratito_settings');
  }
}
