# File: agentforge/agents/pdf_agent.py
# Purpose: Collect lessons per project bucket and render one PDF per bucket.
# Renderer: weasyprint (production) | reportlab (fallback).
# Subscribes to project.bucket_ready events from ProjectGrouperAgent.

from __future__ import annotations

import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

from agentforge.core.event_bus import Event, EventBus
from agentforge.core.events import EventName

logger = logging.getLogger("agentforge.pdf")


class PDFAgent:
    def __init__(self, bus: EventBus, output_dir: str | Path,
                 title: str, subtitle: str, author: str,
                 renderer: str = "weasyprint") -> None:
        self.bus = bus
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.title = title
        self.subtitle = subtitle
        self.author = author
        self.renderer = renderer
        self._pdf_count = 0

        bus.subscribe("project.bucket_ready", self._on_bucket_ready)
        # Fallback: if no grouper is wired, collect flat lessons and render on completion
        self._flat_buffer: List[Dict] = []
        bus.subscribe(EventName.LESSON_EXTRACTED.value, self._on_lesson_flat)
        bus.subscribe(EventName.INGESTION_COMPLETED.value, self._on_ingestion_complete_flat)
        self._has_buckets = False

    async def _on_bucket_ready(self, event: Event) -> None:
        self._has_buckets = True
        bucket = event.payload["bucket"]
        project = event.payload["project"]
        lessons = event.payload["lessons"]

        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename_tpl = project.get("output_filename", f"{bucket}_{{stamp}}.pdf")
        filename = filename_tpl.replace("{stamp}", stamp)
        out_path = self.output_dir / filename

        title = project.get("title", self.title)
        subtitle = project.get("subtitle", self.subtitle)

        try:
            self._render(out_path, title, subtitle, lessons)
        except Exception as e:
            logger.exception("pdf render failed for bucket '%s'", bucket)
            await self.bus.publish(Event(
                name=EventName.PDF_FAILED.value,
                payload={"error": str(e), "bucket": bucket, "output_path": str(out_path)},
                provenance="pdf_agent",
            ))
            return

        self._pdf_count += 1
        logger.info("PDF generated: %s (%d lessons)", out_path, len(lessons))
        await self.bus.publish(Event(
            name=EventName.PDF_GENERATED.value,
            payload={"output_path": str(out_path), "lesson_count": len(lessons), "bucket": bucket},
            provenance="pdf_agent",
        ))

    async def _on_lesson_flat(self, event: Event) -> None:
        self._flat_buffer.append(event.payload["lesson"])

    async def _on_ingestion_complete_flat(self, event: Event) -> None:
        if self._has_buckets or not self._flat_buffer:
            return
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        out_path = self.output_dir / f"agentforge_lessons_{stamp}.pdf"
        try:
            self._render(out_path, self.title, self.subtitle, self._flat_buffer)
        except Exception as e:
            logger.exception("flat pdf render failed")
            await self.bus.publish(Event(
                name=EventName.PDF_FAILED.value,
                payload={"error": str(e), "output_path": str(out_path)},
                provenance="pdf_agent",
            ))
            return
        logger.info("PDF generated: %s (%d lessons)", out_path, len(self._flat_buffer))
        await self.bus.publish(Event(
            name=EventName.PDF_GENERATED.value,
            payload={"output_path": str(out_path), "lesson_count": len(self._flat_buffer)},
            provenance="pdf_agent",
        ))

    def _render(self, out_path: Path, title: str, subtitle: str, lessons: List[Dict]) -> None:
        if self.renderer == "weasyprint":
            try:
                self._render_weasyprint(out_path, title, subtitle, lessons)
            except (ImportError, OSError) as exc:
                # WeasyPrint needs Pango, GObject, and HarfBuzz on the host. Windows CI
                # and minimal installs often lack these; keep the pipeline usable.
                logger.warning(
                    "WeasyPrint unavailable (%s); falling back to reportlab for this run.",
                    exc,
                )
                self._render_reportlab(out_path, title, subtitle, lessons)
        else:
            self._render_reportlab(out_path, title, subtitle, lessons)

    def _render_weasyprint(self, out_path: Path, title: str, subtitle: str,
                           lessons: List[Dict]) -> None:
        from weasyprint import HTML, CSS  # type: ignore

        html = self._build_html(title, subtitle, lessons)
        css = self._build_css()
        HTML(string=html).write_pdf(str(out_path), stylesheets=[CSS(string=css)])

    def _render_reportlab(self, out_path: Path, title: str, subtitle: str,
                          lessons: List[Dict]) -> None:
        from reportlab.lib.pagesizes import LETTER
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, PageBreak, Preformatted,
        )

        styles = getSampleStyleSheet()
        body = styles["BodyText"]
        h1 = styles["Heading1"]
        h2 = styles["Heading2"]
        code_style = ParagraphStyle(
            "Code", parent=body, fontName="Courier", fontSize=8.5,
            leading=11, leftIndent=12,
        )
        doc = SimpleDocTemplate(
            str(out_path), pagesize=LETTER,
            leftMargin=0.9 * inch, rightMargin=0.9 * inch,
            topMargin=0.9 * inch, bottomMargin=0.9 * inch,
        )
        flow = [
            Paragraph(title, h1),
            Paragraph(subtitle, body) if subtitle else Spacer(1, 6),
            Paragraph(f"by {self.author}", body),
            Paragraph(datetime.now().strftime("%B %Y"), body),
            PageBreak(),
        ]
        for i, lesson in enumerate(lessons, start=1):
            flow.append(Paragraph(f"{i}. {self._escape(lesson.get('title', ''))}", h2))
            if lesson.get("summary"):
                flow.append(Paragraph(self._escape(lesson["summary"]), body))
            flow.append(Spacer(1, 6))
            if lesson.get("problem"):
                flow.append(Paragraph("<b>Problem</b>", body))
                flow.append(Paragraph(self._escape(lesson["problem"]), body))
                flow.append(Spacer(1, 6))
            if lesson.get("solution"):
                flow.append(Paragraph("<b>Solution</b>", body))
                flow.append(Paragraph(self._escape(lesson["solution"]), body))
                flow.append(Spacer(1, 6))
            for snippet in lesson.get("code_snippets", []):
                flow.append(Preformatted(snippet, code_style))
                flow.append(Spacer(1, 6))
            if lesson.get("tags"):
                flow.append(Paragraph(
                    "<i>Tags: " + ", ".join(self._escape(t) for t in lesson["tags"]) + "</i>",
                    body,
                ))
            flow.append(PageBreak())
        doc.build(flow)

    @staticmethod
    def _strip_em_dashes(text: str) -> str:
        text = str(text).replace("\u2014", ", ")
        text = text.replace("\u2013", "-")
        return text

    def _build_html(self, title: str, subtitle: str, lessons: List[Dict]) -> str:
        def _normalize_dashes(t: str) -> str:
            return str(t).replace("\u2014", ", ").replace("\u2013", "-")

        sections = []
        for i, lesson in enumerate(lessons, start=1):
            code_html = "".join(
                f"<pre><code>{self._escape(_normalize_dashes(self._strip_em_dashes(s)))}</code></pre>"
                for s in lesson.get("code_snippets", [])
            )
            tags_html = "".join(
                f"<span class='tag'>{self._escape(_normalize_dashes(t))}</span>"
                for t in lesson.get("tags", [])
            )
            lesson_id = f"lesson-{i:03d}"
            s = lambda x: _normalize_dashes(self._strip_em_dashes(x))
            sections.append(f"""
          <section class='lesson' id='{lesson_id}' data-title='{self._escape(s(lesson.get("title", "")))}'>
            <div class='lesson-number'>Lesson {i:03d}</div>
            <h2>{self._escape(s(lesson.get("title", "")))}</h2>
            <p class='summary'>{self._escape(s(lesson.get("summary", "")))}</p>
            <h3>Problem</h3>
            <p>{self._escape(s(lesson.get("problem", "")))}</p>
            <h3>Solution</h3>
            <p>{self._escape(s(lesson.get("solution", "")))}</p>
            {code_html}
            <p class='tags'>{tags_html}</p>
          </section>
        """)

        toc_items = "".join(
            f"<li><a href='#lesson-{i:03d}'>{self._escape(_normalize_dashes(self._strip_em_dashes(lesson.get('title', ''))))}</a></li>"
            for i, lesson in enumerate(lessons, start=1)
        )

        return f"""<!DOCTYPE html>
    <html><head><meta charset='utf-8'>
    <title>{self._escape(title)}</title>
    </head><body>
      <header class='book-meta'>{self._escape(title)}</header>
      <div class='cover'>
        <h1>{self._escape(title)}</h1>
        <p class='subtitle'>{self._escape(subtitle)}</p>
        <p class='author'>{self._escape(self.author)}</p>
        <p class='imprint'>GrizzwaldHouse</p>
      </div>
      <nav class='toc'>
        <h2>Table of Contents</h2>
        <ol>{toc_items}</ol>
      </nav>
      {''.join(sections)}
    </body></html>
    """

    @staticmethod
    def _build_css() -> str:
        return """
        /* GrizzwaldHouse academic PDF stylesheet for WeasyPrint 63+.
           Palette tokens only in this block, body uses var(--color-*). */

        :root {
          --color-ink: #1a1a1a;
          --color-ink-muted: #455a64;
          --color-heading: #0a1929;
          --color-rule: #888888;
          --color-rule-soft: #cfd8dc;
          --color-margin-text: #555555;
          --color-margin-faint: #888888;
          --color-toc-heading-border: #333333;
          --color-cover-bg-0: #0a1929;
          --color-cover-bg-1: #1a3a52;
          --color-cover-text: #f4f4f0;
          --color-cover-subtitle: #c4d4e0;
          --color-cover-imprint: #8aa4b8;
          --color-lesson-number: #6b8a99;
          --color-summary-border: #6b8a99;
          --color-pre-bg: #f4f6f8;
          --color-pre-border: #455a64;
          --color-code-bg: #eef1f4;
          --color-tag-bg: #eef1f4;
          --color-tag-text: #455a64;
        }

        @page {
          size: Letter;
          margin: 1in 0.9in 1in 0.9in;

          @top-left {
            content: string(book-title);
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 9pt;
            color: var(--color-margin-text);
            border-bottom: 0.5pt solid var(--color-rule);
            padding-bottom: 4pt;
          }
          @top-right {
            content: string(chapter-title);
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 9pt;
            font-style: italic;
            color: var(--color-margin-text);
            border-bottom: 0.5pt solid var(--color-rule);
            padding-bottom: 4pt;
          }
          @bottom-left {
            content: "GrizzwaldHouse";
            font-family: 'Georgia', serif;
            font-size: 8pt;
            color: var(--color-margin-faint);
            letter-spacing: 0.05em;
          }
          @bottom-right {
            content: counter(page);
            font-family: 'Georgia', serif;
            font-size: 9pt;
            color: var(--color-margin-text);
          }
        }

        @page :first {
          margin: 0;
          @top-left { content: none; }
          @top-right { content: none; }
          @bottom-left { content: none; }
          @bottom-right { content: none; }
        }

        @page toc {
          @top-left { content: "Table of Contents"; }
          @top-right { content: none; }
        }

        html, body {
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: 11pt;
          line-height: 1.55;
          color: var(--color-ink);
          margin: 0;
          padding: 0;
          hyphens: auto;
        }

        .cover {
          page-break-after: always;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          background: linear-gradient(
            180deg,
            var(--color-cover-bg-0) 0%,
            var(--color-cover-bg-1) 100%
          );
          color: var(--color-cover-text);
          padding: 0 1in;
        }
        .cover h1 {
          font-family: 'Helvetica Neue', 'Arial', sans-serif;
          font-size: 36pt;
          font-weight: 300;
          letter-spacing: 0.02em;
          margin: 0 0 0.2in 0;
          line-height: 1.1;
        }
        .cover .subtitle {
          font-family: 'Georgia', serif;
          font-size: 16pt;
          font-style: italic;
          color: var(--color-cover-subtitle);
          margin: 0 0 1in 0;
        }
        .cover .author {
          font-size: 13pt;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--color-cover-text);
        }
        .cover .imprint {
          font-size: 9pt;
          letter-spacing: 0.2em;
          color: var(--color-cover-imprint);
          margin-top: 0.5in;
        }

        .toc {
          page: toc;
          page-break-after: always;
          string-set: chapter-title "Table of Contents";
        }
        .toc h2 {
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 22pt;
          font-weight: 300;
          border-bottom: 1pt solid var(--color-toc-heading-border);
          padding-bottom: 0.15in;
          margin-bottom: 0.3in;
        }
        .toc ol {
          list-style: none;
          padding: 0;
          counter-reset: toc-counter;
        }
        .toc li {
          counter-increment: toc-counter;
          margin-bottom: 6pt;
          font-size: 11pt;
        }
        .toc li::before {
          content: counter(toc-counter, decimal-leading-zero) ".  ";
          font-family: 'Courier', monospace;
          color: var(--color-margin-faint);
        }
        .toc a {
          color: var(--color-ink);
          text-decoration: none;
        }
        .toc a::after {
          content: leader('.') target-counter(attr(href), page);
          color: var(--color-margin-faint);
          font-family: 'Courier', monospace;
          font-size: 10pt;
        }

        header.book-meta {
          string-set: book-title content();
          display: none;
        }

        section.lesson {
          page-break-before: always;
          page-break-inside: avoid;
          string-set: chapter-title attr(data-title);
        }
        section.lesson h2 {
          font-family: 'Helvetica Neue', 'Arial', sans-serif;
          font-size: 18pt;
          font-weight: 400;
          color: var(--color-heading);
          border-bottom: 1pt solid var(--color-rule-soft);
          padding-bottom: 0.1in;
          margin: 0 0 0.2in 0;
          page-break-after: avoid;
        }
        section.lesson .lesson-number {
          font-family: 'Courier', monospace;
          font-size: 9pt;
          color: var(--color-lesson-number);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 4pt;
        }
        section.lesson h3 {
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 11pt;
          font-weight: 600;
          color: var(--color-heading);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0.25in 0 0.1in 0;
          page-break-after: avoid;
        }
        section.lesson .summary {
          font-style: italic;
          color: var(--color-ink-muted);
          border-left: 3pt solid var(--color-summary-border);
          padding-left: 0.2in;
          margin: 0 0 0.25in 0;
        }
        section.lesson p {
          margin: 0 0 0.15in 0;
          text-align: justify;
        }

        pre {
          background: var(--color-pre-bg);
          border-left: 3pt solid var(--color-pre-border);
          padding: 0.15in 0.2in;
          font-family: 'Menlo', 'Consolas', 'Courier New', monospace;
          font-size: 9pt;
          line-height: 1.4;
          color: var(--color-ink);
          page-break-inside: avoid;
          white-space: pre-wrap;
          word-wrap: break-word;
          margin: 0.15in 0;
        }
        code {
          font-family: 'Menlo', 'Consolas', monospace;
          font-size: 9.5pt;
          background: var(--color-code-bg);
          padding: 1pt 4pt;
          border-radius: 2pt;
        }

        .tags {
          margin-top: 0.3in;
          padding-top: 0.1in;
          border-top: 0.5pt solid var(--color-rule-soft);
          font-size: 9pt;
          color: var(--color-lesson-number);
          font-style: italic;
        }
        .tag {
          display: inline-block;
          background: var(--color-tag-bg);
          color: var(--color-tag-text);
          padding: 1pt 6pt;
          margin-right: 4pt;
          border-radius: 2pt;
          font-style: normal;
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 8.5pt;
          letter-spacing: 0.05em;
        }
        """

    @staticmethod
    def _escape(s: str) -> str:
        return (
            s.replace("&", "&amp;")
             .replace("<", "&lt;")
             .replace(">", "&gt;")
             .replace("'", "&#39;")
        )
