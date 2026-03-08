#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-packages}"

if [[ ! -d "$TARGET" ]]; then
  echo "Target directory not found: $TARGET" >&2
  exit 2
fi

SEARCH_TOOL=""
if command -v rg >/dev/null 2>&1; then
  SEARCH_TOOL="rg"
elif command -v grep >/dev/null 2>&1; then
  SEARCH_TOOL="grep"
else
  echo "Neither rg nor grep is available." >&2
  exit 2
fi

declare -a PATTERNS=(
  "\\bany\\b"
  "as any"
  "as unknown as"
  "\\bFunction\\b"
)

HAS_ISSUE=0

for pattern in "${PATTERNS[@]}"; do
  if [[ "$SEARCH_TOOL" == "rg" ]]; then
    rg -n --hidden --glob '!**/node_modules/**' --glob '!**/dist/**' --glob '!**/build/**' "$pattern" "$TARGET" >/tmp/headless-quality.out || true
  else
    grep -RInE --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build "$pattern" "$TARGET" >/tmp/headless-quality.out || true
  fi

  if [[ -s /tmp/headless-quality.out ]]; then
    echo "Found quality-sensitive pattern: $pattern"
    cat /tmp/headless-quality.out
    echo ""
    HAS_ISSUE=1
  fi
done

rm -f /tmp/headless-quality.out

if [[ "$HAS_ISSUE" -eq 1 ]]; then
  echo "Headless quality check failed."
  exit 1
fi

echo "Headless quality check passed for $TARGET."
