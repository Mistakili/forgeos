const MEMBERS = [
  { role: "Marketing", angle: -45 },
  { role: "Finance", angle: 45 },
  { role: "Compliance", angle: 135 },
  { role: "Operations", angle: -135 },
];

export default function BoardMeeting({ decision, animate }) {
  if (!decision) return null;
  const conf = Math.round((decision.confidence || 0) * 100);

  return (
    <div className={`board-meeting ${animate ? "resolved" : ""}`}>
      <div className="board-chamber">
        <div className="board-center">
          <span className="board-center-label">Consensus</span>
        </div>
        {MEMBERS.map((m, i) => (
          <div
            key={m.role}
            className="board-member"
            style={{
              transform: `rotate(${m.angle}deg) translateY(-72px) rotate(${-m.angle}deg)`,
              animationDelay: `${i * 150}ms`,
            }}
          >
            <div className="member-orb" />
            <span>{m.role}</span>
          </div>
        ))}
      </div>
      <div className="board-resolution">
        <span className="resolution-label">Resolution</span>
        <span className="resolution-text">{decision.decision}</span>
        <div className="resolution-bar">
          <div className="resolution-bar-fill" style={{ width: `${conf}%` }} />
        </div>
        <span className="resolution-conf">{conf}% confidence</span>
      </div>
    </div>
  );
}