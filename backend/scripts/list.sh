#!/bin/bash

CHECK_STREAMS=true
REPO_DIR="$GITHUB_WORKSPACE"
COUNTRIES_DIR="$REPO_DIR/backend/lists/countries"
ORIGINAL_DIR="$REPO_DIR/backend/lists"
INFO_DIR="$REPO_DIR/backend/info"
SKIPPED_FILE="$REPO_DIR/backend/lists/skipped.m3u"
OUTPUT_FILE="$ORIGINAL_DIR/list.m3u"

mkdir -p "$ORIGINAL_DIR" "$INFO_DIR"
echo "#EXTM3U" > "$OUTPUT_FILE"
echo "#EXTM3U" > "$SKIPPED_FILE"

total_entries=0
valid_entries=0
skipped_entries=0

for file in "$COUNTRIES_DIR"/*.txt; do
  country_raw="$(basename "$file" .txt)"
  country="$(tr '[:lower:]' '[:upper:]' <<< "${country_raw:0:1}")${country_raw:1}"
  echo "📦 Processing $country..."

  temp_file="/tmp/temp_$country_raw.m3u"
  > "$temp_file"

  while read -r url; do
    [[ -z "$url" ]] && continue
    curl -s "$url" >> "$temp_file"
  done < "$file"

  while IFS= read -r line; do
    if [[ $line == \#EXTINF* ]]; then
      name=$(echo "$line" | cut -d',' -f2)
      logo=$(echo "$line" | grep -o 'tvg-logo="[^"]*"' | cut -d'"' -f2)
      [[ -z "$logo" ]] && logo="https://img.icons8.com/office40/512/raspberry-pi.png"
      read -r url

      if [[ -z "$name" || -z "$url" || "$name" =~ \[COLOR|\[B|\] ]]; then
        continue
      fi

      ((total_entries++))

      if $CHECK_STREAMS; then
        status=$(curl -s -L -A "Mozilla/5.0" --max-time 5 --head "$url" | grep -i "^HTTP" | head -n 1 | awk '{print $2}')
        if [[ "$status" =~ ^(404|410|500|502|503|000)$ ]]; then
          printf "#EXTINF:-1 tvg-name=\"%s\" tvg-logo=\"%s\" tvg-id=\"\" group-title=\"%s\",%s\n%s\n\n" \
            "$name" "$logo" "$country" "$name" "$url" >> "$SKIPPED_FILE"
          ((skipped_entries++))
          continue
        fi
      fi

      printf "#EXTINF:-1 tvg-name=\"%s\" tvg-logo=\"%s\" tvg-id=\"\" group-title=\"%s\",%s\n%s\n\n" \
        "$name" "$logo" "$country" "$name" "$url" >> "$OUTPUT_FILE"
      ((valid_entries++))
    fi
  done < "$temp_file"

  rm -f "$temp_file"
done

# Scrive file informativi separati
echo "$(date '+%H:%M')" > "$INFO_DIR/last_update.txt"
echo "$total_entries" > "$INFO_DIR/total.txt"
echo "$valid_entries" > "$INFO_DIR/valid.txt"
echo "$skipped_entries" > "$INFO_DIR/skipped.txt"

# Scrive file JSON aggregato
cat <<EOF > "$INFO_DIR/stats.json"
{
  "last_update": "$(date '+%H:%M')",
  "total": $total_entries,
  "valid": $valid_entries,
  "skipped": $skipped_entries
}
EOF


echo "✅ Completato. Canali validi: $valid_entries / $total_entries"
