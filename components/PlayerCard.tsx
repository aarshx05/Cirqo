'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player, PlayerComfort, DareTag } from '@/lib/types';

interface PlayerCardProps {
  player: Player;
  index: number;
  onRemove: (id: string) => void;
  onComfortChange: (id: string, comfort: Partial<PlayerComfort>) => void;
}

const ALL_TAGS: DareTag[] = ['flirty', 'physical', 'alcohol', 'embarrassing'];

export default function PlayerCard({ player, index, onRemove, onComfortChange }: PlayerCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-[rgba(255,255,255,0.07)] overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #16161f 0%, #111118 100%)' }}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-full text-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]">
          {player.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{player.name}</p>
          <div className="flex gap-2 mt-0.5">
            <span className="text-[10px] text-white/30">✓ {player.stats.completed}</span>
            <span className="text-[10px] text-white/20">⏭ {player.stats.skipped}</span>
            <span className="text-[10px] text-white/20">✗ {player.stats.failed}</span>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-white/25 hover:text-[#e8b86d] transition-colors text-xs font-medium px-2"
        >
          {expanded ? 'Done' : 'Limits'}
        </button>
        <button
          onClick={() => onRemove(player.id)}
          className="text-white/15 hover:text-rose-400 transition-colors text-sm"
        >
          ✕
        </button>
      </div>

      {/* Expandable consent settings */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-[rgba(255,255,255,0.05)]"
          >
            <div className="p-4 space-y-3">
              {/* Flirty level */}
              <div>
                <p className="text-white/40 text-xs mb-2 font-medium">Max Flirty Level: {player.comfort.maxFlirtyLevel}</p>
                <div className="flex gap-1.5">
                  {([1, 2, 3, 4, 5] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => onComfortChange(player.id, { maxFlirtyLevel: l })}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all"
                      style={{
                        background: player.comfort.maxFlirtyLevel === l ? 'rgba(232,184,109,0.2)' : 'rgba(255,255,255,0.03)',
                        borderColor: player.comfort.maxFlirtyLevel === l ? 'rgba(232,184,109,0.4)' : 'rgba(255,255,255,0.07)',
                        color: player.comfort.maxFlirtyLevel === l ? '#e8b86d' : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              {[
                { key: 'allowPhysicalInteraction' as keyof PlayerComfort, label: 'Physical dares OK' },
                { key: 'allowAlcohol' as keyof PlayerComfort, label: 'Alcohol dares OK' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">{label}</span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onComfortChange(player.id, { [key]: !player.comfort[key] })}
                    className="relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0"
                    style={{
                      background: player.comfort[key] ? '#e8b86d' : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <motion.div
                      animate={{ x: player.comfort[key] ? 20 : 2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                    />
                  </motion.button>
                </div>
              ))}

              {/* No-go tags */}
              <div>
                <p className="text-white/40 text-xs mb-2 font-medium">Block tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_TAGS.map((tag) => {
                    const blocked = player.comfort.customNoGoTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          const current = player.comfort.customNoGoTags;
                          const updated = blocked ? current.filter((t) => t !== tag) : [...current, tag];
                          onComfortChange(player.id, { customNoGoTags: updated });
                        }}
                        className="px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all"
                        style={{
                          background: blocked ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.03)',
                          borderColor: blocked ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.07)',
                          color: blocked ? '#f87171' : 'rgba(255,255,255,0.35)',
                        }}
                      >
                        {blocked ? '✕ ' : ''}{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
