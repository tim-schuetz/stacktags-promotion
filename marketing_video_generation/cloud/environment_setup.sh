#!/usr/bin/env bash
#
# Pre-warm script for the Claude Code CLOUD environment that renders
# Stacktags marketing videos. Paste this into the environment's
# "Setup script" field (claude.ai/code -> cloud icon -> edit environment).
#
# Runs as ROOT on Ubuntu 24.04.
#
set -eux
export DEBIAN_FRONTEND=noninteractive

# Ubuntu 24.04 is PEP 668 "externally managed": a bare `pip install` aborts with
# "error: externally-managed-environment". This env var makes system-wide pip
# work (== --break-system-packages on every call). WITHOUT it the whole setup
# script fails and NO routine on this environment can start its session.
export PIP_BREAK_SYSTEM_PACKAGES=1

# --- system packages ---
apt-get update -y
apt-get install -y --no-install-recommends \
  ffmpeg python3-pip \
  fonts-noto-cjk fonts-noto-color-emoji

# --- headless chromium for the capture step (+ its OS libs via --with-deps) ---
npm install -g playwright-core
npx --yes playwright install --with-deps chromium

# --- python tooling ---
#   faster-whisper -> offline word-level audio alignment
#   rembg+onnxruntime -> alpha cut-outs ; scikit-image/scipy -> dotted outlines
python3 -m pip install --upgrade pip
python3 -m pip install \
  faster-whisper \
  "rembg[cpu]" onnxruntime \
  scikit-image scipy pillow numpy

# --- sanity check ---
ffmpeg -version | head -1
node --version
python3 -c "import faster_whisper, rembg, skimage, scipy, PIL, numpy; print('python deps OK')"
echo "==> cloud environment pre-warm complete"
