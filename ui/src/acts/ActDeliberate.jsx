import BoardMeeting from "../components/BoardMeeting";

export default function ActDeliberate({
  objective,
  onObjectiveChange,
  onDeliberate,
  loading,
  mission,
}) {
  if (!mission && !loading) {
    return (
      <div className="act act-deliberate idle">
        <p className="act-eyebrow">Deliberate</p>
        <h2 className="act-title-sm">Mission Console</h2>
        <p className="act-sub calm">Reason over the compiled genome — not raw documents.</p>
        <label className="mission-label">
          Objective
          <input
            value={objective}
            onChange={(e) => onObjectiveChange(e.target.value)}
            placeholder="Launch luxury listing campaign"
          />
        </label>
        <button className="awaken-btn compile-primary" onClick={onDeliberate} disabled={loading}>
          Run Deliberation
        </button>
      </div>
    );
  }

  return (
    <div className="act act-deliberate">
      <p className="act-eyebrow">Deliberate</p>
      <h2 className="act-title-sm">{loading ? "Convening…" : "Consensus reached"}</h2>
      {mission?.board_decision && (
        <BoardMeeting decision={mission.board_decision} animate={!loading} />
      )}
    </div>
  );
}