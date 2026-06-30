export default function OrgHealth({ confidence, coverage, status }) {
  const health = Math.round(
    (confidence * 0.6 + (coverage / 100) * 0.4) * 100
  );

  return (
    <div className="org-health">
      <div className="org-sphere-wrap">
        <div
          className="org-sphere"
          style={{ "--health": `${health}%` }}
        >
          <span className="org-sphere-core">{health}%</span>
        </div>
        <div className="org-sphere-ring" />
      </div>
      <div className="org-health-meta">
        <span className="org-health-label">Operational Health</span>
        <span className="org-health-status">{status || "Compiling"}</span>
        <span className="org-health-sub">{coverage}% source coverage</span>
      </div>
    </div>
  );
}