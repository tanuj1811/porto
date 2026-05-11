import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import avatarImg from "@/assets/imgs/avatar.png";
import { useLoading } from "@/components/LoadingProvider";
// import FloatingIcons from "@/components/FloatingIcons";
import Redacted from "@/components/redacted/Redacted";
import { PERSONAL } from "@/utils/constant";

gsap.registerPlugin(ScrollTrigger);

export default function HomeSection() {
  const { isLoading } = useLoading();
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const innerImgRef = useRef<HTMLImageElement>(null);
  const aboutLabelRef = useRef<HTMLSpanElement>(null);
  const aboutBodyRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    gsap.set(
      [imgRef.current, headingRef.current, descRef.current, btnRef.current],
      { autoAlpha: 0 }
    );
    gsap.set([aboutLabelRef.current, aboutBodyRef.current], {
      autoAlpha: 0,
      y: 30,
    });
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const els = [imgRef.current, headingRef.current, descRef.current, btnRef.current];
    gsap.killTweensOf(els);

    const tl = gsap.timeline({ defaults: { ease: "power3.out", overwrite: true } });

    tl.fromTo(imgRef.current,
        { autoAlpha: 0, x: -60 },
        { autoAlpha: 1, x: 0, duration: 1 }
      )
      .fromTo(headingRef.current,
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 0.8 },
        "-=0.5"
      )
      .fromTo(descRef.current,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.7 },
        "-=0.4"
      )
      .fromTo(btnRef.current,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.6 },
        "-=0.3"
      );

    return () => { tl.kill(); };
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      tl.fromTo(
          innerImgRef.current,
          { scale: 2 },
          { scale: 1, ease: "none", immediateRender: false },
          0
        )
        .fromTo(
          [headingRef.current, descRef.current, btnRef.current],
          { autoAlpha: 1, y: 0 },
          { autoAlpha: 0, y: -30, ease: "none", duration: 0.4, immediateRender: false },
          0
        )
        .fromTo(
          [aboutLabelRef.current, aboutBodyRef.current],
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, ease: "none", duration: 0.5, stagger: 0.05, immediateRender: false },
          0.45
        );
    }, sectionRef);

    return () => ctx.revert();
  }, [isLoading]);

  return (
    <section
      ref={sectionRef}
      id="home"
      style={{ position: "relative", height: "200vh" }}
    >
      {/* Anchor for the navbar's "About" link */}
      <div
        id="about"
        style={{
          position: "absolute",
          top: "100vh",
          width: 1,
          height: 1,
          pointerEvents: "none",
        }}
      />

      <div
        className="sticky top-0 h-screen overflow-hidden flex items-center justify-center pb-0 pt-[90px] md:pt-[170px] px-6"
      >
        {/* <FloatingIcons visible={!isLoading} /> */}

        {/* Giant "About Me" header — sits behind the avatar */}
        <div
          className="absolute inset-0 flex justify-end pointer-events-none mt-16 mx-8"
          style={{ zIndex: 0 }}
        >
          <span
            ref={aboutLabelRef}
            className="font-semibold tracking-tight whitespace-nowrap"
            style={{
              textAlign: "center",
              fontSize: "clamp(70px, 17vw, 460px)",
              lineHeight: 0.9,
              color: "transparent",
              WebkitTextStroke: "1.6px rgba(255,255,255,0.45)",
              opacity: 0.65,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
            }}
          >
            About{" "}
            <span
              style={{
                // backgroundImage:
                //   "linear-gradient(120deg, var(--primary-blue-dark) 0%, var(--primary-blue) 36%, #c9f0ff 50%, var(--primary-blue) 66%, var(--primary-blue-dark) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextStroke: "1.6px var(--primary-blue)",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              Me
            </span>
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16 w-full max-w-6xl relative" style={{ zIndex: 1 }}>
          {/* Avatar — hidden on mobile */}
          <div
            ref={imgRef}
            className="hidden md:block shrink-0 rounded-2xl overflow-hidden"
            style={{
              width: 630,
              position: "relative",
              zIndex: 2,
            }}
          >
            <img
              ref={innerImgRef}
              src={avatarImg}
              alt="Avatar"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top center",
                transform: "scale(2)",
                transformOrigin: "top center",
                willChange: "transform",
              }}
            />
          </div>

          {/* Text — two stacked layers that crossfade on scroll */}
          <div
            className="w-full md:flex-1 md:min-w-0 relative"
            style={{ minHeight: "60vh", zIndex: 3 }}
          >
            {/* Hey World layer */}
            <div className="absolute inset-0 flex flex-col gap-6 justify-center">
              <h1
                ref={headingRef}
                className="font-semibold tracking-tight text-[52px] md:text-[100px]"
                style={{
                  lineHeight: 1.05,
                  background:
                    "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.18) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Hey! I am {PERSONAL.displayName}
              </h1>
              <p
                ref={descRef}
                className="leading-relaxed text-[16px] md:text-[22px]"
                style={{
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.6,
                  maxWidth: 480,
                }}
              >
                I turn my caffeine, and questionable sleep schedules into smooth web experiences.{" "} Currently working with {" "}

                <Redacted />
                , making businesses grow, users smile, and developers complain slightly less. I like clean UIs, and build only those.
              </p>
              {/* <button
                ref={btnRef}
                className="mt-2 self-start font-medium rounded-full transition-all"
                style={{
                  fontSize: "18px",
                  padding: "12px 28px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "var(--text)",
                  background: "rgba(255,255,255,0.05)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.05)";
                }}
              >
                Wanna Connect?
              </button> */}
            </div>

            {/* About Me layer */}
            <div className="absolute inset-0 gap-8 justify-center mt-16" style={{ pointerEvents: "none" }}>
              <h2
                ref={aboutBodyRef}
                className="leading-relaxed text-[15px] md:text-[22px]"
                style={{
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.6,
                  maxWidth: 640,
                  margin: 0,
                  pointerEvents: "auto",
                }}
              >
                  I am verified Human not AI, but uses AI alot. I build fast, interactive, and scalable web experiences
                  with a strong focus on clean UI and smooth user interaction.

                  <br/>Over the last 3 years, I’ve been working on industry-level
                  AI products, turning complex ideas into experiences people
                  can actually enjoy using.
                  <br/>
                  <br/>
                  Outside of development,
                  I spend time reading (typically literature, Sci-Fi, Self-Help.), watching movies (<a
                    href={PERSONAL.letterboxd}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "inherit", textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                  >see my letterboxd</a>), travelling, listening to music,
                  playing chess (just kidding, i am bad at it.), and occasionally pretending
                  I’ll sleep early after “just one more feature”.

                  But reallyfv, I genuinely love <b>what I do</b>,
                  and that obsession reflects in my work.
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
