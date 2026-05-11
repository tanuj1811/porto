/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../../styles/Projects.css";
import { projects } from "@/utils/constant";

gsap.registerPlugin(ScrollTrigger);

const Projects = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const flexRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const flex = flexRef.current;
    if (!section || !flex) return;

    ScrollTrigger.getAll()
      .filter((st) => st.trigger === section || st.pin === section)
      .forEach((st) => st.kill());

    const boxes = flex.querySelectorAll<HTMLElement>(".work-box");
    if (!boxes.length) return;

    const boxW = boxes[0].getBoundingClientRect().width;
    const padding = parseInt(getComputedStyle(boxes[0]).padding, 10) / 2;
    const viewWidth = section.getBoundingClientRect().width;
    const translateX = Math.max(boxW * boxes.length - viewWidth + padding, 0);
    (window as any).__projectsTranslateX = translateX;
    (window as any).__projectsMeasurements = {
      boxW,
      padding,
      viewWidth,
      boxes: boxes.length,
    };

    if (translateX <= 0) return;

    gsap.set(flex, { x: 0 });

    const anim = gsap.to(flex, {
      x: -translateX,
      duration: 1,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: `+=${translateX}`,
        pin: true,
        scrub: 1,
        id: "projects-scroll",
      },
    });

    (window as any).__projectsAnim = anim;

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, []);

  return (
    <div ref={sectionRef} className="work-section" id="projects">
      <div className="work-container section-container">
        <h2>
          My <span>Projects</span>
        </h2>
        <div ref={flexRef} className="work-flex">
          {projects.map((p, index) => (
            <div className="work-box" key={p.name}>
              <div className="work-info">
                <div className="work-title">
                  <h3>{String(index + 1).padStart(2, "0")}</h3>
                  <div>
                    <h4>{p.name}</h4>
                    <p>{p.category}</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>{p.tools}</p>
              </div>
              <div className="work-image">
                <div className="work-image-in">
                  <img src={p.image} alt={p.name} />
                </div>
              </div>
              <div className="work-desc">
                <p>{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
