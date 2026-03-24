'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Dare, Player } from '@/lib/types';

interface DareCardProps {
  dare: Dare;
  player: Player;
  onComplete: () => void;
  onSkip: () => void;
  onFail: () => void;
  skipsRemaining: number;
}

const LEVEL_CONFIG: Record<number, { label: string; color: string; borderColor: string; glow: string }> = {
  1: { label: 'Warm-Up',    color: 'text-emerald-400', borderColor: 'border-l-emerald-400', glow: 'rgba(74,222,128,0.2)' },
  2: { label: 'Getting Hot', color: 'text-sky-400',     borderColor: 'border-l-sky-400',     glow: 'rgba(56,189,248,0.2)' },
  3: { label: 'Spicy 🌶️',  color: 'text-amber-400',   borderColor: 'border-l-amber-400',   glow: 'rgba(251,191,36,0.2)'  },
  4: { label: 'Bold 🔥',    color: 'text-orange-400',  borderColor: 'border-l-orange-400',  glow: 'rgba(251,146,60,0.2)'  },
  5: { label: 'Wildest 💥', color: 'text-rose-400',    borderColor: 'border-l-rose-400',    glow: 'rgba(248,113,113,0.2)' },
};

const TAG_EMOJI: Record<string, string> = {
  flirty: '💋', social: '🗣️', bold: '🎯', physical: '💪',
  alcohol: '🍹', creative: '🎨', embarrassing: '😳', funny: '😂', challenge: '⚡',
};

