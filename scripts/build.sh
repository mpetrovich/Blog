#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d Writing/posts ]]; then
	if [[ -z "${WRITING_GITHUB_TOKEN:-}" ]]; then
		echo "error: Writing/posts missing and WRITING_GITHUB_TOKEN is unset" >&2
		exit 1
	fi
	rm -rf Writing
	git clone --depth 1 \
		"https://x-access-token:${WRITING_GITHUB_TOKEN}@github.com/mpetrovich/Writing.git" \
		Writing
fi

npm ci
npm run build
