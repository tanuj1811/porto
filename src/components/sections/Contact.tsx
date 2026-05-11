import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiDownload } from "react-icons/fi";
import signImg from "@/assets/imgs/sign.png";
import { contactSocials, PERSONAL } from "@/utils/constant";

const accent = "var(--primary-blue)";

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-animate",
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="px-5 py-6 sm:px-6 sm:py-8 md:px-10 relative overflow-hidden flex items-center"
      style={{
        background:
          "radial-gradient(ellipse at 74% 64%, rgba(0,191,255,0.1) 0%, transparent 58%), #000",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div
        className="absolute left-0 top-0 h-px w-52"
        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
      />
      <div
        className="absolute left-0 top-0 h-52 w-px"
        style={{ background: `linear-gradient(to bottom, ${accent}, transparent)` }}
      />

      <div className="relative z-10 w-full max-w-[1180px] mx-auto">
        {/* <h2
          className="contact-animate uppercase font-medium tracking-[-0.035em] text-[clamp(22px,3.6vw,46px)] leading-[0.94]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(170,223,255,0.72) 78%, rgba(0,191,255,0.55) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Contact
        </h2> */}

        <div className="grid grid-cols-1 gap-6 pt-4 sm:pt-5 lg:grid-cols-2 xl:grid-cols-[minmax(220px,0.85fr)_minmax(280px,1.05fr)_minmax(240px,0.8fr)] xl:gap-8">
          <div className="contact-animate space-y-6">
            <div className="space-y-2">
              <p className="text-[clamp(13px,1.1vw,16px)] font-medium tracking-tight text-white/50">
                Email
              </p>
              <a
                href={`mailto:${PERSONAL.email}`}
                className="inline-block max-w-full break-all sm:break-normal text-[clamp(12px,1vw,15px)] leading-tight text-white transition-colors hover:text-white/70"
              >
                {PERSONAL.email}
              </a>
            </div>

            <div className="space-y-2">
              <p className="text-[clamp(13px,1.1vw,16px)] font-medium tracking-tight text-white/50">
                Location
              </p>
              <p className="text-[clamp(12px,1vw,15px)] leading-tight text-white">
                {PERSONAL.location}
              </p>
            </div>

            <a
              href={PERSONAL.resumePath}
              download
              className="inline-flex w-fit items-center gap-2 border-b border-white/50 pb-1 text-[14px] tracking-wide text-white/80 transition-colors hover:text-white"
            >
              <FiDownload />
              <span>Download Resume</span>
            </a>
          </div>

          <div className="contact-animate space-y-3">
            <p className="text-[clamp(13px,1.1vw,16px)] font-medium tracking-tight text-white/50">
              Social
            </p>
            <div className="flex flex-wrap gap-2">
              {contactSocials.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[clamp(12px,1vw,14px)] text-white/80 transition-all hover:border-white/35 hover:bg-white/10 hover:text-white"
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="relative contact-animate flex flex-col gap-4 lg:col-span-2 xl:col-span-1 xl:items-end xl:text-right xl:justify-between">
            <p className="max-w-[22ch] text-[clamp(12px,1vw,16px)] leading-[1.16] text-white/85">
              Developed by{" "}
            </p>
            <img src={signImg} alt="Signature" className="contact-sign" />
            <p className="text-[clamp(11px,0.9vw,14px)] text-white/45">© 2026 Tanuj. Software Engineer</p>
          </div>
        </div>
      </div>
    </section>
  );
}
