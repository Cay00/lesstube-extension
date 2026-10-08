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

const GUIDE_RULES = [
  { id: "home", titles: ["strona główna", "home"], paths: ["/"] },
  { id: "shorts", titles: ["shorts", "shorty"], paths: ["/shorts"] },
  { id: "subscriptions", titles: ["subskrypcje", "subscriptions"], paths: ["/feed/subscriptions"] },
  { id: "you", titles: ["ty", "you", "biblioteka", "library"], paths: ["/feed/you", "/feed/library"] },
  { id: "channel", titles: ["twój kanał", "twoj kanal", "your channel"] },
  { id: "history", titles: ["historia", "history"], paths: ["/feed/history"] },
  { id: "playlists", titles: ["playlisty", "playlists"], paths: ["/feed/playlists"] },
  { id: "watchLater", titles: ["do obejrzenia", "obejrzyj później", "obejrzyj pozniej", "watch later"], lists: ["WL"] },
  { id: "liked", titles: ["polubione filmy", "polubione", "liked videos"], lists: ["LL"] },
  { id: "yourVideos", titles: ["twoje filmy", "your videos"], paths: ["/feed/videos"] },
  { id: "downloads", titles: ["pobrane", "pobieranie", "downloads", "offline"], paths: ["/feed/downloads", "/feed/offline"] },
  { id: "courses", titles: ["kursy", "courses", "learning"], paths: ["/feed/courses", "/feed/learning"] },
  { id: "clips", titles: ["klipy", "twoje klipy", "your clips", "clips"], paths: ["/feed/clips"] },
  { id: "exploreMusic", titles: ["muzyka", "music"], channels: ["UC-9-kyTW8ZkZNDHQJ6FgpwQ"] },
  { id: "movies", titles: ["filmy", "movies", "films"], paths: ["/feed/storefront"] },
  { id: "hype", titles: ["podbijanie", "hype"], paths: ["/feed/hype"] },
  { id: "live", titles: ["na żywo", "na zywo", "live"], paths: ["/feed/live"], channels: ["UC4R8DWoMoI7CAwX8_LjQHig"] },
  { id: "gaming", titles: ["gry", "gaming"], paths: ["/gaming"], channels: ["UCOpNcN46UbXVtpKMrmU4Abg"] },
  { id: "news", titles: ["wiadomości", "wiadomosci", "news"], channels: ["UCYfdidRxbB8Qhf0Nx7ioOYw"] },
  { id: "sports", titles: ["sport", "sports", "sporty"], channels: ["UCEgdi0XIXXZ-qJOFPf4JSKw"] },
  { id: "podcasts", titles: ["podcasty", "podcasts"], paths: ["/podcasts"] },
  { id: "playables", titles: ["pokój gier", "pokoj gier", "playables"], paths: ["/playables"] },
  { id: "support", titles: ["wspieranie kanału", "wspieranie kanalu"] },
  { id: "music", titles: ["youtube music"], hosts: ["music.youtube.com"] },
  { id: "kids", titles: ["youtube kids", "dzieci", "youtube dzieci"], hosts: ["www.youtubekids.com", "youtubekids.com"] },
  { id: "reports", titles: ["historia zgłoszeń", "historia zgloszen", "report history"], paths: ["/reporthistory"] },
  { id: "showMore", titles: ["pokaż więcej", "pokaz wiecej", "pokaż mniej", "pokaz mniej", "show more", "show less"] },
];

const HOME_GUIDE = new Set(["home", "shorts"]);
const LIBRARY_GUIDE = new Set(["you", "channel", "history", "playlists", "watchLater", "liked", "yourVideos", "downloads", "courses", "clips", "libraryShowMore"]);
const EXPLORE_GUIDE = new Set(["exploreMusic", "movies", "hype", "live", "gaming", "news", "sports", "podcasts", "playables", "support", "exploreShowMore"]);
const MORE_GUIDE = new Set(["music", "kids", "reports"]);

function entryInfo(entry) {
  const link = entry.querySelector("a[href]");
  const rawHref = link?.getAttribute("href") || "";
  let url = null;
  try {
    if (rawHref) url = new URL(rawHref, location.origin);
  } catch {
    url = null;
  }
  const title = (entry.innerText || link?.getAttribute("title") || "").replace(/\s+/g, " ").trim().toLowerCase();
  return { url, title };
}

function guideId(entry) {
  if (entry.matches("ytd-guide-collapsible-entry-renderer")) return "showMore";
  const { url, title } = entryInfo(entry);
  for (const rule of GUIDE_RULES) {
    if (rule.titles?.includes(title)) return rule.id;
    if (!url) continue;
    if (rule.hosts?.includes(url.hostname)) return rule.id;
    if (rule.paths?.includes(url.pathname) && (url.pathname !== "/" || url.hostname === location.hostname)) return rule.id;
    if (rule.channels?.some((id) => url.pathname.includes(id))) return rule.id;
    if (rule.lists?.includes(url.searchParams.get("list"))) return rule.id;
  }
  return "";
}

