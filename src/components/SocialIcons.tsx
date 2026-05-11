import { useEffect } from "react";
import "../styles/SocialIcons.css";
import { socialLinks } from "@/utils/constant";

const SocialIcons = () => {
  useEffect(() => {
    const social = document.getElementById("social") as HTMLElement;
    if (!social) return;
    const cleanups: Array<() => void> = [];

    social.querySelectorAll(".social-item").forEach((item) => {
      const elem = item as HTMLElement;
      const link = elem.querySelector("a");
      if (!link) return;

      let rect = elem.getBoundingClientRect();
      let mouseX = rect.width / 2;
      let mouseY = rect.height / 2;
      let currentX = 0;
      let currentY = 0;
      let raf = 0;

      const updatePosition = () => {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;

        link.style.setProperty("--siLeft", `${currentX}px`);
        link.style.setProperty("--siTop", `${currentY}px`);

        raf = requestAnimationFrame(updatePosition);
      };

      const onMouseMove = (e: MouseEvent) => {
        rect = elem.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < 40 && x > 10 && y < 40 && y > 5) {
          mouseX = x;
          mouseY = y;
        } else {
          mouseX = rect.width / 2;
          mouseY = rect.height / 2;
        }
      };

      document.addEventListener("mousemove", onMouseMove);

      updatePosition();

      cleanups.push(() => {
        document.removeEventListener("mousemove", onMouseMove);
        if (raf) cancelAnimationFrame(raf);
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <div className="icons-section">
      <div className="social-icons" data-cursor="icons" id="social">
        {socialLinks.map((item) => {
          const Icon = item.icon;
          return (
            <span className="social-item" key={item.label}>
              <a
                href={item.href}
                target={item.openInNewTab ? "_blank" : undefined}
                rel={item.openInNewTab ? "noreferrer" : undefined}
                aria-label={item.label}
              >
                <Icon />
              </a>
              <span className="social-tip" role="tooltip">
                {item.label === "Resume" ? "View Resume" : item.label}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default SocialIcons;
