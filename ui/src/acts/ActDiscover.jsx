export default function ActDiscover({ website, onWebsiteChange, onCompile, loading }) {
  return (
    <div className="act act-discover-entry">
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
          onKeyDown={(e) => e.key === "Enter" && onCompile()}
        />
        <button className="awaken-btn compile-primary" onClick={onCompile} disabled={loading || !website.trim()}>
          {loading ? "Compiling…" : "Compile Organization"}
        </button>
      </div>

      <p className="act-footnote">Paste a domain. ForgeOS discovers sources, compiles a genome, then operates.</p>
    </div>
  );
}