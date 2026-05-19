import { useEffect, useState, useCallback, useRef } from "react";
import gsap from "gsap";
import "../styles/cursor.css";

const CONTACT_EMAIL = "tanujsharma1811@gmail.com";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isHeaderBlurred, setIsHeaderBlurred] = useState(false);

  useEffect(() => {
    console.log("Copied", copied);
    const cursor = cursorRef.current;
    if (!cursor) return;

    let hover = false;
    const mousePos = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    const cursorPos = { ...mousePos };
    let frameId = 0;

    const onMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };

    const loop = () => {
      if (!hover) {
        const delay = 6;
        cursorPos.x += (mousePos.x - cursorPos.x) / delay;
        cursorPos.y += (mousePos.y - cursorPos.y) / delay;
        gsap.to(cursor, { x: cursorPos.x, y: cursorPos.y, duration: 0.1 });
      }

      frameId = requestAnimationFrame(loop);
    };

    const eventCleanups: Array<() => void> = [];
    document.addEventListener("mousemove", onMouseMove);
    frameId = requestAnimationFrame(loop);

    document.querySelectorAll("[data-cursor]").forEach((item) => {
      const element = item as HTMLElement;
      const onMouseOver = (e: MouseEvent) => {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        if (element.dataset.cursor === "icons") {
          cursor.classList.add("cursor-icons");

          gsap.to(cursor, { x: rect.left, y: rect.top, duration: 0.1 });
          cursor.style.setProperty("--cursorH", `${rect.height}px`);
          hover = true;
        }

        if (element.dataset.cursor === "disable") {
          cursor.classList.add("cursor-disable");
        }
      };

      const onMouseOut = () => {
        cursor.classList.remove("cursor-disable", "cursor-icons");
        hover = false;
      };

      element.addEventListener("mouseover", onMouseOver);
      element.addEventListener("mouseout", onMouseOut);
      eventCleanups.push(() => {
        element.removeEventListener("mouseover", onMouseOver);
        element.removeEventListener("mouseout", onMouseOut);
      });
    });

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener("mousemove", onMouseMove);
      eventCleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  const handleCopyEmail = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(CONTACT_EMAIL);
      } else {
        const input = document.createElement("textarea");
        input.value = CONTACT_EMAIL;
        input.setAttribute("readonly", "");
        input.style.position = "absolute";
        input.style.left = "-9999px";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Unable to copy email:", error);
    }
  }, []);

  useEffect(() => {
    const updateHeaderBlur = () => {
      setIsHeaderBlurred(window.scrollY > 8);
    };

    updateHeaderBlur();
    window.addEventListener("scroll", updateHeaderBlur, { passive: true });
    return () => window.removeEventListener("scroll", updateHeaderBlur);
  }, []);

  return <>
    <div className="cursor-main" ref={cursorRef}></div>
    {/* Topbar - header */}
    <div className="landing-circle1" />
    <div className="landing-circle2" />
    <div className="landing-circle3" />

    <header className={`loader-header cursor-topbar ${isHeaderBlurred ? "cursor-topbar--scrolled" : ""}`}>
      <div className="loader-logo">Tanuj Sharma</div>
      <div className="cursor-email-wrap">
        <button
          type="button"
          className="cursor-copy-link"
          onClick={handleCopyEmail}
        >
        </button>
      </div>
    </header>
  </>;
};

export default Cursor;
