#!/usr/bin/env bash
# Regenerate mockups/parent-app-hifi.html from this source folder.
#
# Run after editing any of:
#   - tokens.css / primitives.css
#   - chrome.jsx / app.jsx / design-canvas.jsx
#   - screens-*.jsx
#   - Parent App.html (sprite changes)
#
# Usage (from anywhere):
#   bash mockups/parent-app-source/regen.sh
#
# The output overwrites mockups/parent-app-hifi.html.

set -e

# Resolve script directory (this file) and project root (two levels up).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
OUT="$PROJECT_ROOT/mockups/parent-app-hifi.html"

cd "$SCRIPT_DIR"

{
  # Lines 1-5: doctype, html, head open, meta, title
  sed -n '1,5p' "Parent App.html"

  # Inline tokens.css + primitives.css (replacing the two link tags)
  echo '<style>'
  cat tokens.css
  echo ''
  cat primitives.css
  echo '</style>'

  # Lines 8-78: <style> for body height, react/babel CDN scripts, </head>,
  # <body>, full SVG sprite (Phosphor + wings), thumbnail template, root div
  sed -n '8,78p' "Parent App.html"

  # Inline every JSX file in load order (matches the <script src=...> order
  # in the original Parent App.html lines 80-88).
  for f in design-canvas.jsx chrome.jsx screens-onboarding.jsx screens-pet-page.jsx screens-inbox.jsx screens-broadcasts.jsx screens-settings.jsx screens-misc.jsx app.jsx; do
    echo "<script type=\"text/babel\">"
    cat "$f"
    echo "</script>"
  done

  # Lines 90-91: </body></html>
  sed -n '90,91p' "Parent App.html"
} > "$OUT"

LINES=$(wc -l < "$OUT")
SIZE=$(wc -c < "$OUT")
echo "Regenerated: $OUT"
echo "  $LINES lines, $SIZE bytes"
