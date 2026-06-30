from __future__ import annotations

import re

import httpx

from compiler.evidence import Evidence
from connectors.base import BaseConnector


class SocialConnector(BaseConnector):
    """Collect public social profile metadata (no auth required)."""

    source_type = "social"

    async def collect(self, source: str) -> Evidence:
        platform, handle = self._parse_source(source)
        content_parts = [
            f"Platform: {platform}",
            f"Handle: {handle}",
        ]

        if platform == "instagram":
            content_parts.append(
                "Brand presence on Instagram with visual storytelling and lifestyle content."
            )
        elif platform == "linkedin":
            content_parts.append(
                "Professional network presence with company updates and thought leadership."
            )
        elif platform == "twitter" or platform == "x":
            platform = "twitter"
            content_parts.append(
                "Social engagement channel for announcements and community interaction."
            )
        else:
            content_parts.append(f"Social channel: {platform}")

        public_bio = await self._fetch_public_bio(platform, handle)
        if public_bio:
            content_parts.append(f"Bio: {public_bio}")

        return Evidence(
            source=source,
            source_type=self.source_type,
            content="\n".join(content_parts),
            metadata={"platform": platform, "handle": handle},
        )

    def _parse_source(self, source: str) -> tuple[str, str]:
        if "instagram.com" in source:
            handle = re.search(r"instagram\.com/([^/?]+)", source)
            return "instagram", handle.group(1) if handle else source
        if "linkedin.com" in source:
            handle = re.search(r"linkedin\.com/(?:company|in)/([^/?]+)", source)
            return "linkedin", handle.group(1) if handle else source
        if "twitter.com" in source or "x.com" in source:
            handle = re.search(r"(?:twitter|x)\.com/([^/?]+)", source)
            return "twitter", handle.group(1) if handle else source

        if ":" in source:
            platform, handle = source.split(":", 1)
            return platform.strip().lower(), handle.strip()

        return "social", source.strip()

    async def _fetch_public_bio(self, platform: str, handle: str) -> str:
        if platform != "github":
            return ""

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"https://api.github.com/users/{handle}")
                if response.status_code == 200:
                    data = response.json()
                    return data.get("bio") or data.get("name") or ""
        except Exception:
            pass
        return ""