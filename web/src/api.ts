const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export type Pos = [number, number];
export type Move = [Pos, Pos];

export interface GameState {
  id: string;
  mode: string;
  level: string;
  sheep: Pos;
  wolves: Pos[];
  turn: string;
  winner: string | null;
  legal_moves: Move[];
  move_count: number;
}

// Render's free plan puts the API to sleep after 15 idle minutes and takes
// about a minute to wake it. Pinging on page load starts that wake-up while
// the player is still on the menu. Failures are fine: real requests report them.
export function wakeServer() {
  fetch(`${BASE}/health`).catch(() => {});
}

export async function newGame(mode: string, level: string): Promise<GameState> {
  const res = await fetch(`${BASE}/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, level }),
  });
  if (!res.ok) throw new Error("Could not start game");
  return res.json();
}

// The error message says why a move failed, so the board can show it.
export async function sendMove(id: string, start: Pos, end: Pos): Promise<GameState> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/games/${id}/moves`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start, end }),
    });
  } catch {
    throw new Error("Couldn't reach the game server");
  }
  // Games live in the API's memory, so a server restart forgets them.
  if (res.status === 404) throw new Error("The server lost this game. Start a new one.");
  if (res.status >= 500) throw new Error("The server hit an error. Try again.");
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(typeof body?.detail === "string" ? body.detail : "Illegal move");
  }
  return res.json();
}
export interface Stats {
  total: number;
  vs_computer: number;
  wins: number;
  win_rate: number;
  avg_moves: number;
  seconds: number;
  by_level: Record<string, [number, number]>;
}

export async function getStats(): Promise<Stats> {
  const res = await fetch(`${BASE}/stats`);
  if (!res.ok) throw new Error("Could not load stats");
  return res.json();
}

export async function listSaves(): Promise<string[]> {
  const res = await fetch(`${BASE}/saves`);
  if (!res.ok) throw new Error("Could not list saves");
  return (await res.json()).saves;
}

export async function loadSave(name: string): Promise<GameState> {
  const res = await fetch(`${BASE}/saves/${name}/load`, { method: "POST" });
  if (!res.ok) throw new Error("Could not load save");
  return res.json();
}

export async function saveGame(id: string): Promise<string> {
  const res = await fetch(`${BASE}/games/${id}/save`, { method: "POST" });
  if (!res.ok) throw new Error("Could not save");
  return (await res.json()).saved;
}