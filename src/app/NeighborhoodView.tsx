import React, { useEffect, useState } from 'react';
import { StampRecord } from '../content/types';
import { getAllStamps } from '../storage/db';
import { ArrowLeft, ShoppingBag, Coffee, Train, Trees, Sparkles } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const NeighborhoodView: React.FC<Props> = ({ onBack }) => {
  const [stamps, setStamps] = useState<StampRecord[]>([]);

  useEffect(() => {
    getAllStamps().then(s => setStamps(s));
  }, []);

  const stampCountMap = new Map<string, number>(stamps.map(s => [s.id, s.count]));

  const locations = [
    {
      id: 'market',
      name: 'El Mercado',
      desc: 'Fresh fruit stalls and bakeries of Madrid.',
      icon: <ShoppingBag className="w-6 h-6 text-mustard-600" />,
      color: 'bg-mustard-100',
      badgeColor: 'bg-mustard-500 text-white',
    },
    {
      id: 'cafe',
      name: 'El Café de la Esquina',
      desc: 'A buzzing terrace with café con leche and churros.',
      icon: <Coffee className="w-6 h-6 text-terracotta-600" />,
      color: 'bg-terracotta-100',
      badgeColor: 'bg-terracotta-500 text-white',
    },
    {
      id: 'station',
      name: 'La Estación de Tren',
      desc: 'Connecting neighborhoods and morning commuters.',
      icon: <Train className="w-6 h-6 text-teal-600" />,
      color: 'bg-teal-100',
      badgeColor: 'bg-teal-500 text-white',
    },
    {
      id: 'park',
      name: 'El Parque del Retiro',
      desc: 'Shady benches for conversations and daydreaming.',
      icon: <Trees className="w-6 h-6 text-olive-600" />,
      color: 'bg-olive-100',
      badgeColor: 'bg-olive-600 text-white',
    },
  ];

  const totalStamps = stamps.reduce((acc, s) => acc + s.count, 0);

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
        <span className="text-xs font-bold text-mustard-600 uppercase tracking-wide">
          Collection
        </span>
      </div>

      <div>
        <h2 className="text-2xl font-serif text-ink-900 font-bold">
          El Barrio (Your Pocket Town)
        </h2>
        <p className="text-xs text-ink-500 mt-1">
          Every completed session earns a stamp for your neighborhood map.
        </p>
      </div>

      {/* Town Banner */}
      <div className="bg-white rounded-3xl p-5 border border-cream-300 shadow-sm text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-200 text-ink-800 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-mustard-500" />
          {totalStamps} stamps collected
        </div>
        <p className="text-xs text-ink-600">
          Stamps are a light souvenir of time spent with Spanish. Relax and enjoy the journey!
        </p>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {locations.map(loc => {
          const count = stampCountMap.get(loc.id) || 0;
          const isUnlocked = count > 0;

          return (
            <div
              key={loc.id}
              className={`p-4 rounded-3xl border transition-all ${
                isUnlocked
                  ? 'bg-white border-cream-300 shadow-sm'
                  : 'bg-cream-100/70 border-dashed border-cream-300 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className={`w-12 h-12 rounded-2xl ${loc.color} flex items-center justify-center`}>
                  {loc.icon}
                </div>
                {count > 0 ? (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${loc.badgeColor}`}>
                    ×{count}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase text-ink-400 bg-cream-200 px-2 py-0.5 rounded">
                    Empty
                  </span>
                )}
              </div>

              <h4 className="font-bold text-sm text-ink-900 mt-1">
                {loc.name}
              </h4>
              <p className="text-xs text-ink-500 mt-0.5">
                {loc.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
