import { useState } from "react";
import { newGame, sendMove } from "./api";
import type { GameState, Pos } from "./api";
import "./App.css";

const SIZE = 8;

function samePos(a: Pos, b: Pos) {
  return a[0] === b[0] && a[1] === b[1];
}

export default function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [selected, setSelected] = useState<Pos | null>(null);
  const [level, setLevel] = useState("easy");
  const [error, setError] = useState("");

  async function start(mode: string) {
    setError("");
    setSelected(null);
    setGame(await newGame(mode, level));
  }

  const targets: Pos[] =
    game && selected
      ? game.legal_moves.filter((m) => samePos(m[0], selected!)).map((m) => m[1])
      : [];

  async function clickSquare(row: number, col: number) {
    if (!game || game.winner) return;
    const here: Pos = [row, col];

    if (targets.some((t) => samePos(t, here))) {
      try {
        const next = await sendMove(game.id, selected!, here);
        setGame(next);
        setSelected(null);
      } catch {
        setError("Illegal move");
      }
      return;
    }

    const canMove = game.legal_moves.some((m) => samePos(m[0], here));
    setSelected(canMove ? here : null);
  }

  function contentAt(row: number, col: number): string {
    if (!game) return "";
    if (samePos(game.sheep, [row, col])) return "🐑";
    if (game.wolves.some((w) => samePos(w, [row, col]))) return "🐺";
    return "";
  }

  return (
    <div className="app">
      <h1>Wolf and Sheep</h1>

      <div className="controls">
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button onClick={() => start("pvc")}>Vs Computer</button>
        <button onClick={() => start("pvp")}>Two Players</button>
      </div>

      {error && <p className="error">{error}</p>}

      {game && (
        <>
          <p className="status">
            {game.winner
              ? game.winner === "s"
                ? "Sheep win!"
                : "Wolves win!"
              : game.turn === "s"
              ? "Sheep to move"
              : "Wolves to move"}
          </p>

          <div className="board">
            {Array.from({ length: SIZE }).map((_, row) =>
              Array.from({ length: SIZE }).map((_, col) => {
                const dark = (row + col) % 2 === 1;
                const target = targets.some((t) => samePos(t, [row, col]));
                const sel = selected && samePos(selected, [row, col]);
                return (
                  <div
                    key={`${row}-${col}`}
                    className={
                      "cell" +
                      (dark ? " dark" : "") +
                      (target ? " target" : "") +
                      (sel ? " selected" : "")
                    }
                    onClick={() => clickSquare(row, col)}
                  >
                    {contentAt(row, col)}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}