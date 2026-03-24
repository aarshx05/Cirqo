/**
 * Zustand store for Cirqo game state
 * Persists the active session to IndexedDB on every mutation.
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  GameSession,
  Player,
  PlayerComfort,
  Dare,
  DareHistoryEntry,
} from './types';
import { DEFAULT_COMFORT, DEFAULT_SETTINGS } from './types';
import { pickRandomDare } from './dares';
import { saveSession, loadMostRecentSession } from './db';

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface CirqoStore {
  session: GameSession | null;
  customDares: Dare[];
  isLoading: boolean;

  // Session lifecycle
  createSession: () => void;
  loadExistingSession: () => Promise<void>;
  endSession: () => void;

  // Player management
  addPlayer: (name: string, avatar: string) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerComfort: (playerId: string, comfort: Partial<PlayerComfort>) => void;

  // Game settings
  setSpiceLevel: (level: 1 | 2 | 3 | 4 | 5) => void;
  toggleEscalation: () => void;

  // Game actions
  spin: () => void;
  pickCurrentDare: (recipientId: string) => void;
  completeCurrentDare: () => void;
  skipCurrentDare: () => void;
  failCurrentDare: () => void;
  abandonCurrentDare: () => void;

  // Custom dares
  setCustomDares: (dares: Dare[]) => void;
}

// ---------------------------------------------------------------------------
// Helper: advance to next player
// ---------------------------------------------------------------------------
function nextPlayerIndex(currentIndex: number, totalPlayers: number): number {
  return (currentIndex + 1) % totalPlayers;
}

// ---------------------------------------------------------------------------
// Helper: maybe escalate spice level
// ---------------------------------------------------------------------------
function maybeEscalate(session: GameSession): 1 | 2 | 3 | 4 | 5 {
  if (!session.escalationEnabled) return session.spiceLevel;
  // Escalate every 6 completed turns
  const completed = session.history.filter((h) => h.outcome === 'completed').length;
  const newLevel = Math.min(5, Math.floor(completed / 6) + session.spiceLevel) as 1 | 2 | 3 | 4 | 5;
  return newLevel;
}

// ---------------------------------------------------------------------------
// Zustand store
// ---------------------------------------------------------------------------

export const useCirqoStore = create<CirqoStore>((set, get) => ({
  session: null,
  customDares: [],
  isLoading: false,

  // ── Session lifecycle ──────────────────────────────────────────────────────

  createSession: () => {
    const session: GameSession = {
      id: uuidv4(),
      players: [],
      currentPlayerIndex: 0,
      spiceLevel: DEFAULT_SETTINGS.defaultSpiceLevel,
      escalationEnabled: DEFAULT_SETTINGS.escalationEnabled,
      currentDare: null,
      currentRecipientId: null,
      playedDareIds: [],
      history: [],
      status: 'lobby',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set({ session });
    saveSession(session);
  },

  loadExistingSession: async () => {
    set({ isLoading: true });
    try {
      const session = await loadMostRecentSession();
      if (session && session.status !== 'finished') {
        set({ session });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  endSession: () => {
    const { session } = get();
    if (!session) return;
    const updated: GameSession = { ...session, status: 'finished', updatedAt: Date.now() };
    set({ session: updated });
    saveSession(updated);
  },

  // ── Player management ──────────────────────────────────────────────────────

  addPlayer: (name, avatar) => {
    const { session } = get();
    if (!session) return;
    const player: Player = {
      id: uuidv4(),
      name,
      avatar,
      skipsRemaining: DEFAULT_SETTINGS.defaultSkipsPerPlayer,
      stats: { completed: 0, skipped: 0, failed: 0 },
      comfort: { ...DEFAULT_COMFORT },
    };
    const updated: GameSession = {
      ...session,
      players: [...session.players, player],
      updatedAt: Date.now(),
    };
    set({ session: updated });
    saveSession(updated);
  },

  removePlayer: (playerId) => {
    const { session } = get();
    if (!session) return;
    const updated: GameSession = {
      ...session,
      players: session.players.filter((p) => p.id !== playerId),
      updatedAt: Date.now(),
    };
    set({ session: updated });
    saveSession(updated);
  },

  updatePlayerComfort: (playerId, comfort) => {
    const { session } = get();
    if (!session) return;
    const updated: GameSession = {
      ...session,
      players: session.players.map((p) =>
        p.id === playerId ? { ...p, comfort: { ...p.comfort, ...comfort } } : p
      ),
      updatedAt: Date.now(),
    };
    set({ session: updated });
    saveSession(updated);
  },

  // ── Game settings ──────────────────────────────────────────────────────────

  setSpiceLevel: (level) => {
    const { session } = get();
    if (!session) return;
    const updated: GameSession = { ...session, spiceLevel: level, updatedAt: Date.now() };
    set({ session: updated });
    saveSession(updated);
  },

  toggleEscalation: () => {
    const { session } = get();
    if (!session) return;
    const updated: GameSession = {
      ...session,
      escalationEnabled: !session.escalationEnabled,
      updatedAt: Date.now(),
    };
    set({ session: updated });
    saveSession(updated);
  },

  // ── Game actions ───────────────────────────────────────────────────────────

  /** Moves to the 'spinning' UI status so the wheel animates */
  spin: () => {
    const { session } = get();
    if (!session) return;
    const updated: GameSession = { ...session, status: 'spinning', updatedAt: Date.now() };
    set({ session: updated });
    saveSession(updated);
  },

  /** Called when the wheel stops — picks a dare for the landed player */
  pickCurrentDare: (recipientId: string) => {
    const { session, customDares } = get();
    if (!session) return;

    const effectiveSpice = maybeEscalate(session);
    const dare = pickRandomDare(
      session.players,
      effectiveSpice,
      session.playedDareIds,
      customDares
    );

    const updated: GameSession = {
      ...session,
      currentDare: dare,
      currentRecipientId: recipientId,
      spiceLevel: effectiveSpice,
      status: 'dare',
      updatedAt: Date.now(),
    };
    set({ session: updated });
    saveSession(updated);
  },

  completeCurrentDare: () => {
    const { session } = get();
    if (!session || !session.currentDare) return;
    _recordOutcome(session, 'completed', set);
  },

  skipCurrentDare: () => {
    const { session } = get();
    if (!session || !session.currentDare) return;
    const currentPlayer = session.players[session.currentPlayerIndex];
    if (currentPlayer.skipsRemaining <= 0) return; // No skips left

    _recordOutcome(session, 'skipped', set);
  },

  failCurrentDare: () => {
    const { session } = get();
    if (!session || !session.currentDare) return;
    _recordOutcome(session, 'failed', set);
  },

  abandonCurrentDare: () => {
    const { session } = get();
    if (!session || !session.currentDare) return;
    const updated: GameSession = {
      ...session,
      currentDare: null,
      currentRecipientId: null,
      status: 'spinning',
      updatedAt: Date.now(),
    };
    set({ session: updated });
    saveSession(updated);
  },

  // ── Custom dares ───────────────────────────────────────────────────────────

  setCustomDares: (dares) => {
    set({ customDares: dares });
  },
}));

