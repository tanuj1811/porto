import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";

/* ────────────────────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────────────────── */

export type TooltipPosition = "top" | "bottom" | "left" | "right";
export type TooltipVariant = "default" | "rich" | "interactive";
export type TooltipTrigger = "hover" | "focus" | "click";

export type LumaTooltipProps = {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  hideDelay?: number;
  glowColor?: string;
  variant?: TooltipVariant;
  followCursor?: boolean;
  disabled?: boolean;
  trigger?: TooltipTrigger | TooltipTrigger[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  offset?: number;
  className?: string;
};

type Rect = { top: number; left: number; width: number; height: number };
type Resolved = {
  position: TooltipPosition;
  x: number;
  y: number;
  triggerCenter: { x: number; y: number };
};

/* ────────────────────────────────────────────────────────────────────────────
 * Group controller — only one tooltip visible at a time
 * ──────────────────────────────────────────────────────────────────────── */

const groupListeners = new Set<(id: string) => void>();
const announceOpen = (id: string) =>
  groupListeners.forEach((l) => l(id));

/* ────────────────────────────────────────────────────────────────────────────
 * Positioning
 * ──────────────────────────────────────────────────────────────────────── */

function fitsInViewport(
  position: TooltipPosition,
  trigger: Rect,
  size: { width: number; height: number },
  offset: number,
  padding = 8,
): boolean {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  switch (position) {
    case "top":
      return trigger.top - size.height - offset >= padding;
    case "bottom":
      return trigger.top + trigger.height + size.height + offset <= vh - padding;
    case "left":
      return trigger.left - size.width - offset >= padding;
    case "right":
      return trigger.left + trigger.width + size.width + offset <= vw - padding;
  }
}

function computeCoords(
  position: TooltipPosition,
  trigger: Rect,
  size: { width: number; height: number },
  offset: number,
): { x: number; y: number } {
  const vw = window.innerWidth;
  const padding = 8;
  let x = 0;
  let y = 0;
  switch (position) {
    case "top":
      x = trigger.left + trigger.width / 2 - size.width / 2;
      y = trigger.top - size.height - offset;
      break;
    case "bottom":
      x = trigger.left + trigger.width / 2 - size.width / 2;
      y = trigger.top + trigger.height + offset;
      break;
    case "left":
      x = trigger.left - size.width - offset;
      y = trigger.top + trigger.height / 2 - size.height / 2;
      break;
    case "right":
      x = trigger.left + trigger.width + offset;
      y = trigger.top + trigger.height / 2 - size.height / 2;
      break;
  }
  // Clamp horizontally / vertically into viewport
  if (position === "top" || position === "bottom") {
    x = Math.max(padding, Math.min(x, vw - size.width - padding));
  } else {
    y = Math.max(padding, Math.min(y, window.innerHeight - size.height - padding));
  }
  return { x: x + window.scrollX, y: y + window.scrollY };
}

function flipPosition(p: TooltipPosition): TooltipPosition {
  return (
    { top: "bottom", bottom: "top", left: "right", right: "left" } as const
  )[p];
}

function useTooltipPosition({
  open,
  triggerRef,
  tooltipRef,
  preferred,
  offset,
  cursor,
  followCursor,
}: {
  open: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
  preferred: TooltipPosition;
  offset: number;
  cursor: { x: number; y: number } | null;
  followCursor: boolean;
}): Resolved | null {
  const [resolved, setResolved] = useState<Resolved | null>(null);

  const compute = useCallback(() => {
    const trig = triggerRef.current;
    const tip = tooltipRef.current;
    if (!trig || !tip) return;

    const tRect = trig.getBoundingClientRect();
    const triggerRect: Rect = followCursor && cursor
      ? { top: cursor.y - 1, left: cursor.x - 1, width: 2, height: 2 }
      : { top: tRect.top, left: tRect.left, width: tRect.width, height: tRect.height };

    const size = { width: tip.offsetWidth, height: tip.offsetHeight };

    let pos = preferred;
    if (!fitsInViewport(pos, triggerRect, size, offset)) {
      const flipped = flipPosition(pos);
      if (fitsInViewport(flipped, triggerRect, size, offset)) {
        pos = flipped;
      } else {
        // Pick whichever side has more room
        const order: TooltipPosition[] = ["top", "bottom", "right", "left"];
        const best = order.find((p) =>
          fitsInViewport(p, triggerRect, size, offset),
        );
        if (best) pos = best;
      }
    }

    const { x, y } = computeCoords(pos, triggerRect, size, offset);
    const triggerCenter = {
      x: triggerRect.left + triggerRect.width / 2 + window.scrollX,
      y: triggerRect.top + triggerRect.height / 2 + window.scrollY,
    };
    setResolved({ position: pos, x, y, triggerCenter });
  }, [triggerRef, tooltipRef, preferred, offset, cursor, followCursor]);

  useLayoutEffect(() => {
    if (!open) return;
    compute();
  }, [open, compute]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => compute();
    const onResize = () => compute();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    let ro: ResizeObserver | null = null;
    if (tooltipRef.current && "ResizeObserver" in window) {
      ro = new ResizeObserver(() => compute());
      ro.observe(tooltipRef.current);
    }
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
    };
  }, [open, compute, tooltipRef]);

  return resolved;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Portal
 * ──────────────────────────────────────────────────────────────────────── */

