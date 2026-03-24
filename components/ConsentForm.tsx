'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player, PlayerComfort, DareTag } from '@/lib/types';

const ALL_TAGS: DareTag[] = ['flirty', 'physical', 'alcohol', 'bold', 'embarrassing', 'creative', 'funny', 'challenge', 'social'];

interface ConsentFormProps {
  player: Player;
  onChange: (playerId: string, comfort: Partial<PlayerComfort>) => void;
}

const Toggle = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-white/80 text-sm">{label}</span>
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-neon-pink' : 'bg-white/10'}`}
    >
      <motion.div
        animate={{ x: checked ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
      />
    </motion.button>
  </div>
);

export default function ConsentForm({ player, onChange }: ConsentFormProps) {
  const [expanded, setExpanded] = useState(false);

  const updateComfort = (partial: Partial<PlayerComfort>) => {
    onChange(player.id, partial);
  };

  const toggleNoGoTag = (tag: DareTag) => {
    const current = player.comfort.customNoGoTags;
    const updated = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    updateComfort({ customNoGoTags: updated });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Header — click to expand */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-white/70 text-sm font-medium">⚙ Comfort Settings</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          className="text-white/40 text-xs"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/10">
              {/* Flirty level */}
              <div className="pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white/80 text-sm">Max flirty level</label>
                  <span className="text-neon-pink font-bold">{player.comfort.maxFlirtyLevel} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={player.comfort.maxFlirtyLevel}
                  onChange={(e) =>
                    updateComfort({ maxFlirtyLevel: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })
                  }
                  className="w-full accent-[#ff2d78] h-2 rounded-full cursor-pointer"
                />
                <div className="flex justify-between text-xs text-white/30 mt-1">
                  <span>None</span>
                  <span>Wild</span>
                </div>
              </div>

              {/* Toggles */}
              <Toggle
                label="💪 Allow physical interaction"
                checked={player.comfort.allowPhysicalInteraction}
                onChange={(v) => updateComfort({ allowPhysicalInteraction: v })}
              />
              <Toggle
                label="🍺 Allow alcohol-related dares"
                checked={player.comfort.allowAlcohol}
                onChange={(v) => updateComfort({ allowAlcohol: v })}
              />

              {/* No-go tags */}
              <div>
                <p className="text-white/60 text-xs mb-2">🚫 Topics I never want:</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map((tag) => {
                    const isBlocked = player.comfort.customNoGoTags.includes(tag);
                    return (
                      <motion.button
                        key={tag}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleNoGoTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                          isBlocked
                            ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                            : 'bg-white/5 border-white/15 text-white/50 hover:border-white/30'
                        }`}
                      >
                        {isBlocked ? '✗ ' : ''}{tag}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
