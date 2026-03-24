/**
 * Core TypeScript types for Cirqo
 */

// --- Dare System ---

/** All possible tags a dare can have */
export type DareTag =
  | 'flirty'
  | 'social'
  | 'bold'
  | 'physical'
  | 'alcohol'
  | 'creative'
  | 'embarrassing'
  | 'funny'
  | 'challenge';

/** A single dare card */
export interface Dare {
  id: string;
  text: string;
  /** 1 = very mild, 5 = very bold/spicy */
  level: 1 | 2 | 3 | 4 | 5;
  tags: DareTag[];
  /** True if user added this, false for seeded data */
  isCustom?: boolean;
}

// --- Player System ---

/** Per-player comfort / consent settings */
export interface PlayerComfort {
  /** Max flirty dare level this player accepts (1–5) */
  maxFlirtyLevel: 1 | 2 | 3 | 4 | 5;
  /** Whether this player is okay with challenges involving physical actions */
  allowPhysicalInteraction: boolean;
  /** Whether this player is okay with alcohol-related dares */
  allowAlcohol: boolean;
  /** Tags this player never wants to see (takes precedence over all else) */
  customNoGoTags: DareTag[];
}

/** A player in the current session */
export interface Player {
  id: string;
  name: string;
  /** Emoji character used as avatar */
  avatar: string;
  /** Remaining skips this session */
  skipsRemaining: number;
  /** Per-session stats for this player */
  stats: PlayerStats;
  comfort: PlayerComfort;
}

/** Per-player stats for one session */
export interface PlayerStats {
  completed: number;
  skipped: number;
  failed: number;
}

// --- Game Session ---

export type GameStatus = 'lobby' | 'spinning' | 'dare' | 'finished';

/** A history record of one dare turn */
export interface DareHistoryEntry {
  playerId: string;
  dareId: string;
  dareText: string;
  outcome: 'completed' | 'skipped' | 'failed';
  timestamp: number;
}

/** Full game session state */
export interface GameSession {
  id: string;
  players: Player[];
  /** Index into players array — whose turn it is */
  currentPlayerIndex: number;
  /** Global spice level (1–5) that caps all dare levels */
  spiceLevel: 1 | 2 | 3 | 4 | 5;
  /** Whether the game gradually increases spice level over time */
  escalationEnabled: boolean;
  /** Current dare on display (if any) */
  currentDare: Dare | null;
  /** Player ID who is receiving the current dare */
  currentRecipientId: string | null;
  /** IDs of dares already played this session — avoids repeats */
  playedDareIds: string[];
  /** Full history of this session */
  history: DareHistoryEntry[];
  status: GameStatus;
  createdAt: number;
  updatedAt: number;
}

// --- App Settings ---

export interface AppSettings {
  /** Default skips per player at session start */
  defaultSkipsPerPlayer: number;
  /** Default global spice level */
  defaultSpiceLevel: 1 | 2 | 3 | 4 | 5;
  escalationEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultSkipsPerPlayer: 3,
  defaultSpiceLevel: 3,
  escalationEnabled: false,
};

export const DEFAULT_COMFORT: PlayerComfort = {
  maxFlirtyLevel: 3,
  allowPhysicalInteraction: true,
  allowAlcohol: false,
  customNoGoTags: [],
};
