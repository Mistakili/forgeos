import { useCallback, useEffect, useState } from "react";
import ActAssembly from "./acts/ActAssembly";
import ActAwaken from "./acts/ActAwaken";
import ActCompilation from "./acts/ActCompilation";
import ActDiscovery from "./acts/ActDiscovery";
import ActExecution from "./acts/ActExecution";
import BootSequence from "./components/BootSequence";
import GenomeScreen from "./components/GenomeScreen";
import "./App.css";
import "./acts/acts.css";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function App() {
  const [booted, setBooted] = useState(() => !!sessionStorage.getItem("forgeos_booted"));
  const [act, setAct] = useState("awaken"); // awaken | discovery | compilation | assembly | ready | execution
  const [website, setWebsite] = useState("");
  const [objective, setObjective] = useState("Launch luxury listing campaign");
  const [compiled, setCompiled] = useState(null);
  const [mission, setMission] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showGenome, setShowGenome] = useState(false);

  // Staged animation indices
  const [discStep, setDiscStep] = useState(0);
  const [radarIdx, setRadarIdx] = useState(-1);
  const [compileIdx, setCompileIdx] = useState(-1);
  const [assemblyIdx, setAssemblyIdx] = useState(-1);

  const handleBootComplete = useCallback(() => setBooted(true), []);

  async function runCompilationTheater(pipeline) {
    setAct("compilation");
    setCompileIdx(-1);
    for (let i = 0; i < 6; i++) {
      await sleep(480);
      setCompileIdx(i);
    }
    await sleep(500);
  }

  async function runAssemblyTheater(workforce) {
    setAct("assembly");
    setAssemblyIdx(-1);
    const count = workforce?.roles?.length || 4;
    for (let i = 0; i < count; i++) {
      await sleep(450);
      setAssemblyIdx(i);
    }
    await sleep(500);
  }

  async function awakenOrganization() {
    if (!website.trim()) return;
    setBusy(true);
    setError(null);
    setCompiled(null);
    setMission(null);

    const sources = [
      { type: "website", source: website.trim() },
      { type: "social", source: `instagram:${website.trim().split(".")[0]}` },
    ];

    try {
      const compilePromise = fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources }),
      }).then(async (res) => {
        if (!res.ok) throw new Error(`Compile failed: ${res.status}`);
        return res.json();
      });

      setAct("discovery");
      setDiscStep(0);
      setRadarIdx(-1);

      for (let i = 0; i < 4; i++) {
        await sleep(520);
        setDiscStep(i + 1);
      }

      const data = await compilePromise;
      setCompiled(data);

      for (let i = 0; i < (data.radar?.length || 5); i++) {
        await sleep(380);
        setRadarIdx(i);
      }
      await sleep(600);

      await runCompilationTheater(data.pipeline);
      await runAssemblyTheater({
        roles: [
          { name: "Brand Strategist" },
          { name: "Compliance" },
          { name: "Finance" },
          { name: "Marketing" },
        ],
      });

      setAct("ready");
    } catch (err) {
      setError(err.message);
      setAct("awaken");
    } finally {
      setBusy(false);
    }
  }

  async function launchMission() {
    if (!compiled) return;
    setBusy(true);
    setError(null);
    setAct("execution");

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
      setMission(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setAct("awaken");
    setCompiled(null);
    setMission(null);
    setWebsite("");
    setError(null);
  }

  if (!booted) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <div className="forge-ide">
      <div className="app-glow" aria-hidden />

      <aside className="ide-rail">
        <div className="rail-brand">
          <span className="logo-mark">◆</span>
          <div>
            <strong>ForgeOS</strong>
            <span>Org IDE</span>
          </div>
        </div>
        <nav className="rail-nav">
          <RailItem n={1} label="Awaken" done={act !== "awaken"} active={act === "awaken" || act === "discovery"} />
          <RailItem n={2} label="Compile" done={!!compiled} active={act === "compilation"} />
          <RailItem n={3} label="Genome" done={!!compiled} active={act === "ready" && !mission} onClick={() => compiled && setShowGenome(true)} />
          <RailItem n={4} label="Assemble" done={act === "ready" || !!mission} active={act === "assembly"} />
          <RailItem n={5} label="Execute" done={!!mission} active={act === "execution"} />
        </nav>
        <p className="rail-worldview">
          Compile before you operate.
        </p>
      </aside>

      <div className="ide-main">
        <header className="ide-header">
          <p>The OS that learns your organization first</p>
          {compiled && (
            <span className={`badge ${compiled.reasoning_mode === "live" ? "live" : "mock"}`}>
              {compiled.reasoning_mode === "live" ? "Live reasoning" : "Mock — add API key"}
            </span>
          )}
        </header>

        <div className="ide-stage">
          {act === "awaken" && (
            <ActAwaken
              website={website}
              onWebsiteChange={setWebsite}
              onAwaken={awakenOrganization}
              loading={busy}
            />
          )}

          {act === "discovery" && (
            <ActDiscovery stepsDone={discStep} radar={compiled?.radar} radarIndex={radarIdx} />
          )}

          {act === "compilation" && (
            <ActCompilation pipeline={compiled?.pipeline} stageIndex={compileIdx} />
          )}

          {act === "assembly" && (
            <ActAssembly
              roles={[
                { name: "Brand Strategist" },
                { name: "Compliance" },
                { name: "Finance" },
                { name: "Marketing" },
              ]}
              litIndex={assemblyIdx}
            />
          )}

          {(act === "ready" || act === "execution") && compiled && (
            <div className="ready-stage">
              {act === "ready" && (
                <div className="ready-hero fade-in">
                  <p className="act-eyebrow">Organization compiled</p>
                  <h2>{compiled.genome?.identity}</h2>
                  <p className="ready-meta">
                    {compiled.pipeline?.evidence_count} evidence → {compiled.pipeline?.claims_count} claims → genome
                  </p>
                  <div className="ready-actions">
                    <button className="awaken-btn" onClick={() => setShowGenome(true)}>
                      Open Genome
                    </button>
                    <button className="ghost-btn-inline" onClick={() => setAct("execution")}>
                      Go to Mission Control →
                    </button>
                  </div>
                </div>
              )}

              {act === "execution" && (
                <ActExecution
                  objective={objective}
                  mission={mission}
                  loading={busy}
                  onStart={launchMission}
                  evidence={compiled.evidence}
                  boardDecision={mission?.board_decision}
                />
              )}

              {act === "ready" && (
                <div className="mission-prep fade-in">
                  <label className="mission-label">
                    Mission objective
                    <input
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      placeholder="Launch luxury listing campaign"
                    />
                  </label>
                  <button className="awaken-btn" onClick={() => { setAct("execution"); }}>
                    Enter Mission Control
                  </button>
                </div>
              )}
            </div>
          )}

          {error && <p className="error stage-error">{error}</p>}
        </div>

        {(compiled || mission) && (
          <footer className="ide-footer">
            <button className="ghost-btn-inline" onClick={reset}>
              Awaken new organization
            </button>
            {mission?.replay && (
              <span className="footer-replay">{mission.replay.length} events recorded · replayable</span>
            )}
          </footer>
        )}
      </div>

      {showGenome && (
        <GenomeScreen
          genome={compiled?.genome}
          coverage={compiled?.coverage}
          onClose={() => setShowGenome(false)}
        />
      )}
    </div>
  );
}

function RailItem({ n, label, done, active, onClick }) {
  return (
    <button
      type="button"
      className={`rail-item ${done ? "done" : ""} ${active ? "active" : ""}`}
      onClick={onClick}
      disabled={!onClick}
    >
      <span className="rail-num">{done ? "✓" : n}</span>
      {label}
    </button>
  );
}