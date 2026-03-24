'use client';

import { motion } from 'framer-motion';

const LEVELS: { value: 1 | 2 | 3 | 4 | 5; label: string; color: string; bg: string; border: string }[] = [
  { value: 1, label: 'Mild',    color: '#4ade80', bg: 'rgba(74,222,128,0.12)',   border: 'rgba(74,222,128,0.3)'   },
  { value: 2, label: 'Warm',   color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',   border: 'rgba(96,165,250,0.3)'   },
  { value: 3, label: 'Spicy',  color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',   border: 'rgba(251,191,36,0.3)'   },
  { value: 4, label: 'Bold',   color: '#fb923c', bg: 'rgba(251,146,60,0.12)',   border: 'rgba(251,146,60,0.3)'   },
  { value: 5, label: 'Wild',   color: '#f87171', bg: 'rgba(248,113,113,0.12)',  border: 'rgba(248,113,113,0.3)'  },
];

interface SpiceLevelSliderProps {
  value: 1 | 2 | 3 | 4 | 5;
  onChange: (level: 1 | 2 | 3 | 4 | 5) => void;
}

export default function SpiceLevelSlider({ value, onChange }: SpiceLevelSliderProps) {
  const activeLevel = LEVELS.find((l) => l.value === value)!;

  return (
    <div className="space-y-3">
      {/* Active label */}
      <div className="flex items-center justify-between">
        <span
          className="text-sm font-bold px-3 py-1 rounded-full border"
          style={{ color: activeLevel.color, background: activeLevel.bg, borderColor: activeLevel.border }}
        >
          {activeLevel.label}
        </span>
        <span className="text-white/25 text-xs">{value} / 5</span>
      </div>

      {/* Button group */}
      <div className="grid grid-cols-5 gap-1.5">
        {LEVELS.map((level) => {
          const isActive = value === level.value;
          return (
            <motion.button
              key={level.value}
              whileTap={{ scale: 0.94 }}
              onClick={() => onChange(level.value)}
              className="py-3 rounded-xl text-sm font-bold border transition-all"
              style={{
                background: isActive ? level.bg : 'rgba(255,255,255,0.03)',
                borderColor: isActive ? level.border : 'rgba(255,255,255,0.07)',
                color: isActive ? level.color : 'rgba(255,255,255,0.25)',
                boxShadow: isActive ? `0 0 16px ${level.bg}` : 'none',
              }}
            >
              {level.value}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
