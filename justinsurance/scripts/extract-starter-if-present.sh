#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UPLOAD_DIR="/home/ubuntu/.cursor/projects/workspace/uploads"
TARGET="$ROOT/starter"
mkdir -p "$TARGET"

for candidate in \
  "$UPLOAD_DIR/justinsurance-support-desk-starter.tar.gz" \
  "$UPLOAD_DIR/justinsurance-support-desk-starter.tar_10a8.gz" \
  "$ROOT/support-desk-starter.tar.gz"; do
  if [[ -f "$candidate" ]]; then
    echo "Extracting $candidate -> $TARGET"
    tar -xzf "$candidate" -C "$TARGET"
    echo "Done. Expected: $TARGET/support-desk-test/"
    exit 0
  fi
done

echo "No starter tarball found. Upload to Project Context or place tar.gz at $ROOT/support-desk-starter.tar.gz" >&2
exit 1
