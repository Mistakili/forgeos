import DiscoveryRadar from "./DiscoveryRadar";

const CONNECT_STEPS = ["Website", "Social", "Policies", "Knowledge Sources"];

export default function ActDiscovery({ stepsDone, radar, radarIndex }) {
  return (
    <div className="act act-discovery">
      <p className="act-eyebrow">Discover</p>
      <h2 className="act-title-sm">Scanning organization</h2>

      <ul className="connect-steps">
        <li className="connect-step done">Connecting…</li>
        {CONNECT_STEPS.map((label, i) => (
          <li
            key={label}
            className={`connect-step ${i < stepsDone ? "done" : i === stepsDone ? "active" : ""}`}
          >
            {label}
            {i < stepsDone && <span className="step-lit">✓</span>}
          </li>
        ))}
      </ul>

      <DiscoveryRadar radar={radar} activeIndex={radarIndex} showCenter={radarIndex >= 0} />

      <p className="discovery-insight">
        {radarIndex >= 0
          ? "Illuminated sectors show what ForgeOS already knows — gaps show what to connect next."
          : "Growing the evidence graph in the background…"}
      </p>
    </div>
  );
}