import { useStagedProgress } from "../hooks/useStagedProgress";

const BOARD = ["Marketing", "Finance", "Compliance", "Operations"];

export default function MissionProgress({ active }) {
  const steps = [
    "Loading organization genome…",
    "Assembling workforce…",
    "Convening board…",
    ...BOARD.map((r) => `${r} deliberating…`),
    "Resolving consensus…",
    "Recording decision…",
  ];

  const stepIndex = useStagedProgress(steps, active, 420);

  const speaking = stepIndex >= 3 && stepIndex < 3 + BOARD.length
    ? BOARD[stepIndex - 3]
    : null;

  return (
    <div className="progress-panel mission-progress">
      <div className="progress-title">Forge Runtime</div>
      <div className="board-avatars">
        {BOARD.map((role) => (
          <div
            key={role}
            className={`board-avatar ${speaking === role ? "speaking" : stepIndex >= 3 + BOARD.indexOf(role) + 1 ? "done" : ""}`}
          >
            <span className="avatar-ring" />
            <span className="avatar-label">{role}</span>
          </div>
        ))}
      </div>
      <ul className="progress-steps compact">
        {steps.map((label, i) => {
          const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "pending";
          return (
            <li key={label} className={`progress-step ${state}`}>
              <span className="progress-dot" />
              <span>{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}