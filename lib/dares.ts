/**
 * Cirqo Dare Engine
 *
 * Contains the full seed dare library (250 dares across levels 1–5)
 * and the consent-aware filtering logic.
 */

import type { Dare, Player } from './types';
import { level1Dares } from './dares1';
import { level2Dares } from './dares2';
import { level3Dares } from './dares3';
import { level4Dares } from './dares4';
import { level5Dares } from './dares5';

// ---------------------------------------------------------------------------
// Seed Data — 250 dares across all 5 levels (50 per level)
// ---------------------------------------------------------------------------
export const SEED_DARES: Dare[] = [
  ...level1Dares,
  ...level2Dares,
  ...level3Dares,
  ...level4Dares,
  ...level5Dares,
];

// ---------------------------------------------------------------------------
// Dare Filtering — consent-aware engine
// ---------------------------------------------------------------------------

/**
 * Returns a filtered, shuffled list of dares that are safe for ALL players.
 *
 * @param allPlayers       - All players in the current session
 * @param spiceLevel       - Global max dare level (1–5)
 * @param playedDareIds    - Dare IDs already played this session (excluded)
 * @param customDares      - User-created dares from IndexedDB
 */
export function getFilteredDares(
  allPlayers: Player[],
  spiceLevel: number,
  playedDareIds: string[],
  customDares: Dare[] = []
): Dare[] {
  const allDares = [...SEED_DARES, ...customDares];

  return allDares.filter((dare) => {
    // 1. Global spice strict match (only dares exactly from selected level)
    if (dare.level !== spiceLevel) return false;

    // 2. Don't repeat recently played dares
    if (playedDareIds.includes(dare.id)) return false;

    // 3. Check consent for every player in the session
    for (const player of allPlayers) {
      const c = player.comfort;

      // Flirty level check
      if (dare.tags.includes('flirty') && dare.level > c.maxFlirtyLevel) return false;

      // Physical interaction check
      if (dare.tags.includes('physical') && !c.allowPhysicalInteraction) return false;

      // Alcohol check
      if (dare.tags.includes('alcohol') && !c.allowAlcohol) return false;

      // Custom no-go tags (player-defined blocklist)
      const hasNoGoTag = dare.tags.some((tag) => c.customNoGoTags.includes(tag));
      if (hasNoGoTag) return false;
    }

    return true;
  });
}

/**
 * Picks one random dare from the filtered pool.
 * Returns null if no dares remain after filtering.
 */
export function pickRandomDare(
  allPlayers: Player[],
  spiceLevel: number,
  playedDareIds: string[],
  customDares: Dare[] = []
): Dare | null {
  const pool = getFilteredDares(allPlayers, spiceLevel, playedDareIds, customDares);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
