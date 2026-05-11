/**
 * Loader2 (main loading screen)
 *
 * Layout (top → bottom):
 *   1. CosmicLoader  — full-screen video playing in reverse (z-index 0, behind everything)
 *   2. landing-circle1 — animated ambient glow blob (z-index 15)
 *   3. header        — logo + mini game widget (z-index 3)
 *   4. LoaderHUD     — bottom progress bar + percentage + quote (z-index 4)
 *
 * The whole container fades out over FADE_MS when loading finishes.
 */

import { memo, useCallback, useState } from "react";
import { useLoading } from "./LoadingProvider";
import CosmicLoader from "./CosmicLoader";
import { genZQuotes } from "@/utils/constant";
import "../styles/loading.css";  // shared styles
import "../styles/loader2.css"; // Loader2-specific styles

const FADE_MS = 800; // how long the fade-out takes (ms)

// ---------------------------------------------------------------------------
// LoaderHUD — the bottom bar with percentage + quote
// Kept as a separate component so only it re-renders on every progress tick,
// instead of re-rendering the whole Loader2.
// ---------------------------------------------------------------------------
const LoaderHUD = () => {
  const { loadingPerc } = useLoading();

  // Pick a random quote once when the loader mounts (never changes)
  const [quote] = useState(
    () => genZQuotes[Math.floor(Math.random() * genZQuotes.length)]
  );

  return (
    <div className="loader-hud">
      {/* Top row: percentage (left) + quote (right) */}
      <div className="loader-hud-inner">
        <div className="loader-hud-left">
          <span className="loader-hud-label">LOADING ASSETS</span>
          <div className="loader-hud-perc">
            {loadingPerc.toFixed(1)}
            <span className="loader-hud-perc-unit">%</span>
          </div>
        </div>

        <div className="loader-hud-right">
          <div className="loader-hud-quote">
            <div><span className="text-white">Me:</span> {quote}</div>
            <div className="loader-hud-label"><span className="text-white">Rocky:</span> Stupid EAARTHh QUOTE</div>
          </div>
        </div>
      </div>

      {/* Thin progress bar that fills left → right as loading progresses */}
      <div className="loader-hud-bar-track">
        <div
          className="loader-hud-bar-fill"
          style={{ width: `${loadingPerc}%` }}
        />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Loader2 — the outer shell
// Owns the fade-out animation and orchestrates CosmicLoader + LoaderHUD.
// ---------------------------------------------------------------------------
const Loader2 = () => {
  const { setIsLoading, setLoadingPerc } = useLoading();
  const [fading, setFading] = useState(false);

  // Called by CosmicLoader when the video reaches the beginning
  const handleComplete = useCallback(() => {
    setLoadingPerc(100);
    setFading(true); // triggers CSS opacity transition
    setTimeout(() => setIsLoading(false), FADE_MS); // unmount after fade
  }, [setIsLoading, setLoadingPerc]);

  return (
    <div
      className="loader-container"
      style={{
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
      }}
    >
      {/* Background video (reverse playback) */}
      <CosmicLoader onProgress={setLoadingPerc} onComplete={handleComplete} />

      {/* Animated blue glow blob in the top corner */}
      <div className="landing-circle1" />

      {/* Top bar: name on the left, mini game on the right */}
      <header className="loader-header">
        <div className="loader-logo">Tanuj Sharma</div>
        <div className="loader-game">
          <div className="loader-game-pipes">
            {Array.from({ length: 27 }, (_, i) => (
              <div className="loader-game-pipe" key={i} />
            ))}
          </div>
          <div className="loader-game-ball" />
        </div>
      </header>

      {/* Bottom HUD: percentage + quote + progress bar */}
      <LoaderHUD />
    </div>
  );
};

export default memo(Loader2);
