// resolve-rai-pro.js
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

async function resolve(url) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36'
      }
    });

    let finalUrl = res.url;

    // Se il redirect porta già a .m3u8
    if (finalUrl.endsWith('.m3u8')) {
      console.log(finalUrl);
      return;
    }

    // Altrimenti leggiamo l'HTML
    const html = await res.text();
    const dom = new JSDOM(html);

    // Cerca <meta http-equiv="refresh" content="5; url=xyz.m3u8">
    const metas = dom.window.document.querySelectorAll('meta[http-equiv="refresh"]');
    for (let meta of metas) {
      const content = meta.getAttribute('content');
      const match = content.match(/url=(.*)/i);
      if (match) {
        const redirectedUrl = match[1].trim();
        if (redirectedUrl.endsWith('.m3u8')) {
          console.log(redirectedUrl);
          return;
        }
      }
    }

    // Cerca direttamente link .m3u8 nei <a> o src
    const links = dom.window.document.querySelectorAll('a[href], source[src]');
    for (let link of links) {
      const href = link.getAttribute('href') || link.getAttribute('src');
      if (href && href.endsWith('.m3u8')) {
        console.log(href);
        return;
      }
    }

    console.error('ERROR: Non trovato link .m3u8 finale');
    process.exit(1);

  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

const inputUrl = process.argv[2];
if (!inputUrl) {
  console.error('Nessun URL fornito');
  process.exit(1);
}

resolve(inputUrl);
