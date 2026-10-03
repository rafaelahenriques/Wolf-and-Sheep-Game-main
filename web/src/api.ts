const BASE = import.meta.env.VITE_API_URL;

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

export async function newGame(mode: string, level: string): Promise<GameState> {
  const res = await fetch(`${BASE}/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, level }),
  });
  if (!res.ok) throw new Error("Could not start game");
  return res.json();
}

export async function sendMove(id: string, start: Pos, end: Pos): Promise<GameState> {
  const res = await fetch(`${BASE}/games/${id}/moves`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start, end }),
  });
  if (!res.ok) throw new Error("Illegal move");
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