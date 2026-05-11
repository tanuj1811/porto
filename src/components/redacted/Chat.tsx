import { useEffect, useState } from "react";

const Dot = ({ delay = 0 }: { delay?: number }) => (
  <div
    className="animate-pulse rounded-full"
    style={{
      width: 7, height: 7,
      backgroundColor: "rgba(255,255,255,0.5)",
      animationDelay: `${delay}ms`,
    }}
  />
)

const Message = ({ text, typing, active }: { text?: string; typing?: boolean; active: boolean }) => (
  <div style={{
    display: "inline-flex",
    background: "#000",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: "6px 12px",
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    whiteSpace: "nowrap",
  }}>
    {typing ? (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 20 }}>
        <Dot />
        <Dot delay={active ? 150 : 0} />
        <Dot delay={active ? 300 : 0} />
      </span>
    ) : text}
  </div>
)

export const Chat = ({ active, setActive }: { active: boolean; setActive: () => void }) => {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!active) return () => setStep(0)

    const durations = [1000, 500, 1500, 2000]
    const delay = durations[step] ?? 2500

    if (step < 4) {
      const t = setTimeout(() => setStep(s => s + 1), delay)
      return () => clearTimeout(t)
    }
    if (step === 4) {
      setActive()
    }
  }, [active, step])

  return (
    <div style={{
      position: "absolute",
      bottom: "calc(100% + 10px)",
      left: "50%",
      transform: `translateX(-50%) scale(${active ? 1 : 0.92})`,
      display: "flex",
      flexDirection: "column",
      gap: 6,
      alignItems: "flex-start",
      fontFamily: "var(--sans)",
      pointerEvents: "none",
      opacity: active ? 1 : 0,
      filter: active ? "blur(0px)" : "blur(4px)",
      transition: "opacity 0.25s ease, transform 0.25s ease, filter 0.25s ease",
    }}>
      <Message active={active} typing={step === 0} text="just a sec..." />
      {step > 1 && (
        <Message active={active} typing={step === 2} text="Netomi AI" />
      )}
    </div>
  )
}