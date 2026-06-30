import ReasoningGraph from "../components/ReasoningGraph";

function formatTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function ActExecute({ mission, evidence }) {
  if (!mission) return null;

  return (
    <div className="act act-execute calm">
      <p className="act-eyebrow">Execute</p>
      <h2 className="act-title-sm">Mission complete</h2>
      <p className="execute-status">{mission.status} · {mission.time_saved_hours}h saved</p>

      <ReasoningGraph
        evidence={evidence}
        active={false}
        highlight={-1}
        decision={mission.board_decision?.decision}
      />

      {mission.replay?.length > 0 && (
        <div className="execute-replay">
          <h3>Mission Replay</h3>
          <ol className="replay-timeline calm">
            {mission.replay.map((evt, i) => (
              <li key={i} className="replay-item" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="replay-time">{formatTime(evt.time)}</span>
                <div className="replay-body">
                  <strong>{evt.label}</strong>
                  {evt.detail && <span className="replay-detail">{evt.detail}</span>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}