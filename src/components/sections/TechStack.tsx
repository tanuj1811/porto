import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../../styles/TechStack.css";
import { techStackCategories as categories } from "@/utils/constant";

gsap.registerPlugin(ScrollTrigger);

const STD = "cubic-bezier(0.2,0,0,1)";
const DEC = "cubic-bezier(0,0,0.2,1)";
const BASE_ROTATIONS = [-8, -3, 0, 4, 8];
const SCATTER_SHIFT = 88;

const getSummary = (category: string) => {
  if (category === "Language")
    return "Core languages I use to write typed, maintainable, production-grade software.";
  if (category === "Frontend Lib/Framework")
    return "UI libraries and frameworks for building fast, responsive product experiences.";
  if (category === "Backend Lib/Framework")
    return "Backend frameworks and runtimes used to design reliable API and service layers.";
  if (category === "Database")
    return "Storage and search systems for structured data, indexing, and retrieval workloads.";
  return "Supporting software tools used across daily development and product delivery.";
};

const TOTAL_TOOLS = categories.reduce((s, c) => s + c.items.length, 0);

const TechStack = () => {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const stageRef    = useRef<HTMLDivElement>(null);
  const cardRefs    = useRef<(HTMLElement | null)[]>([]);
  const eyebrowRef  = useRef<HTMLParagraphElement>(null);
  const headClipRef = useRef<HTMLDivElement>(null);
  const descRef     = useRef<HTMLParagraphElement>(null);
  const statsRef    = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(2);

  useEffect(() => {
    const section  = sectionRef.current;
    const stage    = stageRef.current;
    const cards    = cardRefs.current.filter(Boolean) as HTMLElement[];
    const eyebrow  = eyebrowRef.current;
    const headClip = headClipRef.current;
    const desc     = descRef.current;
    const stats    = statsRef.current;
    if (!section || !stage || !cards.length) return;

    // ── Header reveal ─────────────────────────────────────────────────
    const headText = headClip?.querySelector<HTMLElement>(".ts-head-text");
    if (eyebrow) gsap.set(eyebrow, { y: 16, autoAlpha: 0 });
    if (headText) gsap.set(headText, { y: "105%", autoAlpha: 1 });
    if (desc)    gsap.set(desc,    { y: 18, autoAlpha: 0 });
    if (stats) {
      gsap.set(stats.querySelectorAll(".ts-stat"), { y: 16, autoAlpha: 0 });
    }

    const headerTl = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top 80%", once: true },
    });
    if (eyebrow) headerTl.to(eyebrow, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" });
    if (headText) headerTl.to(headText, { y: "0%", duration: 0.8, ease: "power4.out" }, "-=0.25");
    if (desc)    headerTl.to(desc,    { y: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out" }, "-=0.45");
    if (stats) {
      headerTl.to(stats.querySelectorAll(".ts-stat"), {
        y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out", stagger: 0.1,
      }, "-=0.35");
    }

    const isTouch =
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth < 1321;

    // ── Initial stacked state — all cards piled at center, below stage ──
    cards.forEach((card, i) => {
      gsap.set(card, {
        transformPerspective: 1200,
        autoAlpha: 0,
        y: 140,
        rotationZ: i % 2 === 0 ? 0.55 : -0.55,
        scale: 0.88,
        zIndex: categories.length - i,
      });
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    // ── quickTo setters (desktop only — created now, wired after reveal) ──
    const q = isTouch
      ? null
      : cards.map((card) => ({
          x: gsap.quickTo(card, "x", { duration: 0.38, ease: STD }),
          y: gsap.quickTo(card, "y", { duration: 0.38, ease: STD }),
          rx: gsap.quickTo(card, "rotationX", { duration: 0.18, ease: STD }),
          ry: gsap.quickTo(card, "rotationY", { duration: 0.18, ease: STD }),
          rz: gsap.quickTo(card, "rotationZ", { duration: 0.28, ease: STD }),
          sc: gsap.quickTo(card, "scale", { duration: 0.35, ease: STD }),
        }));

    let zCounter = 10;
    let activeIndex = -1;
    let collapseTimer: ReturnType<typeof setTimeout> | null = null;
    const cleanups: (() => void)[] = [];

    const scatterSiblings = (fromIndex: number) => {
      if (!q) return;
      cards.forEach((c, j) => {
        if (j === fromIndex) return;
        q[j].x(j < fromIndex ? -SCATTER_SHIFT : SCATTER_SHIFT);
        gsap.to(c, { opacity: 0.65, duration: 0.3, ease: STD, overwrite: "auto" });
      });
    };

    const collapseFan = () => {
      if (!q) return;
      cards.forEach((c, j) => {
        q[j].x(0);
        q[j].y(0);
        q[j].rx(0);
        q[j].ry(0);
        q[j].rz(BASE_ROTATIONS[j]);
        q[j].sc(1);
        gsap.to(c, { opacity: 1, duration: 0.42, ease: DEC, overwrite: "auto" });
      });
    };

    const wireHover = () => {
      if (!q || isTouch) return;

      cards.forEach((card, i) => {
        const onEnter = () => {
          clearTimeout(collapseTimer!);
          activeIndex = i;
          gsap.set(card, { zIndex: ++zCounter });
          scatterSiblings(i);
          gsap.to(card, {
            scale: 1.06,
            opacity: 1,
            duration: 0.3,
            ease: "back.out(1.2)",
            overwrite: "auto",
          });
          q[i].y(-22);
          q[i].rz(0);
        };

        const onMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const nx =
            (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
          const ny =
            (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
          const d = Math.sqrt(nx * nx + ny * ny);

          q[i].rx(-ny * 8);
          q[i].ry(nx * 8);
          q[i].rz(nx * 1.5);
          q[i].sc(1.06 - d * 0.012);

          card.style.setProperty(
            "--mouse-x",
            `${((e.clientX - rect.left) / rect.width) * 100}%`,
          );
          card.style.setProperty(
            "--mouse-y",
            `${((e.clientY - rect.top) / rect.height) * 100}%`,
          );
        };

        const onLeave = () => {
          activeIndex = -1;
          collapseTimer = setTimeout(() => {
            if (activeIndex === -1) collapseFan();
          }, 240);

          q[i].x(0);
          q[i].y(0);
          q[i].rx(0);
          q[i].ry(0);
          q[i].rz(BASE_ROTATIONS[i]);
          gsap.to(card, {
            scale: 1,
            duration: 0.38,
            ease: DEC,
            overwrite: "auto",
          });
        };

        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mousemove", onMove as EventListener);
        card.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          card.removeEventListener("mouseenter", onEnter);
          card.removeEventListener("mousemove", onMove as EventListener);
          card.removeEventListener("mouseleave", onLeave);
        });
      });
    };

    // ── Deck reveal on scroll ─────────────────────────────────────────
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 75%",
      once: true,
      onEnter: () => {
        stage.classList.add("deck-animating");

        // Phase 1: Cards emerge — staggered opacity
        gsap.to(cards, {
          autoAlpha: 1,
          duration: 0.25,
          stagger: { each: 0.22, from: "end" },
          ease: "none",
          force3D: true,
          overwrite: "auto",
        });

        // Phase 2: Pile-up — each card snaps to center with expo gravity
        gsap.to(cards, {
          y: 0,
          scale: 1,
          rotationZ: 0,
          duration: 1.6,
          ease: "expo.out",
          stagger: { each: 0.22, from: "end" },
          force3D: true,
          overwrite: "auto",
          onComplete: function () {
            // Only proceed when the last-arriving card (cards[0]) lands
            if ((this as unknown as gsap.core.Tween).targets()[0] !== cards[0]) return;

            // Phase 3: Fan out — cards spread to their base rotations
            gsap.to(cards, {
              x: 0,
              y: 0,
              rotationZ: (idx: number) => BASE_ROTATIONS[idx],
              scale: 1,
              stagger: { each: 0.07, from: "end" },
              duration: 0.65,
              ease: "back.out(1.4)",
              force3D: true,
              onComplete: () => {
                // Hard-snap for pixel-perfect hover registration
                cards.forEach((c, idx) => {
                  gsap.set(c, {
                    x: 0,
                    y: 0,
                    rotationZ: BASE_ROTATIONS[idx],
                    scale: 1,
                    transformPerspective: 1200,
                  });
                });

                // Phase 4: remove animating lock, enable hover
                stage.classList.add("deck-settling");
                requestAnimationFrame(() =>
                  stage.classList.remove("deck-animating"),
                );
                setTimeout(() => stage.classList.remove("deck-settling"), 750);

                wireHover();
              },
            });
          },
        });
      },
    });

    return () => {
      headerTl.scrollTrigger?.kill();
      headerTl.kill();
      trigger.kill();
      clearTimeout(collapseTimer!);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  let cardIndex = 0;

  return (
    <div
      id="techstack"
      ref={sectionRef}
      className="w-full max-w-[1450px] mx-auto px-6 md:px-10 box-sizing-border"
    >
      <div className="w-full">

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="ts-header">
          <p className="ts-eyebrow" ref={eyebrowRef}>Tech expertise</p>

          <div className="ts-head-clip" ref={headClipRef}>
            <h2 className="ts-head-text">
              My <span>Tech Stack</span>
            </h2>
          </div>

          <p className="ts-desc" ref={descRef}>
            Tools I reach for to ship end-to-end products
          </p>

          <div className="ts-stats" ref={statsRef}>
            <div className="ts-stat">
              <span className="ts-stat-num">{categories.length}</span>
              <span className="ts-stat-label">Categories</span>
            </div>
            <div className="ts-stat-sep" aria-hidden="true" />
            <div className="ts-stat">
              <span className="ts-stat-num">{TOTAL_TOOLS}+</span>
              <span className="ts-stat-label">Tools</span>
            </div>
            <div className="ts-stat-sep" aria-hidden="true" />
            <div className="ts-stat">
              <span className="ts-stat-num">∞</span>
              <span className="ts-stat-label">Coffee cups</span>
            </div>
          </div>
        </div>

        <div className="techstack-stage" ref={stageRef}>
          {categories.map((cat, index) => {
            const idx = cardIndex++;
            const majorIcon = cat.items[0]?.icon;
            const MajorIcon = majorIcon;
            const hiddenCount = Math.max(cat.items.length - 6, 0);

            return (
              <article
                key={cat.name}
                data-index={index}
                className={`tech-exp-card ${hoveredIndex === index ? "is-hovered" : ""}`}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
                tabIndex={0}
              >
                <div className="tech-exp-card-header">
                  <div className="tech-exp-card-left">
                    <span className="tech-exp-card-logo" aria-hidden>
                      {MajorIcon ? <MajorIcon /> : null}
                    </span>
                    <span className="tech-exp-card-company">{cat.name}</span>
                  </div>
                  <span className="tech-exp-date">{cat.items.length} tools</span>
                </div>

                <h3 className="tech-exp-role">{cat.name}</h3>
                <p className="tech-exp-desc">{getSummary(cat.name)}</p>

                <div className="tech-exp-pills">
                  {cat.items.slice(0, 6).map((item) => {
                    const Icon = item.icon;
                    return (
                      <span
                        key={`${cat.name}-${item.label}`}
                        className="tech-exp-pill"
                      >
                        <Icon style={{ color: item.color }} />
                        <span>{item.label}</span>
                      </span>
                    );
                  })}
                  {hiddenCount > 0 ? (
                    <span className="tech-exp-pill tech-exp-pill-more">
                      +{hiddenCount} more
                    </span>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TechStack;
