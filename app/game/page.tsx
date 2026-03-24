'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCirqoStore } from '@/lib/store';
import SpinWheel from '@/components/SpinWheel';

export default function GamePage() {
  const router = useRouter();
  const { session, spin, pickCurrentDare } = useCirqoStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!session) { router.replace('/lobby'); return; }
    if (session.players.length < 2) { router.replace('/lobby'); return; }
    if (session.status === 'dare' && session.currentDare) { router.replace('/dare'); }
  }, [session, router]);

  const handleSpin = useCallback(() => {
    if (isAnimating || !session) return;
    setIsAnimating(true);
    setWinnerIndex(null);
    spin();
  }, [isAnimating, session, spin]);

  const handleSpinComplete = useCallback(
    (playerIndex: number) => {
      const winner = session!.players[playerIndex];
      setWinnerIndex(playerIndex);
      setIsAnimating(false);
      setTimeout(() => {
        pickCurrentDare(winner.id);
        router.push('/dare');
      }, 1200);
    },
    [pickCurrentDare, router, session]
  );

  if (!session || session.players.length < 2) return null;

  const spinner = session.players[session.currentPlayerIndex];

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex flex-col items-center px-4 overflow-hidden">
      {/* Layered bg */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 35% at 50% 0%, rgba(232,184,109,0.1), transparent)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 40% 40% at 80% 80%, rgba(192,132,252,0.07), transparent)' }} />
      </div>

      {/* Header bar */}
      <div className="relative z-10 w-full max-w-md pt-10 pb-4 flex items-center gap-3">
        <button
          onClick={() => router.push('/lobby')}
          className="text-white/30 hover:text-white/60 transition-colors text-sm font-medium flex items-center gap-1"
        >
          <span>←</span> <span>Lobby</span>
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Round {session.history.length + 1}
          </span>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold border"
            style={{ background: 'rgba(232,184,109,0.1)', borderColor: 'rgba(232,184,109,0.25)', color: '#e8b86d' }}
          >
            🌶 Spice {session.spiceLevel}
          </span>
        </div>
      </div>

      {/* Spinner / winner label */}
      <div className="relative z-10 w-full max-w-md mb-4 text-center">
        <AnimatePresence mode="wait">
          {winnerIndex !== null && !isAnimating ? (
            <motion.div
              key="winner"
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Dare goes to</p>
              <p className="font-display font-black text-2xl text-white">
                <span className="mr-2">{session.players[winnerIndex]?.avatar}</span>
                <span style={{ background: 'linear-gradient(90deg,#e8b86d,#f5d08b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {session.players[winnerIndex]?.name}
                </span>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="spinner-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {isAnimating ? (
                <p className="text-white/40 text-sm">Spinning the wheel…</p>
              ) : (
                <p className="text-white/40 text-sm">
                  <span className="text-white/60 font-medium">{spinner.name}</span> {spinner.avatar} — tap below to spin
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spin Wheel */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-2">
        <SpinWheel
          players={session.players}
          isSpinning={isAnimating}
          winnerId={null}
          spinnerIndex={session.currentPlayerIndex}
          onSpinComplete={handleSpinComplete}
        />
      </div>

      {/* Player avatar strip */}
      <div className="relative z-10 w-full max-w-md mb-5">
        <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
          {session.players.map((p, i) => (
            <motion.div
              key={p.id}
              animate={{ scale: i === session.currentPlayerIndex ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              <div
                className="w-10 h-10 flex items-center justify-center rounded-full text-xl border transition-all"
                style={{
                  borderColor: i === session.currentPlayerIndex ? 'rgba(232,184,109,0.5)' : 'rgba(255,255,255,0.07)',
                  background: i === session.currentPlayerIndex ? 'rgba(232,184,109,0.08)' : 'rgba(255,255,255,0.03)',
                  boxShadow: i === session.currentPlayerIndex ? '0 0 12px rgba(232,184,109,0.2)' : 'none',
                }}
              >
                {p.avatar}
              </div>
              <span className="text-[10px] text-white/30 font-medium truncate max-w-[40px]">{p.name.split(' ')[0]}</span>
              <span className="text-[10px] text-white/20">✓{p.stats.completed}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Spin button */}
      <div className="relative z-10 w-full max-w-md pb-10">
        <motion.button
          id="btn-spin"
          whileHover={{ scale: isAnimating ? 1 : 1.02 }}
          whileTap={{ scale: isAnimating ? 1 : 0.98 }}
          onClick={handleSpin}
          disabled={isAnimating}
          className="w-full py-5 rounded-2xl font-display font-black text-xl transition-all disabled:cursor-not-allowed"
          style={
            isAnimating
              ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }
              : { background: 'linear-gradient(135deg,#e8b86d 0%,#f5d08b 50%,#d4952a 100%)', color: '#0a0a0f', boxShadow: '0 0 50px rgba(232,184,109,0.35), 0 1px 0 rgba(255,255,255,0.15) inset' }
          }
        >
          {isAnimating ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              ⟳
            </motion.span>
          ) : (
            'Spin the Wheel'
          )}
        </motion.button>
      </div>
    </main>
  );
}
