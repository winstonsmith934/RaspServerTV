#!/bin/bash

REPO_DIR="$GITHUB_WORKSPACE"
INPUT_FILE="$REPO_DIR/backend/epg/guide.txt"
DEST_DIR="$REPO_DIR/backend/epg"


mkdir -p "$DEST_DIR"

while IFS= read -r url; do
  [[ -z "$url" || "$url" == \#* ]] && continue

  filename=$(basename "$url")                
  extension="${filename##*.}"                # gz, xz, zip
  base="${filename%%_*}"                     
  temp_file="temp_${base}.${extension}"      
  output_xml="guide-${base}.xml"

  echo "⬇️ Scarico: $url"
  curl -L "$url" -o "$temp_file"

  case "$extension" in
    gz)
      echo "📦 Scompatto GZ: $temp_file"
      gunzip -f "$temp_file"
      uncompressed="${temp_file%.gz}"
      ;;
    xz)
      echo "📦 Scompatto XZ: $temp_file"
      unxz -f "$temp_file"
      uncompressed="${temp_file%.xz}"
      ;;
    zip)
      echo "📦 Estrai ZIP: $temp_file"
      unzip -o "$temp_file" -d .
      uncompressed=$(unzip -l "$temp_file" | awk 'NR==4 {print $4}')
      rm -f "$temp_file"
      ;;
    *)
      echo "⚠️ Formato non supportato: $extension"
      continue
      ;;
  esac

  echo "📂 Sposto: $uncompressed → $DEST_DIR/$output_xml"
  mv "$uncompressed" "$DEST_DIR/$output_xml"

done < "$INPUT_FILE"
