"""LLM port. Analyzers depend on this, not on a vendor SDK."""
from __future__ import annotations

from typing import Any, Protocol


class LLMPort(Protocol):
    async def complete_json(
        self,
        *,
        system: str,
        user: str,
        max_tokens: int = 4096,
    ) -> dict[str, Any]:
        """Return parsed JSON from the model. Implementations must enforce JSON-only output."""
