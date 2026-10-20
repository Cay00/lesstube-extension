# LessTube

<p align="center">
  <img src="img/promo-marquee-1400x560.png" width="100%" alt="LessTube — Less clutter. More control." />
</p>

<p align="center">
  <strong>Less clutter. More control.</strong><br />
  Customize YouTube, hide distractions, and make your viewing experience your own.
</p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/lesstube-%E2%80%94-youtube-cleane/oloemmfdfdnempbpiockejbckckjffci"><strong>Install from the Chrome Web Store</strong></a><br />
  <a href="https://addons.mozilla.org/en-US/firefox/addon/lesstube-youtube-cleaner/"><strong>Install from Firefox Add-ons</strong></a><br />
  <a href="#features">Features</a> ·
  <a href="#installation">Installation</a> ·
  <a href="#privacy">Privacy</a> ·
  <a href="#compatibility">Compatibility</a> ·
  <a href="#feedback--suggestions">Feedback</a>
</p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/lesstube-%E2%80%94-youtube-cleane/oloemmfdfdnempbpiockejbckckjffci">
    <img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FCay00%2Flesstube-extension%2Fmain%2F.github%2Fextension-stats.json&query=%24.chrome.downloads&label=Chrome%20users&color=4285F4&logo=googlechrome&logoColor=white" alt="Chrome users" />
    <img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FCay00%2Flesstube-extension%2Fmain%2F.github%2Fextension-stats.json&query=%24.chrome.rating&label=Chrome%20rating&color=34A853&suffix=%20%2F%205" alt="Chrome rating" />
    <img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FCay00%2Flesstube-extension%2Fmain%2F.github%2Fextension-stats.json&query=%24.chrome.comments&label=Chrome%20reviews&color=FBBC05" alt="Chrome reviews" />
  </a>
</p>

<p align="center">
  <a href="https://addons.mozilla.org/en-US/firefox/addon/lesstube-youtube-cleaner/">
    <img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FCay00%2Flesstube-extension%2Fmain%2F.github%2Fextension-stats.json&query=%24.firefox.downloads&label=Firefox%20users&color=FF7139&logo=firefoxbrowser&logoColor=white" alt="Firefox users" />
    <img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FCay00%2Flesstube-extension%2Fmain%2F.github%2Fextension-stats.json&query=%24.firefox.rating&label=Firefox%20rating&color=34A853&suffix=%20%2F%205" alt="Firefox rating" />
    <img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FCay00%2Flesstube-extension%2Fmain%2F.github%2Fextension-stats.json&query=%24.firefox.comments&label=Firefox%20reviews&color=FBBC05" alt="Firefox reviews" />
  </a>
</p>

---

## See LessTube in action

<p align="center">
  <img src="img/screenshot-2-before-after.png" width="100%" alt="YouTube before and after customization with LessTube" />
</p>

<p align="center">
  <em>A cleaner YouTube interface, tailored to your preferences.</em>
</p>

<table>
  <tr>
    <td width="50%" align="center">
      <img src="img/screenshot-3-watch.png" width="100%" alt="LessTube customization on the YouTube watch page" />
      <strong>Customize your viewing experience</strong>
    </td>
    <td width="50%" align="center">
      <img src="img/screenshot-5-settings.png" width="100%" alt="LessTube settings panel" />
      <strong>All your settings in one place</strong>
    </td>
  </tr>
</table>

## Features

- **Hide distractions** — hide Shorts, comments, recommendations, sidebars, end screens, and other unwanted YouTube elements.
- **Customize the layout** — adjust the video grid and number of columns.
- **Personalize the interface** — use grayscale mode and blur thumbnails to reduce visual distractions.
- **Hide watched videos** — remove videos you've already watched from supported YouTube feeds.
- **Control autoplay** — disable thumbnail hover previews and customize supported autoplay-related interface elements.
- **Element picker** — use developer mode in Tools to hide elements by clicking them or entering a CSS selector. Custom selectors can break parts of the page, so this feature must be enabled manually. You can also remove previously hidden elements from the same section.
- **Import and export settings** — back up your configuration or transfer it between installations.
- **Simple settings popup** — manage your preferences in one place.
- **Multilingual support** — the interface is available in 13 languages: English, Polish, Spanish, Portuguese, German, French, Russian, Japanese, Chinese, Korean, Hindi, Arabic, and Indonesian.

LessTube is designed to customize YouTube's interface. It does not replace YouTube's recommendation algorithms or change the videos YouTube makes available.

## Installation

### From the Chrome Web Store

[Install LessTube for Chrome](https://chromewebstore.google.com/detail/lesstube-%E2%80%94-youtube-cleane/oloemmfdfdnempbpiockejbckckjffci)

### From Firefox Add-ons

[Install LessTube for Firefox](https://addons.mozilla.org/en-US/firefox/addon/lesstube-youtube-cleaner/)

### Manual installation

Source files are located in the project root. Browser-specific manifests are available in `chrome/manifest.json` and `firefox/manifest.json`.

To load the extension unpacked:

1. Copy the manifest for your target browser into the project root as `manifest.json`.
2. Open the browser's extension management page.
3. Load the project directory as an unpacked extension.

In Chrome, open `chrome://extensions` and enable Developer mode. In Firefox, open `about:debugging` and select **This Firefox**.

For store packages, include the appropriate browser manifest as `manifest.json` and leave out the other browser's folder.

Manual installation is intended for testing and development.

## Development

LessTube is built with JavaScript, CSS, HTML, and Manifest V3.

| File | Purpose |
|---|---|
| `shared.js` | Shared settings schema, CSS generation, import/export, and selector utilities |
| `labels.js` | Text and interface labels used to recognize YouTube buttons and content across supported languages |
| `i18n.js` | Translations for the extension's settings popup |
| `content.js` | YouTube DOM manipulation, redirects, and element picker |
| `style.css` | Layout and video grid styling |
| `popup.html` | Settings interface |
| `popup.css` | Popup styling |
| `popup.js` | Popup logic |
| `_locales/` | Localized interface strings |
| `fonts/` | Figtree font files |

## Privacy

LessTube stores your preferences locally using the browser extension storage API.

- No analytics or tracking.
- No external network requests made by LessTube.
- No remotely hosted code.
- No LessTube account required.

LessTube runs on YouTube and does not need to send your settings to an external server.

## Compatibility

- **Google Chrome:** version 105 or newer.
- **Mozilla Firefox:** version 142 or newer.
- **Chromium-based browsers:** Brave, Microsoft Edge, Opera, Vivaldi, and others may work, but have not all been individually tested.
- **Gecko-based browsers:** other Firefox-based browsers may work, but have not all been individually tested.

LessTube uses Manifest V3. Compatibility may vary between browsers and their versions.

## Feedback & Suggestions

Have an idea for a new feature or a way to improve LessTube? Found a bug or something that doesn't work as expected? Feel free to email me at [cayoo.dev@gmail.com](mailto:cayoo.dev@gmail.com). I'd love to hear your suggestions!

You can also open an issue in this repository to report bugs or suggest new features.

## License

LessTube is licensed under the MIT License.