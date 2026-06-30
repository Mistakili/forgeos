const POSITIONS = {
  top: { top: "4%", left: "50%", transform: "translateX(-50%)" },
  right: { top: "38%", right: "2%" },
  "bottom-right": { bottom: "12%", right: "14%" },
  "bottom-left": { bottom: "12%", left: "14%" },
  left: { top: "38%", left: "2%" },
};

function statusColor(status) {
  if (status === "strong") return "var(--success)";
  if (status === "partial") return "var(--warning)";
  return "#ff6b6b";
}

export default function DiscoveryRadar({ radar, activeIndex = -1, showCenter }) {
  if (!radar?.length) return null;

  return (
    <div className={`discovery-radar ${showCenter ? "live" : ""}`}>
      <div className="radar-sweep" aria-hidden />
      <div className="radar-grid" aria-hidden />
      {showCenter && (
        <div className="radar-center">
          <span>Organization</span>
        </div>
      )}
      {radar.map((dept, i) => {
        const pos = POSITIONS[dept.axis] || POSITIONS.top;
        const lit = i <= activeIndex;
        return (
          <div
            key={dept.dept}
            className={`radar-blip ${lit ? "lit" : ""} status-${dept.status}`}
            style={{ ...pos, "--score": dept.score, animationDelay: `${i * 200}ms` }}
          >
            <span className="blip-dept">{dept.dept}</span>
            <span className="blip-score" style={{ color: statusColor(dept.status) }}>
              {lit ? `${dept.score}%` : "—"}
            </span>
            <span className={`blip-dot status-${dept.status}`} />
          </div>
        );
      })}
    </div>
  );
}