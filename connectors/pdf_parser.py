from __future__ import annotations

from pathlib import Path

from compiler.evidence import Evidence
from connectors.base import BaseConnector


class PDFConnector(BaseConnector):
    """Extract text from PDF documents."""

    source_type = "pdf"

    async def collect(self, source: str) -> Evidence:
        path = Path(source)
        if not path.exists():
            return Evidence(
                source=source,
                source_type=self.source_type,
                content=f"<error>PDF not found: {source}</error>",
                metadata={"error": "file_not_found"},
            )

        try:
            from pypdf import PdfReader

            reader = PdfReader(str(path))
            pages = []
            for page in reader.pages[:20]:
                text = page.extract_text() or ""
                pages.append(text)

            content = "\n\n".join(pages)
            return Evidence(
                source=str(path.resolve()),
                source_type=self.source_type,
                content=content[:12000],
                metadata={
                    "pages": len(reader.pages),
                    "filename": path.name,
                },
            )
        except Exception as exc:
            return Evidence(
                source=source,
                source_type=self.source_type,
                content=f"<error>PDF parse failed: {exc}</error>",
                metadata={"error": str(exc)},
            )