"""Gemini implementation of LLMPort. Uses native JSON response mode."""
from __future__ import annotations

import json
import re
from typing import Any

from google import genai
from google.genai import types

from app.core.logging import get_logger

log = get_logger(__name__)


class GeminiLLM:
    def __init__(self, *, api_key: str, model: str) -> None:
        self._client = genai.Client(api_key=api_key)
        self._model = model

    async def complete_json(
        self,
        *,
        system: str,
        user: str,
        max_tokens: int = 4096,
    ) -> dict[str, Any]:
        config = types.GenerateContentConfig(
            system_instruction=system + "\n\nRespond with a single valid JSON object.",
            response_mime_type="application/json",
            max_output_tokens=max_tokens,
            temperature=0.2,
        )
        response = await self._client.aio.models.generate_content(
            model=self._model,
            contents=user,
            config=config,
        )
        text = (response.text or "").strip()
        if not text:
            log.warning("gemini empty response model=%s", self._model)
            return {}
        try:
            return _parse_json_lenient(text)
        except Exception as e:  # noqa: BLE001
            log.warning("gemini JSON parse fail err=%s preview=%r", e, text[:300])
            return {}


_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)


def _parse_json_lenient(text: str) -> dict[str, Any]:
    cleaned = _FENCE.sub("", text).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(cleaned[start : end + 1])
        except json.JSONDecodeError:
            pass
    # Last resort: model truncated mid-string. Close any open string + pad braces.
    return _force_close(cleaned[start if start != -1 else 0 :])


def _force_close(s: str) -> dict[str, Any]:
    """Recover from truncated JSON by trimming to the last comma and closing braces."""
    # Drop trailing partial token after the last closing structural char.
    last_safe = max(s.rfind('",'), s.rfind("],"), s.rfind("},"))
    if last_safe == -1:
        return {}
    head = s[: last_safe + 1].rstrip(",")
    # Balance brackets/braces using a stack.
    stack: list[str] = []
    in_str = False
    esc = False
    for ch in head:
        if esc:
            esc = False
            continue
        if ch == "\\":
            esc = True
            continue
        if ch == '"':
            in_str = not in_str
            continue
        if in_str:
            continue
        if ch in "{[":
            stack.append(ch)
        elif ch in "}]":
            if stack:
                stack.pop()
    closer = "".join("}" if c == "{" else "]" for c in reversed(stack))
    try:
        return json.loads(head + closer)
    except json.JSONDecodeError:
        return {}
