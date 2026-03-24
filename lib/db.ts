/**
 * Dexie (IndexedDB) database for Cirqo.
 * All game data is stored offline — no backend required.
 */

import Dexie, { type Table } from 'dexie';
import type { GameSession, Dare } from './types';

class CirqoDB extends Dexie {
  sessions!: Table<GameSession, string>;
  customDares!: Table<Dare, string>;

  constructor() {
    super('CirqoDB');
    this.version(1).stores({
      sessions: 'id, updatedAt, status',
      customDares: 'id, level, *tags',
    });
  }
}

// Singleton instance — safe in both SSR (will be null) and browser
let db: CirqoDB | null = null;

function getDB(): CirqoDB {
  if (!db) {
    db = new CirqoDB();
  }
  return db;
}

// --- Session helpers ---

export async function saveSession(session: GameSession): Promise<void> {
  await getDB().sessions.put(session);
}

export async function loadSession(id: string): Promise<GameSession | undefined> {
  return getDB().sessions.get(id);
}

export async function loadMostRecentSession(): Promise<GameSession | undefined> {
  return getDB()
    .sessions.orderBy('updatedAt')
    .reverse()
    .first();
}

export async function deleteSession(id: string): Promise<void> {
  await getDB().sessions.delete(id);
}

export async function listSessions(): Promise<GameSession[]> {
  return getDB().sessions.orderBy('updatedAt').reverse().toArray();
}

// --- Custom dare helpers ---

export async function addCustomDare(dare: Dare): Promise<void> {
  await getDB().customDares.put(dare);
}

export async function deleteCustomDare(id: string): Promise<void> {
  await getDB().customDares.delete(id);
}

export async function getCustomDares(): Promise<Dare[]> {
  return getDB().customDares.toArray();
}
