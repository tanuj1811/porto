import { useEffect } from "react";
import { useMotionValue, useSpring, motion } from "framer-motion";

export default function ScrollProgressBar() {
  const progress = useMotionValue(0);
  const scaleX = useSpring(progress, { stiffness: 180, damping: 28, mass: 0.4 });

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight || 1;
      progress.set(Math.min(1, Math.max(0, window.scrollY / max)));
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [progress]);

  return (
    <motion.div
      style={{
        scaleX,
        transformOrigin: "center",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: "linear-gradient(90deg, #3b82f6 0%, #7dd3fc 50%, #3b82f6 100%)",
        boxShadow: "0 0 8px #7dd3fc, 0 0 16px #3b82f644",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}
