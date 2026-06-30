"""ForgeOS runtime controller — mission orchestration."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from compiler.pipeline import GenomeCompiler
from connectors.pdf_parser import PDFConnector
from connectors.social import SocialConnector
from connectors.website import WebsiteConnector
from kernel.artifact_store import ArtifactStore
from kernel.event_store import EventStore
from reasoning.client import ReasoningClient
from runtime.coverage import SOURCE_CATALOG, build_coverage
from runtime.trace import build_board_trace, format_replay_timeline


class ForgeController:
    """Orchestrates discovery, genome compilation, and mission execution."""

    def __init__(self) -> None:
        self.reasoning = ReasoningClient()
        self.compiler = GenomeCompiler(self.reasoning)
        self.events = EventStore()
        self.artifacts = ArtifactStore()
        self._missions: dict[str, dict[str, Any]] = {}
        self._compiled_sessions: dict[str, dict[str, Any]] = {}
        self._connectors = {
            "website": WebsiteConnector(),
            "pdf": PDFConnector(),
            "social": SocialConnector(),
        }

    def get_source_catalog(self) -> list[dict[str, Any]]:
        return list(SOURCE_CATALOG)

    def _normalize_sources(self, sources: list[dict[str, str]] | None) -> list[dict[str, str]]:
        if not sources:
            return [
                {"type": "website", "source": "example.com"},
                {"type": "social", "source": "instagram:luxurylistings"},
            ]
        return [s for s in sources if s.get("source", "").strip()]

    async def discover(self, sources: list[dict[str, str]] | None = None) -> list[dict[str, Any]]:
        sources = self._normalize_sources(sources)
        evidence_list = []
        for item in sources:
            connector = self._connectors.get(item["type"])
            if connector:
                evidence_list.append(await connector.collect(item["source"]))

        self.events.append("discovery.complete", {"count": len(evidence_list)})
        return [e.to_dict() for e in evidence_list]

    async def compile_organization(
        self,
        sources: list[dict[str, str]] | None = None,
    ) -> dict[str, Any]:
        """Compile → Genome. Separate from mission execution."""
        sources = self._normalize_sources(sources)
        session_id = f"compile-{uuid4().hex[:6]}"
        coverage = build_coverage(sources)

        self.events.append("compile.started", {"session_id": session_id})

        evidence_list = []
        for item in sources:
            connector = self._connectors.get(item["type"])
            if connector:
                evidence_list.append(await connector.collect(item["source"]))

        self.events.append(
            "evidence.collected",
            {"session_id": session_id, "count": len(evidence_list)},
        )

        compiled = await self.compiler.compile(evidence_list)
        self.events.append(
            "facts.extracted",
            {"session_id": session_id, "count": len(compiled["facts"])},
        )
        self.events.append(
            "claims.generated",
            {"session_id": session_id, "count": len(compiled["claims"])},
        )
        self.events.append(
            "genome.compiled",
            {
                "session_id": session_id,
                "confidence": compiled["genome"]["confidence"],
            },
        )

        result = {
            "session_id": session_id,
            "compiled_at": datetime.now(timezone.utc).isoformat(),
            "sources": sources,
            "coverage": coverage,
            "pipeline": {
                "evidence_count": len(compiled["evidence"]),
                "facts_count": len(compiled["facts"]),
                "claims_count": len(compiled["claims"]),
            },
            "evidence": compiled["evidence"],
            "facts": compiled["facts"],
            "claims": compiled["claims"],
            "genome": compiled["genome"],
            "reasoning_mode": "live" if self.reasoning.is_live else "mock",
        }

        self._compiled_sessions[session_id] = result
        self.artifacts.save("latest_genome", result)
        self.artifacts.save(session_id, result)
        self.events.append("compile.completed", {"session_id": session_id})
        return result

    async def compile_genome(self, sources: list[dict[str, str]] | None = None) -> dict[str, Any]:
        """Backward-compatible alias."""
        return await self.compile_organization(sources)

    def _assemble_workforce(self, genome: dict[str, Any]) -> dict[str, Any]:
        channels = genome.get("channels", [])
        roles = [
            {"name": "Brand Strategist", "status": "active"},
            {"name": "Listing Copywriter", "status": "active"},
            {"name": "Campaign Analyst", "status": "active"},
        ]
        if len(channels) > 2:
            roles.append({"name": "Channel Manager", "status": "active"})
        roles.append({"name": "Compliance Reviewer", "status": "standby"})
        return {"roles": roles, "assembled": len(roles)}

    async def start_mission(
        self,
        objective: str,
        sources: list[dict[str, str]] | None = None,
        session_id: str | None = None,
        use_compiled: bool = True,
    ) -> dict[str, Any]:
        """Mission runs on an already-compiled genome when possible."""
        mission_id = f"mission-{uuid4().hex[:6]}"
        self.events.append(
            "mission.started",
            {"mission_id": mission_id, "objective": objective},
        )

        compiled: dict[str, Any] | None = None
        if session_id:
            compiled = self._compiled_sessions.get(session_id) or self.artifacts.get(session_id)
        elif use_compiled and not sources:
            compiled = self.artifacts.get("latest_genome")
        if compiled is None:
            compiled = await self.compile_organization(sources)

        genome = compiled["genome"]
        coverage = compiled.get("coverage") or build_coverage(compiled.get("sources", []))
        workforce = self._assemble_workforce(genome)

        self.events.append("board.deliberated", {"mission_id": mission_id})
        board_raw = await self.reasoning.deliberate(objective, genome)
        provider = board_raw.pop("_provider", None)
        board_decision = build_board_trace(compiled, objective, board_raw, coverage)

        self.events.append(
            "board.decided",
            {
                "mission_id": mission_id,
                "decision": board_decision.get("decision"),
                "confidence": board_decision.get("confidence"),
            },
        )

        confidence = genome.get("confidence", 0.5)
        time_saved = round(8 + confidence * 10, 1)
        compile_events = self.events.replay_session(compiled.get("session_id", ""))
        mission_events = self.events.replay(mission_id)
        all_events = sorted(
            compile_events + mission_events,
            key=lambda e: e.get("timestamp", ""),
        )
        timeline = format_replay_timeline(all_events)

        result = {
            "mission_id": mission_id,
            "compile_session_id": compiled.get("session_id"),
            "objective": objective,
            "pipeline": compiled.get("pipeline", {}),
            "coverage": coverage,
            "genome": genome,
            "workforce": workforce,
            "board_decision": board_decision,
            "replay": timeline,
            "reasoning_mode": "live" if self.reasoning.is_live else "mock",
            "reasoning_provider": provider,
            "status": "OPERATIONAL",
            "time_saved_hours": time_saved,
        }
        self._missions[mission_id] = result
        self.artifacts.save(mission_id, result)
        self.events.append("mission.completed", {"mission_id": mission_id})
        return result

    def get_mission(self, mission_id: str) -> dict[str, Any] | None:
        mission = self._missions.get(mission_id) or self.artifacts.get(mission_id)
        if mission and "replay" not in mission:
            compile_events = self.events.replay_session(mission.get("compile_session_id", ""))
            mission_events = self.events.replay(mission_id)
            all_events = sorted(
                compile_events + mission_events,
                key=lambda e: e.get("timestamp", ""),
            )
            mission["replay"] = format_replay_timeline(all_events)
        return mission

    def replay_mission(self, mission_id: str) -> dict[str, Any] | None:
        events = self.events.replay(mission_id)
        mission = self.get_mission(mission_id)
        if mission:
            print(f"  Replaying {mission_id}: {mission['objective']}")
            print(f"  Status: {mission['status']}")
            print(f"  Events: {len(events)} recorded")
        else:
            print(f"  Mission {mission_id} not found.")
        return mission

    def get_status(self) -> dict[str, Any]:
        configured = [
            p["name"] for p in self.reasoning.list_providers() if p["configured"]
        ]
        return {
            "missions": len(self._missions),
            "compiled_sessions": len(self._compiled_sessions),
            "artifacts": self.artifacts.list_keys(),
            "events": len(self.events.list_events()),
            "reasoning_live": self.reasoning.is_live,
            "providers_configured": configured,
        }