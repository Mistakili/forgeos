export default function ActAwaken({ website, onWebsiteChange, onAwaken, loading }) {
  return (
    <div className="act act-awaken">
      <div className="act-hero">
        <p className="act-eyebrow">FORGEOS</p>
        <h2 className="act-title">No organization loaded.</h2>
        <p className="act-sub">
          Organizations should be compiled before they're operated.
        </p>
      </div>

      <div className="awaken-input-wrap">
        <input
          className="awaken-input"
          value={website}
          onChange={(e) => onWebsiteChange(e.target.value)}
          placeholder="acme.com"
          onKeyDown={(e) => e.key === "Enter" && onAwaken()}
        />
        <button className="awaken-btn" onClick={onAwaken} disabled={loading || !website.trim()}>
          {loading ? "Awakening…" : "Awaken Organization"}
        </button>
      </div>

      <p className="act-footnote">Paste a domain. ForgeOS discovers, compiles, then operates.</p>
    </div>
  );
}