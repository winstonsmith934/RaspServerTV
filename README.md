# 🛰️ RaspberryTV — IPTV Web Interface & Auto Cleaner

🌍 **Live Site**: [https://jonathansanfilippo.github.io/RaspServerTV/](https://jonathansanfilippo.github.io/RaspServerTV/)  
📦 **GitHub Repo (Script)**: [https://github.com/JonathanSanfilippo/iptv-auto-cleaner](https://github.com/JonathanSanfilippo/iptv-auto-cleaner)

**RaspberryTV** is a clean, mobile-friendly web interface to browse, search, and watch IPTV channels.  
It works with an automated Bash script that builds and maintains a curated `.m3u` playlist from various country-based sources.

---

## 💡 Features

- 🌐 Web-based IPTV browser (desktop & mobile)
- 📂 Channel lists by country
- 🔎 Search, logos, and stream preview
- ⚙️ Auto-detect your country via IP (GeoIP)
- 🧼 GitHub Action to clean and verify stream URLs
- ✅ Uses `ffprobe` to detect valid video/audio streams
- 📊 JSON + TXT stats for frontend use

---

## 🖥️ RaspberryTV: The Frontend

Built with **HTML, CSS (Ubuntu fonts)**, and **JavaScript + HLS.js**.

### Desktop Version
- URL: [Desktop view](https://jonathansanfilippo.github.io/RaspServerTV/)
- Sidebar with channels and flags
- Auto-play on selection
- Status messages, last update info, and view counter

### Mobile Version
- URL: [Mobile view](https://jonathansanfilippo.github.io/RaspServerTV/mobile.html)
- Responsive layout with same functionalities
- Flags and channels in vertical layout
- Built-in video player and fast navigation

> Both versions share the same logic via `scripts.js` and load data dynamically from the GitHub repo.

---

## ⚙️ Backend: IPTV Auto-Cleaner Script

This Bash script automatically parses, verifies, and rebuilds `.m3u` IPTV playlists.

### 📄 Script Overview

```bash
# Uses ffprobe to validate each stream:
ffprobe -v error -show_entries stream=codec_type -of csv=p=0 "$url"

