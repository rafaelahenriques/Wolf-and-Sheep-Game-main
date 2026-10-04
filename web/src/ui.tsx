import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { vars } from "./motion";
import pointer from "./assets/design/pointer.svg";
import helpIcon from "./assets/design/help.svg";
import helpIconHome from "./assets/design/help-home.svg";

export function Masthead({ subtitle, className = "" }: { subtitle?: string; className?: string }) {
  return (
    <header className={`masthead ${className}`}>
      <h1 className="masthead__title">Wolf &amp; Sheep</h1>
      <div className="masthead__row">
        {subtitle && <p className="masthead__subtitle">{subtitle}</p>}
        <p className="masthead__game">GAME</p>
      </div>
    </header>
  );
}

export function MenuButton({
  children,
  onClick,
  index = 0,
  tilt = false,
  busy = false,
  comingSoon = false,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  index?: number;
  tilt?: boolean;
  busy?: boolean;
  comingSoon?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`menu-item${tilt ? " menu-item--tilt" : ""} ${className}`}
      style={vars({ "--i": index })}
    >
      <button
        className={`menu-btn${busy ? " is-busy" : ""}`}
        onClick={comingSoon || busy ? undefined : onClick}
        aria-disabled={comingSoon || undefined}
        aria-busy={busy || undefined}
        title={comingSoon ? "Coming soon" : undefined}
      >
        <span className="menu-btn__face">{children}</span>
      </button>
      <img className="menu-pointer" src={pointer} alt="" />
    </div>
  );
}

export function Dots() {
  return (
    <span className="dots" aria-hidden="true">
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </span>
  );
}

// Shown under menus while a request to the API is slow (Render's free tier
// sleeps, so the first request can take a while) or after it fails.
export function ServerStatus({ slow, error }: { slow: boolean; error: string }) {
  if (error) {
    return (
      <p className="server-status server-status--error" role="alert">
        {error}
      </p>
    );
  }
  if (slow) {
    return (
      <p className="server-status" role="status">
        Waking up the game server
        <Dots />
      </p>
    );
  }
  return null;
}

// The "?" icon that opens the rules. On the home screen it carries a label.
export function HelpButton({
  onClick,
  withLabel = false,
  className = "",
}: {
  onClick: () => void;
  withLabel?: boolean;
  className?: string;
}) {
  if (withLabel) {
    return (
      <button className={`help-link ${className}`} onClick={onClick}>
        <img className="help-link__icon" src={helpIconHome} alt="" />
        <span>Confused?</span>
      </button>
    );
  }
  return (
    <button className={`help-icon ${className}`} onClick={onClick} aria-label="How to play">
      <img src={helpIcon} alt="" />
    </button>
  );
}

export function GoBack({ onClick }: { onClick: () => void }) {
  return (
    <button className="go-back" onClick={onClick}>
      <span className="go-back__arrow" aria-hidden="true">
        &lt;
      </span>{" "}
      Go Back
    </button>
  );
}

// Decorative black blocks at the screen edges; positions live in App.css.
export function Checkers({ variant, count }: { variant: string; count: number }) {
  return (
    <div className={`checkers checkers--${variant}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} style={vars({ "--i": i })} />
      ))}
    </div>
  );
}

const RULES: ReactNode[] = [
  "Pieces move one square diagonally.",
  <>
    The sheep can move <b>forward and backward</b>.
  </>,
  <>
    The wolves can only move <b>forward</b>.
  </>,
  "The sheep wins by reaching the opposite end of the board.",
  "The wolves win by blocking the sheep so it cannot move.",
];

export function RulesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="rules"
      aria-label="How to play"
      onClose={onClose}
      // Clicks on the backdrop land on the <dialog> itself, not the panel inside it.
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="rules__panel">
        <button className="rules__close" onClick={onClose} autoFocus>
          Close
        </button>
        <p className="rules__intro">
          Wolf and Sheep is a two-player strategy game. One player controls{" "}
          <b>one sheep</b>, while the other controls <b>four wolves</b>.
        </p>
        <h2 className="rules__title">Rules</h2>
        <ul className="rules__list">
          {RULES.map((rule, i) => (
            <li key={i} style={vars({ "--i": i })}>
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
