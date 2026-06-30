import { useEffect, useState } from "react";
import ReasoningGraph from "../components/ReasoningGraph";

const LIVE_EVENTS = [
  { role: "Marketing", msg: "Research complete." },
  { role: "Compliance", msg: "Policy review passed." },
  { role: "Finance", msg: "Budget approved." },
  { role: "Campaign", msg: "Publishing…" },
];

export default function ActExecution({
  objective,
  mission,
  loading,
  onStart,
  evidence,
  boardDecision,
}) {
  const [elapsed, setElapsed] = useState(0);
  const [eventIndex, setEventIndex] = useState(-1);

  useEffect(() => {
    if (!loading) return;
    setElapsed(0);
    setEventIndex(-1);
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    const events = LIVE_EVENTS.map((_, i) =>
      setTimeout(() => setEventIndex(i), 800 + i * 900)
    );
    return () => {
      clearInterval(tick);
      events.forEach(clearTimeout);
    };
  }, [loading]);

  const t = String(Math.max(0, 14 - elapsed)).padStart(2, "0");

  if (!mission && !loading) {
    return (
      <div className="act act-execution idle">
        <p className="act-eyebrow">Act V — Execution</p>
        <h2 className="act-title-sm">Mission Control</h2>
        <p className="mission-objective-label">Mission</p>
        <p className="mission-objective">{objective}</p>
        <button className="awaken-btn mission-launch" onClick={onStart}>
          Launch Mission
        </button>
      </div>
    );
  }

  return (
    <div className="act act-execution">
      <p className="act-eyebrow">Act V — Execution</p>
      <div className="mission-hud">
        <div>
          <span className="hud-label">Mission</span>
          <span className="hud-value">{objective}</span>
        </div>
        <div>
          <span className="hud-label">Status</span>
          <span className="hud-value status-exec">{loading ? "Executing" : "Complete"}</span>
        </div>
        <div>
          <span className="hud-label">T-</span>
          <span className="hud-timer">{loading ? `00:${t}` : "00:00"}</span>
        </div>
      </div>

      <ReasoningGraph
        evidence={evidence}
        active={loading}
        highlight={eventIndex}
        decision={boardDecision?.decision}
      />

      <div className="live-feed">
        {LIVE_EVENTS.map((evt, i) => (
          <div key={evt.role} className={`feed-line ${i <= eventIndex ? "visible" : ""}`}>
            <span className="feed-role">{evt.role}</span>
            <span className="feed-msg">{evt.msg}</span>
          </div>
        ))}
        {!loading && mission && (
          <div className="feed-line visible resolved">
            <span className="feed-role">Board</span>
            <span className="feed-msg">{mission.board_decision?.decision} — {Math.round((mission.board_decision?.confidence || 0) * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}