export default function DareCard({
  dare,
  player,
  onComplete,
  onSkip,
  onFail,
  skipsRemaining,
}: DareCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isImprovising, setIsImprovising] = useState(false);
  const [showImprovPrompt, setShowImprovPrompt] = useState(false);
  const [improvReason, setImprovReason] = useState('');
  const [activeDareText, setActiveDareText] = useState(dare.text);
  const cfg = LEVEL_CONFIG[dare.level] ?? LEVEL_CONFIG[3];

  const handleImprovise = async () => {
    if (isImprovising) return;
    setIsImprovising(true);
    try {
      const res = await fetch('/api/improvise-dare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalDare: activeDareText,
          level: dare.level,
          tags: dare.tags,
          playerName: player.name,
          reason: improvReason.trim() ? improvReason.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (data.improvisedText) {
        setActiveDareText(data.improvisedText);
        setShowImprovPrompt(false);
        setImprovReason('');
      }
    } catch (err) {
      console.error('Failed to improvise dare', err);
    } finally {
      setIsImprovising(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={dare.id}
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="w-full max-w-md mx-auto"
      >
        {/* Recipient header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-5"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-11 h-11 flex items-center justify-center rounded-full text-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)]"
          >
            {player.avatar}
          </motion.div>
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium">Dare for</p>
            <p className="text-white font-display font-bold text-lg leading-tight">{player.name}</p>
          </div>
          <div
            className={`ml-auto px-3 py-1 rounded-full text-xs font-bold border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] ${cfg.color}`}
          >
            {cfg.label}
          </div>
        </motion.div>

        {/* 3D Card Flip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="perspective mb-6 cursor-pointer"
          onClick={() => setIsFlipped(true)}
        >
          <motion.div
            className="relative preserve-3d"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* CARD BACK (shown first) */}
            <div
              className="backface-hidden absolute inset-0 w-full rounded-2xl border border-[rgba(255,255,255,0.09)] overflow-hidden flex flex-col items-center justify-center gap-4 shimmer"
              style={{
                background: '#16161f',
                boxShadow: `0 0 60px ${cfg.glow}, 0 20px 60px rgba(0,0,0,0.4)`,
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border border-[rgba(255,255,255,0.1)]"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                🎲
              </div>
              <div className="text-center">
                <p className="text-white/60 font-semibold text-sm">Tap to reveal your dare</p>
                <p className={`text-xs mt-1 font-medium ${cfg.color}`}>{cfg.label}</p>
              </div>
              {/* Decorative corner accents */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[rgba(255,255,255,0.1)] rounded-tl" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[rgba(255,255,255,0.1)] rounded-tr" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[rgba(255,255,255,0.1)] rounded-bl" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[rgba(255,255,255,0.1)] rounded-br" />
            </div>

            {/* CARD FRONT (dare text) */}
            <div
              className={`backface-hidden rotate-y-180 relative w-full min-h-[240px] rounded-2xl border-l-4 ${cfg.borderColor} border border-[rgba(255,255,255,0.07)] overflow-hidden p-6 flex flex-col`}
              style={{
                background: 'linear-gradient(145deg, #16161f 0%, #111118 100%)',
                boxShadow: `0 0 60px ${cfg.glow}, 0 20px 60px rgba(0,0,0,0.4)`,
              }}
            >
              {/* Tags row */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {dare.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.07)] text-white/40"
                  >
                    {TAG_EMOJI[tag] ?? ''} {tag}
                  </span>
                ))}
              </div>

              {/* Dare text */}
              <p className="flex-1 text-white font-semibold text-xl leading-relaxed relative">
                {isImprovising ? (
                  <span className="flex items-center gap-2 text-white/50 animate-pulse">
                    <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    Improvising dare...
                  </span>
                ) : (
                  activeDareText
                )}
              </p>

              {dare.isCustom && activeDareText === dare.text && (
                <span className="mt-3 self-start text-[10px] text-[#e8b86d] border border-[rgba(232,184,109,0.25)] px-2 py-0.5 rounded-full bg-[rgba(232,184,109,0.06)]">
                  Custom Dare
                </span>
              )}
              {activeDareText !== dare.text && (
                <span className="mt-3 self-start text-[10px] text-violet-400 border border-[rgba(192,132,252,0.25)] px-2 py-0.5 rounded-full bg-[rgba(192,132,252,0.06)]">
                  ✨ AI Improvised
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Action buttons — only shown once card is flipped */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {/* Primary: Complete */}
              <motion.button
                id="btn-complete"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onComplete}
                className="w-full py-4 rounded-2xl font-display font-bold text-base text-[#0a0a0f] transition-all"
                style={{
                  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                  boxShadow: '0 0 30px rgba(74,222,128,0.25)',
                }}
              >
                ✓ Done — Nailed It
              </motion.button>

              {/* Secondary row */}
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  id="btn-skip"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onSkip}
                  disabled={skipsRemaining <= 0}
                  className="py-3 px-4 rounded-xl border font-semibold text-sm transition-all flex flex-col items-center gap-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: skipsRemaining > 0 ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.03)',
                    borderColor: skipsRemaining > 0 ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.07)',
                    color: skipsRemaining > 0 ? '#fbbf24' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  <span>⏭ Skip</span>
                  <span className="text-[10px] opacity-60">{skipsRemaining} remaining</span>
                </motion.button>

                <motion.button
                  id="btn-fail"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onFail}
                  className="py-3 px-4 rounded-xl border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.06)] text-rose-400 hover:bg-[rgba(248,113,113,0.12)] font-semibold text-sm transition-all flex flex-col items-center gap-0.5"
                >
                  <span>✗ Fail</span>
                  <span className="text-[10px] opacity-60">pass turn</span>
                </motion.button>
              </div>

              {/* AI Improvise Area */}
              {showImprovPrompt ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="w-full mt-1 p-3 rounded-xl border flex flex-col gap-2 relative z-20"
                  style={{
                    background: 'rgba(192,132,252,0.04)',
                    borderColor: 'rgba(192,132,252,0.15)',
                  }}
                >
                  <p className="text-[#c084fc] text-xs font-medium">How should we change it?</p>
                  <input
                    type="text"
                    value={improvReason}
                    onChange={(e) => setImprovReason(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleImprovise()}
                    placeholder="e.g. no physical contact, no drinks..."
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#c084fc] transition-colors"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => setShowImprovPrompt(false)}
                      disabled={isImprovising}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold text-white/50 hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImprovise}
                      disabled={isImprovising}
                      className="flex-1 py-2 rounded-lg text-xs font-bold text-[#0a0a0f] transition-all disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #e9d5ff 0%, #c084fc 100%)' }}
                    >
                      {isImprovising ? 'Thinking...' : 'Rewrite It ✨'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  id="btn-improvise"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowImprovPrompt(true)}
                  className="w-full py-3 mt-1 rounded-xl border font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  style={{
                    background: 'rgba(192,132,252,0.08)',
                    borderColor: 'rgba(192,132,252,0.25)',
                    color: '#c084fc',
                  }}
                >
                  <span>✨ Not feasible? Improvise</span>
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint when not yet flipped */}
        {!isFlipped && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-white/25 text-xs mt-2"
          >
            Tap the card to reveal the dare
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
