#!/bin/bash

# URL della lista globale
M3U_URL="https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8"
REPO_DIR="$GITHUB_WORKSPACE"
OUTPUT_FILE="$REPO_DIR/backend/epg/test.json"

# Scarica la lista
echo "Downloading playlist..."
m3u_content=$(curl -s "$M3U_URL")

# Estrai la riga x-tvg-url
line=$(echo "$m3u_content" | grep -oP 'x-tvg-url="\K[^"]+')

if [[ -z "$line" ]]; then
  echo "❌ x-tvg-url not found."
  exit 1
fi

# Parsing
declare -A country_map

IFS=',' read -ra urls <<< "$line"
for raw_url in "${urls[@]}"; do
  url=$(echo "$raw_url" | xargs) # trim
  filename=$(basename "$url" .xml)

  # 1. Estrazione da suffisso (_fr, _uk)
  if [[ "$filename" == *_* ]]; then
    suffix="${filename##*_}"
    if [[ ${#suffix} -eq 2 ]]; then
      country="${suffix^^}"
    else
      country="Other"
    fi
  else
    # 2. Estrazione da dominio (.it, .uk)
    ext="${filename##*.}"
    if [[ ${#ext} -eq 2 ]]; then
      country="${ext^^}"
    else
      country="Other"
    fi
  fi

  country_map["$country"]+="$url"$'\n'
done

# Scrive il JSON
mkdir -p "$(dirname "$OUTPUT_FILE")"
echo "{" > "$OUTPUT_FILE"

first=1
for country in "${!country_map[@]}"; do
  [[ $first -eq 0 ]] && echo "," >> "$OUTPUT_FILE"
  first=0
  echo "  \"$country\": [" >> "$OUTPUT_FILE"
  while IFS= read -r url; do
    echo "    \"$url\"," >> "$OUTPUT_FILE"
  done <<< "${country_map[$country]}"
  sed -i '$ s/,$//' "$OUTPUT_FILE"  # rimuove l'ultima virgola
  echo "  ]" >> "$OUTPUT_FILE"
done

echo "}" >> "$OUTPUT_FILE"

echo "EPG sources saved to $OUTPUT_FILE"
