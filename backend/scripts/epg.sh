#!/bin/bash

INPUT_FILE="backend/epg/guide"
DEST_DIR="backend/epg"

mkdir -p "$DEST_DIR"

while IFS= read -r url; do
  [[ -z "$url" ]] && continue

  filename=$(basename "$url")
  country_code=$(echo "$filename" | cut -d'_' -f1)     # es. it_wltv_full.gz → it
  output_xml="guide-${country_code}.xml"
  temp_gz="${country_code}.tmp.gz"

  echo "⬇️ Scarico: $url"
  curl -L "$url" -o "$temp_gz"

  echo "📦 Scompatto: $temp_gz"
  gunzip -f "$temp_gz"

  extracted_name="${temp_gz%.gz}"  # rimuove .gz
  echo "📂 Sposto: $extracted_name → $DEST_DIR/$output_xml"
  mv "$extracted_name" "$DEST_DIR/$output_xml"

done < "$INPUT_FILE"

