#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-packages}"

if [[ ! -d "$TARGET" ]]; then
  echo "Target directory not found: $TARGET" >&2
  exit 2
fi

declare -a PATTERNS=(
  "from ['\"]solid-js/web['\"]"
  "from ['\"]solid-js/store['\"]"
  "\\bSuspense\\b"
  "\\bErrorBoundary\\b"
  "\\bIndex\\b"
  "\\bclassList\\b"
  "\\bcreateResource\\b"
  "\\buseTransition\\b"
  "\\bstartTransition\\b"
  "\\bbatch\\("
  "\\bmergeProps\\b"
  "\\bsplitProps\\b"
  "\\bunwrap\\b"
  "\\bonMount\\b"
)

HAS_ISSUE=0
SEARCH_TOOL=""

if command -v rg >/dev/null 2>&1; then
  SEARCH_TOOL="rg"
elif command -v grep >/dev/null 2>&1; then
  SEARCH_TOOL="grep"
else
  echo "Neither rg nor grep is available." >&2
  exit 2
fi

for pattern in "${PATTERNS[@]}"; do
  if [[ "$SEARCH_TOOL" == "rg" ]]; then
    rg -n --hidden --glob '!**/node_modules/**' --glob '!**/dist/**' --glob '!**/build/**' "$pattern" "$TARGET" >/tmp/solid2-check.out || true
  else
    grep -RInE --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build "$pattern" "$TARGET" >/tmp/solid2-check.out || true
  fi

  if [[ -s /tmp/solid2-check.out ]]; then
    echo "Found Solid 2 migration-sensitive pattern: $pattern"
    cat /tmp/solid2-check.out
    echo ""
    HAS_ISSUE=1
  fi
done

rm -f /tmp/solid2-check.out

# Solid 2 context provider syntax: block "<X.Provider>" except explicit public API names.
PROVIDER_PATTERN='</?[A-Za-z_][A-Za-z0-9_]*\\.Provider\\b'
if [[ "$SEARCH_TOOL" == "rg" ]]; then
  rg -n --hidden --glob '!**/node_modules/**' --glob '!**/dist/**' --glob '!**/build/**' "$PROVIDER_PATTERN" "$TARGET" >/tmp/solid2-provider.out || true
else
  grep -RInE --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build "$PROVIDER_PATTERN" "$TARGET" >/tmp/solid2-provider.out || true
fi

if [[ -s /tmp/solid2-provider.out ]]; then
  grep -vE '<(/)?Drawer\\.Provider\\b' /tmp/solid2-provider.out >/tmp/solid2-provider-filtered.out || true
  if [[ -s /tmp/solid2-provider-filtered.out ]]; then
    echo "Found Solid 2 migration-sensitive pattern: <X.Provider> (old context provider syntax)"
    cat /tmp/solid2-provider-filtered.out
    echo ""
    HAS_ISSUE=1
  fi
fi

rm -f /tmp/solid2-provider.out /tmp/solid2-provider-filtered.out

if [[ "$HAS_ISSUE" -eq 1 ]]; then
  echo "Solid 2 migration check failed."
  exit 1
fi

echo "Solid 2 migration check passed for $TARGET."
