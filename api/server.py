"""ForgeOS REST API for the React UI."""

from __future__ import annotations

from typing import Any

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from runtime.controller import ForgeController

app = FastAPI(title="ForgeOS API", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

controller = ForgeController()


class SourceInput(BaseModel):
    type: str
    source: str


class MissionRequest(BaseModel):
    objective: str = "Launch luxury listing campaign"
    sources: list[SourceInput] = Field(default_factory=list)


class DiscoverRequest(BaseModel):
    sources: list[SourceInput] = Field(default_factory=list)


@app.get("/api/health")
async def health() -> dict[str, Any]:
    return {"status": "ok", **controller.get_status()}


@app.post("/api/discover")
async def discover(req: DiscoverRequest) -> dict[str, Any]:
    sources = [s.model_dump() for s in req.sources] or None
    evidence = await controller.discover(sources)
    return {"evidence": evidence}


@app.post("/api/compile")
async def compile_genome(req: DiscoverRequest) -> dict[str, Any]:
    sources = [s.model_dump() for s in req.sources] or None
    compiled = await controller.compile_genome(sources)
    return compiled


@app.post("/api/mission")
async def start_mission(req: MissionRequest) -> dict[str, Any]:
    sources = [s.model_dump() for s in req.sources] or None
    result = await controller.start_mission(req.objective, sources)
    return result


@app.get("/api/missions/{mission_id}")
async def get_mission(mission_id: str) -> dict[str, Any]:
    mission = controller.replay_mission(mission_id)
    if not mission:
        return {"error": "not_found"}
    events = controller.events.replay(mission_id)
    return {"mission": mission, "events": events}


def main() -> None:
    import uvicorn

    uvicorn.run("api.server:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()