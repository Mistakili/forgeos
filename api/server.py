"""ForgeOS REST API — development and production."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from runtime.controller import ForgeController

ROOT = Path(__file__).resolve().parent.parent
UI_DIST = ROOT / "ui" / "dist"
IS_PRODUCTION = os.getenv("FORGE_ENV", "development").lower() == "production"

app = FastAPI(title="ForgeOS API", version="0.3.0")

# CORS: localhost in dev, configurable in production
_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
cors_origins = [
    o.strip()
    for o in os.getenv("FORGE_CORS_ORIGINS", _default_origins).split(",")
    if o.strip()
]
if IS_PRODUCTION and os.getenv("FORGE_CORS_ORIGINS", "") == "*":
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
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
    status = controller.get_status()
    return {
        "status": "ok",
        "environment": "production" if IS_PRODUCTION else "development",
        "ui_bundled": UI_DIST.exists(),
        **status,
    }


@app.get("/api/models")
async def list_models() -> dict[str, Any]:
    providers = controller.reasoning.list_providers()
    return {
        "reasoning_live": controller.reasoning.is_live,
        "default_provider": os.getenv("FORGE_DEFAULT_PROVIDER", "auto"),
        "providers": providers,
    }


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
    mission = controller.get_mission(mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    events = controller.events.replay(mission_id)
    return {"mission": mission, "events": events}


# Serve React UI in production (single deploy)
if UI_DIST.exists():
    assets_dir = UI_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    async def serve_ui():
        return FileResponse(UI_DIST / "index.html")

    @app.get("/{path:path}")
    async def spa_fallback(path: str):
        if path.startswith("api"):
            raise HTTPException(status_code=404)
        file_path = UI_DIST / path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(UI_DIST / "index.html")


def main() -> None:
    import uvicorn

    host = os.getenv("FORGE_HOST", "0.0.0.0")
    port = int(os.getenv("FORGE_PORT", "8000"))
    reload = not IS_PRODUCTION and os.getenv("FORGE_RELOAD", "true").lower() == "true"

    uvicorn.run(
        "api.server:app",
        host=host,
        port=port,
        reload=reload,
    )


if __name__ == "__main__":
    main()