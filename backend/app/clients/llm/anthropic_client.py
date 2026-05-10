"""Anthropic implementation of LLMPort. JSON-only via prefilled assistant turn."""
from __future__ import annotations

import json
import re
from typing import Any

from anthropic import AsyncAnthropic

from app.core.logging import get_logger

log = get_logger(__name__)


class AnthropicLLM:
    def __init__(self, *, api_key: str, model: str) -> None:
        self._client = AsyncAnthropic(api_key=api_key)
        self._model = model

    async def complete_json(
        self,
        *,
        system: str,
        user: str,
        max_tokens: int = 4096,
    ) -> dict[str, Any]:
        msg = await self._client.messages.create(
            model=self._model,
            max_tokens=max_tokens,
            system=system + "\n\nRespond with a single valid JSON object. No prose, no code fences.",
            messages=[
                {"role": "user", "content": user},
                {"role": "assistant", "content": "{"},
            ],
        )
        text = "{" + "".join(block.text for block in msg.content if getattr(block, "type", "") == "text")
        return _parse_json_lenient(text)


_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)


def _parse_json_lenient(text: str) -> dict[str, Any]:
    cleaned = _FENCE.sub("", text).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(cleaned[start : end + 1])
        raise
