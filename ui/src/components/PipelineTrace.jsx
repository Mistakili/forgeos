export default function PipelineTrace({ pipeline, hero, activeStage = 4 }) {
  if (!pipeline) return null;

  const stages = [
    { key: "evidence", label: "Evidence", count: pipeline.evidence_count },
    { key: "facts", label: "Facts", count: pipeline.facts_count },
    { key: "claims", label: "Claims", count: pipeline.claims_count },
    { key: "genome", label: "Genome", count: null },
  ];

  return (
    <div className={`pipeline-hero ${hero ? "" : "muted"}`}>
      <div className="pipeline-title">Compiler Pipeline</div>
      <div className="pipeline-flow">
        {stages.map((s, i) => (
          <div key={s.key} className="pipe-stage-wrap">
            {i > 0 && (
              <span className={`pipe-arrow ${i <= activeStage ? "lit" : ""}`}>↓</span>
            )}
            <span
              className={`pipe-stage ${i <= activeStage ? "lit" : ""} ${s.key === "genome" ? "genome-stage" : ""}`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {s.label}
              {s.count != null && <em>({s.count})</em>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}