import { useState } from "react";
import { sendMove, saveGame } from "./api";
import type { GameState, Pos } from "./api";
import type { GameState as GS } from "./api";

const SIZE = 8;

function samePos(a: Pos, b: Pos) {
  return a[0] === b[0] && a[1] === b[1];
}

export default function Board({
  initial,
  onExit,
}: {
  initial: GS;
  onExit: () => void;
}) {
  const [game, setGame] = useState<GameState>(initial);
  const [selected, setSelected] = useState<Pos | null>(null);
  const [note, setNote] = useState("");

  const targets: Pos[] =
    selected
      ? game.legal_moves.filter((m) => samePos(m[0], selected)).map((m) => m[1])
      : [];

  async function clickSquare(row: number, col: number) {
    if (game.winner) return;
    const here: Pos = [row, col];

    if (targets.some((t) => samePos(t, here))) {
      try {
        setGame(await sendMove(game.id, selected!, here));
        setSelected(null);
        setNote("");
      } catch {
        setNote("Illegal move");
      }
      return;
    }
    const canMove = game.legal_moves.some((m) => samePos(m[0], here));
    setSelected(canMove ? here : null);
  }

  function contentAt(row: number, col: number): string {
    if (samePos(game.sheep, [row, col])) return "🐑";
    if (game.wolves.some((w) => samePos(w, [row, col]))) return "🐺";
    return "";
  }

  async function save() {
    try {
      await saveGame(game.id);
      setNote("Game saved");
    } catch {
      setNote("Could not save");
    }
  }

  return (
    <div>
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

      {note && <p className="note">{note}</p>}

      <div className="controls">
        <button onClick={save}>Save</button>
        <button onClick={onExit}>Menu</button>
      </div>
    </div>
  );
}