function useTooltipPortal(): HTMLElement | null {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    let node = document.getElementById("luma-tooltip-root") as HTMLElement | null;
    if (!node) {
      node = document.createElement("div");
      node.id = "luma-tooltip-root";
      node.style.position = "absolute";
      node.style.top = "0";
      node.style.left = "0";
      node.style.zIndex = "2147483646";
      node.style.pointerEvents = "none";
      document.body.appendChild(node);
    }
    setEl(node);
  }, []);
  return el;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Motion variants
 * ──────────────────────────────────────────────────────────────────────── */

const ENTER_EASE = [0.22, 1, 0.36, 1] as const;
const EXIT_EASE = [0.4, 0, 0.6, 1] as const;

const tooltipVariants = (reduced: boolean, dir: TooltipPosition): Variants => {
  const offset = 6;
  const oy = dir === "top" ? offset : dir === "bottom" ? -offset : 0;
  const ox = dir === "left" ? offset : dir === "right" ? -offset : 0;

  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.15 } },
      exit: { opacity: 0, transition: { duration: 0.12 } },
    };
  }
  return {
    hidden: {
      opacity: 0,
      scale: 0.92,
      x: ox,
      y: oy,
      filter: "blur(6px)",
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.42,
        ease: ENTER_EASE,
        filter: { duration: 0.32, ease: ENTER_EASE },
      },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      filter: "blur(4px)",
      transition: { duration: 0.22, ease: EXIT_EASE },
    },
  };
};

const contentStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.12 } },
  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
};

const contentItem: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: ENTER_EASE } },
  exit: { opacity: 0, y: 2, transition: { duration: 0.15 } },
};

/* ────────────────────────────────────────────────────────────────────────────
 * Hover bridge — invisible polygon between trigger and tooltip
 * ──────────────────────────────────────────────────────────────────────── */

