#!/bin/bash
set -e  # Interrompe lo script in caso di errore

REPO_DIR="${GITHUB_WORKSPACE:-$(pwd)}"
INPUT_FILE="$REPO_DIR/backend/epg/guide.txt"
DEST_DIR="$REPO_DIR/backend/epg/xml"
JSON_FILE="$REPO_DIR/backend/epg/epg-sources.json"
RAW_BASE_URL="https://raw.githubusercontent.com/JonathanSanfilippo/RaspServerTV/refs/heads/main/backend/epg/xml"

mkdir -p "$DEST_DIR"
declare -A country_links  # Mappa nazione -> array di link

# Link UK fisso, da includere sempre
country_links["UK"]=("https://raw.githubusercontent.com/dp247/Freeview-EPG/master/epg.xml")

# Estrai dati da guide.txt
while IFS= read -r url; do
  [[ -z "$url" || "$url" == \#* ]] && continue

  filename=$(basename "$url")
  base="${filename%.xml.gz}"
  country=$(echo "$base" | sed -E 's/^epg_ripper_//; s/[0-9]+$//; s/-.*//')
  temp_file="temp_${base}.xml.gz"
  output_file="guide-${base}.xml"

  echo "⬇️ Scarico: $url"
  if curl -fsSL "$url" -o "$temp_file"; then
    echo "📦 Scompatto GZ: $temp_file"
    if gunzip -c "$temp_file" > "$DEST_DIR/$output_file"; then
      echo "📂 Creato: $DEST_DIR/$output_file"
      country_links[$country]+=("$RAW_BASE_URL/$output_file")
    else
      echo "❌ Errore nello scompattare: $temp_file"
    fi
    rm -f "$temp_file"
  else
    echo "❌ Errore nel download: $url"
  fi

done < "$INPUT_FILE"

# Scrive JSON finale
{
  echo '{'
  first_entry=1
  for country in "${!country_links[@]}"; do
    [[ $first_entry -eq 0 ]] && echo ','
    first_entry=0
    echo -n "  \"$country\": ["
    links=(${country_links[$country]})
    for i in "${!links[@]}"; do
      [[ $i -gt 0 ]] && echo -n ", "
      echo -n "\"${links[$i]}\""
    done
    echo -n "]"
  done
  echo -e '\n}'
} > "$JSON_FILE"

echo "✅ JSON creato: $JSON_FILE"
