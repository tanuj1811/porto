import { memo, useEffect, useState } from "react";
import { useLoading } from "./LoadingProvider";
import { genZQuotes } from "@/utils/constant";
import Particles, { initParticlesEngine, type IParticlesProps } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import "../styles/loading.css";  // shared styles
import "../styles/loader1.css"; // Loader-specific styles

const PARTICLE_OPTIONS: IParticlesProps["options"] = {
  background: { color: { value: "transparent" } },
  fullScreen: { enable: false },
  fpsLimit: 120,

  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "repulse",
      },
    },
    modes: {
      repulse: {
        distance: 120,
        duration: 0.4,
      },
    },
  },

  particles: {
    color: { value: "#ffffff" },
    links: { enable: false },
    move: {
      enable: true,
      speed: { min: 0.5, max: 1 },
      outModes: { default: "bounce" },
    },
    number: { value: 200, density: { enable: true } },
    opacity: { value: { min: 0.3, max: 0.7 } },
    shape: { type: "star" },
    size: { value: { min: 1, max: 3 } },
  },

  detectRetina: true,
};

// Isolated component — only re-renders when loadingPerc changes
const LoaderProgress = () => {
  const { loadingPerc, setIsLoading } = useLoading();
  const [quote] = useState(
    () => genZQuotes[Math.floor(Math.random() * genZQuotes.length)]
  );
  const glowCount = Math.floor((loadingPerc / 100) * quote.length);

  useEffect(() => {
    if (loadingPerc >= 100) {
      setIsLoading(false);
    }
  }, [loadingPerc, setIsLoading]);

  return (
    <div className="loader-body">
      <div className="loader-body-content">
        <p className="loader-quote">
          {quote.split("").map((char, i) => (
            <span key={i} className={i < glowCount ? "tube-glow" : ""}>
              {char}
            </span>
          ))}
        </p>
        <div className="loader-progress-wrapper">
          <div
            className="loader-progress-bar"
            style={{ width: `${loadingPerc}%` }}
          />
        </div>
        {loadingPerc < 100 && (
          <div className="loader-hud-row">
            <span className="loader-progress-label">Loading</span>
            <span className="loader-perc-counter">
              {Math.floor(loadingPerc)}
              <span className="loader-perc-unit">%</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Loader never reads from context — only re-renders once when particles init
const Loader = () => {
  const [initParticles, setInitParticles] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      });
      setInitParticles(true);
    };
    init();
  }, []);

  return (
    <div className="loader-container">
      <div className="landing-circle1" />

      {initParticles && (
        <Particles id="tsparticles" options={PARTICLE_OPTIONS} className="loader-particles" />
      )}

      <header className="loader-header">
        <div className="loader-logo">Tanuj Sharma</div>
      </header>

      <LoaderProgress />
    </div>
  );
};

export default memo(Loader);
