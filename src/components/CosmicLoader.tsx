/**
 * CosmicLoader
 *
 * Plays the background video in REVERSE from its last frame back to the first.
 * The playback speed is automatically adjusted so the full video fits within
 * a randomly chosen loading duration (30–70 seconds).
 *
 * Instead of using the browser's built-in playback (which can't go backwards),
 * we manually move `video.currentTime` backwards every 50ms using
 * requestAnimationFrame — this gives us smooth reverse playback.
 *
 * Props:
 *   onProgress(percent) — called with 0–99 as the video scrubs backwards
 *   onComplete()        — called when the video reaches the beginning
 */

import { memo, useEffect, useRef } from "react";
import earthVid from "@/assets/vids/earth_outside.mp4";
import milkywayVid from "@/assets/vids/milkyway.mp4";

// --- Config ---
const SEEK_EVERY_MS = 50; // seek every 50ms (~20fps) for smooth reverse playback
const isOdd = Math.floor(Math.random() * 10) % 2 === 0;
interface CosmicLoaderProps {
  onProgress: (percent: number) => void;
  onComplete: () => void;
}

const CosmicLoader = ({ onProgress, onComplete }: CosmicLoaderProps) => {
  const videoRef        = useRef<HTMLVideoElement>(null);
  const rafRef          = useRef<number>(0);
  const startTimeRef    = useRef<number>(0); // when reverse playback began (ms)
  const lastSeekRef     = useRef<number>(0); // timestamp of the last seek (ms)

  // Store callbacks in refs so the effect never needs to re-run when they change
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onProgressRef.current = onProgress;
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Called once the video metadata (duration, dimensions) is ready
    const startReverse = () => {
      const totalDuration   = video.duration;                    // full video length in seconds
      const loadingDuration = 10 + Math.random() * 5;           // random 10–15s loading time

      // Start from the very last frame
      video.currentTime = totalDuration;
      video.pause();

      // Each animation frame we check if it's time to seek
      const tick = (now: number) => {
        // On the very first tick, record the start time
        if (!startTimeRef.current) {
          startTimeRef.current = now;
          lastSeekRef.current  = now;
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        const elapsedSeconds   = (now - startTimeRef.current) / 1000;
        const msSinceLastSeek  = now - lastSeekRef.current;

        // Only seek once every SEEK_EVERY_MS to avoid choppy decoding
        if (msSinceLastSeek >= SEEK_EVERY_MS) {
          // progress goes from 0 → 1 over the loading duration
          const progress       = Math.min(elapsedSeconds / loadingDuration, 1);
          const targetTime     = totalDuration - progress * totalDuration;

          if (targetTime <= 0 || progress >= 1) {
            // Reached the beginning — loading is done
            video.currentTime = 0;
            onCompleteRef.current();
            return;
          }

          video.currentTime = targetTime;
          onProgressRef.current(Math.min(99, Math.round(progress * 100)));
          lastSeekRef.current = now;
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    // Start immediately if metadata is already loaded, otherwise wait for it
    if (video.readyState >= 1) {
      startReverse();
    } else {
      video.addEventListener("loadedmetadata", startReverse, { once: true });
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      video.removeEventListener("loadedmetadata", startReverse);
    };
  }, []); // runs once on mount

  return (
    <video
      ref={videoRef}
      src={isOdd ? milkywayVid : earthVid}
      muted
      playsInline
      preload="auto"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: 0, // sits behind the header and HUD
      }}
    />
  );
};

export default memo(CosmicLoader);
