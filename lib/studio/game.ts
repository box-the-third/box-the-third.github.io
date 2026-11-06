import { store } from "./resilience";

// Gamification: XP, levels, daily streaks, badges. Local-first so it works
// offline and for guests; levels give a reason to come back and finish setup.
export interface GameState {
  xp: number;
  streak: number;
  lastDay: string;
  runs: Record<string, number>;
  badges: string[];
}
const KEY = "yas_game_v1";
const empty: GameState = { xp: 0, streak: 0, lastDay: "", runs: {}, badges: [] };
export const LEVELS = [0, 50, 150, 300, 500, 800, 1200];
export const BADGES: Record<string, { label: string; test: (g: GameState) => boolean }> = {
  first: { label: "First Run", test: (g) => Object.keys(g.runs).length >= 1 },
  trio: { label: "Toolkit x3", test: (g) => Object.keys(g.runs).length >= 3 },
  all: { label: "All 10 Agents", test: (g) => Object.keys(g.runs).length >= 10 },
  streak3: { label: "3-Day Streak", test: (g) => g.streak >= 3 },
  streak7: { label: "7-Day Streak", test: (g) => g.streak >= 7 },
  closer: { label: "Closer", test: (g) => (g.runs.paywall || 0) >= 1 },
};

export const getGame = (): GameState => ({ ...empty, ...store.read<GameState>(KEY, empty) });
export const levelOf = (xp: number) => Math.max(1, LEVELS.filter((l) => xp >= l).length);
export const nextLevelXp = (xp: number) => LEVELS.find((l) => l > xp) ?? LEVELS[LEVELS.length - 1];

const day = (d = new Date()) => d.toISOString().slice(0, 10);

/** Award XP for an agent action; returns the new state and any new badges. */
export function award(agent: string, base: number) {
  const g = getGame();
  const first = !g.runs[agent];
  const gained = first ? base : Math.max(5, Math.round(base / 4));
  const today = day();
  const y = day(new Date(Date.now() - 864e5));
  if (g.lastDay !== today) {
    g.streak = g.lastDay === y ? g.streak + 1 : 1;
    g.lastDay = today;
  }
  g.runs[agent] = (g.runs[agent] || 0) + 1;
  g.xp += gained + (g.streak > 1 ? 2 : 0);
  const newBadges = Object.entries(BADGES)
    .filter(([k, b]) => !g.badges.includes(k) && b.test(g))
    .map(([k]) => k);
  g.badges.push(...newBadges);
  store.write(KEY, g);
  return { state: g, gained, newBadges };
}
