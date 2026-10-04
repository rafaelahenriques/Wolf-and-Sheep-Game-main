import { useEffect, useRef, useState } from "react";
import { randomStation, reportPlay } from "./radio";
import type { Station } from "./radio";
import { Dots } from "./ui";
import { wait } from "./motion";
import tunesCircle from "./assets/design/tunes-circle.svg";
import tunesPlay from "./assets/design/tunes-play.svg";

// A silent clip started straight from the click. Safari only allows audio that
// begins inside a user gesture, and the station lookup happens after an await.
const SILENCE =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

// Give up on a stream that hasn't started after this long and try another.
const STREAM_TIMEOUT_MS = 8000;

type Status = "idle" | "tuning" | "playing" | "paused" | "error";

function playWithTimeout(audio: HTMLAudioElement) {
  return Promise.race([
    audio.play(),
    wait(STREAM_TIMEOUT_MS).then(() => {
      throw new Error("Stream timed out");
    }),
  ]);
}

export default function Tunes() {
  const audio = useRef<HTMLAudioElement>(null);
  const [station, setStation] = useState<Station | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  // Stop the radio when leaving the game screen.
  useEffect(() => {
    const el = audio.current;
    return () => el?.pause();
  }, []);

  async function tune() {
    const el = audio.current;
    if (!el || status === "tuning") return;
    el.src = SILENCE;
    el.play().catch(() => {});
    setStatus("tuning");

    // A random country can have dead or slow streams, so try a few.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const next = await randomStation(station?.countryCode);
        el.src = next.url;
        await playWithTimeout(el);
        setStation(next);
        setStatus("playing");
        reportPlay(next.id);
        return;
      } catch {
        // try another station
      }
    }
    el.pause();
    setStatus("error");
  }

  function toggle() {
    const el = audio.current;
    if (!el || status === "tuning") return;
    if (status === "playing") {
      el.pause();
      setStatus("paused");
    } else if (status === "paused" && station) {
      // Reload so the live stream resumes at "now", not where it was paused.
      el.src = station.url;
      el.play()
        .then(() => setStatus("playing"))
        .catch(() => setStatus("error"));
    } else {
      tune();
    }
  }

  const playing = status === "playing";

  return (
    <div className="radio">
      <audio
        ref={audio}
        // A stream that drops mid-song; failures while tuning are retried instead.
        onError={() => setStatus((s) => (s === "playing" ? "error" : s))}
      />

      <div className="radio__now" aria-live="polite">
        {status === "tuning" && (
          <p className="radio__hint">
            Tuning in
            <Dots />
          </p>
        )}
        {status === "error" && (
          <p className="radio__hint radio__hint--error">No station answered. Try again.</p>
        )}
        {station && (playing || status === "paused") && (
          // Keyed by station so each new country animates in.
          <div key={station.id} className="radio__station">
            <p className="radio__label">
              {playing && (
                <span className="eq" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              )}
              {playing ? "On air from" : "Paused"}
            </p>
            <p className="radio__country">{station.country}</p>
            <p className="radio__name" title={station.name}>
              {station.name}
            </p>
            <button className="radio__next" onClick={tune}>
              Next country <span aria-hidden="true">&gt;</span>
            </button>
          </div>
        )}
      </div>

      <button
        className="tunes"
        onClick={toggle}
        aria-pressed={playing}
        aria-busy={status === "tuning" || undefined}
        data-status={status}
      >
        <span className="tunes__icon">
          <img className="tunes__circle" src={tunesCircle} alt="" />
          {playing ? (
            <span className="tunes__pause" />
          ) : (
            <img className="tunes__play" src={tunesPlay} alt="" />
          )}
        </span>
        Tunes
      </button>
    </div>
  );
}
