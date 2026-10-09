# Customizer for YouTube (MV3)

Load unpacked: chrome://extensions → Developer mode → Load unpacked → this folder.

Files: shared.js (settings schema, CSS generator, import/export, selector builder), content.js (DOM logic, redirects, element picker), style.css (column grid), popup.html/css/js (settings UI), fonts/ (Figtree, OFL), _locales/.

Adding a setting = one entry in shared.js (key, labels EN/PL, `hide` selectors or `css`). Popup, CSS and import/export pick it up automatically.

Chrome Web Store notes
- Single purpose: customise the YouTube interface (hide/restyle elements).
- Permission `storage`: saves your settings. No host permissions beyond the content-script match on https://www.youtube.com/*. No network requests, no remote code, no analytics.
- The name avoids starting with the "YouTube" trademark ("Customizer for YouTube").
- Needs Chrome 105+ (CSS :has()).
