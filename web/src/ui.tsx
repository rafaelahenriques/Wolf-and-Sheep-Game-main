import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { vars } from "./motion";
import pointer from "./assets/design/pointer.svg";
import helpIcon from "./assets/design/help.svg";
import helpIconHome from "./assets/design/help-home.svg";

export function Masthead({
  subtitle,
  tumble = false,
  className = "",
}: {
  subtitle?: string;
  // Knocks the letters of GAME loose, like the menu screens' tumbling type.
  tumble?: boolean;
  className?: string;
}) {
  return (
    <header className={`masthead${tumble ? " masthead--tumble" : ""} ${className}`}>
      <h1 className="masthead__title">Wolf &amp; Sheep</h1>
      <div className="masthead__row">
        {subtitle && <p className="masthead__subtitle">{subtitle}</p>}
        <p className="masthead__game">
          <span className="sr-only">GAME</span>
          <span className="masthead__letters" aria-hidden="true">
            {[..."GAME"].map((letter, i) => (
              <span key={i} style={vars({ "--i": i })}>
                {letter}
              </span>
            ))}
          </span>
        </p>
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

// A checkerboard coming apart at the screen edge: solid squares (which glide
// between screens), outlined and grey squares, and loose bracket lines, each a
// little off-true. Sizes are design pixels, anchored to the right edge and to
// the top or bottom.
interface BoardBit {
  kind: "solid" | "outline" | "grey" | "bracket" | "rule";
  right: number;
  top?: number;
  bottom?: number;
  w: number;
  h: number;
  tilt?: number;
  // Solid squares keep the same block number on every screen so they morph.
  block?: number;
}

const BOARD_BITS: Record<"home" | "difficulty", BoardBit[]> = {
  home: [
    { kind: "solid", block: 1, right: 612, bottom: -100, w: 232, h: 185 },
    { kind: "solid", block: 2, right: 380, bottom: 85, w: 232, h: 184 },
    { kind: "solid", block: 3, right: 148, bottom: -100, w: 232, h: 185 },
    { kind: "solid", block: 4, right: -84, bottom: 85, w: 232, h: 184 },
    { kind: "outline", right: 578, bottom: 110, w: 250, h: 170, tilt: -2 },
    { kind: "outline", right: 120, bottom: 60, w: 250, h: 200, tilt: 1.5 },
    { kind: "outline", right: -70, bottom: 278, w: 220, h: 172, tilt: -0.8 },
    { kind: "grey", right: -84, bottom: -100, w: 232, h: 185 },
    { kind: "bracket", right: 850, bottom: 30, w: 30, h: 220 },
    { kind: "rule", right: -20, bottom: 470, w: 330, h: 44 },
  ],
  difficulty: [
    { kind: "solid", block: 1, right: -184, top: 465, w: 232, h: 184 },
    { kind: "solid", block: 2, right: 48, top: 649, w: 232, h: 184 },
    { kind: "solid", block: 3, right: -184, top: 833, w: 232, h: 184 },
    { kind: "outline", right: 70, top: 440, w: 250, h: 220, tilt: 2 },
    { kind: "outline", right: 30, top: 820, w: 240, h: 200, tilt: -1.8 },
    { kind: "grey", right: -184, top: 649, w: 232, h: 184 },
    { kind: "rule", right: -20, top: 1040, w: 420, h: 40 },
    { kind: "bracket", right: 312, top: 300, w: 28, h: 150 },
  ],
};

export function Checkers({ variant }: { variant: "home" | "difficulty" }) {
  return (
    <div className={`checkers checkers--${variant}`} aria-hidden="true">
      {BOARD_BITS[variant].map((bit, i) => (
        <span
          key={i}
          className={`bit bit--${bit.kind}`}
          style={vars({
            "--i": i,
            "--right": bit.right,
            "--w": bit.w,
            "--h": bit.h,
            "--tilt": `${bit.tilt ?? 0}deg`,
            ...(bit.top !== undefined && { "--top": bit.top }),
            ...(bit.bottom !== undefined && { "--bottom": bit.bottom }),
            ...(bit.block && { viewTransitionName: `block-${bit.block}` }),
          })}
        />
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
