import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getStats, listSaves } from "./api";
import type { Stats} from "./api";
import { Dots, GoBack, Masthead, MenuButton } from "./ui";
import { useCountUp, vars } from "./motion";


export function StatsScreen({ onBack }: { onBack: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStats().then(setStats).catch(() => setError("Could not load stats"));
  }, []);

  return (
    <main className="screen subscreen">
      <Masthead subtitle="Statistics" />
      <div className="subscreen__body">
        {error && <p className="subscreen__message">{error}</p>}
        {!stats && !error && (
          <p className="subscreen__message">
            Loading
            <Dots />
          </p>
        )}
        {stats && (
          <div className="stats">
            <div className="stat-tiles">
              <StatTile index={0} label="Games played" value={stats.total} />
              <StatTile index={1} label="Win rate" value={stats.win_rate} suffix="%" />
              <StatTile index={2} label="Average moves" value={stats.avg_moves} />
            </div>
            <div className="stats__columns">
              <dl className="stat-list">
                <Stat label="Vs computer" value={stats.vs_computer} />
                <Stat label="Sheep wins" value={stats.wins} />
                <Stat
                  label="Total time"
                  value={`${Math.floor(stats.seconds / 60)} min ${stats.seconds % 60} s`}
                />
              </dl>
              <div className="level-bars">
                {["easy", "medium", "hard"].map((lvl, i) => {
                  const [games, wins] = stats.by_level[lvl] ?? [0, 0];
                  return (
                    <div key={lvl} className="level-bar" style={vars({ "--i": i })}>
                      <div className="level-bar__label">
                        <span>{lvl[0].toUpperCase() + lvl.slice(1)}</span>
                        <b>
                          {wins}/{games} won
                        </b>
                      </div>
                      <div className="level-bar__track">
                        <div
                          className="level-bar__fill"
                          style={vars({ "--p": games ? wins / games : 0 })}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      <GoBack onClick={onBack} />
    </main>
  );
}

function StatTile({
  index,
  label,
  value,
  suffix = "",
}: {
  index: number;
  label: string;
  value: number;
  suffix?: string;
}) {
  const shown = useCountUp(value);
  return (
    <div className="stat-tile" style={vars({ "--i": index })}>
      <span className="stat-tile__value">
        {shown}
        {suffix}
      </span>
      <span className="stat-tile__label">{label}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat-list__row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

// Save files are named like 2026-10-04_23-05-11.json; show "Oct 4, 23:05".
function saveLabel(name: string) {
  const m = name.match(/^(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/);
  if (!m) return name.replace(".json", "");
  const [year, month, day, hour, minute] = m.slice(1, 6).map(Number);
  return new Date(year, month - 1, day, hour, minute).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SavedGamesScreen({
  onBack,
  onLoad,
  busy,
  status,
}: {
  onBack: () => void;
  onLoad: (name: string) => void;
  busy: string | null;
  status: ReactNode;
}) {
  const [saves, setSaves] = useState<string[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listSaves().then(setSaves).catch(() => setError("Could not list saves"));
  }, []);

  return (
    <main className="screen subscreen">
      <Masthead subtitle="Saved Games" />
      <div className="subscreen__body">
        {error && <p className="subscreen__message">{error}</p>}
        {!saves && !error && (
          <p className="subscreen__message">
            Loading
            <Dots />
          </p>
        )}
        {saves?.length === 0 && <p className="subscreen__message">No saved games yet.</p>}
        <div className="save-list">
          {saves?.slice(0, 10).map((name, i) => (
            <MenuButton
              key={name}
              index={i}
              busy={busy === name}
              onClick={() => onLoad(name)}
            >
              {saveLabel(name)}
            </MenuButton>
          ))}
        </div>
        {status}
      </div>
      <GoBack onClick={onBack} />
    </main>
  );
}
