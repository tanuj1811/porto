import { useEffect, useRef, useState } from "react";
import "../styles/FloatingIcons.css";
import { floatingIcons as icons } from "@/utils/constant";

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

const COUNT = 2 + Math.floor(Math.random() * 2); // 2 or 3
const selected = pickRandom(icons, COUNT);

export default function FloatingIcons({ visible }: { visible: boolean }) {
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;
    timerRef.current = setTimeout(() => setShow(true), 600);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [visible]);

  return (
    <div className="floating-icons-layer">
      {selected.map(({ Icon, color, size, top, left, right, bottom, anim, delay }, i) => (
        <div
          key={i}
          className={`fi ${anim} ${show ? "visible" : ""}`}
          style={{
            top, left, right, bottom,
            animationDelay: `${delay}s`,
            opacity: show ? (color.startsWith("rgba") ? undefined : 0.38) : 0,
            color,
            transitionDelay: `${delay * 0.4}s`,
          }}
        >
          <Icon size={size} />
        </div>
      ))}
    </div>
  );
}
