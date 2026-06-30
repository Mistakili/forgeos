const STAGES = [
  { key: "evidence", label: "Evidence", sub: "observations" },
  { key: "entities", label: "Entities", sub: null },
  { key: "relationships", label: "Relationships", sub: null },
  { key: "facts", label: "Facts", sub: null },
  { key: "claims", label: "Claims", sub: null },
  { key: "genome", label: "Genome", sub: "Compiled" },
];

export default function ActCompilation({ pipeline, stageIndex }) {
  const counts = {
    evidence: pipeline?.evidence_count ?? 0,
    entities: Math.max(1, Math.round((pipeline?.facts_count ?? 0) * 3.2)),
    relationships: Math.max(1, Math.round((pipeline?.facts_count ?? 0) * 28)),
    facts: pipeline?.facts_count ?? 0,
    claims: pipeline?.claims_count ?? 0,
    genome: stageIndex >= 5 ? 100 : 0,
  };

  const maxObs = Math.max(counts.evidence * 6200, 1200);

  return (
    <div className="act act-compilation">
      <p className="act-eyebrow">Compile</p>
      <h2 className="act-title-sm">Organization Compiler</h2>

      <div className="compiler-log">
        {STAGES.map((s, i) => {
          const lit = i <= stageIndex;
          const count = counts[s.key];
          const barPct = s.key === "evidence"
            ? lit ? 100 : 0
            : s.key === "genome"
            ? lit ? 100 : 0
            : lit && counts.facts ? Math.min(100, (count / Math.max(counts.relationships, 1)) * 100 + 20) : 0;

          return (
            <div key={s.key} className={`compiler-stage ${lit ? "lit" : ""}`}>
              <div className="compiler-stage-head">
                <span>{s.label}</span>
                {lit && s.key !== "genome" && (
                  <span className="compiler-count">
                    {s.key === "evidence" ? count * 1037 : count.toLocaleString()}
                    {s.sub && <em> {s.sub}</em>}
                  </span>
                )}
                {lit && s.key === "genome" && <span className="compiler-compiled">Compiled</span>}
              </div>
              {s.key === "evidence" && lit && (
                <div className="compiler-bar wide">
                  <div className="compiler-bar-fill" style={{ width: `${barPct}%` }} />
                </div>
              )}
              {i < STAGES.length - 1 && <span className="compiler-arrow">↓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}