// ---------------------------------------------------------------------------
// Internal helper: record a dare outcome and advance the turn
// ---------------------------------------------------------------------------
function _recordOutcome(
  session: GameSession,
  outcome: DareHistoryEntry['outcome'],
  set: (state: Partial<CirqoStore>) => void
) {
  const recipientPlayer = session.players.find((p) => p.id === session.currentRecipientId)!;
  const currentDare = session.currentDare!;

  const entry: DareHistoryEntry = {
    playerId: recipientPlayer.id,
    dareId: currentDare.id,
    dareText: currentDare.text,
    outcome,
    timestamp: Date.now(),
  };

  // Update stats for the recipient player
  const updatedPlayers = session.players.map((p) => {
    if (p.id !== recipientPlayer.id) return p;
    return {
      ...p,
      skipsRemaining: outcome === 'skipped' ? p.skipsRemaining - 1 : p.skipsRemaining,
      stats: {
        ...p.stats,
        completed: p.stats.completed + (outcome === 'completed' ? 1 : 0),
        skipped: p.stats.skipped + (outcome === 'skipped' ? 1 : 0),
        failed: p.stats.failed + (outcome === 'failed' ? 1 : 0),
      },
    };
  });

  const updated: GameSession = {
    ...session,
    players: updatedPlayers,
    currentPlayerIndex: nextPlayerIndex(session.currentPlayerIndex, session.players.length),
    currentDare: null,
    playedDareIds: [...session.playedDareIds, currentDare.id],
    history: [...session.history, entry],
    status: 'spinning',
    updatedAt: Date.now(),
  };

  set({ session: updated });
  saveSession(updated);
}
