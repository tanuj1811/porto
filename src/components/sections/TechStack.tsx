import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../../styles/TechStack.css";
import { techStackCategories as categories } from "@/utils/constant";

gsap.registerPlugin(ScrollTrigger);

const TechStack = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean);
    if (!cards.length) return;

    gsap.set(cards, { autoAlpha: 0, y: 28 });

    const anims = cards.map((card, i) =>
      gsap.to(card, {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
        delay: (i % 11) * 0.055,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      })
    );

    return () => {
      anims.forEach((a) => { a.scrollTrigger?.kill(); a.kill(); });
    };
  }, []);

  let cardIndex = 0;

  return (
    <div
      id="techstack"
      ref={sectionRef}
      className="w-full max-w-[1400px] mx-auto px-10 box-border flex flex-col items-center justify-center py-[120px]"
    >
      <div className="w-full">
        <h2 className="text-[70px] leading-[70px] font-[500] text-center mt-[50px] mb-[90px] text-white">
          My <span style={{ color: "var(--primary-blue)" }}>Tech Stack</span>
        </h2>

        {categories.map((cat) => (
          <div key={cat.name} className="techstack-category">
            <div className="techstack-category-label">
              <span>{cat.name}</span>
            </div>

            <div className="techstack-grid">
              {cat.items.map((item) => {
                const idx = cardIndex++;
                const Icon = item.icon;
                return (
                  <div
                    key={`${cat.name}-${item.label}`}
                    className="tech-card"
                    ref={(el) => { cardRefs.current[idx] = el; }}
                  >
                    <Icon style={{ color: item.color }} />
                    <span className="tech-card-label">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStack;
