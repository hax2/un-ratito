import React from 'react';
import { X, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { audioService } from '../audio/audioService';

interface Props {
  onClose: () => void;
}

export const CurriculumRoadmapModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-ink-950/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-cream-50 w-full max-w-lg rounded-3xl border-2 border-cream-300 shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-white border-b border-cream-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-ink-900 leading-tight">
                Plan de Estudios y Hoja de Ruta
              </h3>
              <p className="text-[11px] text-ink-500">
                Madrid Peninsular Spanish Syllabus (A1–C1)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              audioService.playTap();
              onClose();
            }}
            className="p-2 rounded-xl text-ink-400 hover:text-ink-900 hover:bg-cream-100 transition-colors"
            aria-label="Cerrar hoja de ruta"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Syllabus Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-left">
          {/* Level 1: El Barrio y la Barra (A1-A2) */}
          <div className="bg-white rounded-2xl p-3.5 border border-cream-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 uppercase tracking-wide">
                Nivel 1 • A1–A2
              </span>
              <span className="text-[11px] font-bold text-teal-600 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Disponible
              </span>
            </div>
            <h4 className="font-serif font-bold text-base text-ink-900">
              El Barrio y la Barra (La Vida Diaria)
            </h4>
            <p className="text-xs text-ink-600 leading-relaxed">
              Fórmulas directas de barra (<em>«¡Ponme un café!»</em>, <em>«¿Me pones un cortado?»</em>), medidas de mercado (<em>«Medio kilo de...»</em>, <em>«Un cuarto de queso»</em>), y pedir la cuenta (<em>«¿Me cobras, por favor?»</em>).
            </p>
            <div className="text-[11px] bg-cream-50 p-2 rounded-xl border border-cream-200 space-y-1 font-mono text-ink-700">
              <p>• Capítulo A: Pedir con naturalidad (Barista & Mercado)</p>
              <p>• Motores: Barista de Barrio, Mercado Rush, Tapeo Frenzy</p>
            </div>
          </div>

          {/* Level 2: El Tapeo y las Anécdotas (B1) */}
          <div className="bg-white rounded-2xl p-3.5 border border-cream-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 uppercase tracking-wide">
                Nivel 2 • B1
              </span>
              <span className="text-[11px] font-bold text-teal-600 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Disponible
              </span>
            </div>
            <h4 className="font-serif font-bold text-base text-ink-900">
              El Tapeo y las Anécdotas (Pasado Continuo)
            </h4>
            <p className="text-xs text-ink-600 leading-relaxed">
              Salir de cañas y raciones (<em>«¡Marchando unas bravas!»</em>, <em>«Vamos a pachas»</em>), narrar sucesos de fondo interrumpidos (<em>«Estaba saliendo cuando llamaste»</em>) y planes con amigos (<em>«¿Te hace unas cañas?»</em>).
            </p>
            <div className="text-[11px] bg-cream-50 p-2 rounded-xl border border-cream-200 space-y-1 font-mono text-ink-700">
              <p>• Capítulo B: ¿Qué estaba pasando? (Anécdotas e interrupciones)</p>
              <p>• Motores: Metro Sprint, Aventuras en Madrid, Radio Retiro</p>
            </div>
          </div>

          {/* Level 3: Hipótesis, Debate e Ironía (B2-C1) */}
          <div className="bg-white rounded-2xl p-3.5 border border-cream-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-terracotta-100 text-terracotta-900 uppercase tracking-wide">
                Nivel 3 • B2–C1
              </span>
              <span className="text-[11px] font-bold text-teal-600 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Disponible
              </span>
            </div>
            <h4 className="font-serif font-bold text-base text-ink-900">
              Hipótesis, Modismos e Ironía Madrileña
            </h4>
            <p className="text-xs text-ink-600 leading-relaxed">
              Condicional irreal y subjuntivo (<em>«Si tuviera más pasta...»</em>, <em>«Si fuera tú...»</em>), dobles sentidos y modismos castizos (<em>«Estar hasta arriba»</em>, <em>«Costar un riñón»</em>, <em>«¡Qué va!»</em>).
            </p>
            <div className="text-[11px] bg-cream-50 p-2 rounded-xl border border-cream-200 space-y-1 font-mono text-ink-700">
              <p>• Capítulo C: Si tuviera más tiempo... (Consejos e hipótesis)</p>
              <p>• Motores: Radio Retiro, Metro Sprint, Aventuras en Madrid</p>
            </div>
          </div>

          {/* Future Expansion Chapters */}
          <div className="bg-cream-100/60 rounded-2xl p-3.5 border border-dashed border-cream-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-cream-200 text-ink-600 uppercase tracking-wide">
                Próximas Expansiones
              </span>
              <span className="text-[11px] text-ink-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> En hoja de ruta
              </span>
            </div>
            <div className="text-xs text-ink-600 space-y-1">
              <p>• <strong>Capítulo D: De Cañas por La Latina</strong> — Expresiones de fiesta, pagar a medias, pedir la última ronda.</p>
              <p>• <strong>Capítulo E: El Metro y el Transporte</strong> — Transbordos, retrasos, avisos de megafonía y direcciones callejeras.</p>
              <p>• <strong>Capítulo F: La Sobremesa y el Debate</strong> — Discusiones amables, matices de cortesía, expresiones irónicas avanzadas.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-cream-200 shrink-0 text-center">
          <button
            type="button"
            onClick={() => {
              audioService.playTap();
              onClose();
            }}
            className="w-full h-11 rounded-xl bg-ink-900 hover:bg-ink-800 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Entendido • Volver al juego
          </button>
        </div>
      </div>
    </div>
  );
};
