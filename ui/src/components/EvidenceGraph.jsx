export default function EvidenceGraph({ evidence, animate }) {
  if (!evidence?.length) return null;

  const nodes = evidence.map((e, i) => ({
    id: i,
    label: e.source_type || "source",
    name: (e.source || "").replace(/^https?:\/\//, "").slice(0, 28),
  }));

  return (
    <div className={`evidence-graph ${animate ? "animate-in" : ""}`}>
      <div className="graph-title">Evidence Graph</div>
      <div className="graph-chain">
        {nodes.map((node, i) => (
          <div key={node.id} className="graph-node-wrap">
            <div
              className="graph-node pulse-node"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <span className="graph-node-type">{node.label}</span>
              <span className="graph-node-name">{node.name}</span>
            </div>
            {i < nodes.length - 1 && <span className="graph-edge">↓</span>}
          </div>
        ))}
        <span className="graph-edge">↓</span>
        <div className="graph-node graph-node-genome pulse-node" style={{ animationDelay: `${nodes.length * 200}ms` }}>
          <span className="graph-node-type">compiled</span>
          <span className="graph-node-name">Organization Genome</span>
        </div>
      </div>
    </div>
  );
}