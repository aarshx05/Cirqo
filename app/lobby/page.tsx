'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useCirqoStore } from '@/lib/store';
import PlayerCard from '@/components/PlayerCard';
import SpiceLevelSlider from '@/components/SpiceLevelSlider';
import type { PlayerComfort } from '@/lib/types';

const EMOJIS = ['🦊','🐯','🦁','🐺','🦋','🐉','🦄','🐙','🦅','🌙','⚡','🔥','🌊','💎','🎭'];
const TABS = ['Players', 'Settings', 'Dares'] as const;

export default function LobbyPage() {
  const router = useRouter();
  const {
    session,
    addPlayer,
    removePlayer,
    updatePlayerComfort,
    setSpiceLevel,
    toggleEscalation,
    loadExistingSession,
  } = useCirqoStore();

  const [tab, setTab] = useState<typeof TABS[number]>('Players');
  const [name, setName] = useState('');
  const [avatarIdx, setAvatarIdx] = useState(0);

  useEffect(() => {
    if (!session) loadExistingSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-[#e8b86d] border-t-transparent animate-spin" />
    </div>
  );

  const canStart = session.players.length >= 2;

  const handleAddPlayer = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addPlayer(trimmed, EMOJIS[avatarIdx]);
    setName('');
    setAvatarIdx((i) => (i + 1) % EMOJIS.length);
  };

  const handleStart = () => {
    if (!canStart) return;
    router.push('/game');
  };

  const handleComfortChange = (id: string, comfort: Partial<PlayerComfort>) =>
    updatePlayerComfort(id, comfort);

  return (
    <main className="relative min-h-screen bg-[#0a0a0f] flex flex-col items-center overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(232,184,109,0.1) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse at 100% 100%, rgba(192,132,252,0.07) 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-sm mx-auto flex items-center justify-between pt-6 px-4 pb-4">
        <button
          onClick={() => router.push('/')}
          className="text-white/30 flex items-center gap-1.5 text-sm hover:text-white/60 transition-colors"
        >
          <span>←</span> <span>Back</span>
        </button>
        <h1 className="font-display font-bold text-white text-base">Game Lobby</h1>
        <span className="text-white/30 text-sm font-mono">{session.players.length} / 10</span>
      </header>

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm mx-auto flex-1 flex flex-col px-4 pb-8">

        {/* Tab strip */}
        <div className="flex gap-1 p-1 rounded-2xl mb-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {TABS.map((t) => {
            const active = t === tab;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  color: active ? '#0a0a0f' : 'rgba(255,255,255,0.35)',
                  background: active ? 'linear-gradient(135deg, #f5d08b 0%, #e8b86d 100%)' : 'transparent',
                  boxShadow: active ? '0 0 20px rgba(232,184,109,0.25)' : 'none',
                }}
              >
                {t === 'Players' && '👥 '}
                {t === 'Settings' && '⚙️ '}
                {t === 'Dares' && '🎲 '}
                {t}
              </button>
            );
          })}
        </div>

        {/* ─────────── PLAYERS TAB ─────────── */}
        {tab === 'Players' && (
          <motion.div
            key="players"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col gap-4"
          >
            {/* Add player input */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex gap-2 p-3">
                <button
                  onClick={() => setAvatarIdx((i) => (i + 1) % EMOJIS.length)}
                  className="w-11 h-11 flex items-center justify-center text-xl rounded-xl transition-all hover:scale-110 shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {EMOJIS[avatarIdx]}
                </button>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                  placeholder="Player name…"
                  maxLength={20}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/20"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddPlayer}
                  disabled={!name.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
                  style={{ background: 'linear-gradient(135deg, #f5d08b 0%, #d4952a 100%)', color: '#0a0a0f' }}
                >
                  Add
                </motion.button>
              </div>
              {/* Avatar reel */}
              <div className="flex gap-1.5 px-3 pb-3 overflow-x-auto">
                {EMOJIS.map((e, i) => (
                  <button
                    key={i}
                    onClick={() => setAvatarIdx(i)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-lg shrink-0 transition-all"
                    style={{
                      background: avatarIdx === i ? 'rgba(232,184,109,0.2)' : 'rgba(255,255,255,0.04)',
                      outline: avatarIdx === i ? '1.5px solid rgba(232,184,109,0.5)' : 'none',
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Player list */}
            {session.players.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 gap-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                <div className="text-5xl opacity-30">👥</div>
                <div className="text-center">
                  <p className="text-white/30 font-semibold text-sm">No players yet</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.15)' }}>Add at least 2 to start</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <AnimatePresence>
                  {session.players.map((player, i) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      index={i}
                      onRemove={removePlayer}
                      onComfortChange={handleComfortChange}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* ─────────── SETTINGS TAB ─────────── */}
        {tab === 'Settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 space-y-4"
          >
            <div className="p-4 rounded-2xl space-y-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <p className="text-white font-semibold text-sm mb-0.5">Spice Level</p>
                <p className="text-white/30 text-xs">Sets the max intensity of dares</p>
              </div>
              <SpiceLevelSlider
                value={session.spiceLevel}
                onChange={(level) => setSpiceLevel(level)}
              />
            </div>

            <div className="p-4 rounded-2xl space-y-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-white font-semibold text-sm">Escalation</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Auto-escalate spice</p>
                  <p className="text-white/30 text-xs">Spice level rises as the game goes on</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleEscalation}
                  className="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0"
                  style={{ background: session.escalationEnabled ? '#e8b86d' : 'rgba(255,255,255,0.08)' }}
                >
                  <motion.div
                    animate={{ x: session.escalationEnabled ? 22 : 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                  />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─────────── DARES TAB ─────────── */}
        {tab === 'Dares' && (
          <motion.div
            key="dares"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 py-16 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.08)' }}
          >
            <div className="text-5xl">🎲</div>
            <div className="text-center">
              <p className="text-white/40 font-semibold text-sm">400+ dares loaded</p>
              <p className="text-white/20 text-xs mt-1">Adjust spice level in Settings</p>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {[['Mild','#4ade80'],['Warm','#60a5fa'],['Spicy','#fbbf24'],['Bold','#fb923c'],['Wild','#f87171']].map(([l, c]) => (
                <div key={l} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border"
                    style={{ background: `${c}18`, borderColor: `${c}30`, color: c }}>
                    80
                  </div>
                  <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{l}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─────────── Start button ─────────── */}
        <div className="pt-5">
          <motion.button
            id="btn-start-game"
            whileHover={{ scale: canStart ? 1.02 : 1, boxShadow: canStart ? '0 0 60px rgba(232,184,109,0.4)' : 'none' }}
            whileTap={{ scale: canStart ? 0.97 : 1 }}
            onClick={handleStart}
            disabled={!canStart}
            className="w-full py-4 rounded-2xl font-display font-bold text-base transition-all"
            style={{
              background: canStart
                ? 'linear-gradient(135deg, #f5d08b 0%, #e8b86d 40%, #d4952a 100%)'
                : 'rgba(255,255,255,0.05)',
              color: canStart ? '#0a0a0f' : 'rgba(255,255,255,0.2)',
              boxShadow: canStart ? '0 0 40px rgba(232,184,109,0.25)' : 'none',
              border: canStart ? 'none' : '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {canStart
              ? `Let's Spin — ${session.players.length} players`
              : `Add ${2 - session.players.length} more player${session.players.length === 1 ? '' : 's'}`}
          </motion.button>
        </div>
      </div>
    </main>
  );
}
