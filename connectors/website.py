from __future__ import annotations

import re

import httpx
from bs4 import BeautifulSoup

from compiler.evidence import Evidence
from connectors.base import BaseConnector


class WebsiteConnector(BaseConnector):
    """Crawl a website and extract text content."""

    source_type = "website"

    async def collect(self, source: str) -> Evidence:
        url = source if source.startswith("http") else f"https://{source}"
        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                response = await client.get(
                    url,
                    headers={"User-Agent": "ForgeOS/1.0 (+https://github.com/Mistakili/forgeos)"},
                )
                response.raise_for_status()
                html = response.text
        except Exception as exc:
            return Evidence(
                source=url,
                source_type=self.source_type,
                content=f"<error>Failed to fetch {url}: {exc}</error>",
                metadata={"error": str(exc)},
            )

        soup = BeautifulSoup(html, "html.parser")
        title = soup.title.string if soup.title else ""
        for tag in soup(["script", "style", "nav", "footer"]):
            tag.decompose()

        text = soup.get_text(separator=" ", strip=True)
        text = re.sub(r"\s+", " ", text)

        headings = [h.get_text(strip=True) for h in soup.find_all(["h1", "h2", "h3"])[:8]]
        heading_html = "".join(f"<h2>{h}</h2>" for h in headings)

        return Evidence(
            source=url,
            source_type=self.source_type,
            content=f"<title>{title}</title>{heading_html}<body>{text[:8000]}</body>",
            metadata={
                "title": title,
                "word_count": len(text.split()),
                "headings": headings,
            },
        )