#!/bin/bash
set -e

REPO_DIR="${GITHUB_WORKSPACE:-$(pwd)}"
INPUT_JSON="$REPO_DIR/backend/epg/urls/testing-link.json"
DEST_DIR="$REPO_DIR/backend/epg/xml-testing"
OUTPUT_JSON="$REPO_DIR/backend/epg/testing-epg-sources.json"
RAW_BASE_URL="https://raw.githubusercontent.com/winstonsmith934/RaspServerTV/refs/heads/main/backend/epg/xml-testing"

mkdir -p "$DEST_DIR"
rm -f "$DEST_DIR"/*.xml


echo "📥 Inizio download EPG..."

declare -A country_links

# Usa jq per leggere le chiavi (paesi) e i link associati
mapfile -t countries < <(jq -r 'keys[]' "$INPUT_JSON")

for country in "${countries[@]}"; do
  mapfile -t urls < <(jq -r --arg c "$country" '.[$c][]' "$INPUT_JSON")
  for url in "${urls[@]}"; do
    filename=$(basename "$url")
    base="${filename%.xml.gz}"
    base="${base%.xml}"
    output_file="guide-${base}.xml"
    temp_file="temp_${base}.xml.gz"

    echo "⬇️ Scarico: $url"
    if curl -fsSL "$url" -o "$temp_file"; then
      mime_type=$(file --mime-type "$temp_file" | cut -d ' ' -f2)
      if [[ "$mime_type" == "application/gzip" ]]; then
        echo "📦 Scompatto GZ: $temp_file"
        gunzip -c "$temp_file" > "$DEST_DIR/$output_file"
      else
        echo "📁 File XML non compresso: Copio $temp_file"
        mv "$temp_file" "$DEST_DIR/$output_file"
      fi
      rm -f "$temp_file"
      country_links["$country"]+="$RAW_BASE_URL/$output_file "
    else
      echo "❌ Errore nel download: $url"
    fi
  done
done

# Scrittura JSON finale
echo "📄 Creo JSON: $OUTPUT_JSON"
echo '{' > "$OUTPUT_JSON"
first=1
for country in "${!country_links[@]}"; do
  [[ $first -eq 0 ]] && echo ',' >> "$OUTPUT_JSON"
  first=0
  echo -n "  \"$country\": [" >> "$OUTPUT_JSON"
  IFS=' ' read -r -a urls <<< "${country_links[$country]}"
  for i in "${!urls[@]}"; do
    [[ $i -gt 0 ]] && echo -n ', ' >> "$OUTPUT_JSON"
    echo -n "\"${urls[$i]}\"" >> "$OUTPUT_JSON"
  done
  echo "]" >> "$OUTPUT_JSON"
done
echo '}' >> "$OUTPUT_JSON"

echo "✅ JSON creato: $OUTPUT_JSON"
