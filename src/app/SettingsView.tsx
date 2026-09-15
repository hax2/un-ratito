import React, { useEffect, useState, useRef } from 'react';
import {
  clearAllLearnerData,
  exportLearnerData,
  getSettings,
  importLearnerData,
  saveSettings,
} from '../storage/db';
import { audioService } from '../audio/audioService';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const SettingsView: React.FC<Props> = ({ onBack }) => {
  const [soundEnabled, setSoundEnabled] = useState(audioService.isSoundEnabled());
  const [speechRate, setSpeechRate] = useState(audioService.getSpeechRate());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSettings().then(cfg => {
      setSoundEnabled(cfg.soundEnabled);
      setSpeechRate(cfg.speechRate);
    });
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioService.setSoundEnabled(next);
    saveSettings({ soundEnabled: next });
    if (next) audioService.playTap();
  };

  const handleRateChange = (rate: number) => {
    setSpeechRate(rate);
    audioService.setSpeechRate(rate);
    saveSettings({ speechRate: rate });
  };

  const handleExport = async () => {
    try {
      const json = await exportLearnerData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `un-ratito-progress-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Backup file exported successfully!' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to export backup.' });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const success = await importLearnerData(text);
      if (success) {
        setMessage({ type: 'success', text: 'Progress restored successfully from file!' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: 'error', text: 'Invalid backup file format.' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to read file.' });
    }
  };

  const handleClear = async () => {
    const confirmed = window.confirm('Are you sure you want to clear all progress and stamps?');
    if (confirmed) {
      await clearAllLearnerData();
      setMessage({ type: 'success', text: 'All progress reset. Reloading...' });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm font-semibold text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Arcade
        </button>
        <span className="text-xs font-bold text-ink-500 uppercase tracking-wide">
          Settings
        </span>
      </div>

      <h2 className="text-2xl font-serif text-ink-900 font-bold">
        Preferences & Storage
      </h2>

      {message && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-teal-50 text-teal-800 border border-teal-200'
              : 'bg-terracotta-50 text-terracotta-800 border border-terracotta-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-terracotta-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Audio Settings */}
      <div className="bg-white rounded-3xl p-5 border border-cream-300 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider">
          Audio & Speech (Spain Spanish)
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-ink-900">Sound & Effects</p>
            <p className="text-xs text-ink-500">Enable spoken clips and feedback chimes</p>
          </div>
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-3 rounded-2xl transition-colors ${
              soundEnabled ? 'bg-teal-500 text-white' : 'bg-cream-200 text-ink-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-ink-700 mb-1">
            <span>Speech Playback Speed</span>
            <span>{Math.round(speechRate * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.6"
            max="1.1"
            step="0.05"
            value={speechRate}
            onChange={e => handleRateChange(parseFloat(e.target.value))}
            className="w-full accent-teal-500"
          />
        </div>
      </div>

      {/* Storage & Backup */}
      <div className="bg-white rounded-3xl p-5 border border-cream-300 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider">
          Backup & Privacy
        </h3>
        <p className="text-xs text-ink-600">
          All your learning progress and collected stamps are stored locally on this device in IndexedDB.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex-1 min-h-[48px] px-4 py-2.5 rounded-2xl bg-cream-100 hover:bg-cream-200 text-ink-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export JSON Backup
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 min-h-[48px] px-4 py-2.5 rounded-2xl bg-cream-100 hover:bg-cream-200 text-ink-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import Backup
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />
        </div>

        <div className="pt-2 border-t border-cream-200">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-terracotta-600 hover:text-terracotta-800 font-semibold flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset all local progress
          </button>
        </div>
      </div>

      {/* About Box */}
      <div className="p-4 rounded-2xl bg-cream-100 text-xs text-ink-600 space-y-1.5 border border-cream-200">
        <div className="flex items-center gap-1.5 font-bold text-ink-800">
          <Info className="w-4 h-4 text-teal-600" />
          <span>About Un Ratito</span>
        </div>
        <p>
          Designed for quick, satisfying Spanish practice in spare moments. Teaches European Spanish (Castilian) with authentic vocabulary, vosotros forms, and nuanced grammar distinctions.
        </p>
      </div>
    </div>
  );
};
