# Cloud video-generation setup

Why the first scheduled cloud run failed (2026-06-21): the cloud container ran
**out of disk** cloning the monorepo (`.git` = 8.7 GB; ~21 GB of tracked
binaries, dominated by 17.6 GB of JPGs in `application/backend`), never got a
working checkout, fell back to reading files over the GitHub API (so it couldn't
render), and then **ran out of context window** and died before building.

Three fixes make cloud runs viable (and near local 15-min speed):

1. **Lean repo** — a dedicated repo containing only `promotion/marketing_video_generation`
   minus the `.webm` capture intermediates and other videos' rendered `.mp4`
   (keep `.mp3`). ~250–350 MB, clones in seconds. Point the routine there.
   *(Do NOT rewrite the monorepo history — risky for the production app repo, and
   it only frees ~1–2 GB anyway; the weight is current files, not old versions.)*

2. **Pre-warmed environment** — `environment_setup.sh` bakes the toolchain
   (ffmpeg, playwright+chromium, faster-whisper, rembg, scikit-image, …) into a
   custom Claude Code cloud environment so no per-run install. Wire-up:
   claude.ai/code → Environments → new custom env → paste `environment_setup.sh`
   as the setup script → set the routine's `environment_id` to it.

3. **Leaner prompt** — `routine_prompt.md`: one reference video instead of three,
   assumes the toolchain is pre-installed, tells the agent to keep its own context
   lean (delegate heavy reads/QA to sub-agents) and work in phases with a commit
   after each, so the context window no longer overflows.

Status: (2) and (3) done. (1) pending — needs an empty GitHub repo to push the
lean snapshot into.
