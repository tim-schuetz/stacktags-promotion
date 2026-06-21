#!/usr/bin/env bash
#
# Pre-warm script for the Claude Code CLOUD environment that renders
# Stacktags marketing videos. Bake the heavy/slow toolchain into the
# environment ONCE (via the custom-environment setup step in the
# Claude Code web UI) so each scheduled routine run starts ready
# instead of installing from scratch.
#
# Wire-up: claude.ai/code -> Environments -> (create custom env) ->
#          paste this as the setup / build script. Then point the
#          routine's environment_id at that env.
#
set -euxo pipefail

SUDO="$(command -v sudo || true)"   # cloud containers often run as root

# --- System packages -------------------------------------------------------
$SUDO apt-get update -y
$SUDO apt-get install -y --no-install-recommends \
  ffmpeg \
  python3 python3-pip python3-venv \
  fonts-noto-cjk fonts-noto-color-emoji   # CJK + emoji glyphs for headless render

# --- Headless browser for the capture step ---------------------------------
# The capture pipeline drives a cached Chromium via playwright-core.
# Install the browser AND its OS-level shared libs (--with-deps).
npm install -g playwright-core
npx --yes playwright install --with-deps chromium

# --- Python tooling (the slow installs — this is the real time saver) ------
#   faster-whisper        -> offline word-level audio alignment (no OpenAI quota)
#   rembg[cpu]+onnxruntime -> true-alpha cut-outs of generated images
#   scikit-image/scipy    -> dashed-outline baking + image post-processing
#   pillow/numpy          -> general image ops
python3 -m pip install --upgrade pip
python3 -m pip install \
  faster-whisper \
  "rembg[cpu]" onnxruntime \
  scikit-image scipy pillow numpy

# --- Sanity check ----------------------------------------------------------
ffmpeg -version | head -1
node --version
npx playwright --version
python3 -c "import faster_whisper, rembg, skimage, scipy, PIL, numpy; print('python deps OK')"
echo "==> Cloud environment pre-warm complete."
