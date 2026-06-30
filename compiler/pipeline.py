from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any

from compiler.claims import Claim
from compiler.evidence import Evidence
from compiler.facts import Fact
from compiler.genome import OrganizationGenome
from reasoning.qwen import QwenClient


class GenomeCompiler:
    """Evidence → Facts → Claims → Genome pipeline."""

    def __init__(self, qwen: QwenClient | None = None) -> None:
        self.qwen = qwen or QwenClient()

    async def compile(self, evidence_list: list[Evidence]) -> dict[str, Any]:
        facts = self._extract_facts(evidence_list)
        claims = await self._infer_claims(facts)
        genome = self._build_genome(claims)
        return {
            "evidence": [e.to_dict() for e in evidence_list],
            "facts": [f.to_dict() for f in facts],
            "claims": [c.to_dict() for c in claims],
            "genome": genome.to_dict(),
        }

    def _extract_facts(self, evidence_list: list[Evidence]) -> list[Fact]:
        facts: list[Fact] = []
        for evidence in evidence_list:
            facts.extend(self._facts_from_evidence(evidence))
        return facts

    def _facts_from_evidence(self, evidence: Evidence) -> list[Fact]:
        content = evidence.content
        facts: list[Fact] = []

        title_match = re.search(r"<title>([^<]+)</title>", content, re.I)
        if title_match:
            facts.append(
                Fact(
                    evidence_id=evidence.id,
                    category="identity",
                    statement=f"Site title: {title_match.group(1).strip()}",
                    confidence=0.9,
                )
            )

        headings = re.findall(r"<h[1-3][^>]*>([^<]+)</h[1-3]>", content, re.I)
        for heading in headings[:5]:
            facts.append(
                Fact(
                    evidence_id=evidence.id,
                    category="messaging",
                    statement=f"Key message: {heading.strip()}",
                    confidence=0.75,
                )
            )

        if evidence.source_type == "pdf":
            pages = evidence.metadata.get("pages", 0)
            facts.append(
                Fact(
                    evidence_id=evidence.id,
                    category="documentation",
                    statement=f"Document has {pages} pages of organizational content",
                    confidence=0.85,
                )
            )

        if evidence.source_type == "social":
            platform = evidence.metadata.get("platform", "social")
            facts.append(
                Fact(
                    evidence_id=evidence.id,
                    category="channel",
                    statement=f"Active on {platform} with brand presence",
                    confidence=0.8,
                )
            )

        words = re.sub(r"<[^>]+>", " ", content).split()
        if len(words) > 50:
            sample = " ".join(words[:80])
            facts.append(
                Fact(
                    evidence_id=evidence.id,
                    category="content",
                    statement=f"Content sample: {sample[:200]}...",
                    confidence=0.6,
                )
            )

        if not facts:
            facts.append(
                Fact(
                    evidence_id=evidence.id,
                    category="raw",
                    statement=content[:300] or "No extractable content",
                    confidence=0.4,
                )
            )

        return facts

    async def _infer_claims(self, facts: list[Fact]) -> list[Claim]:
        fact_lines = "\n".join(f"- [{f.category}] {f.statement}" for f in facts)
        prompt = (
            "Given these organizational facts, infer 4-6 claims about the "
            "organization's identity, voice, audience, and channels.\n\n"
            f"Facts:\n{fact_lines}\n\n"
            "Respond as JSON array with objects: "
            '{"attribute": "...", "value": "...", "confidence": 0.0-1.0, '
            '"reasoning": "..."}'
        )
        fallback = self._fallback_claims(facts)
        result = await self.qwen.complete_json(prompt, fallback=fallback)
        if not result:
            return fallback
        if isinstance(result, list) and result and isinstance(result[0], Claim):
            return result

        claims: list[Claim] = []
        for item in result:
            if not isinstance(item, dict):
                continue
            claims.append(
                Claim(
                    attribute=item.get("attribute", "unknown"),
                    value=item.get("value", ""),
                    supporting_facts=[f.id for f in facts[:3]],
                    confidence=float(item.get("confidence", 0.5)),
                    reasoning=item.get("reasoning", ""),
                )
            )
        return claims or fallback

    def _fallback_claims(self, facts: list[Fact]) -> list[Claim]:
        channels = [f.statement for f in facts if f.category == "channel"]
        identity = next(
            (f.statement for f in facts if f.category == "identity"),
            "Organization with digital presence",
        )
        return [
            Claim(
                attribute="identity",
                value=identity.replace("Site title: ", ""),
                supporting_facts=[f.id for f in facts if f.category == "identity"],
                confidence=0.7,
                reasoning="Derived from site title and content",
            ),
            Claim(
                attribute="voice",
                value="Professional, trust-forward",
                supporting_facts=[f.id for f in facts if f.category == "messaging"],
                confidence=0.65,
                reasoning="Inferred from messaging headings",
            ),
            Claim(
                attribute="audience",
                value="Target customers seeking quality services",
                supporting_facts=[f.id for f in facts[:2]],
                confidence=0.6,
                reasoning="Inferred from content tone",
            ),
            Claim(
                attribute="channels",
                value=", ".join(channels) if channels else "website, email",
                supporting_facts=[f.id for f in facts if f.category == "channel"],
                confidence=0.75,
                reasoning="Derived from connector sources",
            ),
        ]

    def _build_genome(self, claims: list[Claim]) -> OrganizationGenome:
        lookup = {c.attribute: c for c in claims}
        channels_raw = lookup.get("channels", Claim(value="website")).value
        channels = [c.strip() for c in re.split(r"[,;]", channels_raw) if c.strip()]

        confidences = [c.confidence for c in claims if c.confidence > 0]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.5

        return OrganizationGenome(
            identity=lookup.get("identity", Claim(value="Unknown")).value,
            voice=lookup.get("voice", Claim(value="Neutral")).value,
            audience=lookup.get("audience", Claim(value="General")).value,
            channels=channels or ["website"],
            values=[
                c.value
                for c in claims
                if c.attribute not in ("identity", "voice", "audience", "channels")
            ],
            claims=[c.to_dict() for c in claims],
            confidence=round(avg_confidence, 2),
            compiled_at=datetime.now(timezone.utc).isoformat(),
        )