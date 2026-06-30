import { useState } from "react";
import "./App.css";

const PHASES = [
  { id: "boot", label: "Boot Sequence", icon: "⚡" },
  { id: "genome", label: "Organization Genome", icon: "🧬" },
  { id: "workforce", label: "Workforce Assembly", icon: "👥" },
  { id: "board", label: "Board Meeting", icon: "🏛" },
  { id: "minutes", label: "Executive Minutes", icon: "📋" },
];

export default function App() {
  const [objective, setObjective] = useState("Launch luxury listing campaign");
  const [website, setWebsite] = useState("example.com");
  const [social, setSocial] = useState("instagram:luxurylistings");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function runMission() {
    setLoading(true);
    setError(null);
    setResult(null);
    setPhase(0);

    try {
      for (let i = 0; i < PHASES.length - 1; i++) {
        setPhase(i);
        await new Promise((r) => setTimeout(r, 400));
      }

      const res = await fetch("/api/mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective,
          sources: [
            { type: "website", source: website },
            { type: "social", source: social },
          ],
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setResult(data);
      setPhase(PHASES.length - 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-mark">◆</span>
          <div>
            <h1>ForgeOS</h1>
            <p>The OS that learns your organization first</p>
          </div>
        </div>
        {result && (
          <span className={`badge ${result.reasoning_mode === "live" ? "live" : "mock"}`}>
            {result.reasoning_mode === "live"
              ? `Live${result.reasoning_provider ? ` · ${result.reasoning_provider}` : ""}`
              : "Mock — add an API key"}
          </span>
        )}
      </header>

      <main className="main">
        <section className="panel input-panel">
          <h2>Mission Control</h2>
          <label>
            Objective
            <input
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Launch luxury listing campaign"
            />
          </label>
          <label>
            Website
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="example.com"
            />
          </label>
          <label>
            Social
            <input
              value={social}
              onChange={(e) => setSocial(e.target.value)}
              placeholder="instagram:handle"
            />
          </label>
          <button className="launch-btn" onClick={runMission} disabled={loading}>
            {loading ? "Running mission…" : "Start Mission"}
          </button>
          {error && <p className="error">{error}</p>}
        </section>

        <section className="panel output-panel">
          <h2>Mission Progress</h2>
          <div className="phases">
            {PHASES.map((p, i) => (
              <div
                key={p.id}
                className={`phase ${i <= phase ? "active" : ""} ${i === phase && loading ? "current" : ""}`}
              >
                <span className="phase-icon">{p.icon}</span>
                <span>{p.label}</span>
                {i < phase && <span className="check">✓</span>}
              </div>
            ))}
          </div>

          {result && (
            <div className="results">
              <div className="stat-row">
                <Stat label="Status" value={result.status} highlight />
                <Stat label="Time Saved" value={`${result.time_saved_hours}h`} />
                <Stat label="Confidence" value={`${Math.round(result.genome.confidence * 100)}%`} />
              </div>

              <Card title="Organization Genome">
                <dl className="genome-grid">
                  <dt>Identity</dt>
                  <dd>{result.genome.identity}</dd>
                  <dt>Voice</dt>
                  <dd>{result.genome.voice}</dd>
                  <dt>Audience</dt>
                  <dd>{result.genome.audience}</dd>
                  <dt>Channels</dt>
                  <dd>{result.genome.channels.join(", ")}</dd>
                </dl>
              </Card>

              <Card title="Workforce">
                <ul className="workforce-list">
                  {result.workforce.roles.map((r) => (
                    <li key={r.name}>
                      <span>{r.name}</span>
                      <span className={`status ${r.status}`}>{r.status}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card title="Board Decision">
                <p className="decision">{result.board_decision.decision}</p>
                <p className="rationale">{result.board_decision.rationale}</p>
              </Card>

              <Card title="Pipeline Trace">
                <code className="pipeline">
                  Evidence ({result.pipeline.evidence_count}) → Facts (
                  {result.pipeline.facts_count}) → Claims ({result.pipeline.claims_count}) →
                  Genome
                </code>
              </Card>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className={`stat ${highlight ? "highlight" : ""}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}