#!/bin/bash

REPO_DIR="$GITHUB_WORKSPACE"
INPUT_FILE="$REPO_DIR/backend/epg/guide.txt"
DEST_DIR="$REPO_DIR/backend/epg/xml"
JSON_FILE="$REPO_DIR/backend/epg/epg-sources.json"
RAW_BASE_URL="https://raw.githubusercontent.com/JonathanSanfilippo/RaspServerTV/refs/heads/main/backend/epg/xml"

mkdir -p "$DEST_DIR"

# Inizializza JSON
echo '{' > "$JSON_FILE"

first=1
while IFS= read -r url; do
  [[ -z "$url" || "$url" == \#* ]] && continue

  filename=$(basename "$url")
  base="${filename%.xml.gz}"
  temp_file="temp_${base}.xml.gz"
  output_file="guide-${base}.xml"

  echo "⬇️ Scarico: $url"
  curl -L "$url" -o "$temp_file"

  echo "📦 Scompatto GZ: $temp_file"
  gunzip -c "$temp_file" > "$DEST_DIR/$output_file"
  rm -f "$temp_file"

  echo "📂 Creato: $DEST_DIR/$output_file"

  # Aggiunge al JSON
  [ $first -eq 0 ] && echo ',' >> "$JSON_FILE"
  first=0
  echo "  \"${base}\": [\"$RAW_BASE_URL/$output_file\"]" >> "$JSON_FILE"

done < "$INPUT_FILE"

# Chiude JSON
echo '}' >> "$JSON_FILE"

echo "✅ JSON creato: $JSON_FILE"
