export type EvidenceType =
  | 'meaning-recognition'
  | 'listening-recognition'
  | 'scaffolded-production'
  | 'unaided-recall';

export type GameId =
  | 'builder'
  | 'tales'
  | 'market'
  | 'cafe'
  | 'tapeo'
  | 'listening';

export type SupportLevel = 'supported' | 'standard' | 'stretch';

export type LearnerLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Target {
  id: string;
  revision: number;
  packId: string;
  type: 'phrase' | 'construction' | 'contrast' | 'noun';
  spanish: string;
  english: string;
  locale: 'es-ES';
  register?: 'neutral-polite' | 'informal' | 'formal';
  prerequisiteIds: string[];
  tags: string[];
  explanation?: string;
  explanationEs?: string;
}

export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  band: 'Beginner' | 'Intermediate' | 'Advanced';
  grammarAliases: string[];
  goal: string;
  goalEs?: string;
  explanation: string;
  explanationEs?: string;
  examples: { spanish: string; english: string }[];
  targetIds: string[];
  supportedGames: GameId[];
}

export interface BasePrompt {
  id: string;
  revision: number;
  game: GameId;
  targetId: string;
  chapterId: string;
  evidence: EvidenceType;
  supportLevel: SupportLevel;
  explanation: string;
  explanationEs?: string;
}

// 1. Metro Sprint / Phrase Builder Prompt
export interface BuilderTile {
  id: string;
  text: string;
}

export interface BuilderPrompt extends BasePrompt {
  game: 'builder';
  intent: string;
  intentEs?: string;
  situationalContext?: string; // e.g. "Situación en la barra: Pides un cortado con hielo"
  interlocutorQuestion?: string; // e.g. "Camarero: «¿Qué te pongo, salao?»"
  tiles: BuilderTile[];
  acceptedSequences: string[][]; // tile ID sequences
  validOffTargetSequences?: { sequence: string[]; feedback: string }[];
  canonicalDisplay: string;
}

// 2. Aventuras en Madrid / Tiny Tales Prompt
export interface TaleChoice {
  id: string;
  text: string;
  isCorrect: boolean;
  isOffTarget?: boolean;
  feedback: string;
  consequence: string;
}

export interface TaleTurn {
  speaker: string;
  text: string;
  speakerRole: 'partner' | 'server' | 'friend';
  goal: string;
  goalEs?: string;
  choices: TaleChoice[];
}

export interface TalesPrompt extends BasePrompt {
  game: 'tales';
  title: string;
  setting: string;
  turns: TaleTurn[];
}

// 3. Mercado Rush Prompt
export interface MarketItem {
  id: string;
  spanish: string;
  english: string;
  gender: 'el' | 'la' | 'los' | 'las';
  icon: string;
  weightGrams?: number;
}

export interface MarketPrompt extends BasePrompt {
  game: 'market';
  instruction: string;
  instructionEs?: string;
  vendorDialogue?: string;
  correctItemId: string;
  choices: MarketItem[];
}

// 4. Barista de Barrio Prompt
export interface CafeSlot {
  drink: string;
  milk?: 'solo' | 'con leche' | 'cortado' | 'con hielo';
  quantity: number;
}

export interface CafePrompt extends BasePrompt {
  game: 'cafe';
  orderSpokenSpanish: string;
  orderEnglish: string;
  targetSlot: CafeSlot;
  customerName: string;
}

// 5. Tapeo Frenzy Prompt
export interface TapeoItem {
  id: string;
  nameEs: string;
  nameEn: string;
  icon: string;
  category: 'tapa' | 'bebida';
}

export interface TapeoPrompt extends BasePrompt {
  game: 'tapeo';
  patronName: string;
  orderSpokenSpanish: string; // e.g., "¡Marchando unas bravas y una caña!"
  orderEnglish?: string;
  requiredItemIds: string[];
  availableItems: TapeoItem[];
}

// 6. Radio Retiro Prompt
export interface ListeningPrompt extends BasePrompt {
  game: 'listening';
  clipSpanish: string;
  transcript: string;
  question: string;
  questionEs?: string;
  choices: {
    id: string;
    text: string;
    textEs?: string;
    isCorrect: boolean;
  }[];
  revealedTranscript?: boolean;
}

export type AnyPrompt =
  | BuilderPrompt
  | TalesPrompt
  | MarketPrompt
  | CafePrompt
  | TapeoPrompt
  | ListeningPrompt;

export interface AttemptRecord {
  attemptId: string;
  sessionId: string;
  promptId: string;
  targetId: string;
  game: GameId;
  requestedEvidence: EvidenceType;
  actualEvidence: EvidenceType;
  result: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target';
  answerPayload: any;
  assisted: boolean;
  timestamp: number;
  durationMs: number;
}

export interface TargetProgress {
  targetId: string;
  channel: EvidenceType;
  stage: number; // 0 to 4
  lastPracticed: number;
  nextDue: number; // epoch ms
  totalCorrect: number;
  totalAttempts: number;
}

export interface SessionState {
  sessionId: string;
  chapterId: string;
  gameId: GameId | 'mixed';
  supportLevel: SupportLevel;
  promptIds: string[];
  currentPromptIndex: number;
  attempts: AttemptRecord[];
  isCompleted: boolean;
  startTime: number;
}

export interface StampRecord {
  id: string; // 'market' | 'cafe' | 'station' | 'park'
  unlockedAt: number;
  count: number;
}
