import { useMemo } from "react";
import { useStagedProgress } from "../hooks/useStagedProgress";

export function buildCompileSteps(sources) {
  const labels = [];
  if (sources.website?.trim()) labels.push({ label: "Website" });
  if (sources.documents?.trim()) labels.push({ label: "Documents" });
  if (sources.social?.trim()) labels.push({ label: "Social" });
  return labels;
}

export default function CompileProgress({ sources, active }) {
  const connected = useMemo(() => buildCompileSteps(sources), [sources]);
  const steps = useMemo(
    () => [
      "Connecting to organization…",
      ...connected.map((s) => `${s.label} connected`),
      "Building evidence graph…",
      "Extracting facts…",
      "Generating claims…",
      "Compiling genome…",
    ],
    [connected]
  );

  const stepIndex = useStagedProgress(steps, active, 360);

  return (
    <div className="progress-panel compile-progress">
      <div className="progress-title">Organization Compiler</div>
      <ul className="progress-steps">
        {steps.map((label, i) => {
          const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "pending";
          return (
            <li key={label} className={`progress-step ${state}`}>
              <span className="progress-dot" />
              <span>{label}</span>
              {state === "done" && <span className="progress-check">✓</span>}
              {state === "active" && <span className="progress-pulse" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}