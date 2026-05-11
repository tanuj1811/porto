import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

/* ----------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

export type Section = { id: string; label: string };

export type NaviBarProps = {
  sections: Section[];
  side?: "left" | "right";
  glowColor?: string;
  onSectionChange?: (id: string) => void;
};

/* ----------------------------------------------------------------------------
 * Constants
 * -------------------------------------------------------------------------- */

const TRACK_HEIGHT = 480; // px — fixed track height
const ORB_RIGHT = 8;      // px from right edge, keeps orb fully inside track
const ORB_SIZE = 26;
const ORB_RADIUS = ORB_SIZE / 2;
const TRACK_TOP = 16;
const TRACK_BOTTOM = TRACK_HEIGHT - 16;
const SECTION_ENTER_THRESHOLD = 0.7;
const SECTION_START_SNAP = 48; // px from viewport top to treat as "section start"
const SPOTLIGHT_LABEL_GAP = 20; // px gap between orb (dot) and label in default state

/* ----------------------------------------------------------------------------
 * Hooks
 * -------------------------------------------------------------------------- */

type SectionState = { activeId: string; inSection: boolean };

/**
 * Track both which section is active AND whether we are solidly inside it
 * (ratio > SECTION_ENTER_THRESHOLD). Between sections the ratio drops, hiding the label.
 */
function useActiveSection(
  sections: Section[],
  onChange?: (id: string) => void,
): SectionState & { setActiveId: (id: string) => void } {
  const [state, setState] = useState<SectionState>({
    activeId: sections[0]?.id ?? "",
    inSection: false,
  });
  const ratiosRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratiosRef.current.set(entry.target.id, entry.intersectionRatio);
        }
        let bestId = "";
        let bestRatio = -1;
        for (const [id, ratio] of ratiosRef.current) {
          if (ratio > bestRatio) { bestRatio = ratio; bestId = id; }
        }
        if (!bestId) return;
        setState((prev) => {
          const inSection = bestRatio >= SECTION_ENTER_THRESHOLD;
          if (prev.activeId !== bestId) onChange?.(bestId);
          if (prev.activeId === bestId && prev.inSection === inSection) return prev;
          return { activeId: bestId, inSection };
        });
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.75, 1], rootMargin: "0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  const setActiveId = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeId: id }));
  }, []);

  return { ...state, setActiveId };
}

/** Scroll progress 0..1 across the full document. */
function useScrollProgress() {
  const progress = useMotionValue(0);
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
  return progress;
}

/** Reduced-motion preference. */
function usePrefersReducedMotion() {
  const [v, setV] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const upd = () => setV(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);
  return v;
}

/* ----------------------------------------------------------------------------
 * Circular rail geometry (expanded hover mode)
 * -------------------------------------------------------------------------- */

const TRACK_WIDTH = 56; // component width
const RAIL_CURVE_DEPTH = TRACK_WIDTH * 0.42;

type Point = { x: number; y: number };

function buildCircularRailPoints(count: number, x: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const y = TRACK_TOP + t * (TRACK_BOTTOM - TRACK_TOP);
    const u = t * 2 - 1; // -1..1
    // Semi-ellipse profile gives a more circular arc than a sine offset.
    const arcX = x - Math.sqrt(Math.max(0, 1 - u * u)) * RAIL_CURVE_DEPTH;
    pts.push({ x: arcX, y });
  }
  return pts;
}