const GUIDE_FLAG = {
  home: "hideGuideHome",
  shorts: "hideGuideShorts",
  subscriptions: "hideGuideSubscriptions",
  music: "hideGuideMusic",
  kids: "hideGuideKids",
  you: "hideGuideYou",
  channel: "hideGuideChannel",
  history: "hideGuideHistory",
  playlists: "hideGuidePlaylists",
  yourVideos: "hideGuideYourVideos",
  watchLater: "hideGuideWatchLater",
  downloads: "hideGuideDownloads",
  clips: "hideGuideClips",
  liked: "hideGuideLiked",
  courses: "hideGuideCourses",
  exploreMusic: "hideGuideExploreMusic",
  movies: "hideGuideMovies",
  hype: "hideGuideHype",
  live: "hideGuideLive",
  gaming: "hideGuideGaming",
  news: "hideGuideNews",
  sports: "hideGuideSports",
  podcasts: "hideGuidePodcasts",
  playables: "hideGuidePlayables",
  support: "hideGuideSupport",
  reports: "hideGuideReports",
  libraryShowMore: "hideGuideLibraryShowMore",
  exploreShowMore: "hideGuideExploreShowMore",
};

let settingsState = {
  hideShorts: true,
  hideGames: true,
};

function forceHide(element, hidden) {
  if (hidden) {
    element.dataset.ytcForced = "1";
    element.style.setProperty("display", "none", "important");
    return;
  }
  if (element.dataset.ytcForced) {
    element.style.removeProperty("display");
    delete element.dataset.ytcForced;
  }
}

function guideHidden(id) {
  if (!id || !GUIDE_FLAG[id]) return false;
  if (settingsState.hideHomeSection === true && HOME_GUIDE.has(id)) return true;
  if (settingsState.hideSubscriptionsSection === true && (id === "subscriptions" || id === "subscriptionsShowMore")) return true;
  if (settingsState.hideLibrarySection === true && LIBRARY_GUIDE.has(id)) return true;
  if (settingsState.hideExploreSection === true && EXPLORE_GUIDE.has(id)) return true;
  if (settingsState.hideMoreSection === true && MORE_GUIDE.has(id)) return true;
  return settingsState[GUIDE_FLAG[id]] === true;
}

function markGuide() {
  const entries = [
    ...document.querySelectorAll(
      "ytd-guide-renderer ytd-guide-entry-renderer, ytd-guide-renderer ytd-guide-collapsible-entry-renderer, ytd-mini-guide-renderer ytd-mini-guide-entry-renderer"
    ),
  ];
  const rows = entries.map((entry) => ({
    entry,
    id: guideId(entry),
    section: entry.closest("ytd-guide-section-renderer"),
  }));
  const subscriptionSections = new Set(
    [...new Set(rows.map((row) => row.section).filter(Boolean))].filter((section) => isSubscriptionSection(section, rows))
  );
  const librarySections = new Set(
    rows.filter((row) => row.section && LIBRARY_GUIDE.has(row.id)).map((row) => row.section)
  );
  const exploreSections = new Set(
    rows.filter((row) => row.section && EXPLORE_GUIDE.has(row.id)).map((row) => row.section)
  );

  for (const row of rows) {
    let id = row.id;
    if (id === "showMore" && subscriptionSections.has(row.section)) id = "subscriptionsShowMore";
    else if (id === "showMore" && librarySections.has(row.section)) id = "libraryShowMore";
    else if (id === "showMore" && exploreSections.has(row.section)) id = "exploreShowMore";
    else if (id === "showMore") id = "";
    row.finalId = id;
    if (id) row.entry.dataset.ytcGuide = id;
    else delete row.entry.dataset.ytcGuide;
    forceHide(row.entry, guideHidden(id));
  }

  const sections = new Set(rows.map((row) => row.section).filter(Boolean));
  for (const section of sections) {
    const inSection = rows.filter((row) => row.section === section);
    const allHidden = inSection.length > 0 && inSection.every((row) => row.finalId && guideHidden(row.finalId));
    const hideSubscriptionBlock = subscriptionSections.has(section) && settingsState.hideSubscriptionsSection === true;
    forceHide(section, hideSubscriptionBlock || allHidden);
    if (!hideSubscriptionBlock) syncSubscriptionExpansion(section, subscriptionSections.has(section));
  }
}

function isSubscriptionSection(section, rows) {
  const ids = rows.filter((row) => row.section === section).map((row) => row.id);
  if (ids.includes("home") || ids.includes("shorts")) return false;
  const headerText = [...section.querySelectorAll("#header, #guide-section-title")]
    .map((header) => (header.innerText || "").replace(/\s+/g, " ").trim().toLowerCase())
    .join(" ");
  if (headerText === "subskrypcje" || headerText === "subscriptions" || headerText.startsWith("subskrypcje ") || headerText.startsWith("subscriptions ")) {
    return true;
  }
  return ids.includes("subscriptions") && !ids.some((id) => LIBRARY_GUIDE.has(id) || EXPLORE_GUIDE.has(id) || MORE_GUIDE.has(id));
}

