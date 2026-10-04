import { useState } from "react";
import {  newGame, loadSave } from "./api";
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

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
     const [game, setGame] = useState<GameState | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  // Which button is waiting on the API, whether that's taking a while, and why it failed.
  const [busy, setBusy] = useState<string | null>(null);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");
  const showRules = () => setRulesOpen(true);

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
            <Masthead />
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
            <HelpButton withLabel onClick={showRules} />
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
          <Checkers variant="home" count={4} />
        </main>
      )}

      {screen === "difficulty" && (
        <main className="screen subscreen difficulty">
          <Masthead subtitle="Difficulty" />
          <nav className="menu" aria-label="Difficulty">
            {["easy", "medium", "hard"].map((level, i) => (
              <MenuButton
                key={level}
                index={i}
                busy={busy === level}
                onClick={() => startPvc(level)}
              >
                {level[0].toUpperCase() + level.slice(1)}
              </MenuButton>
            ))}
            <ServerStatus slow={slow} error={error} />
          </nav>
          <GoBack onClick={() => go("menu")} />
          <HelpButton className="help-icon--corner" onClick={showRules} />
          <Checkers variant="difficulty" count={3} />
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
