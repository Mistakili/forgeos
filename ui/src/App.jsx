import { useState } from "react";
import "./App.css";

const SOURCE_FIELDS = [
  { id: "website", label: "Website", type: "website", placeholder: "yourcompany.com", available: true },
  { id: "documents", label: "Documents", type: "pdf", placeholder: "path/to/brand-guide.pdf", available: true },
  { id: "social", label: "Social", type: "social", placeholder: "instagram:handle", available: true },
  { id: "notion", label: "Notion", type: "notion", placeholder: "Coming soon", available: false },
  { id: "hubspot", label: "HubSpot", type: "hubspot", placeholder: "Coming soon", available: false },
  { id: "slack", label: "Slack", type: "slack", placeholder: "Coming soon", available: false },
  { id: "policies", label: "Policies", type: "policies", placeholder: "Coming soon", available: false },
];

function formatTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function App() {
  const [step, setStep] = useState("connect"); // connect | compiled | mission
  const [sources, setSources] = useState({
    website: "",
    documents: "",
    social: "",
  });
  const [objective, setObjective] = useState("Launch luxury listing campaign");
  const [compiled, setCompiled] = useState(null);
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedBoard, setExpandedBoard] = useState(true);

  function buildSourcePayload() {
    const payload = [];
    if (sources.website.trim()) payload.push({ type: "website", source: sources.website.trim() });
    if (sources.documents.trim()) payload.push({ type: "pdf", source: sources.documents.trim() });
    if (sources.social.trim()) payload.push({ type: "social", source: sources.social.trim() });
    return payload;
  }

  async function compileOrganization() {
    const payload = buildSourcePayload();
    if (!payload.length) {
      setError("Connect at least one source to compile.");
      return;
    }

    setLoading(true);
    setError(null);
    setCompiled(null);
    setMission(null);

    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: payload }),
      });
      if (!res.ok) throw new Error(`Compile failed: ${res.status}`);
      const data = await res.json();
      setCompiled(data);
      setStep("compiled");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function runMission() {
    if (!compiled) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective,
          session_id: compiled.session_id,
          use_compiled: true,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Mission failed: ${res.status}`);
      }
      const data = await res.json();
      setMission(data);
      setStep("mission");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const active = mission || compiled;
  const pipeline = active?.pipeline;
  const coverage = active?.coverage || compiled?.coverage;
  const genome = active?.genome || compiled?.genome;

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
        {active && (
          <span className={`badge ${(active.reasoning_mode || compiled?.reasoning_mode) === "live" ? "live" : "mock"}`}>
            {(active.reasoning_mode || compiled?.reasoning_mode) === "live"
              ? `Live${mission?.reasoning_provider ? ` · ${mission.reasoning_provider}` : ""}`
              : "Mock — add an API key"}
          </span>
        )}
      </header>

      <nav className="flow-nav">
        <FlowStep n={1} label="Compile" active={step === "connect"} done={!!compiled} />
        <span className="flow-arrow">→</span>
        <FlowStep n={2} label="Genome" active={step === "compiled"} done={!!compiled} />
        <span className="flow-arrow">→</span>
        <FlowStep n={3} label="Mission" active={step === "mission"} done={!!mission} />
      </nav>

      <main className="main">
        <section className="panel input-panel">
          {step === "connect" && (
            <>
              <h2>Connect Organization</h2>
              <p className="panel-desc">Compile your org before running missions.</p>
              {SOURCE_FIELDS.map((field) => (
                <label key={field.id} className={!field.available ? "disabled" : ""}>
                  {field.label}
                  {!field.available && <span className="soon">Soon</span>}
                  <input
                    value={sources[field.id] || ""}
                    onChange={(e) => setSources((s) => ({ ...s, [field.id]: e.target.value }))}
                    placeholder={field.placeholder}
                    disabled={!field.available}
                  />
                </label>
              ))}
              <button className="launch-btn compile-btn" onClick={compileOrganization} disabled={loading}>
                {loading ? "Compiling…" : "Compile Organization"}
              </button>
            </>
          )}

          {(step === "compiled" || step === "mission") && (
            <>
              <h2>Mission Control</h2>
              <p className="panel-desc">Genome ready. Run a mission against it.</p>
              <label>
                Objective
                <input
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Launch luxury listing campaign"
                />
              </label>
              <button className="launch-btn" onClick={runMission} disabled={loading || !compiled}>
                {loading ? "Running mission…" : "Start Mission"}
              </button>
              <button className="ghost-btn" onClick={() => { setStep("connect"); setMission(null); }}>
                Re-compile organization
              </button>
            </>
          )}

          {error && <p className="error">{error}</p>}
        </section>

        <section className="panel output-panel">
          {!active && (
            <div className="empty-state">
              <h2>Organization Compiler</h2>
              <p>Connect sources, compile your genome, then run missions.</p>
              <div className="pipeline-hero muted">
                <PipelineTrace pipeline={{ evidence_count: 0, facts_count: 0, claims_count: 0 }} />
              </div>
            </div>
          )}

          {active && (
            <>
              <PipelineTrace pipeline={pipeline} hero />

              {coverage && (
                <div className="coverage-block">
                  <div className="coverage-header">
                    <div>
                      <span className="coverage-label">Genome Confidence</span>
                      <span className="coverage-value">{Math.round((genome?.confidence || 0) * 100)}%</span>
                    </div>
                    <span className="coverage-pct">{coverage.coverage_percent}% source coverage</span>
                  </div>
                  <p className="coverage-hint">{coverage.hint}</p>
                  <ul className="coverage-list">
                    {coverage.items.map((item) => (
                      <li key={item.id} className={item.connected ? "on" : item.available ? "off" : "soon"}>
                        <span>{item.label}</span>
                        <span>{item.connected ? "✓" : item.available ? "✗" : "—"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {genome && (
                <Card title="Organization Genome">
                  <dl className="genome-grid">
                    <dt>Identity</dt><dd>{genome.identity}</dd>
                    <dt>Voice</dt><dd>{genome.voice}</dd>
                    <dt>Audience</dt><dd>{genome.audience}</dd>
                    <dt>Channels</dt><dd>{genome.channels?.join(", ")}</dd>
                  </dl>
                </Card>
              )}

              {mission?.workforce && (
                <Card title="Workforce">
                  <ul className="workforce-list">
                    {mission.workforce.roles.map((r) => (
                      <li key={r.name}>
                        <span>{r.name}</span>
                        <span className={`status ${r.status}`}>{r.status}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {mission?.board_decision && (
                <Card title="Board Decision">
                  <button
                    className="board-toggle"
                    onClick={() => setExpandedBoard(!expandedBoard)}
                  >
                    <span className="decision">{mission.board_decision.decision}</span>
                    <span className="board-conf">{Math.round(mission.board_decision.confidence * 100)}% confidence</span>
                  </button>
                  {expandedBoard && (
                    <div className="board-trace">
                      <section>
                        <h4>Evidence</h4>
                        <ul>
                          {mission.board_decision.evidence.map((e, i) => (
                            <li key={i}>{e.source} <span className="muted">({e.type})</span></li>
                          ))}
                        </ul>
                      </section>
                      <section>
                        <h4>Reasoning</h4>
                        <ul>
                          {mission.board_decision.reasoning.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </section>
                      {mission.board_decision.policies?.length > 0 && (
                        <section>
                          <h4>Policies</h4>
                          <ul>
                            {mission.board_decision.policies.map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </section>
                      )}
                    </div>
                  )}
                </Card>
              )}

              {mission?.replay?.length > 0 && (
                <Card title="Mission Replay">
                  <ol className="replay-timeline">
                    {mission.replay.map((evt, i) => (
                      <li key={i}>
                        <span className="replay-time">{formatTime(evt.time)}</span>
                        <div className="replay-body">
                          <strong>{evt.label}</strong>
                          {evt.detail && <span className="replay-detail">{evt.detail}</span>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </Card>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function FlowStep({ n, label, active, done }) {
  return (
    <div className={`flow-step ${active ? "active" : ""} ${done ? "done" : ""}`}>
      <span className="flow-num">{done ? "✓" : n}</span>
      <span>{label}</span>
    </div>
  );
}

function PipelineTrace({ pipeline, hero }) {
  if (!pipeline) return null;
  const cls = hero ? "pipeline-hero" : "pipeline";
  return (
    <div className={cls}>
      <div className="pipeline-title">Compiler Pipeline</div>
      <div className="pipeline-flow">
        <span className="pipe-stage">Evidence <em>({pipeline.evidence_count})</em></span>
        <span className="pipe-arrow">↓</span>
        <span className="pipe-stage">Facts <em>({pipeline.facts_count})</em></span>
        <span className="pipe-arrow">↓</span>
        <span className="pipe-stage">Claims <em>({pipeline.claims_count})</em></span>
        <span className="pipe-arrow">↓</span>
        <span className="pipe-stage genome-stage">Genome</span>
      </div>
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