function HoverBridge({
  triggerRect,
  tooltipRect,
  onEnter,
}: {
  triggerRect: DOMRect | null;
  tooltipRect: DOMRect | null;
  onEnter: () => void;
}) {
  if (!triggerRect || !tooltipRect) return null;
  const sx = window.scrollX;
  const sy = window.scrollY;
  const tr = {
    top: triggerRect.top + sy,
    left: triggerRect.left + sx,
    right: triggerRect.right + sx,
    bottom: triggerRect.bottom + sy,
  };
  const tp = {
    top: tooltipRect.top + sy,
    left: tooltipRect.left + sx,
    right: tooltipRect.right + sx,
    bottom: tooltipRect.bottom + sy,
  };
  const minX = Math.min(tr.left, tp.left);
  const minY = Math.min(tr.top, tp.top);
  const maxX = Math.max(tr.right, tp.right);
  const maxY = Math.max(tr.bottom, tp.bottom);

  return (
    <div
      onMouseEnter={onEnter}
      style={{
        position: "absolute",
        top: minY,
        left: minX,
        width: maxX - minX,
        height: maxY - minY,
        pointerEvents: "auto",
        background: "transparent",
      }}
      aria-hidden
    />
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Connector — soft glowing light thread between trigger and tooltip
 * ──────────────────────────────────────────────────────────────────────── */

function LightConnector({
  from,
  to,
  color,
  visible,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  visible: boolean;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len < 4) return null;

  const minX = Math.min(from.x, to.x) - 8;
  const minY = Math.min(from.y, to.y) - 8;
  const w = Math.abs(dx) + 16;
  const h = Math.abs(dy) + 16;

  const x1 = from.x - minX;
  const y1 = from.y - minY;
  const x2 = to.x - minX;
  const y2 = to.y - minY;

  return (
    <svg
      style={{
        position: "absolute",
        top: minY,
        left: minX,
        width: w,
        height: h,
        pointerEvents: "none",
        overflow: "visible",
      }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`luma-thread-${color.replace(/[^a-z0-9]/gi, "")}`} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={`url(#luma-thread-${color.replace(/[^a-z0-9]/gi, "")})`}
        strokeWidth={1}
        strokeLinecap="round"
        initial={{ opacity: 0, pathLength: 0 }}
        animate={
          visible
            ? { opacity: [0, 1, 0.7], pathLength: 1 }
            : { opacity: 0, pathLength: 0 }
        }
        transition={{ duration: 0.5, ease: ENTER_EASE }}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Main component
 * ──────────────────────────────────────────────────────────────────────── */

export function LumaTooltip({
  content,
  children,
  position = "top",
  delay = 200,
  hideDelay = 140,
  glowColor = "#7DD3FC",
  variant = "default",
  followCursor = false,
  disabled = false,
  trigger = "hover",
  open: controlledOpen,
  onOpenChange,
  offset = 14,
  className,
}: LumaTooltipProps) {
  const id = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const portal = useTooltipPortal();
  const reduced = useReducedMotion() ?? false;

  const triggers = useMemo(
    () => (Array.isArray(trigger) ? trigger : [trigger]),
    [trigger],
  );

  const [uOpen, setUOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? !!controlledOpen : uOpen;

  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  // Cursor parallax
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const sx = useSpring(mvX, { stiffness: 200, damping: 20, mass: 0.6 });
  const sy = useSpring(mvY, { stiffness: 200, damping: 20, mass: 0.6 });
  const tiltX = useTransform(sy, [-40, 40], [3, -3]);
  const tiltY = useTransform(sx, [-40, 40], [-3, 3]);
  const parallaxX = useTransform(sx, [-40, 40], [-3, 3]);
  const parallaxY = useTransform(sy, [-40, 40], [-3, 3]);

  const setOpen = useCallback(
    (v: boolean) => {
      if (!isControlled) setUOpen(v);
      onOpenChange?.(v);
      if (v) announceOpen(id);
    },
    [isControlled, onOpenChange, id],
  );

  // Group: close when another opens
  useEffect(() => {
    const listener = (otherId: string) => {
      if (otherId !== id) {
        if (showTimer.current) window.clearTimeout(showTimer.current);
        if (!isControlled) setUOpen(false);
      }
    };
    groupListeners.add(listener);
    return () => {
      groupListeners.delete(listener);
    };
  }, [id, isControlled]);

  const clearTimers = useCallback(() => {
    if (showTimer.current) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const requestShow = useCallback(() => {
    if (disabled) return;
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (open) return;
    showTimer.current = window.setTimeout(() => setOpen(true), delay);
  }, [disabled, delay, open, setOpen]);

  const requestHide = useCallback(() => {
    if (showTimer.current) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    hideTimer.current = window.setTimeout(() => setOpen(false), hideDelay);
  }, [hideDelay, setOpen]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // Mirror trigger ref from rendered child wrapper. With display: contents,
  // the wrapper has no box of its own — fall back to firstElementChild so
  // positioning and the existing host layout/styles aren't affected.
  useLayoutEffect(() => {
    const wrap = wrapperRef.current;
    if (!wrap) return;
    const target = (wrap.firstElementChild as HTMLElement) ?? wrap;
    triggerRef.current = target;
    setTriggerRect(target.getBoundingClientRect());
  }, [children]);

  // Update tooltip rect when open
  useLayoutEffect(() => {
    if (!open || !tooltipRef.current) {
      setTooltipRect(null);
      return;
    }
    setTooltipRect(tooltipRef.current.getBoundingClientRect());
  }, [open, cursor]);

  const resolved = useTooltipPosition({
    open,
    triggerRef,
    tooltipRef,
    preferred: position,
    offset,
    cursor,
    followCursor,
  });

  // Cursor tracking on trigger
  const onMouseMoveTrigger = useCallback(
    (e: React.MouseEvent) => {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      const cx = e.clientX - (r.left + r.width / 2);
      const cy = e.clientY - (r.top + r.height / 2);
      mvX.set(cx);
      mvY.set(cy);
      if (followCursor) {
        setCursor({ x: e.clientX, y: e.clientY });
      }
    },
    [followCursor, mvX, mvY],
  );

  // ESC dismiss for interactive variant
  useEffect(() => {
    if (!open || variant !== "interactive") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, variant, setOpen]);

  // Build event handlers for trigger
  const triggerHandlers: React.HTMLAttributes<HTMLElement> = {};
  if (triggers.includes("hover")) {
    triggerHandlers.onMouseEnter = () => requestShow();
    triggerHandlers.onMouseLeave = () => requestHide();
    triggerHandlers.onMouseMove = onMouseMoveTrigger;
  }
  if (triggers.includes("focus")) {
    triggerHandlers.onFocus = () => {
      if (disabled) return;
      setOpen(true);
    };
    triggerHandlers.onBlur = () => requestHide();
  }
  if (triggers.includes("click")) {
    triggerHandlers.onClick = () => {
      if (disabled) return;
      setOpen(!open);
    };
  }

  /* Render */

  const tooltipStyle: CSSProperties = resolved
    ? {
        position: "absolute",
        top: resolved.y,
        left: resolved.x,
        pointerEvents: variant === "interactive" ? "auto" : "none",
      }
    : {
        position: "absolute",
        top: -9999,
        left: -9999,
        opacity: 0,
        pointerEvents: "none",
      };

  const variants = tooltipVariants(reduced, resolved?.position ?? position);

  const showConnector = !reduced && resolved && variant === "default";

  return (
    <>
      <span
        ref={wrapperRef}
        aria-describedby={open ? id : undefined}
        onMouseEnter={triggerHandlers.onMouseEnter}
        onMouseLeave={triggerHandlers.onMouseLeave}
        onMouseMove={triggerHandlers.onMouseMove}
        onFocus={triggerHandlers.onFocus}
        onBlur={triggerHandlers.onBlur}
        onClick={triggerHandlers.onClick}
        style={{ display: "contents" }}
      >
        {children}
      </span>

      {portal &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                {/* Hover bridge — keeps tooltip alive when crossing the gap */}
                {triggers.includes("hover") && variant !== "interactive" && (
                  <HoverBridge
                    triggerRect={triggerRect}
                    tooltipRect={tooltipRect}
                    onEnter={() => {
                      if (hideTimer.current) {
                        window.clearTimeout(hideTimer.current);
                        hideTimer.current = null;
                      }
                    }}
                  />
                )}

                {/* Light connector */}
                {showConnector && tooltipRect && (
                  <LightConnector
                    visible={open}
                    color={glowColor}
                    from={resolved!.triggerCenter}
                    to={{
                      x: resolved!.x + tooltipRect.width / 2,
                      y: resolved!.y + tooltipRect.height / 2,
                    }}
                  />
                )}

                <motion.div
                  ref={tooltipRef}
                  id={id}
                  role="tooltip"
                  key="luma-tooltip"
                  style={{
                    ...tooltipStyle,
                    rotateX: reduced ? 0 : tiltX,
                    rotateY: reduced ? 0 : tiltY,
                    x: reduced ? 0 : parallaxX,
                    y: reduced ? 0 : parallaxY,
                    transformPerspective: 800,
                  }}
                  variants={variants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onMouseEnter={() => {
                    if (hideTimer.current) {
                      window.clearTimeout(hideTimer.current);
                      hideTimer.current = null;
                    }
                  }}
                  onMouseLeave={() => {
                    if (triggers.includes("hover")) requestHide();
                  }}
                >
                  <TooltipBody
                    glowColor={glowColor}
                    variant={variant}
                    reduced={reduced}
                    className={className}
                  >
                    <motion.div
                      variants={contentStagger}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {variant === "default" ? (
                        <motion.div variants={contentItem}>{content}</motion.div>
                      ) : (
                        <StaggeredChildren>{content}</StaggeredChildren>
                      )}
                    </motion.div>
                  </TooltipBody>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          portal,
        )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Tooltip body — glass surface, glow, pulse, inner highlight
 * ──────────────────────────────────────────────────────────────────────── */

function TooltipBody({
  children,
  glowColor,
  variant,
  reduced,
  className,
}: {
  children: ReactNode;
  glowColor: string;
  variant: TooltipVariant;
  reduced: boolean;
  className?: string;
}) {
  const widthClass =
    variant === "rich" || variant === "interactive"
      ? "max-w-xs min-w-[14rem]"
      : "max-w-[18rem]";

  return (
    <div
      className={`relative ${widthClass}`}
      style={{ ["--luma-glow" as string]: glowColor }}
    >
      {/* Outer ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[1.75rem] opacity-70"
        style={{
          background: `radial-gradient(60% 60% at 50% 50%, ${glowColor}40 0%, transparent 70%)`,
          filter: "blur(14px)",
        }}
      />

      {/* Pulse wave on entry */}
      {!reduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          initial={{ opacity: 0.5, scale: 0.9 }}
          animate={{ opacity: 0, scale: 1.4 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{
            boxShadow: `0 0 0 1px ${glowColor}66, 0 0 30px ${glowColor}55`,
          }}
        />
      )}

      {/* Glass surface */}
      <div
        className={[
          "relative overflow-hidden rounded-2xl px-3.5 py-2.5",
          "bg-neutral-950/70 backdrop-blur-xl",
          "text-[13px] leading-snug text-white/90",
          "shadow-[0_8px_30px_-6px_rgba(0,0,0,0.6),0_2px_8px_-2px_rgba(0,0,0,0.5)]",
          className ?? "",
        ].join(" ")}
        style={{
          border: `1px solid ${glowColor}33`,
          boxShadow: `inset 0 1px 0 0 ${glowColor}26, 0 0 0 1px rgba(255,255,255,0.04), 0 10px 40px -10px ${glowColor}33, 0 4px 20px -4px rgba(0,0,0,0.55)`,
        }}
      >
        {/* Top inner highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${glowColor}aa, transparent)`,
          }}
        />
        {/* Soft gradient sheen */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            background: `radial-gradient(120% 60% at 50% 0%, ${glowColor}, transparent 60%)`,
          }}
        />
        {/* Shimmer */}
        {!reduced && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ backgroundPositionX: "-150%" }}
            animate={{ backgroundPositionX: "250%" }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            style={{
              background: `linear-gradient(115deg, transparent 30%, ${glowColor}1a 50%, transparent 70%)`,
              backgroundSize: "200% 100%",
              mixBlendMode: "screen",
            }}
          />
        )}

        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Stagger helper — wraps each top-level child in a motion item for rich content
 * ──────────────────────────────────────────────────────────────────────── */

function StaggeredChildren({ children }: { children: ReactNode }) {
  const arr = Array.isArray(children) ? children : [children];
  return (
    <>
      {arr.map((child, i) => (
        <motion.div key={i} variants={contentItem}>
          {child}
        </motion.div>
      ))}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Convenience layouts for rich tooltips
 * ──────────────────────────────────────────────────────────────────────── */

export function LumaTooltipRich({
  icon,
  title,
  description,
  actions,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      {icon && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/80">
          {icon}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="text-[13px] font-medium text-white">{title}</div>
        {description && (
          <div className="text-[12px] leading-relaxed text-white/60">
            {description}
          </div>
        )}
        {actions && <div className="mt-1.5 flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export default LumaTooltip;
