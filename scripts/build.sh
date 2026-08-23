#!/usr/bin/env bash
# Compatibility entrypoint for the Render service while Blueprint Path still
# points at the repo root (buildCommand: bash scripts/build.sh, publishPath: ./_site).
# Canonical build lives in site/scripts/build.sh.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
bash "$REPO/site/scripts/build.sh"
rm -rf "$REPO/_site"
cp -a "$REPO/site/dist" "$REPO/_site"
