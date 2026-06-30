const CHAIN = [
  { id: "website", label: "Website" },
  { id: "voice", label: "Brand Voice" },
  { id: "segment", label: "Luxury Segment" },
  { id: "social", label: "Instagram" },
  { id: "campaign", label: "Campaign" },
  { id: "board", label: "Board Decision" },
];

export default function ReasoningGraph({ evidence, active, highlight, decision }) {
  const hasWeb = evidence?.some((e) => e.source_type === "website");
  const hasSocial = evidence?.some((e) => e.source_type === "social");

  return (
    <div className={`reasoning-graph ${active ? "pulsing" : "resolved"}`}>
      <span className="graph-label">Reasoning Graph</span>
      <div className="reasoning-chain">
        {CHAIN.map((node, i) => {
          const glow =
            active && highlight >= 0
              ? i <= highlight + 2
              : true;
          const skip = (node.id === "website" && !hasWeb) || (node.id === "social" && !hasSocial);
          if (skip && node.id === "social") return null;
          return (
            <div key={node.id} className="reasoning-node-wrap">
              <div className={`reasoning-node ${glow ? "glow" : ""}`} style={{ animationDelay: `${i * 120}ms` }}>
                {node.id === "board" && decision ? decision : node.label}
              </div>
              {i < CHAIN.length - 1 && <span className="reasoning-edge">↓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}