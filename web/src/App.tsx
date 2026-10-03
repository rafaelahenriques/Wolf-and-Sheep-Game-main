import { useState } from "react";
import {  newGame, loadSave } from "./api";
import type { GameState} from "./api";
import Board from "./Board";
import { StatsScreen, SavedGamesScreen } from "./Screens";
import "./App.css";

type Screen = "menu" | "difficulty" | "game" | "stats" | "saves";

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [game, setGame] = useState<GameState | null>(null);
  const [level, setLevel] = useState("easy");

  async function startPvc(chosen: string) {
    setLevel(chosen);
    setGame(await newGame("pvc", chosen));
    setScreen("game");
  }

  async function startPvp() {
    setGame(await newGame("pvp", "easy"));
    setScreen("game");
  }

  async function openSave(name: string) {
    setGame(await loadSave(name));
    setScreen("game");
  }

  return (
    <div className="app">
      <h1>Wolf and Sheep</h1>

      {screen === "menu" && (
        <div className="controls vertical">
          <button onClick={() => setScreen("difficulty")}>Player vs Computer</button>
          <button onClick={startPvp}>Player vs Player</button>
          <button onClick={() => setScreen("saves")}>Saved Games</button>
          <button onClick={() => setScreen("stats")}>Statistics</button>
        </div>
      )}

      {screen === "difficulty" && (
        <div className="controls vertical">
          <button onClick={() => startPvc("easy")}>Easy</button>
          <button onClick={() => startPvc("medium")}>Medium</button>
          <button onClick={() => startPvc("hard")}>Hard</button>
          <button onClick={() => setScreen("menu")}>Back</button>
        </div>
      )}

      {screen === "game" && game && (
        <Board initial={game} onExit={() => setScreen("menu")} />
      )}

      {screen === "stats" && <StatsScreen onBack={() => setScreen("menu")} />}

      {screen === "saves" && (
        <SavedGamesScreen onBack={() => setScreen("menu")} onLoad={openSave} />
      )}
    </div>
  );
}