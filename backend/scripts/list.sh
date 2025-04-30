#!/bin/bash

CHECK_STREAMS=true
REPO_DIR="$GITHUB_WORKSPACE"
COUNTRIES_DIR="$REPO_DIR/backend/lists/countries"
ORIGINAL_DIR="$REPO_DIR/backend/lists"
INFO_DIR="$REPO_DIR/backend/info"
SKIPPED_FILE="$REPO_DIR/backend/lists/skipped.m3u"
OUTPUT_FILE="$ORIGINAL_DIR/list.m3u"
BACKUP_FILE="$ORIGINAL_DIR/bak_list.m3u"  # <--- aggiunto backup file
FORCED_CHANNELS=("La7")

mkdir -p "$ORIGINAL_DIR" "$INFO_DIR"

# Backup prima di sovrascrivere
if [ -f "$OUTPUT_FILE" ]; then
    echo "🔄 Backup della lista precedente in bak_list.m3u..."
    cp "$OUTPUT_FILE" "$BACKUP_FILE"
fi

echo "#EXTM3U" > "$OUTPUT_FILE"
echo "#EXTM3U" > "$SKIPPED_FILE"

# (segue tutto il tuo codice identico...)


total_entries=0
valid_entries=0
skipped_entries=0

normalize_name() {
  echo "$1" | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/\[.*?\]|\(.*?\)//g' \
    | sed -E 's/\b(hd|fhd|sd|1080|720|h264|h265|plus|extra|direct|premium)\b//g' \
    | sed -E 's/rete[[:space:]]*4|retequattro/rete4/g' \
    | sed -E 's/canale[[:space:]]*5/canale5/g' \
    | sed -E 's/italia[[:space:]]*1/italia1/g' \
    | sed -E 's/tv[[:space:]]*8/tv8/g' \
    | sed -E 's/[^a-z0-9]+//g' \
    | tr -d '\n'
}

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

      tvgid=$(normalize_name "$name")

      if $CHECK_STREAMS; then
  status=$(curl -s -L -A "Mozilla/5.0" --max-time 5 --head "$url" | grep -i "^HTTP" | head -n 1 | awk '{print $2}')

  # Controlla se il canale è in FORCED_CHANNELS
  force_channel=false
  for forced in "${FORCED_CHANNELS[@]}"; do
    if [[ "$name" == "$forced" ]]; then
      force_channel=true
      echo "⚠️  Eccezione: '$name' forzato anche se status HTTP=$status"
      break
    fi
  done

  if [[ "$force_channel" == false && "$status" =~ ^(404|410|500|502|503|000)$ ]]; then
    printf "#EXTINF:-1 tvg-name=\"%s\" tvg-logo=\"%s\" tvg-id=\"%s\" group-title=\"%s\",%s\n%s\n\n" \
      "$name" "$logo" "$tvgid" "$country" "$name" "$url" >> "$SKIPPED_FILE"
    ((skipped_entries++))
    continue
  fi
fi


      printf "#EXTINF:-1 tvg-name=\"%s\" tvg-logo=\"%s\" tvg-id=\"%s\" group-title=\"%s\",%s\n%s\n\n" \
        "$name" "$logo" "$tvgid" "$country" "$name" "$url" >> "$OUTPUT_FILE"
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

