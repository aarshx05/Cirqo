'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCirqoStore } from '@/lib/store';

const FEATURES = [
  {
    icon: '⚡',
    label: 'Fully Offline',
    desc: 'No internet needed',
    glow: 'rgba(251,191,36,0.12)',
    border: 'rgba(251,191,36,0.18)',
    iconBg: 'rgba(251,191,36,0.1)',
  },
  {
    icon: '🛡️',
    label: 'Consent-Safe',
    desc: 'Per-player limits',
    glow: 'rgba(96,165,250,0.12)',
    border: 'rgba(96,165,250,0.18)',
    iconBg: 'rgba(96,165,250,0.1)',
  },
  {
    icon: '🎲',
    label: '400+ Dares',
    desc: '5 heat levels',
    glow: 'rgba(192,132,252,0.12)',
    border: 'rgba(192,132,252,0.18)',
    iconBg: 'rgba(192,132,252,0.1)',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { createSession, loadExistingSession, session, isLoading } = useCirqoStore();

  useEffect(() => {
    loadExistingSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewGame = () => {
    createSession();
    router.push('/lobby');
  };

  const hasActiveSession = session && session.status !== 'finished' && session.players.length > 0;

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden bg-[#0a0a0f]">
      {/* Rich layered background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary gold bloom — top centre */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(232,184,109,0.18) 0%, transparent 70%)' }} />
        {/* Violet bloom — bottom right */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px]"
          style={{ background: 'radial-gradient(ellipse at 100% 100%, rgba(192,132,252,0.12) 0%, transparent 70%)' }} />
        {/* Subtle blue — bottom left */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse at 0% 100%, rgba(96,165,250,0.07) 0%, transparent 70%)' }} />
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center">

        {/* ── Logo / Brand ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 text-xs font-semibold border"
            style={{ background: 'rgba(232,184,109,0.08)', borderColor: 'rgba(232,184,109,0.25)', color: '#e8b86d' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8b86d] animate-pulse" />
            Party Game
          </div>

          {/* Wordmark */}
          <h1 className="font-display text-[clamp(52px,12vw,72px)] font-black tracking-tighter leading-none text-white mb-4"
            style={{ textShadow: '0 0 80px rgba(232,184,109,0.2)' }}>
            Cir<span style={{ color: '#e8b86d', textShadow: '0 0 40px rgba(232,184,109,0.4)' }}>qo</span>
          </h1>

          <p className="text-white/40 text-base leading-relaxed tracking-wide">
            Spin the wheel. Get a dare.<br />
            <span className="text-white/25">Push the night further.</span>
          </p>
        </motion.div>

        {/* ── Feature cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-3 gap-2.5 w-full mb-8"
        >
          {FEATURES.map(({ icon, label, desc, glow, border, iconBg }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 p-3.5 rounded-2xl text-center transition-all"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, ${glow}, rgba(255,255,255,0.02) 70%)`,
                border: `1px solid ${border}`,
              }}
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-xl text-2xl"
                style={{ background: iconBg }}>
                {icon}
              </div>
              <div>
                <p className="text-white text-xs font-bold">{label}</p>
                <p className="text-white/35 text-[10px] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── CTAs ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="w-full space-y-3"
        >
          <motion.button
            id="btn-new-game"
            whileHover={{ scale: 1.025, boxShadow: '0 0 60px rgba(232,184,109,0.45)' }}
            whileTap={{ scale: 0.975 }}
            onClick={handleNewGame}
            className="w-full py-4 rounded-2xl font-display font-bold text-base text-[#0a0a0f] transition-all"
            style={{
              background: 'linear-gradient(135deg, #f5d08b 0%, #e8b86d 40%, #d4952a 100%)',
              boxShadow: '0 0 40px rgba(232,184,109,0.3), 0 1px 0 rgba(255,255,255,0.2) inset, 0 -1px 0 rgba(0,0,0,0.2) inset',
            }}
          >
            Start New Game
          </motion.button>

          {hasActiveSession && !isLoading && (
            <motion.button
              id="btn-continue"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/lobby')}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white/50 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              Resume — {session.players.length} players in session
            </motion.button>
          )}
        </motion.div>

        {/* ── Footer ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-white/18 text-xs tracking-wide"
          style={{ color: 'rgba(255,255,255,0.15)' }}
        >
          Pass-the-device · No account · Works offline
        </motion.p>
      </div>
    </main>
  );
}
