import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../../styles/Career.css";
import { careerEntries as entries } from "@/utils/constant";

gsap.registerPlugin(ScrollTrigger);

const Career = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const timeline = timelineRef.current;
    if (!section || !timeline) return;

    gsap.set(timeline, { maxHeight: "0%" });
    gsap.set(boxRefs.current, { autoAlpha: 0, y: 32 });

    const lineAnim = gsap.to(timeline, {
      maxHeight: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "bottom 60%",
        scrub: 0.6,
      },
    });

    const boxAnims = boxRefs.current.map((box) =>
      gsap.to(box, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: box,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      })
    );

    return () => {
      lineAnim.scrollTrigger?.kill();
      lineAnim.kill();
      boxAnims.forEach((a) => {
        a.scrollTrigger?.kill();
        a.kill();
      });
    };
  }, []);

  return (
    <div
      id="experience"
      ref={sectionRef}
      className="w-full max-w-[1400px] mx-auto px-5 md:px-10 box-border flex flex-col items-center justify-center py-[80px] md:py-[120px] mb-0"
    >
      <div className="w-full">
        <h2 className="text-[40px] md:text-[70px] leading-tight font-[500] text-center mt-[30px] md:mt-[50px] mb-[50px] md:mb-[90px] text-white">
          My <span style={{ color: "var(--primary-blue)" }}>Career &amp; Experience</span>
        </h2>

        <div className="relative flex flex-col mx-auto">
          <div
            ref={timelineRef}
            className="career-timeline hidden md:block absolute left-1/2 -translate-x-1/2 w-[3px] top-[-50px] h-full"
          >
            <div className="career-dot" />
          </div>

          {entries.map((entry, i) => (
            <div
              key={`${entry.company}-${entry.year}`}
              ref={(el) => { boxRefs.current[i] = el; }}
              className="flex flex-col md:flex-row justify-between mb-[40px] md:mb-[50px] gap-4 md:gap-0"
            >
              <div className="flex md:w-[40%] justify-between gap-[20px] md:gap-[50px]">
                <div>
                  <h4
                    className="text-[22px] md:text-[33px] leading-tight tracking-[0.8px] font-medium m-0"
                    style={{ color: "#fff" }}
                  >
                    {entry.role}
                  </h4>
                  <h5
                    className="font-normal tracking-[0.7px] text-[16px] md:text-[20px] capitalize my-[8px]"
                    style={{ color: "var(--primary-blue)" }}
                  >
                    {entry.company}
                  </h5>
                  <p
                    className="md:hidden text-[13px] font-light m-0 leading-[1.55]"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    {entry.year}
                  </p>
                </div>
                <h3
                  className="hidden md:block text-[34px] m-0 font-medium leading-[40px] text-right"
                  style={{ color: "#fff" }}
                >
                  {entry.year}
                </h3>
              </div>

              <p
                className="md:w-[40%] text-[14px] md:text-[18px] font-light m-0 leading-[1.55]"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                {entry.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;
