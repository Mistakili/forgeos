export default function ActAssembly({ roles, litIndex }) {
  const seats = roles?.length
    ? roles
    : [
        { name: "Brand Strategist" },
        { name: "Compliance" },
        { name: "Finance" },
        { name: "Marketing" },
      ];

  return (
    <div className="act act-assembly">
      <p className="act-eyebrow">Act IV — Assembly</p>
      <h2 className="act-title-sm">Workforce determined by genome</h2>

      <div className="assembly-room">
        {seats.map((role, i) => {
          const on = i <= litIndex;
          return (
            <div key={role.name} className={`assembly-seat ${on ? "online" : ""}`} style={{ animationDelay: `${i * 400}ms` }}>
              <div className="seat-chair" />
              <span className="seat-role">{role.name}</span>
              <span className="seat-status">{on ? "ONLINE" : "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}