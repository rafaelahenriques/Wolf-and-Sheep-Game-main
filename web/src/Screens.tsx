import { useEffect, useState } from "react";
import { getStats, listSaves } from "./api";
import type { Stats} from "./api";


export function StatsScreen({ onBack }: { onBack: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStats().then(setStats).catch(() => setError("Could not load stats"));
  }, []);

  return (
    <div>
      <h2>Statistics</h2>
      {error && <p className="error">{error}</p>}
      {stats && (
        <div className="stats">
          <p>Games played: {stats.total}</p>
          <p>Vs computer: {stats.vs_computer}</p>
          <p>Sheep wins: {stats.wins}</p>
          <p>Win rate: {stats.win_rate}%</p>
          <p>Average moves: {stats.avg_moves}</p>
          <p>
            Total time: {Math.floor(stats.seconds / 60)} min {stats.seconds % 60} s
          </p>
          {["easy", "medium", "hard"].map((lvl) => {
            const [games, wins] = stats.by_level[lvl] ?? [0, 0];
            return (
              <p key={lvl}>
                {lvl[0].toUpperCase() + lvl.slice(1)}: {wins}/{games} won
              </p>
            );
          })}
        </div>
      )}
      <button onClick={onBack}>Back</button>
    </div>
  );
}

export function SavedGamesScreen({
  onBack,
  onLoad,
}: {
  onBack: () => void;
  onLoad: (name: string) => void;
}) {
  const [saves, setSaves] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    listSaves().then(setSaves).catch(() => setError("Could not list saves"));
  }, []);

  return (
    <div>
      <h2>Saved Games</h2>
      {error && <p className="error">{error}</p>}
      {saves.length === 0 && !error && <p>No saved games yet.</p>}
      <div className="save-list">
        {saves.slice(0, 10).map((name) => (
          <button key={name} onClick={() => onLoad(name)}>
            {name.replace(".json", "")}
          </button>
        ))}
      </div>
      <button onClick={onBack}>Back</button>
    </div>
  );
}