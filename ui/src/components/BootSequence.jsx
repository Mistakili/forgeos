import { useEffect, useState } from "react";

const BOOT_LINES = [
  "Initializing Runtime…",
  "Loading Compiler…",
  "Loading Reasoning Engine…",
  "Loading Connectors…",
  "Runtime Ready.",
];

export default function BootSequence({ onComplete }) {
  const [line, setLine] = useState(-1);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const skip = sessionStorage.getItem("forgeos_booted");
    if (skip) {
      onComplete();
      return;
    }

    const timers = BOOT_LINES.map((_, i) =>
      setTimeout(() => setLine(i), 400 + i * 420)
    );

    const fadeTimer = setTimeout(() => setFade(true), 400 + BOOT_LINES.length * 420 + 600);
    const doneTimer = setTimeout(() => {
      sessionStorage.setItem("forgeos_booted", "1");
      onComplete();
    }, 400 + BOOT_LINES.length * 420 + 1200);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div className={`boot-overlay ${fade ? "fade-out" : ""}`}>
      <div className="boot-content">
        <div className="boot-logo">FORGEOS</div>
        <div className="boot-lines">
          {BOOT_LINES.map((text, i) => (
            <div
              key={text}
              className={`boot-line ${i <= line ? "visible" : ""} ${i === line ? "current" : ""}`}
            >
              <span className="boot-cursor">{i === line && i < BOOT_LINES.length - 1 ? "▸" : " "}</span>
              {text}
            </div>
          ))}
        </div>
        <div className="boot-bar">
          <div
            className="boot-bar-fill"
            style={{ width: `${Math.max(0, ((line + 1) / BOOT_LINES.length) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}