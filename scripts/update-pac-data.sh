#!/bin/bash
# Pulls the latest data.json from the AI political spending tracker repo
# and updates data/pac-tracker.json in this project.
#
# Usage: ./scripts/update-pac-data.sh
#
# Prerequisites: git access to the tracker repo (SSH or HTTPS credentials)

set -euo pipefail

TRACKER_REPO="https://github.com/Mihonarium/AI-political-spending-tracker.git"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TARGET="$PROJECT_DIR/data/pac-tracker.json"
TMPDIR=$(mktemp -d)

cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

echo "Cloning tracker repo..."
git clone --depth 1 --quiet "$TRACKER_REPO" "$TMPDIR/tracker"

SOURCE="$TMPDIR/tracker/data.json"
if [ ! -f "$SOURCE" ]; then
  echo "Error: data.json not found in tracker repo"
  exit 1
fi

# Check if data actually changed
if [ -f "$TARGET" ] && diff -q "$SOURCE" "$TARGET" > /dev/null 2>&1; then
  echo "No changes — pac-tracker.json is already up to date."
  exit 0
fi

cp "$SOURCE" "$TARGET"

# Show what changed
UPDATED=$(python3 -c "import json,sys; d=json.load(open('$TARGET')); print(d.get('metadata',{}).get('last_updated','unknown'))" 2>/dev/null || echo "unknown")
CANDIDATES=$(python3 -c "import json,sys; d=json.load(open('$TARGET')); print(len([n for n in d['nodes'] if n['type']=='cand' and n.get('amt_raw')]))" 2>/dev/null || echo "?")

echo "Updated pac-tracker.json (tracker last updated: $UPDATED, $CANDIDATES candidates)"
echo ""
echo "To deploy, commit and push:"
echo "  git add data/pac-tracker.json"
echo "  git commit -m 'Update PAC tracker data ($UPDATED)'"
echo "  git push"
