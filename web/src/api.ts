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