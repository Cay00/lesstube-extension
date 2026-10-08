console.log("YouTube Customizer loaded");

const MIN_COLUMNS = 3;
const MAX_COLUMNS = 7;
const DEFAULT_COLUMNS = 4;

let columns = DEFAULT_COLUMNS;

document.documentElement.classList.add("ytc-columns", "ytc-hide-shorts", "ytc-hide-games");
document.documentElement.style.setProperty("--ytc-columns", String(DEFAULT_COLUMNS));

function gridVars() {
  const count = String(columns);
  return {
    "--ytd-rich-grid-items-per-row": count,
    "--ytd-rich-grid-posts-per-row": count,
    "--ytd-rich-grid-slim-items-per-row": count,
    "--ytd-rich-grid-game-cards-per-row": count,
    "--ytd-rich-grid-item-margin": "0px",
    "--ytd-rich-grid-item-min-width": "0px",
  };
}

function clearInlineBox(element) {
  element.style.removeProperty("width");
  element.style.removeProperty("max-width");
  element.style.removeProperty("min-width");
  element.style.removeProperty("margin");
  element.style.removeProperty("margin-left");
  element.style.removeProperty("margin-right");
  element.style.removeProperty("flex-basis");
}

function fixGrid(grid) {
  for (const [name, value] of Object.entries(gridVars())) {
    grid.style.setProperty(name, value, "important");
  }

  const contents = grid.querySelector(":scope > #contents");
  if (!contents) return;

  clearInlineBox(contents);

  for (const child of contents.children) {
    if (child.closest("ytd-rich-shelf-renderer") === child) continue;
    if (child.tagName === "YTD-RICH-ITEM-RENDERER" && child.closest("ytd-rich-shelf-renderer")) {
      continue;
    }
    clearInlineBox(child);
  }
}

function fixAllGrids() {
  document.querySelectorAll("ytd-rich-grid-renderer").forEach(fixGrid);
}

const SHORTS_TITLE = /^(shorts|shorty)$/i;
const GAMES_TITLE = /^(pokój gier|pokoj gier|playables|youtube playables)$/i;

function shelfTitle(section) {
  for (const title of section.querySelectorAll("#title")) {
    if (title.closest("ytd-rich-item-renderer, ytd-rich-grid-media, ytd-reel-item-renderer")) continue;
    const text = title.textContent.replace(/\s+/g, " ").trim();
    if (text) return text;
  }
  return "";
}

function shelfHrefs(section) {
  const hrefs = [];
  for (const link of section.querySelectorAll("a[href]")) {
    if (link.closest("ytd-rich-item-renderer, ytd-reel-item-renderer")) continue;
    hrefs.push(link.getAttribute("href") || "");
  }
  return hrefs;
}

function widgetKind(title, hrefs) {
  if (SHORTS_TITLE.test(title) || hrefs.some((href) => href === "/shorts" || href.startsWith("/shorts?"))) {
    return "shorts";
  }
  if (GAMES_TITLE.test(title) || hrefs.some((href) => href === "/playables" || href.startsWith("/playables"))) {
    return "games";
  }
  return "";
}

function markWidget(element, kind) {
  if (!kind) {
    delete element.dataset.ytcHide;
    return;
  }
  element.dataset.ytcHide = kind;
  const section = element.closest("ytd-rich-section-renderer");
  if (section) section.dataset.ytcHide = kind;
}

function hideWidgets() {
  document.querySelectorAll("ytd-rich-section-renderer, ytd-rich-shelf-renderer, ytd-reel-shelf-renderer").forEach((section) => {
    if (section.matches("ytd-rich-shelf-renderer[is-shorts], ytd-reel-shelf-renderer")) {
      markWidget(section, "shorts");
      return;
    }
    markWidget(section, widgetKind(shelfTitle(section), shelfHrefs(section)));
  });

  document.querySelectorAll("ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer").forEach((entry) => {
    const link = entry.querySelector("a[href]");
    const href = link?.getAttribute("href") || "";
    const title = (link?.getAttribute("title") || link?.textContent || "").replace(/\s+/g, " ").trim();
    markWidget(entry, widgetKind(title, [href]));
  });
}

let applying = false;

let scheduled = false;

function refresh() {
  if (applying) return;
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    applying = true;
    fixAllGrids();
    hideWidgets();
    applying = false;
  });
}

const observer = new MutationObserver(() => {
  refresh();
});

const DEFAULTS = { hideShorts: true, hideGames: true, columns: DEFAULT_COLUMNS };

function clampColumns(value) {
  const count = Number(value);
  if (!Number.isInteger(count) || count < MIN_COLUMNS || count > MAX_COLUMNS) return DEFAULT_COLUMNS;
  return count;
}

function applySettings(settings) {
  columns = clampColumns(settings.columns);
  document.documentElement.style.setProperty("--ytc-columns", String(columns));
  document.documentElement.classList.toggle("ytc-hide-shorts", settings.hideShorts !== false);
  document.documentElement.classList.toggle("ytc-hide-games", settings.hideGames !== false);
  refresh();
}

chrome.storage.local.get(DEFAULTS, applySettings);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  chrome.storage.local.get(DEFAULTS, applySettings);
});

function start() {
  refresh();
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}

document.addEventListener("yt-navigate-finish", refresh);
