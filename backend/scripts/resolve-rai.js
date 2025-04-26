// resolve-rai.js
const fetch = require('node-fetch');

async function resolve(url) {
  try {
    const response = await fetch(url, { redirect: 'follow' });

    if (!response.url.endsWith('.m3u8')) {
      console.error('ERROR: URL finale non è .m3u8');
      process.exit(1);
    }

    const test = await fetch(response.url, { method: 'HEAD' });
    if (!test.ok) {
      console.error('ERROR: Il file .m3u8 non è raggiungibile');
      process.exit(1);
    }

    console.log(response.url);
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
