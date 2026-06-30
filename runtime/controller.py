"""ForgeOS runtime controller — mission orchestration."""

from __future__ import annotations

from typing import Any
from uuid import uuid4

from compiler.pipeline import GenomeCompiler
from connectors.pdf_parser import PDFConnector
from connectors.social import SocialConnector
from connectors.website import WebsiteConnector
from kernel.artifact_store import ArtifactStore
from kernel.event_store import EventStore
from reasoning.client import ReasoningClient


class ForgeController:
    """Orchestrates discovery, genome compilation, and mission execution."""

    def __init__(self) -> None:
        self.reasoning = ReasoningClient()
        self.compiler = GenomeCompiler(self.reasoning)
        self.events = EventStore()
        self.artifacts = ArtifactStore()
        self._missions: dict[str, dict[str, Any]] = {}
        self._connectors = {
            "website": WebsiteConnector(),
            "pdf": PDFConnector(),
            "social": SocialConnector(),
        }

    async def discover(
        self,
        sources: list[dict[str, str]] | None = None,
    ) -> list[dict[str, Any]]:
        """Collect evidence from configured connectors."""
        if not sources:
            sources = [
                {"type": "website", "source": "example.com"},
                {"type": "social", "source": "instagram:luxurylistings"},
            ]

        evidence_list = []
        for item in sources:
            connector = self._connectors.get(item["type"])
            if connector:
                evidence = await connector.collect(item["source"])
                evidence_list.append(evidence)

        self.events.append("discovery.complete", {"count": len(evidence_list)})
        return [e.to_dict() for e in evidence_list]

    async def compile_genome(
        self,
        sources: list[dict[str, str]] | None = None,
    ) -> dict[str, Any]:
        """Run full Evidence → Facts → Claims → Genome pipeline."""
        if not sources:
            sources = [
                {"type": "website", "source": "example.com"},
                {"type": "social", "source": "instagram:luxurylistings"},
            ]

        evidence_list = []
        for item in sources:
            connector = self._connectors.get(item["type"])
            if connector:
                evidence_list.append(await connector.collect(item["source"]))

        compiled = await self.compiler.compile(evidence_list)
        self.artifacts.save("latest_genome", compiled)
        self.events.append("genome.compiled", {"confidence": compiled["genome"]["confidence"]})
        return compiled

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
    ) -> dict[str, Any]:
        """Run the full boot sequence and return organization state."""
        mission_id = f"mission-{uuid4().hex[:6]}"
        self.events.append("mission.started", {"mission_id": mission_id, "objective": objective})

        compiled = await self.compile_genome(sources)
        genome = compiled["genome"]
        workforce = self._assemble_workforce(genome)

        board_decision = await self.reasoning.deliberate(objective, genome)
        provider = board_decision.pop("_provider", None)
        self.events.append(
            "board.decided",
            {"mission_id": mission_id, "decision": board_decision.get("decision")},
        )

        confidence = genome.get("confidence", 0.5)
        time_saved = round(8 + confidence * 10, 1)

        result = {
            "mission_id": mission_id,
            "objective": objective,
            "pipeline": {
                "evidence_count": len(compiled["evidence"]),
                "facts_count": len(compiled["facts"]),
                "claims_count": len(compiled["claims"]),
            },
            "genome": genome,
            "workforce": workforce,
            "board_decision": board_decision,
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
        """Return mission without console output."""
        return self._missions.get(mission_id) or self.artifacts.get(mission_id)

    def replay_mission(self, mission_id: str) -> dict[str, Any] | None:
        """Replay a completed mission from the event store."""
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
            "artifacts": self.artifacts.list_keys(),
            "events": len(self.events.list_events()),
            "reasoning_live": self.reasoning.is_live,
            "providers_configured": configured,
        }