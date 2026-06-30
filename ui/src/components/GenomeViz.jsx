const TRAITS = [
  { key: "identity", label: "Identity", weight: 0.92 },
  { key: "voice", label: "Voice", weight: 0.78 },
  { key: "audience", label: "Audience", weight: 0.85 },
  { key: "channels", label: "Channels", weight: 0.7, isList: true },
];

export default function GenomeViz({ genome, animate }) {
  if (!genome) return null;
  const base = genome.confidence || 0.68;

  return (
    <div className={`genome-viz ${animate ? "animate-in" : ""}`}>
      {TRAITS.map((trait, i) => {
        const value = trait.isList
          ? (genome.channels?.length || 1) / 4
          : base * trait.weight;
        const pct = Math.round(Math.min(100, value * 100));
        return (
          <div
            key={trait.key}
            className="genome-trait"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <div className="trait-header">
              <span>{trait.label}</span>
              <span className="trait-value">
                {trait.isList ? genome.channels?.join(", ") : genome[trait.key]}
              </span>
            </div>
            <div className="trait-bar">
              <div
                className="trait-bar-fill"
                style={{ width: animate ? `${pct}%` : "0%" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}