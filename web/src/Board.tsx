import { useState } from "react";
import { newGame, sendMove, saveGame } from "./api";
import type { GameState, Pos } from "./api";
import type { GameState as GS } from "./api";
import { Dots, HelpButton, Masthead } from "./ui";
import { vars, wait } from "./motion";
import Tunes from "./Tunes";
import wolfImg from "./assets/design/wolf.svg";
import sheepImg from "./assets/design/sheep.svg";

const SIZE = 8;
// The computer "thinks" at least this long, so its reply slides in after the sheep lands.
const THINK_MS = 450;

function samePos(a: Pos, b: Pos) {
  return a[0] === b[0] && a[1] === b[1];
}

// Moves a piece locally so it starts sliding before the server answers.
function applyMove(game: GameState, from: Pos, to: Pos): GameState {
  const sheepMoved = samePos(game.sheep, from);
  return {
    ...game,
    sheep: sheepMoved ? to : game.sheep,
    wolves: sheepMoved ? game.wolves : game.wolves.map((w) => (samePos(w, from) ? to : w)),
    turn: sheepMoved ? "w" : "s",
    legal_moves: [],
  };
}

function Piece({
  kind,
  pos,
  index,
  lifted,
}: {
  kind: "sheep" | "wolf";
  pos: Pos;
  index: number;
  lifted: boolean;
}) {
  return (
    <span
      className={`piece-slot${lifted ? " is-lifted" : ""}`}
      style={vars({ "--r": pos[0], "--c": pos[1], "--i": index })}
    >
      <img
        className={`piece piece--${kind}`}
        src={kind === "sheep" ? sheepImg : wolfImg}
        alt={kind === "sheep" ? "Sheep" : "Wolf"}
      />
    </span>
  );
}

export default function Board({
  initial,
  onExit,
  onHelp,
}: {
  initial: GS;
  onExit: () => void;
  onHelp: () => void;
}) {
  const [game, setGame] = useState<GameState>(initial);
  const [selected, setSelected] = useState<Pos | null>(null);
  const [note, setNote] = useState("");
  const [thinking, setThinking] = useState(false);
  const [restarting, setRestarting] = useState(false);

  const targets: Pos[] =
    selected
      ? game.legal_moves.filter((m) => samePos(m[0], selected)).map((m) => m[1])
      : [];

  async function move(from: Pos, to: Pos) {
    const before = game;
    const vsComputer = game.mode === "pvc";
    setGame(applyMove(game, from, to));
    setSelected(null);
    setNote("");
    setThinking(vsComputer);
    try {
      const [next] = await Promise.all([
        sendMove(game.id, from, to),
        wait(vsComputer ? THINK_MS : 0),
      ]);
      setGame(next);
    } catch {
      setGame(before);
      setNote("Illegal move");
    } finally {
      setThinking(false);
    }
  }

  function clickSquare(row: number, col: number) {
    if (game.winner || thinking) return;
    const here: Pos = [row, col];

    if (selected && targets.some((t) => samePos(t, here))) {
      move(selected, here);
      return;
    }
    const canMove = game.legal_moves.some((m) => samePos(m[0], here));
    const reselect = selected && samePos(selected, here);
    setSelected(canMove && !reselect ? here : null);
  }

  async function save() {
    try {
      await saveGame(game.id);
      setNote("Game saved");
    } catch {
      setNote("Could not save");
    }
  }

  async function playAgain() {
    setRestarting(true);
    try {
      setGame(await newGame(game.mode, game.level));
      setSelected(null);
      setNote("");
    } catch {
      setNote("Couldn't start a new game");
    } finally {
      setRestarting(false);
    }
  }

  const side = game.turn === "s" ? "Sheep" : "Wolves";
  const sheepWon = game.winner === "s";
  const vsComputer = game.mode === "pvc";
  const meta = vsComputer
    ? `vs Computer · ${game.level[0].toUpperCase() + game.level.slice(1)}`
    : "2 players";

  return (
    <main className="screen game">
      <Masthead className="game__masthead" />
      <HelpButton className="game__help" onClick={onHelp} />

      <div className="game__left">
        <div className="game__status" aria-live="polite">
          {/* Re-keyed on every change so the new line animates in. */}
          <div key={`${game.winner}-${thinking}-${game.turn}`} className="game__status-text">
            {game.winner ? (
              <>
                <p>Game over</p>
                <p className="game__side">-{sheepWon ? "Sheep wins" : "Wolves win"}</p>
              </>
            ) : thinking ? (
              <>
                <p>
                  Thinking
                  <Dots />
                </p>
                <p className="game__side">-Wolves</p>
              </>
            ) : (
              <>
                <p>Your Turn...</p>
                <p className="game__side">-{side}</p>
              </>
            )}
          </div>
          <p className="game__meta">
            {meta} · Moves {game.move_count}
          </p>
          {note && <p className="game__note">{note}</p>}
        </div>

        <Tunes />
      </div>

      {/* Keyed by game so a new game replays the entrance. */}
      <div className="board" key={game.id}>
        {Array.from({ length: SIZE }).map((_, row) =>
          Array.from({ length: SIZE }).map((_, col) => {
            const here: Pos = [row, col];
            const dark = (row + col) % 2 === 1;
            const target = targets.some((t) => samePos(t, here));
            const sel = selected && samePos(selected, here);
            const movable = !thinking && game.legal_moves.some((m) => samePos(m[0], here));
            return (
              <div
                key={`${row}-${col}`}
                className={
                  "cell" +
                  (dark ? " dark" : "") +
                  (target ? " target" : "") +
                  (sel ? " selected" : "") +
                  (movable ? " movable" : "")
                }
                style={vars({ "--d": row + col })}
                onClick={() => clickSquare(row, col)}
              />
            );
          })
        )}

        <div className="pieces">
          <Piece
            kind="sheep"
            pos={game.sheep}
            index={0}
            lifted={!!selected && samePos(selected, game.sheep)}
          />
          {game.wolves.map((w, i) => (
            <Piece
              key={i}
              kind="wolf"
              pos={w}
              index={i + 1}
              lifted={!!selected && samePos(selected, w)}
            />
          ))}
        </div>

        {game.winner && (
          <div className="result">
            <p className="result__title">
              {vsComputer ? (sheepWon ? "You win!" : "Caught!") : sheepWon ? "Sheep wins!" : "Wolves win!"}
            </p>
            <p className="result__text">
              {sheepWon ? "The sheep slipped through." : "The wolves cornered the sheep."}
            </p>
            <div className="result__actions">
              <button
                className="result__btn result__btn--primary"
                onClick={playAgain}
                disabled={restarting}
              >
                {restarting ? (
                  <>
                    Starting
                    <Dots />
                  </>
                ) : (
                  "Play again"
                )}
              </button>
              <button className="result__btn" onClick={onExit}>
                Menu
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="game__right">
        <button className="game__save" onClick={save}>
          Save Game
        </button>
        <button className="game__quit" onClick={onExit}>
          Menu/Quit
        </button>
      </div>
    </main>
  );
}
