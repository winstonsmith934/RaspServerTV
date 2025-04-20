# 🛰️ RaspServerTV

🌍 **Live site**: [https://jonathansanfilippo.github.io/RaspServerTV/](https://jonathansanfilippo.github.io/RaspServerTV/)

**RaspServerTV** is a personal project created to collect and display IPTV channels in a clean and organized way, directly from the browser. It provides an updated and filtered list of streaming channels from around the world, accessible anywhere.

---

## 🔧 How It Works

## 📄 Script Overview: M3U Playlist Processor

This Bash script processes multiple IPTV M3U playlists, organized by country, and performs the following actions:

---

### 🔧 1. Setup and Cleanup

- Determines the script's base directory.
- Defines directories for:
  - Input lists per country (`lists/countries/*.txt`)
  - Output master playlist (`lists/original/original.m3u`)
  - Skipped channels (`lists/skipped.m3u`)
  - Info and stats files (`lists/info/`)
- Cleans previous output files and initializes them with `#EXTM3U` header.

---

### 📦 2. Country Loop

For each `.txt` file in `lists/countries`, it:

- Derives the country name from the filename.
- Downloads the content of each URL listed in that file using `curl`.
- Appends the content into a temporary M3U file.

---

### 🔍 3. M3U Parsing and Validation

Parses the temporary M3U file line by line:

- When it finds a `#EXTINF` line, it extracts the channel name and logo.
- The next line is assumed to be the stream URL.
- It ignores malformed entries (empty name, URL, or formatting tags like `[COLOR]`).

✅ It increments the `total_entries` counter.

---

### 📺 4. Stream Validation (with ffprobe)

If `CHECK_STREAMS=true`, it checks if the stream URL is valid using:

```bash
ffprobe -v error -show_entries stream=codec_type -of csv=p=0 "$url"


---

## 🌐 Web Interface

- A lightweight HTML + JavaScript page loads the cleaned playlist.
- Channels are displayed by country, with logos and names.
- The site detects the user's location (via IP or VPN) and prioritizes channels from that country.
- Everything runs directly in the browser — no installation needed.

---

## ⚠️ Technical Note

Some streams may **not work properly in VLC or other external IPTV players**, as they require loading through a browser that supports **HLS (HTTP Live Streaming)**.

The website uses `hls.js` to ensure proper playback of these streams in a compatible environment.  
**For best results, use the website interface.**

---

## 📄 Channel Policy

**Only free channels**  
This playlist includes only channels that are freely and officially available in their country of origin (e.g., via DVB-T, DVB-S, analog, or legal online streaming).  

- ❌ No paid subscription channels  
- ✅ Only officially free-to-air or publicly available content

**Only mainstream channels**  
This project aims to be accessible to a wide audience. Therefore:

- ❌ No adult content  
- ❌ No channels tied to specific religions or political parties  
- ❌ No state-funded foreign propaganda channels

---

### 🔍 Channel Legend

- Ⓢ = Not in HD (Standard Definition)  
- Ⓖ = Geo-blocked (only viewable from specific countries)  
- Ⓨ = YouTube live stream

---

## 🔗 Useful Links

- 🌍 **Live Site**: [https://jonathansanfilippo.github.io/RaspServerTV/](https://jonathansanfilippo.github.io/RaspServerTV/)
- 📄 **Clean M3U Playlist**:  
  [https://raw.githubusercontent.com/JonathanSanfilippo/iptv-auto-cleaner/refs/heads/main/lists/original/original.m3u](https://raw.githubusercontent.com/JonathanSanfilippo/iptv-auto-cleaner/refs/heads/main/lists/original/original.m3u)

---

## 📬 Contact

📧 **Email**: jonalinux.uk@gmail.com

---

© 2025 Jonathan Sanfilippo
