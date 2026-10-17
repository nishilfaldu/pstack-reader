#!/usr/bin/env bash
# Regenerate content/docs from cursor/plugins pstack/ (zero hand edits).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="${UPSTREAM_DIR:-$(mktemp -d)}"
if [ ! -d "$WORK/.git" ]; then
  git clone -q --depth 1 --filter=blob:none --sparse --branch "${UPSTREAM_REF:-main}" https://github.com/cursor/plugins.git "$WORK"
  git -C "$WORK" sparse-checkout set pstack
fi
SHA="$(git -C "$WORK" rev-parse HEAD)"
echo "$SHA" > "$ROOT/UPSTREAM_SHA"
PSTACK_COMMIT="$SHA" python3 "$ROOT/scripts/sync-content.py" "$WORK/pstack"
python3 "$ROOT/scripts/check-content.py"
python3 "$ROOT/scripts/audit-source.py" "$WORK/pstack"
echo "synced cursor/plugins@$SHA"