function pointsToRailPath(points: Point[]): string {
  if (points.length < 2) return "";
  const d: string[] = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`);
  }
  return d.join(" ");
}

/* ----------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

export default function NavbarxScrollbar({
  sections,
  side = "right",
  glowColor = "#7dd3fc",
  onSectionChange,
}: NaviBarProps) {
  const reduced = usePrefersReducedMotion();
  const { activeId, setActiveId } = useActiveSection(sections, onSectionChange);
  const scrollProgress = useScrollProgress();

  const [expanded, setExpanded] = useState(false);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  const activeIndex = Math.max(0, sections.findIndex((s) => s.id === activeId));
  const activeLabel = sections[activeIndex]?.label ?? "";
  const orbCenterX = TRACK_WIDTH - ORB_RIGHT - ORB_RADIUS;
  const [atSectionStart, setAtSectionStart] = useState(false);
  const points = useMemo(
    () => buildCircularRailPoints(sections.length, orbCenterX),
    [sections.length, orbCenterX],
  );
  const pathD = useMemo(() => pointsToRailPath(points), [points]);

  /* ---------- Orb Y — strictly 0..TRACK_HEIGHT, scroll-driven ---------- */

  const MIN_Y = TRACK_TOP;
  const MAX_Y = TRACK_BOTTOM;

  const orbYRaw = useTransform(scrollProgress, [0, 1], [MIN_Y, MAX_Y]);
  const orbY = useSpring(orbYRaw, { stiffness: 140, damping: 24, mass: 0.5 });

  // Manual drag: override orbY via direct spring targeting (no Framer drag prop)
  const dragOverride = useMotionValue<number | null>(null);

  // Compose: drag wins when active
  const finalY = useMotionValue(MIN_Y);

  useEffect(() => {
    const update = (v: number) => {
      if (dragOverride.get() == null) finalY.set(v);
    };
    return orbY.on("change", update);
  }, [orbY, dragOverride, finalY]);

  useEffect(() => {
    return dragOverride.on("change", (v) => {
      if (v != null) finalY.set(v);
    });
  }, [dragOverride, finalY]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    const update = () => {
      const el = activeId ? document.getElementById(activeId) : null;
      if (!el) {
        setAtSectionStart(false);
        raf = 0;
        return;
      }
      const isAtStart = Math.abs(el.getBoundingClientRect().top) <= SECTION_START_SNAP;
      setAtSectionStart(isAtStart);
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
  }, [activeId]);

  /* ---------- Drag via pointer events (no compounding transforms) ---------- */

  const scrollToSection = useCallback(
    (id: string) => {
      document.getElementById(id)?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
      setActiveId(id);
      onSectionChange?.(id);
    },
    [onSectionChange, reduced, setActiveId],
  );

  const snapToNearest = useCallback(
    (y: number) => {
      let bestIdx = 0;
      let bestDist = Infinity;
      sections.forEach((_, i) => {
        const sectionY = MIN_Y + (i / Math.max(sections.length - 1, 1)) * (MAX_Y - MIN_Y);
        const d = Math.abs(sectionY - y);
        if (d < bestDist) { bestDist = d; bestIdx = i; }
      });
      scrollToSection(sections[bestIdx].id);
    },
    [sections, scrollToSection, MIN_Y, MAX_Y],
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const y = Math.min(MAX_Y, Math.max(MIN_Y, e.clientY - rect.top));
    dragOverride.set(y);
  }, [dragOverride, MIN_Y, MAX_Y]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    const y = dragOverride.get();
    if (y != null) snapToNearest(y);
    dragOverride.set(null);
  }, [dragOverride, snapToNearest]);

  const scrollToPointerPosition = useCallback((clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const y = Math.min(MAX_Y, Math.max(MIN_Y, clientY - rect.top));
    const progress = (y - MIN_Y) / Math.max(MAX_Y - MIN_Y, 1);
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const top = Math.max(0, Math.min(maxScroll, progress * maxScroll));
    finalY.set(y);
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  }, [MIN_Y, MAX_Y, finalY, reduced]);

  const onRailPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (orbRef.current?.contains(target)) return;
    if (target.closest("button")) return;
    scrollToPointerPosition(e.clientY);
  }, [scrollToPointerPosition]);

  /* ---------- Keyboard ---------- */

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = sections[Math.min(activeIndex + 1, sections.length - 1)];
      if (next) scrollToSection(next.id);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = sections[Math.max(activeIndex - 1, 0)];
      if (prev) scrollToSection(prev.id);
    } else if (e.key === "Home") { e.preventDefault(); scrollToSection(sections[0].id); }
    else if (e.key === "End") { e.preventDefault(); scrollToSection(sections[sections.length - 1].id); }
  };

  /* ---------- Spotlight label position (always to the left) ---------- */
  // Show only when we're at the start of a section.
  const showSpotlight = !expanded && atSectionStart && Boolean(activeLabel);

  const sideClass = side === "right" ? "right-6" : "left-6";

  return (
    <motion.div
      ref={containerRef}
      role="navigation"
      aria-label="Section navigation"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onHoverStart={() => setExpanded(true)}
      onHoverEnd={() => { if (!isDragging.current) setExpanded(false); }}
      onFocus={() => setExpanded(true)}
      onBlur={() => { if (!isDragging.current) setExpanded(false); }}
      onPointerDown={onRailPointerDown}
      className={`fixed ${sideClass} top-1/2 -translate-y-1/2 z-50 outline-none cursor-pointer`}
      style={{ width: TRACK_WIDTH, height: TRACK_HEIGHT }}
    >
      {/* ── SVG circular rail track (expanded mode) ──────────────────────── */}
      <svg
        width={TRACK_WIDTH}
        height={TRACK_HEIGHT}
        viewBox={`0 0 ${TRACK_WIDTH} ${TRACK_HEIGHT}`}
        className="absolute inset-0 pointer-events-none overflow-visible"
        aria-hidden
      >
        <defs>
          <linearGradient id="navx-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={glowColor} stopOpacity="0" />
            <stop offset="50%"  stopColor={glowColor} stopOpacity="0.85" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
          </linearGradient>
          <filter id="navx-bloom" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="navx-aura" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={glowColor} stopOpacity="0.85" />
            <stop offset="65%"  stopColor={glowColor} stopOpacity="0.1" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Vertical rail */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="url(#navx-stroke)"
          strokeWidth={1.2}
          strokeLinecap="round"
          filter="url(#navx-bloom)"
          initial={false}
          animate={{ opacity: expanded ? 0.85 : 0, pathLength: expanded ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Energy pulse */}
        {expanded && !reduced && (
          <circle r={1.8} fill={glowColor} filter="url(#navx-bloom)" opacity={0.9}>
            <animateMotion dur="3.5s" repeatCount="indefinite" path={pathD} />
          </circle>
        )}

        {/* Circular checkpoints */}
        {points.map((p, i) => {
          const isActive = i === activeIndex;
          return (
            <motion.g
              key={sections[i].id}
              initial={false}
              animate={{ opacity: expanded ? 1 : 0, scale: expanded ? 1 : 0.3 }}
              transition={{
                duration: reduced ? 0 : 0.4,
                delay: expanded ? i * 0.045 : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={isActive ? 10 : 8}
                fill="none"
                stroke={glowColor}
                strokeWidth={isActive ? 1.6 : 1.2}
                opacity={isActive ? 0.95 : 0.45}
                filter="url(#navx-bloom)"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={isActive ? 5 : 3.6}
                fill={isActive ? "#fff" : glowColor}
                opacity={isActive ? 1 : 0.8}
              />
              {isActive && (
                <circle cx={p.x} cy={p.y} r={15} fill="url(#navx-aura)" opacity={0.35} />
              )}
            </motion.g>
          );
        })}
      </svg>

      {/* ── Expanded labels (hover) ───────────────────────────────────────── */}
      <AnimatePresence>
        {expanded && sections.map((s, i) => {
          const p = points[i];
          const isActive = i === activeIndex;
          return (
            <motion.button
              key={s.id}
              type="button"
              aria-label={`Go to ${s.label}`}
              aria-current={isActive ? "true" : undefined}
              onClick={() => scrollToSection(s.id)}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{
                duration: reduced ? 0 : 0.4,
                delay: reduced ? 0 : i * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`absolute text-[10px] tracking-[0.2em] uppercase font-medium whitespace-nowrap ${
                isActive ? "text-white" : "text-white/50 hover:text-white/75"
              }`}
              style={{
                top: p.y - 7,
                right: TRACK_WIDTH + 10,
                textShadow: isActive ? `0 0 10px ${glowColor}, 0 0 22px ${glowColor}55` : "none",
              }}
            >
              {s.label}
            </motion.button>
          );
        })}
      </AnimatePresence>

      {/* ── Spotlight label (idle, only when solidly in a section) ─────────── */}
      <AnimatePresence>
        {showSpotlight && (
          <motion.div
            key={activeId}
            className="absolute pointer-events-none flex items-center"
            style={{ top: finalY, left: orbCenterX - SPOTLIGHT_LABEL_GAP, translateY: "-50%", translateX: "-100%" }}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          >

            {/* Label */}
            <span
              className="text-[11px] tracking-[0.22em] uppercase font-medium text-white/90 whitespace-nowrap"
              style={{
                textShadow: `0 0 8px ${glowColor}, 0 0 20px ${glowColor}55`,
              }}
            >
              {activeLabel}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Orb — vertical rail only, pointer-event driven drag ──────────── */}
      <motion.div
        ref={orbRef}
        role="slider"
        aria-label="Scroll position"
        aria-valuemin={0}
        aria-valuemax={sections.length - 1}
        aria-valuenow={activeIndex}
        aria-valuetext={activeLabel}
        className="absolute cursor-pointer select-none"
        style={{
          // Keep orb inside the scrollbar track
          right: ORB_RIGHT,
          top: finalY,
          translateY: "-50%",
          width: ORB_SIZE,
          height: ORB_SIZE,
          pointerEvents: expanded ? "none" : "auto",
        }}
        animate={{ opacity: expanded ? 0 : 1, scale: expanded ? 0.9 : 1 }}
        transition={{ duration: reduced ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        whileHover={{ scale: 1.18 }}
        whileTap={{ scale: 1.28 }}
      >
        {/* Aura */}
        <span
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: -16,
            background: `radial-gradient(circle, ${glowColor}44 0%, transparent 70%)`,
            filter: "blur(10px)",
          }}
          aria-hidden
        />
        {/* Glow ring */}
        <span
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: `0 0 12px ${glowColor}cc, 0 0 24px ${glowColor}55`,
            border: `1px solid ${glowColor}99`,
          }}
          aria-hidden
        />
        {/* Glass core */}
        <span
          className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
          style={{
            width: 10,
            height: 10,
            transform: "translate(-50%,-50%)",
            background:
              "radial-gradient(circle at 30% 30%, #fff 0%, #ffffffcc 35%, #ffffff18 80%)",
            boxShadow: `0 0 6px ${glowColor}`,
          }}
          aria-hidden
        />
        {/* Conic shimmer */}
        {!reduced && (
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `conic-gradient(from 0deg, transparent, ${glowColor}, transparent 25%)`,
              mixBlendMode: "screen",
              opacity: 0.45,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            aria-hidden
          />
        )}
      </motion.div>
    </motion.div>
  );
}
