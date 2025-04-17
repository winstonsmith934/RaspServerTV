# RaspServerTV
https://jonathansanfilippo.github.io/RaspServerTV/

# 🛰️ RaspServerTV

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

## ⚠️ Technical Note

Some streams may **not work properly in VLC or other external IPTV players**, as they require loading through a browser that supports **HLS (HTTP Live Streaming)**.

The website uses `hls.js` to ensure proper playback of these streams in a compatible environment.  
**For best results, use the website interface.**

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


Only free channels

If a channel is normally only available via commercial subscriptions it has nothing to do in this playlist. If on the other hand it is provided for free to everybody in a particular country, then it should be in this playlist.

    No paid channels
    Only channels which are officially provided for free (via DVB-S, DVB-T, analog, etc..)

Only mainstream channels

This is a playlist for everybody.

    No adult channels
    No channels dedicated to any particular religion
    No channels dedicated to any particular political party
    No channels made for a country and funded by a different country

Channels which are not in HD are marked with an Ⓢ.

Channels which use GeoIP blocking are marked with a Ⓖ.

Channels which are live Youtube channels are marked with a Ⓨ.