function isShown(element) {
  if (!element || element.hidden || element.closest("[hidden]")) return false;
  const style = getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
}

function visibleGuideLabel(entry) {
  if (!isShown(entry)) return "";
  return (entry.innerText || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function setExpanded(collapsible, expand) {
  if (typeof collapsible.set === "function") collapsible.set("expanded", expand);
  else collapsible.expanded = expand;
}

function syncSubscriptionExpansion(section, isSubscriptions) {
  if (!isSubscriptions || settingsState.hideSubscriptionsSection === true || section.dataset.ytcToggleLock === "1") return;
  const expand = settingsState.expandSubscriptions === true;
  const collapsibles = [...section.querySelectorAll("ytd-guide-collapsible-entry-renderer")];
  const controllable = collapsibles.filter((collapsible) => "expanded" in collapsible || typeof collapsible.set === "function");
  if (controllable.length) {
    for (const collapsible of controllable) {
      if (Boolean(collapsible.expanded) === expand) continue;
      section.dataset.ytcToggleLock = "1";
      setTimeout(() => delete section.dataset.ytcToggleLock, 500);
      setExpanded(collapsible, expand);
    }
    return;
  }

  const buttons = [...section.querySelectorAll("ytd-guide-entry-renderer")]
    .map((entry) => ({ entry, text: visibleGuideLabel(entry) }))
    .filter((item) => ["pokaż więcej", "show more", "pokaż mniej", "show less"].includes(item.text));
  const showMore = buttons.find((item) => item.text === "pokaż więcej" || item.text === "show more");
  const showLess = buttons.find((item) => item.text === "pokaż mniej" || item.text === "show less");
  const button = expand ? showMore : showLess;
  if (!button) return;
  section.dataset.ytcToggleLock = "1";
  setTimeout(() => delete section.dataset.ytcToggleLock, 500);
  (button.entry.querySelector("a#endpoint, a, tp-yt-paper-item") || button.entry).click();
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

  markGuide();
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
    try {
      fixAllGrids();
      hideWidgets();
    } finally {
      applying = false;
    }
  });
}

const observer = new MutationObserver(() => {
  refresh();
});

const REDIRECTS = {
  subscriptions: "/feed/subscriptions",
  history: "/feed/history",
  library: "/feed/library",
};

const FLAGS = {
  hideSuggestions: "ytc-hide-suggestions",
  hideMixes: "ytc-hide-mixes",
  hideAds: "ytc-hide-ads",
  hideShorts: "ytc-hide-shorts",
  hideGames: "ytc-hide-games",
  hideHomeSection: "ytc-hide-home-section",
  hideLibrarySection: "ytc-hide-library-section",
  hideGuideHome: "ytc-hide-guide-home",
  hideGuideSubscriptions: "ytc-hide-guide-subscriptions",
  hideGuideMusic: "ytc-hide-guide-music",
  hideGuideKids: "ytc-hide-guide-kids",
  hideGuideYou: "ytc-hide-guide-you",
  hideGuideChannel: "ytc-hide-guide-channel",
  hideGuideHistory: "ytc-hide-guide-history",
  hideGuidePlaylists: "ytc-hide-guide-playlists",
  hideGuideYourVideos: "ytc-hide-guide-your-videos",
  hideGuideWatchLater: "ytc-hide-guide-watch-later",
  hideGuideDownloads: "ytc-hide-guide-downloads",
  hideGuideClips: "ytc-hide-guide-clips",
  hideGuideLiked: "ytc-hide-guide-liked",
  hideGuideShowMore: "ytc-hide-guide-show-more",
};

const DEFAULTS = {
  columns: DEFAULT_COLUMNS,
  homeRedirect: "home",
  hideShorts: true,
  hideGames: true,
};

function clampColumns(value) {
  const count = Number(value);
  if (!Number.isInteger(count) || count < MIN_COLUMNS || count > MAX_COLUMNS) return DEFAULT_COLUMNS;
  return count;
}

function maybeRedirect(target) {
  const dest = REDIRECTS[target];
  if (!dest || location.pathname !== "/") return;
  location.replace(dest);
}

function applySettings(settings) {
  settingsState = settings;
  columns = clampColumns(settings.columns);
  document.documentElement.style.setProperty("--ytc-columns", String(columns));
  for (const [key, className] of Object.entries(FLAGS)) {
    const enabled = key === "hideShorts" || key === "hideGames" ? settings[key] !== false : settings[key] === true;
    document.documentElement.classList.toggle(className, enabled);
  }
  maybeRedirect(settings.homeRedirect);
  refresh();
}

chrome.storage.local.get(null, (stored) => applySettings({ ...DEFAULTS, ...stored }));
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  chrome.storage.local.get(null, (stored) => applySettings({ ...DEFAULTS, ...stored }));
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
