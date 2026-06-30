/** Client-side insights when API omits them (stale server / cached build). */
export function fallbackInsights(compiled) {
  if (!compiled) return [];

  const genome = compiled.genome || {};
  const coverage = compiled.coverage || {};
  const missing = (coverage.items || [])
    .filter((i) => i.available && !i.connected)
    .map((i) => i.label);

  const insights = [];

  if (genome.identity) {
    insights.push({
      title: "Identity compiled",
      body: `ForgeOS identified this organization as "${genome.identity}" with a ${genome.voice || "neutral"} voice targeting ${genome.audience || "its market"}.`,
    });
  }

  if (missing.length) {
    insights.push({
      title: "Evidence blind spot",
      body: `Genome compiled without ${missing.slice(0, 3).join(", ")}. Decisions in those domains rely on inference, not verified sources.`,
    });
  }

  const weak = (compiled.radar || []).filter((r) => r.status !== "strong").sort((a, b) => a.score - b.score);
  if (weak[0]) {
    insights.push({
      title: "Department gap",
      body: `${weak[0].dept} coverage is only ${weak[0].score}% — connect more sources to sharpen operational claims.`,
    });
  }

  while (insights.length < 3) {
    insights.push({
      title: `Compiler observation #${insights.length + 1}`,
      body: `Genome confidence ${Math.round((genome.confidence || 0.5) * 100)}% with ${coverage.coverage_percent || 0}% source coverage. Connect more connectors to improve fidelity.`,
    });
  }

  return insights.slice(0, 3);
}

export function resolveInsights(compiled) {
  if (compiled?.insights?.length) return compiled.insights;
  return fallbackInsights(compiled);
}