# 🛰️ RaspServerTV

🌍 **Live site**: [https://jonathansanfilippo.github.io/RaspServerTV/](https://jonathansanfilippo.github.io/RaspServerTV/)

**RaspServerTV** is a personal project created to collect and display IPTV channels in a clean and organized way, directly from the browser. It provides an updated and filtered list of streaming channels from around the world, accessible anywhere.

---

## 🔧 How It Works

- A Bash script processes multiple `.m3u` source files organized by country (`italy.txt`, `uk.txt`, etc.).
- Dead links (e.g., 404, 500, 000) are automatically removed.
- Channels with 403 errors are fixed when possible (name, logo, link).
- The result is a cleaned master playlist: `original.m3u`.

---

## 🌐 Web Interface

- A lightweight HTML + JavaScript page loads the cleaned playlist.
- Channels are displayed by country, with logos and names.
- The site detects the user's location (via IP or VPN) and prioritizes channels from that country.
- Everything runs directly in the browser — no installation needed.

---
🎞️ **HLS Stream Resolution Support**

This feature detects and lists the **video resolutions available** in an HLS (HTTP Live Streaming) stream. Useful for quality selectors, player overlays, or simply displaying what your player is currently handling.

### 🔍 Supported Resolutions

| Height (px) | Label                |
|-------------|----------------------|
| ≥ 8640      | 16K Experimental     |
| ≥ 4320      | 8K Ultra HD          |
| ≥ 2880      | 5K UltraWide         |
| ≥ 2160      | 4K Ultra HD          |
| ≥ 1600      | WQXGA+ 1600p         |
| ≥ 1440      | 2K QHD               |
| ≥ 1280      | HD+ 1280p            |
| ≥ 1080      | Full HD              |
| ≥ 1024      | XGA+ 1024p           |
| ≥ 720       | HD Ready             |
| ≥ 576       | PAL SD 576p          |
| ≥ 480       | SD 480p              |
| ≥ 360       | SD 360p              |
| ≥ 240       | Low 240p             |
| ≥ 144       | Very Low 144p        |
| ≥ 120       | Low 120p             |
| ≥ 96        | Retro 96p            |
| < 96        | Potato Mode 🥔        |

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
