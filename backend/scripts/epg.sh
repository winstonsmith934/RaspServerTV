#!/bin/bash
set -e  # Stop in caso di errore

REPO_DIR="${GITHUB_WORKSPACE:-$(pwd)}"
INPUT_FILE="$REPO_DIR/backend/epg/guide.txt"
DEST_DIR="$REPO_DIR/backend/epg/xml"
JSON_FILE="$REPO_DIR/backend/epg/epg-sources.json"
RAW_BASE_URL="https://raw.githubusercontent.com/JonathanSanfilippo/RaspServerTV/refs/heads/main/backend/epg/xml"

mkdir -p "$DEST_DIR"

echo '{' > "$JSON_FILE"
first=1

while IFS= read -r url; do
  [[ -z "$url" || "$url" == \#* ]] && continue

  filename=$(basename "$url")
  base="${filename%.xml.gz}"
  temp_file="temp_${base}.xml.gz"
  output_file="guide-${base}.xml"

  echo "⬇️ Scarico: $url"
  if curl -fsSL "$url" -o "$temp_file"; then
    echo "📦 Scompatto GZ: $temp_file"
    if gunzip -c "$temp_file" > "$DEST_DIR/$output_file"; then
      echo "📂 Creato: $DEST_DIR/$output_file"
    else
      echo "❌ Errore nello scompattare: $temp_file"
      continue
    fi
    rm -f "$temp_file"
  else
    echo "❌ Errore nel download: $url"
    continue
  fi

  [[ $first -eq 0 ]] && echo ',' >> "$JSON_FILE"
  first=0
  echo "  \"${base}\": [\"$RAW_BASE_URL/$output_file\"]" >> "$JSON_FILE"

done < "$INPUT_FILE"

echo '}' >> "$JSON_FILE"
echo "✅ JSON creato: $JSON_FILE"
