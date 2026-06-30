const EXTENDED = [
  { label: "Decision Style", value: "Founder Driven", confidence: 78 },
  { label: "Operating Rhythm", value: "Weekday Heavy", confidence: 72 },
  { label: "Approval Chain", value: "CEO → Marketing → Compliance → Launch", confidence: 85 },
  { label: "Known Bottlenecks", value: "Weekend Response", confidence: 60 },
  { label: "Knowledge Gaps", value: "CRM missing", confidence: 45 },
  { label: "Risk Profile", value: "Medium", confidence: 70 },
  { label: "Culture", value: "Fast Decisions", confidence: 82 },
];

export default function GenomeScreen({ genome, coverage, onClose }) {
  if (!genome) return null;
  const conf = Math.round((genome.confidence || 0) * 100);

  return (
    <div className="genome-screen-overlay" onClick={onClose}>
      <div className="genome-screen" onClick={(e) => e.stopPropagation()}>
        <button className="genome-close" onClick={onClose}>×</button>
        <p className="act-eyebrow">Organization Genome</p>
        <h2 className="genome-screen-title">{genome.identity}</h2>
        <span className="genome-screen-conf">Confidence {conf}%</span>

        <section className="genome-section">
          <h3>Core DNA</h3>
          <dl className="genome-dl">
            <dt>Identity</dt><dd>{genome.identity}</dd>
            <dt>Voice</dt><dd>{genome.voice}</dd>
            <dt>Audience</dt><dd>{genome.audience}</dd>
            <dt>Channels</dt><dd>{genome.channels?.join(", ")}</dd>
          </dl>
        </section>

        <section className="genome-section">
          <h3>Extended Model</h3>
          {EXTENDED.map((trait) => (
            <div key={trait.label} className="genome-trait-row">
              <div className="trait-row-head">
                <span>{trait.label}</span>
                <span>{trait.value}</span>
              </div>
              <div className="trait-bar">
                <div className="trait-bar-fill" style={{ width: `${trait.confidence}%` }} />
              </div>
            </div>
          ))}
        </section>

        {coverage && (
          <p className="genome-evidence-cov">Evidence Coverage {coverage.coverage_percent}%</p>
        )}

        <p className="genome-diff-teaser">
          Genome Diff — compare v3 → v4 as your org evolves. <em>Coming soon.</em>
        </p>
      </div>
    </div>
  );
}