#!/bin/bash
set -e  # Stop in caso di errore

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
  base="${filename%.xml.gz}"  # epg_ripper_UK1
  country="${base##*_}"       # UK1
  country_code=$(echo "$country" | sed 's/[0-9]*$//')  # UK

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

  # Appendi il link al paese nel dizionario (stringa concatenata)
  country_links["$country_code"]="${country_links[$country_code]} $RAW_BASE_URL/$output_file"

done < "$INPUT_FILE"

echo "📄 Creo JSON: $JSON_FILE"
echo '{' > "$JSON_FILE"
first=1
for country in "${!country_links[@]}"; do
  [[ $first -eq 0 ]] && echo ',' >> "$JSON_FILE"
  first=0

  echo -n "  \"$country\": [" >> "$JSON_FILE"

  IFS=' ' read -r -a urls <<< "${country_links[$country]}"
  for i in "${!urls[@]}"; do
    [[ $i -gt 0 ]] && echo -n ', ' >> "$JSON_FILE"
    echo -n "\"${urls[$i]}\"" >> "$JSON_FILE"
  done

  echo "]" >> "$JSON_FILE"
done
echo '}' >> "$JSON_FILE"

echo "✅ JSON creato: $JSON_FILE"
