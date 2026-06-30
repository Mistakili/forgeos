import { useCallback, useState } from "react";
import ActAssembly from "./acts/ActAssembly";
import ActCompilation from "./acts/ActCompilation";
import ActDeliberate from "./acts/ActDeliberate";
import ActDiscover from "./acts/ActDiscover";
import ActDiscovery from "./acts/ActDiscovery";
import ActExecute from "./acts/ActExecute";
import ActInsights from "./acts/ActInsights";
import BootSequence from "./components/BootSequence";
import GenomeScreen from "./components/GenomeScreen";
import "./App.css";
import "./acts/acts.css";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const RAIL = [
  { id: "discover", label: "Discover", hint: "Connectors" },
  { id: "compile", label: "Compile", hint: "Compiler" },
  { id: "assemble", label: "Assemble", hint: "Workforce" },
  { id: "insights", label: "Insights", hint: "Problems" },
  { id: "deliberate", label: "Deliberate", hint: "Console" },
  { id: "execute", label: "Execute", hint: "Replay" },
];

export default function App() {
  const [booted, setBooted] = useState(() => !!sessionStorage.getItem("forgeos_booted"));
  const [act, setAct] = useState("discover");
  const [website, setWebsite] = useState("");
  const [objective, setObjective] = useState("Launch luxury listing campaign");
  const [compiled, setCompiled] = useState(null);
  const [mission, setMission] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showGenome, setShowGenome] = useState(false);

  const [discStep, setDiscStep] = useState(0);
  const [radarIdx, setRadarIdx] = useState(-1);
  const [compileIdx, setCompileIdx] = useState(-1);
  const [assemblyIdx, setAssemblyIdx] = useState(-1);

  const handleBootComplete = useCallback(() => setBooted(true), []);

  async function runCompilationTheater(pipeline) {
    setAct("compile");
    setCompileIdx(-1);
    for (let i = 0; i < 6; i++) {
      await sleep(420);
      setCompileIdx(i);
    }
    await sleep(400);
  }

  async function runAssemblyTheater() {
    setAct("assemble");
    setAssemblyIdx(-1);
    for (let i = 0; i < 4; i++) {
      await sleep(400);
      setAssemblyIdx(i);
    }
    await sleep(400);
  }

  async function compileOrganization() {
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
      setAct("discovery");
      setDiscStep(0);
      setRadarIdx(-1);

      const compilePromise = fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources }),
      }).then(async (res) => {
        if (!res.ok) throw new Error(`Compile failed: ${res.status}`);
        return res.json();
      });

      for (let i = 0; i < 4; i++) {
        await sleep(480);
        setDiscStep(i + 1);
      }

      const data = await compilePromise;
      setCompiled(data);

      for (let i = 0; i < (data.radar?.length || 5); i++) {
        await sleep(340);
        setRadarIdx(i);
      }
      await sleep(500);

      await runCompilationTheater(data.pipeline);
      await runAssemblyTheater();
      setAct("insights");
    } catch (err) {
      setError(err.message);
      setAct("discover");
    } finally {
      setBusy(false);
    }
  }

  async function runDeliberation() {
    if (!compiled) return;
    setBusy(true);
    setError(null);
    setAct("deliberate");

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
        throw new Error(body.detail || `Deliberation failed: ${res.status}`);
      }
      setMission(await res.json());
      setAct("execute");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setAct("discover");
    setCompiled(null);
    setMission(null);
    setWebsite("");
    setError(null);
  }

  function railDone(id) {
    const order = ["discover", "discovery", "compile", "assemble", "insights", "ready", "deliberate", "execute"];
    const idx = order.indexOf(act);
    const target = { discover: 0, compile: 1, assemble: 2, insights: 3, deliberate: 4, execute: 5 }[id];
    const actMap = {
      discover: 0, discovery: 0, compile: 1, assemble: 2, insights: 3, ready: 3,
      deliberate: 4, execute: 5,
    };
    return actMap[act] > target || (id === "discover" && !!compiled);
  }

  function railActive(id) {
    const map = {
      discover: ["discover", "discovery"],
      compile: ["compile"],
      assemble: ["assemble"],
      insights: ["insights", "ready"],
      deliberate: ["deliberate"],
      execute: ["execute"],
    };
    return map[id]?.includes(act);
  }

  if (!booted) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <div className="forge-ide">
      <aside className="ide-rail">
        <div className="rail-brand">
          <span className="logo-mark">◆</span>
          <div>
            <strong>ForgeOS</strong>
            <span>Organization IDE</span>
          </div>
        </div>
        <nav className="rail-nav">
          {RAIL.map((item, i) => (
            <RailItem
              key={item.id}
              n={i + 1}
              label={item.label}
              hint={item.hint}
              done={railDone(item.id)}
              active={railActive(item.id)}
              onClick={
                item.id === "insights" && compiled
                  ? () => setAct("insights")
                  : item.id === "deliberate" && compiled
                  ? () => setAct("deliberate")
                  : item.id === "execute" && mission
                  ? () => setAct("execute")
                  : undefined
              }
            />
          ))}
        </nav>
        <p className="rail-worldview">Compile before you operate.</p>
      </aside>

      <div className="ide-main">
        <header className="ide-header calm">
          <p>Organization Compiler — learns your org before it operates</p>
          {compiled && (
            <span className={`badge ${compiled.reasoning_mode === "live" ? "live" : "mock"}`}>
              {compiled.reasoning_mode === "live" ? "Live" : "Mock"}
            </span>
          )}
        </header>

        <div className="ide-stage">
          {act === "discover" && (
            <ActDiscover
              website={website}
              onWebsiteChange={setWebsite}
              onCompile={compileOrganization}
              loading={busy}
            />
          )}

          {act === "discovery" && (
            <ActDiscovery stepsDone={discStep} radar={compiled?.radar} radarIndex={radarIdx} />
          )}

          {act === "compile" && (
            <ActCompilation pipeline={compiled?.pipeline} stageIndex={compileIdx} />
          )}

          {act === "assemble" && (
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

          {act === "insights" && compiled && (
            <ActInsights
              compiled={compiled}
              onContinue={() => setAct("ready")}
            />
          )}

          {act === "ready" && compiled && (
            <div className="ready-stage calm">
              <p className="act-eyebrow">Organization Genome</p>
              <h2>{compiled.genome?.identity}</h2>
              <p className="ready-meta">
                {compiled.pipeline?.evidence_count} evidence → {compiled.pipeline?.claims_count} claims
              </p>
              <div className="ready-actions">
                <button className="awaken-btn compile-primary" onClick={() => setShowGenome(true)}>
                  Explorer — Open Genome
                </button>
                <button className="ghost-btn-inline" onClick={() => setAct("deliberate")}>
                  Mission Console →
                </button>
              </div>
            </div>
          )}

          {act === "deliberate" && (
            <ActDeliberate
              objective={objective}
              onObjectiveChange={setObjective}
              onDeliberate={runDeliberation}
              loading={busy}
              mission={mission}
            />
          )}

          {act === "execute" && mission && (
            <ActExecute mission={mission} evidence={compiled?.evidence} />
          )}

          {error && <p className="error stage-error">{error}</p>}
        </div>

        {(compiled || mission) && (
          <footer className="ide-footer calm">
            <button className="ghost-btn-inline" onClick={reset}>
              Compile new organization
            </button>
            {mission?.replay && (
              <span className="footer-replay">{mission.replay.length} events · replayable</span>
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

function RailItem({ n, label, hint, done, active, onClick }) {
  return (
    <button
      type="button"
      className={`rail-item ${done ? "done" : ""} ${active ? "active" : ""}`}
      onClick={onClick}
      disabled={!onClick}
    >
      <span className="rail-num">{done ? "✓" : n}</span>
      <span className="rail-text">
        {label}
        <span className="rail-hint">{hint}</span>
      </span>
    </button>
  );
}