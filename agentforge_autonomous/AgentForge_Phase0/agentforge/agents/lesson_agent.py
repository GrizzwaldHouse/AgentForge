# File: agentforge/agents/lesson_agent.py
# Purpose: Extract a structured Lesson from a Conversation.
# Two modes: heuristic (zero-cost, runs without API key) and claude (production grade).
# Default mode is selected by config: lesson_extraction.mode

from __future__ import annotations

import json
import logging
import os
import re
from typing import Any, Dict, List, Optional

from agentforge.core.event_bus import Event, EventBus
from agentforge.core.events import EventName
from agentforge.core.schemas import Conversation, Lesson

logger = logging.getLogger("agentforge.lesson")

class HeuristicLessonExtractor:
    """No API call. Pulls problem/solution signals from message text."""

    PROBLEM_HINTS = re.compile(
        r"(error|fail|issue|bug|stuck|broken|crash|cannot|won.?t|why)",
        re.IGNORECASE,
    )
    SOLUTION_HINTS = re.compile(
        r"(fix(ed)?|solution|resolved|works now|the cause|use|set|change)",
        re.IGNORECASE,
    )
    CODE_BLOCK_RE = re.compile(r"```(?:[a-z]*)\n(.*?)```", re.DOTALL)

    @staticmethod
    def _strip_em_dashes(text: str) -> str:
        text = text.replace("\u2014", ", ")
        text = text.replace("\u2013", "-")
        return text

    def extract(self, conv: Conversation) -> Optional[Lesson]:
        joined = "\n".join(m.text for m in conv.messages)
        if len(joined) < 200:
            return None

        problem = self._first_match(conv, self.PROBLEM_HINTS) or ""
        solution = self._first_match(conv, self.SOLUTION_HINTS) or ""
        if not (problem and solution):
            return None

        code = self.CODE_BLOCK_RE.findall(joined)[:3]
        tags = self._infer_tags(joined)
        title = self._strip_em_dashes((conv.title or "Lesson").strip())[:120]

        return Lesson(
            id=f"lesson:{conv.id}",
            source_conversation_id=conv.id,
            title=title,
            summary=self._strip_em_dashes(problem[:280]),
            problem=self._strip_em_dashes(problem[:1200]),
            solution=self._strip_em_dashes(solution[:1800]),
            code_snippets=[self._strip_em_dashes(c.strip()[:1200]) for c in code],
            tags=tags,
            skip=False,
        )

    @staticmethod
    def _first_match(conv: Conversation, pattern: re.Pattern) -> str:
        for m in conv.messages:
            if pattern.search(m.text):
                return m.text.strip()
        return ""

    @staticmethod
    def _infer_tags(text: str) -> List[str]:
        text_l = text.lower()
        candidates = {
            "unreal": ["unreal", "ue5", "ue4", "blueprint", "uobject"],
            "cpp": ["c++", "cpp", "header file", "uclass"],
            "python": ["python", "asyncio", "pydantic"],
            "perforce": ["perforce", "p4", "p4v"],
            "git": ["git ", "git rebase", "git merge"],
            "ai": ["llm", "claude", "openai", "embedding"],
        }
        tags = []
        for tag, needles in candidates.items():
            if any(n in text_l for n in needles):
                tags.append(tag)
        return tags or ["uncategorized"]


class ClaudeLessonExtractor:
    """Production extractor. Lazy-imports anthropic so missing dep does not break offline runs."""

    def __init__(self, model: str, max_tokens_out: int, system_prompt: str) -> None:
        self.model = model
        self.max_tokens_out = max_tokens_out
        self.system_prompt = system_prompt

    @staticmethod
    def _strip_em_dashes(text: str) -> str:
        text = text.replace("\u2014", ", ")
        text = text.replace("\u2013", "-")
        return text

    def extract(self, conv: Conversation) -> Optional[Lesson]:
        try:
            import anthropic
        except ImportError:
            logger.warning("anthropic not installed; falling back to heuristic")
            return HeuristicLessonExtractor().extract(conv)

        api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
        if not api_key:
            logger.warning("ANTHROPIC_API_KEY not set; falling back to heuristic")
            return HeuristicLessonExtractor().extract(conv)

        client = anthropic.Anthropic(api_key=api_key)
        transcript = "\n\n".join(f"[{m.sender.value}] {m.text}" for m in conv.messages)

        try:
            msg = client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens_out,
                system=self.system_prompt,
                messages=[{"role": "user", "content": transcript[:80000]}],
            )
            data = json.loads(msg.content[0].text)
        except Exception as e:
            logger.error("claude extraction failed: %s", e)
            return HeuristicLessonExtractor().extract(conv)

        if data.get("skip"):
            return None
        try:
            return Lesson(
                id=f"lesson:{conv.id}",
                source_conversation_id=conv.id,
                title=self._strip_em_dashes(data["title"])[:120],
                summary=self._strip_em_dashes(data.get("summary", "")[:280]),
                problem=self._strip_em_dashes(data.get("problem", "")[:1500]),
                solution=self._strip_em_dashes(data.get("solution", "")[:2000]),
                code_snippets=[self._strip_em_dashes(s[:1500]) for s in data.get("code_snippets", [])][:3],
                tags=data.get("tags", []) or ["uncategorized"],
            )
        except Exception as e:
            logger.error("malformed lesson payload: %s", e)
            return None


class LessonAgent:
    def __init__(self, bus: EventBus, mode: str, model: str,
                 max_tokens_out: int, system_prompt: str) -> None:
        self.bus = bus
        if mode == "claude":
            self.extractor: Any = ClaudeLessonExtractor(model, max_tokens_out, system_prompt)
        else:
            self.extractor = HeuristicLessonExtractor()
        self.bus.subscribe(EventName.CONVERSATION_INGESTED.value, self.handle)

    async def handle(self, event: Event) -> None:
        conv_data = event.payload["conversation"]
        conv = Conversation.model_validate(conv_data)
        lesson = self.extractor.extract(conv)
        if not lesson:
            return
        await self.bus.publish(Event(
            name=EventName.LESSON_EXTRACTED.value,
            payload={"lesson": lesson.model_dump()},
            correlation_id=event.correlation_id,
            provenance="lesson_agent",
        ))
