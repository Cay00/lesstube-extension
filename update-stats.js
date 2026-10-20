const fs = require('fs/promises');
const path = require('path');
const { ChromeWebStore } = require('webextension-store-meta/lib/chrome-web-store');

// 🔁 Podmień na swoje identyfikatory:
const CHROME_EXTENSION_ID = 'twoje-id-rozszerzenia-chrome';
const FIREFOX_ADDON_SLUG = 'twoj-slug-dodatku-firefox';

async function getChromeStats() {
  const chrome = await ChromeWebStore.load({
    id: CHROME_EXTENSION_ID,
    qs: { hl: 'en' },
  });
  const meta = chrome.meta();
  return {
    downloads: meta.users,        // liczba aktywnych użytkowników
    rating: meta.ratingValue,     // średnia ocena
    comments: meta.ratingCount,   // liczba ocen (najbliższy publiczny wskaźnik „komentarzy”)
  };
}

async function getFirefoxStats() {
  const url = `https://addons.mozilla.org/api/v5/addons/addon/${FIREFOX_ADDON_SLUG}/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`AMO API error: ${res.status}`);
  const data = await res.json();

  return {
    downloads: data.weekly_downloads,          // pobrania w ostatnim tygodniu
    rating: data.ratings.average,              // średnia ocena
    comments: data.ratings.text_count,         // liczba ocen z tekstem (komentarze)
  };
}

async function main() {
  const [chromeStats, firefoxStats] = await Promise.all([
    getChromeStats(),
    getFirefoxStats(),
  ]);

  const stats = { chrome: chromeStats, firefox: firefoxStats };
  const outPath = path.join('.github', 'extension-stats.json');

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(stats, null, 2));
  console.log('✅ Statystyki zaktualizowane:', stats);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});