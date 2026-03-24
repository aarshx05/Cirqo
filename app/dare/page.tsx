'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCirqoStore } from '@/lib/store';
import DareCard from '@/components/DareCard';

const LEVEL_COLORS: Record<number, { label: string; color: string; glow: string }> = {
  1: { label: 'Mild',  color: '#4ade80', glow: 'rgba(74,222,128,0.1)'   },
  2: { label: 'Warm',  color: '#60a5fa', glow: 'rgba(96,165,250,0.1)'   },
  3: { label: 'Spicy', color: '#fbbf24', glow: 'rgba(251,191,36,0.12)'  },
  4: { label: 'Bold',  color: '#fb923c', glow: 'rgba(251,146,60,0.12)'  },
  5: { label: 'Wild',  color: '#f87171', glow: 'rgba(248,113,113,0.12)' },
};

export default function DarePage() {
  const router = useRouter();
  const { session, completeCurrentDare, skipCurrentDare, failCurrentDare, abandonCurrentDare } = useCirqoStore();

  useEffect(() => {
    if (!session) { router.replace('/'); return; }
    if (!session.currentDare) { router.replace('/game'); }
  }, [session, router]);

  if (!session || !session.currentDare) return null;

  const darePlayer = session.players.find((p) => p.id === session.currentRecipientId)!;
  if (!darePlayer) { router.replace('/game'); return null; }

  const handleComplete = () => { completeCurrentDare(); router.push('/game'); };
  const handleSkip = () => { if (darePlayer.skipsRemaining <= 0) return; skipCurrentDare(); router.push('/game'); };
  const handleFail = () => { failCurrentDare(); router.push('/game'); };

  const completed = session.history.filter((h) => h.outcome === 'completed').length;
  const skipped   = session.history.filter((h) => h.outcome === 'skipped').length;
  const failed    = session.history.filter((h) => h.outcome === 'failed').length;
  const level = session.spiceLevel;
  const lc = LEVEL_COLORS[level] ?? LEVEL_COLORS[1];

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Layered background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse 60% 55% at 50% 50%, ${lc.glow}, transparent)` }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 40% 40% at 20% 80%, rgba(192,132,252,0.06), transparent)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px]"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(232,184,109,0.08), transparent)' }} />
      </div>

      {/* Header bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mb-4 flex items-center justify-between"
      >
        <button
          onClick={() => { abandonCurrentDare(); router.push('/game'); }}
          className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-sm font-medium"
        >
          <span>←</span> <span>Wheel</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
            ✓ {completed}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
            ⏭ {skipped}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
            ✗ {failed}
          </span>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
          style={{ color: lc.color, background: lc.glow, borderColor: lc.color + '40' }}>
          {lc.label}
        </span>
      </motion.div>



      {/* Dare card */}
      <div className="relative z-10 w-full max-w-md">
        <DareCard
          dare={session.currentDare}
          player={darePlayer}
          onComplete={handleComplete}
          onSkip={handleSkip}
          onFail={handleFail}
          skipsRemaining={darePlayer.skipsRemaining}
        />
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => router.push('/')}
        className="relative z-10 mt-8 text-white/15 hover:text-white/35 text-xs transition-colors font-medium"
      >
        End Session
      </motion.button>
    </main>
  );
}
