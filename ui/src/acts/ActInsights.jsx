export default function ActInsights({ insights, onContinue }) {
  if (!insights?.length) return null;

  return (
    <div className="act act-insights">
      <p className="act-eyebrow">Compiler insight</p>
      <h2 className="act-title-sm">Three things ForgeOS found</h2>
      <p className="insights-pause">Pause here. These are evidence-backed — not mission output.</p>

      <ol className="aha-panel">
        {insights.map((item, i) => (
          <li key={item.title} className="aha-item" style={{ animationDelay: `${i * 200}ms` }}>
            <span className="aha-num">#{i + 1}</span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <button className="awaken-btn compile-primary" onClick={onContinue}>
        Open Organization Genome →
      </button>
    </div>
  );
}