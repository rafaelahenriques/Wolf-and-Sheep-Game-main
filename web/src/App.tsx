import { useEffect, useState } from "react";
import {  newGame, loadSave, wakeServer } from "./api";
import type { GameState} from "./api";
import Board from "./Board";
import { StatsScreen, SavedGamesScreen } from "./Screens";
import {
  Checkers,
  GoBack,
  HelpButton,
  Masthead,
  MenuButton,
  RulesDialog,
  ServerStatus,
} from "./ui";
import { withViewTransition } from "./motion";
import savesCircle from "./assets/design/circle-saves.svg";
import statsCircle from "./assets/design/circle-stats.svg";
import "./App.css";

type Screen = "menu" | "difficulty" | "game" | "stats" | "saves";

// How the computer plays each level (see ai/players.py).
const LEVELS = [
  { id: "easy", name: "Easy", hint: "Wolves move at random." },
  { id: "medium", name: "Medium", hint: "Wolves look one move ahead." },
  { id: "hard", name: "Hard", hint: "Wolves plan six moves ahead." },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
     const [game, setGame] = useState<GameState | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  // Which button is waiting on the API, whether that's taking a while, and why it failed.
  const [busy, setBusy] = useState<string | null>(null);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");
  const showRules = () => setRulesOpen(true);

  // Start waking a sleeping server as soon as the page opens.
  useEffect(wakeServer, []);

  function go(next: Screen) {
    setError("");
    withViewTransition(() => setScreen(next));
  }

  async function launch(key: string, load: () => Promise<GameState>) {
    if (busy) return;
    setBusy(key);
    setError("");
    const slowTimer = setTimeout(() => setSlow(true), 1500);
    try {
      const loaded = await load();
      withViewTransition(() => {
        setGame(loaded);
        setScreen("game");
      });
    } catch {
      setError("Couldn't reach the game server. Try again in a moment.");
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
      setBusy(null);
    }
  }

  const startPvc = (chosen: string) => launch(chosen, () => newGame("pvc", chosen));
  const startPvp = () => launch("pvp", () => newGame("pvp", "easy"));
  const openSave = (name: string) => launch(name, () => loadSave(name));

  return (
    <>
      {screen === "menu" && (
        <main className="screen home">
          <div className="home__main">
            <Masthead tumble />
            <nav className="menu" aria-label="Game modes">
              <MenuButton index={0} tilt onClick={() => go("difficulty")}>
                Player vs Computer
              </MenuButton>
              <MenuButton index={1} tilt busy={busy === "pvp"} onClick={startPvp}>
                Player vs Player
              </MenuButton>
              <MenuButton index={2} tilt comingSoon className="menu-item--online">
                Online Multiplayer
              </MenuButton>
              <ServerStatus slow={slow} error={error} />
            </nav>
            <footer className="home__footer">
              <HelpButton withLabel onClick={showRules} />
              <p className="home__about">One sheep against four wolves on a checkerboard.</p>
            </footer>
          </div>
          <div className="home__bubbles">
            <button className="bubble bubble--saves" onClick={() => go("saves")}>
              <img src={savesCircle} alt="" />
              <span>Saved Games</span>
            </button>
            <button className="bubble bubble--stats" onClick={() => go("stats")}>
              <img src={statsCircle} alt="" />
              <span>Statistics</span>
            </button>
          </div>
          <Checkers variant="home" />
        </main>
      )}

      {screen === "difficulty" && (
        <main className="screen subscreen difficulty">
          <span className="difficulty__circle" aria-hidden="true" />
          <Masthead subtitle="Difficulty" tumble />
          <nav className="menu" aria-label="Difficulty">
            {LEVELS.map((level, i) => (
              <MenuButton
                key={level.id}
                index={i}
                busy={busy === level.id}
                onClick={() => startPvc(level.id)}
              >
                {level.name}
              </MenuButton>
            ))}
            <ServerStatus slow={slow} error={error} />
          </nav>
          <dl className="levels">
            {LEVELS.map((level) => (
              <div key={level.id}>
                <dt>{level.name}</dt>
                <dd>{level.hint}</dd>
              </div>
            ))}
          </dl>
          <GoBack onClick={() => go("menu")} />
          <HelpButton className="help-icon--corner" onClick={showRules} />
          <Checkers variant="difficulty" />
        </main>
      )}

      {screen === "game" && game && (
        <Board initial={game} onExit={() => go("menu")} onHelp={showRules} />
      )}

      {screen === "stats" && <StatsScreen onBack={() => go("menu")} />}

      {screen === "saves" && (
        <SavedGamesScreen
          onBack={() => go("menu")}
          onLoad={openSave}
          busy={busy}
          status={<ServerStatus slow={slow} error={error} />}
        />
      )}

      <RulesDialog open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </>
  );
}
