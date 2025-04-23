#!/bin/bash
set -e  # Interrompe lo script in caso di errore

REPO_DIR="${GITHUB_WORKSPACE:-$(pwd)}"
INPUT_FILE="$REPO_DIR/backend/epg/urls/link.txt"
DEST_DIR="$REPO_DIR/backend/epg/xml-testing"
JSON_FILE="$REPO_DIR/backend/epg/testing-epg-sources.json"
RAW_BASE_URL="https://raw.githubusercontent.com/JonathanSanfilippo/RaspServerTV/refs/heads/main/backend/epg/xml-testing"

mkdir -p "$DEST_DIR"

declare -A country_links

echo "📥 Inizio download e decompressione EPG..."

while IFS= read -r url; do
  [[ -z "$url" || "$url" == \#* ]] && continue

  filename=$(basename "$url")
  base="${filename%.xml.gz}"
  base="${base%.xml}"
  country="${base##*_}"
  country_code=$(echo "$country" | sed 's/[0-9]*$//')

  temp_file="temp_${base}.xml.gz"
  output_file="guide-${base}.xml"

  echo "⬇️ Scarico: $url"
  if curl -fsSL "$url" -o "$temp_file"; then
    mime_type=$(file --mime-type "$temp_file" | cut -d ' ' -f2)
    if [[ "$mime_type" == "application/gzip" ]]; then
      echo "📦 Scompatto GZ: $temp_file"
      if gunzip -c "$temp_file" > "$DEST_DIR/$output_file"; then
        echo "📂 Creato: $DEST_DIR/$output_file"
      else
        echo "❌ Errore nello scompattare: $temp_file"
        continue
      fi
    else
      echo "📁 File normale XML: Copio $temp_file"
      mv "$temp_file" "$DEST_DIR/$output_file"
    fi
    rm -f "$temp_file"
  else
    echo "❌ Errore nel download: $url"
