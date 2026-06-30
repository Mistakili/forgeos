import { useCallback, useEffect, useState } from "react";
import BootSequence from "./components/BootSequence";
import BoardMeeting from "./components/BoardMeeting";
import CompileProgress from "./components/CompileProgress";
import EvidenceGraph from "./components/EvidenceGraph";
import GenomeViz from "./components/GenomeViz";
import MissionProgress from "./components/MissionProgress";
import OrgHealth from "./components/OrgHealth";
import PipelineTrace from "./components/PipelineTrace";
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
  const [booted, setBooted] = useState(() => !!sessionStorage.getItem("forgeos_booted"));
  const [step, setStep] = useState("connect");
  const [sources, setSources] = useState({ website: "", documents: "", social: "" });
  const [objective, setObjective] = useState("Launch luxury listing campaign");
  const [compiled, setCompiled] = useState(null);
  const [mission, setMission] = useState(null);
  const [compiling, setCompiling] = useState(false);
  const [missioning, setMissioning] = useState(false);
  const [error, setError] = useState(null);
  const [expandedBoard, setExpandedBoard] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(-1);

  const handleBootComplete = useCallback(() => setBooted(true), []);

  useEffect(() => {
    if (!compiled) {
      setShowResults(false);
      setPipelineStage(-1);
      return;
    }
    setShowResults(true);
    setPipelineStage(-1);
    const timers = [0, 1, 2, 3, 4].map((s, i) =>
      setTimeout(() => setPipelineStage(s), 200 + i * 280)
    );
    return () => timers.forEach(clearTimeout);
  }, [compiled?.session_id]);

  useEffect(() => {
    if (mission) {
      const t = setTimeout(() => setExpandedBoard(true), 600);
      return () => clearTimeout(t);
    }
  }, [mission?.mission_id]);

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

    setCompiling(true);
    setError(null);
    setCompiled(null);
    setMission(null);
    setShowResults(false);

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
      setCompiling(false);
    }
  }

  async function runMission() {
    if (!compiled) return;
    setMissioning(true);
    setError(null);
    setMission(null);

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
      setMissioning(false);
    }
  }

  const active = mission || compiled;
  const pipeline = active?.pipeline;
  const coverage = active?.coverage || compiled?.coverage;
  const genome = active?.genome || compiled?.genome;
  const loading = compiling || missioning;

  if (!booted) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <div className={`app ${loading ? "is-busy" : ""}`}>
      <div className="app-glow" aria-hidden />

      <header className="header fade-in">
        <div className="logo">
          <span className="logo-mark pulse-slow">◆</span>
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

      <nav className="flow-nav fade-in">
        <FlowStep n={1} label="Compile" active={step === "connect" || compiling} done={!!compiled} />
        <span className="flow-arrow">→</span>
        <FlowStep n={2} label="Genome" active={step === "compiled" && !missioning} done={!!compiled} />
        <span className="flow-arrow">→</span>
        <FlowStep n={3} label="Mission" active={step === "mission" || missioning} done={!!mission} />
      </nav>

      <main className="main">
        <section className="panel input-panel fade-in">
          {step === "connect" && !compiling && (
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
                Compile Organization
              </button>
            </>
          )}

          {(step === "compiled" || step === "mission") && !compiling && (
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
                {missioning ? "Convening board…" : "Start Mission"}
              </button>
              <button
                className="ghost-btn"
                onClick={() => {
                  setStep("connect");
                  setMission(null);
                  setCompiled(null);
                }}
              >
                Re-compile organization
              </button>
            </>
          )}

          {error && <p className="error">{error}</p>}
        </section>

        <section className="panel output-panel">
          {compiling && <CompileProgress sources={sources} active={compiling} />}

          {missioning && <MissionProgress active={missioning} />}

          {!active && !loading && (
            <div className="empty-state">
              <OrgHealth confidence={0} coverage={0} status="Awaiting sources" />
              <h2>Organization Compiler</h2>
              <p>Connect sources, compile your genome, then run missions.</p>
              <PipelineTrace
                pipeline={{ evidence_count: 0, facts_count: 0, claims_count: 0 }}
                hero
                activeStage={-1}
              />
            </div>
          )}

          {active && !compiling && !missioning && showResults && (
            <div className="results-reveal">
              <PipelineTrace pipeline={pipeline} hero activeStage={pipelineStage} />

              {coverage && genome && (
                <div className="health-row">
                  <OrgHealth
                    confidence={genome.confidence}
                    coverage={coverage.coverage_percent}
                    status={mission?.status || "Genome compiled"}
                  />
                  <div className="coverage-block compact">
                    <div className="coverage-header">
                      <div>
                        <span className="coverage-label">Genome Confidence</span>
                        <span className="coverage-value">{Math.round(genome.confidence * 100)}%</span>
                      </div>
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
                </div>
              )}

              <EvidenceGraph evidence={compiled?.evidence} animate={showResults} />

              {genome && (
                <Card title="Organization Genome">
                  <GenomeViz genome={genome} animate={pipelineStage >= 4} />
                </Card>
              )}

              {mission?.workforce && (
                <Card title="Workforce">
                  <ul className="workforce-list">
                    {mission.workforce.roles.map((r, i) => (
                      <li key={r.name} className="fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                        <span>{r.name}</span>
                        <span className={`status ${r.status}`}>
                          {r.status === "active" && <span className="presence-dot" />}
                          {r.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {mission?.board_decision && (
                <Card title="Board Meeting">
                  <BoardMeeting decision={mission.board_decision} animate />
                  <button
                    className="board-toggle"
                    onClick={() => setExpandedBoard(!expandedBoard)}
                  >
                    <span>{expandedBoard ? "Hide trace" : "Show decision trace"}</span>
                  </button>
                  {expandedBoard && (
                    <div className="board-trace fade-in">
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
                    </div>
                  )}
                </Card>
              )}

              {mission?.replay?.length > 0 && (
                <Card title="Mission Replay">
                  <ol className="replay-timeline">
                    {mission.replay.map((evt, i) => (
                      <li
                        key={i}
                        className="replay-item"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
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
            </div>
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

function Card({ title, children }) {
  return (
    <div className="card fade-up">
      <h3>{title}</h3>
      {children}
    </div>
  );
}