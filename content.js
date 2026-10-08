console.log("YouTube Customizer loaded");

const COLUMN_CLASS = "ytc-columns-4";

document.documentElement.classList.add(COLUMN_CLASS);

const GRID_VARS = {
  "--ytd-rich-grid-items-per-row": "4",
  "--ytd-rich-grid-posts-per-row": "4",
  "--ytd-rich-grid-slim-items-per-row": "4",
  "--ytd-rich-grid-game-cards-per-row": "4",
  "--ytd-rich-grid-item-margin": "0px",
  "--ytd-rich-grid-item-min-width": "0px",
};

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
  for (const [name, value] of Object.entries(GRID_VARS)) {
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

let applying = false;

const observer = new MutationObserver(() => {
  if (applying) return;
  applying = true;
  fixAllGrids();
  applying = false;
});

function start() {
  fixAllGrids();
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

document.addEventListener("yt-navigate-finish", fixAllGrids);
