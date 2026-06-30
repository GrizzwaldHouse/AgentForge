# Claude Code Dynamic Workflows — Video Notes

**Video:** Claude Code Dynamic Workflows Clearly Explained
**Channel:** Nate Herk | AI Automation
**Status:** Full transcript not extracted. Summary and key excerpts documented below.

---

## What Is Known (From LinkedIn Excerpt)

The video compares five Claude Code execution patterns and explains when each is worth using:

1. **Plain Claude Code** — direct session work, no orchestration overhead
2. **Skills** (`/skill-name`) — repeatable instruction patterns saved as Markdown files
3. **Subagents** — isolated side tasks that do not share session context
4. **Agent Teams** — small groups that share context and coordinate
5. **`/goal`** — loops until a done condition is met (one agent chain)
6. **Dynamic Workflows** — fan-out many independent parallel agents, synthesize at the end

Key emphasis: dynamic workflows are expensive in tokens and session limits. They are only worth using when the task is **wide**, **independently parallelizable**, and **bounded** with a clear synthesis output.

---

## How to Get the Full Transcript

Use any of the following tools with the video URL:

1. **DownSub** — downloads YouTube captions as TXT, SRT, or VTT
2. **Tactiq YouTube Transcript Tool** — copy/download transcript without signup
3. **YouTube Transcript.io** — extract and download public YouTube transcripts
4. **Download YouTube Subtitles** — SRT, VTT, or TXT format

### Local Method (yt-dlp)

```bash
yt-dlp --skip-download --write-auto-subs --sub-lang en --sub-format vtt \
  "https://youtu.be/jZgcWCzxh1I?si=7gtu1_b9mFX8avUk"
```

Convert the `.vtt` output to Markdown, then paste into Claude with the JSON prompt in `docs/analysis/claude_code_dynamic_workflows_skill_notes.md` to extract skill patterns.

### Whisper Fallback

If captions are unavailable, use the existing Whisper pipeline:
1. Download audio locally
2. Run existing Whisper transcription
3. Export as `.md`
4. Feed into Claude Code for skill extraction

---

## Source Record

- Video URL: `https://youtu.be/jZgcWCzxh1I?si=7gtu1_b9mFX8avUk`
- Notes documented: 2026-06-30
- Full transcript: NOT YET EXTRACTED
