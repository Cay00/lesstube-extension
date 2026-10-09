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
    const wantedStillCollapsed = librarySections.has(section) && [...LIBRARY_GUIDE].some((id) => {
      return id !== "libraryShowMore" && !guideHidden(id) && !inSection.some((row) => row.finalId === id);
    });
    const allHidden = !wantedStillCollapsed && inSection.length > 0 && inSection.every((row) => row.finalId && guideHidden(row.finalId));
    const hideSubscriptionBlock = subscriptionSections.has(section) && settingsState.hideSubscriptionsSection === true;
    forceHide(section, hideSubscriptionBlock || allHidden);
    if (!hideSubscriptionBlock) syncSubscriptionExpansion(section, subscriptionSections.has(section));
    if (librarySections.has(section)) revealCollapsedLibraryItems(section, inSection);
  }
  hideGuideFooter();
}

function hideGuideFooter() {
  const hide = settingsState.hideGuideFooter === true || settingsState.hideMoreSection === true;
  const footers = [];
  for (const guide of document.querySelectorAll("ytd-guide-renderer")) {
    const root = guide.shadowRoot || guide;
    footers.push(...root.querySelectorAll("#footer"));
  }
  for (const footer of footers) forceHide(footer, hide);
}

function entryLabel(entry) {
  return (entry.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function revealCollapsedLibraryItems(section, rows) {
  if (settingsState.hideLibrarySection === true || section.dataset.ytcLibraryLock === "1") return;
  const shownIds = new Set(rows.filter((row) => row.finalId && isShown(row.entry)).map((row) => row.finalId));
  const missing = [...LIBRARY_GUIDE].some((id) => id !== "libraryShowMore" && !guideHidden(id) && !shownIds.has(id));
  if (!missing) return;

  for (const row of rows) {
    if (!row.finalId || row.finalId === "libraryShowMore" || guideHidden(row.finalId)) continue;
    let node = row.entry;
    while (node && node !== section) {
      if (node.hasAttribute("hidden")) node.removeAttribute("hidden");
      node = node.parentElement;
    }
    forceHide(row.entry, false);
  }

  for (const collapsible of section.querySelectorAll("ytd-guide-collapsible-entry-renderer")) {
    setExpanded(collapsible, true);
    collapsible.querySelectorAll("#expanded, #expandable-items").forEach((element) => element.removeAttribute("hidden"));
  }

  const showMore = [...section.querySelectorAll("ytd-guide-entry-renderer")].find((entry) => {
    const text = entryLabel(entry);
    return text === "pokaż więcej" || text === "show more";
  });
  if (!showMore) return;
  section.dataset.ytcLibraryLock = "1";
  setTimeout(() => delete section.dataset.ytcLibraryLock, 500);
  const restoreHide = guideHidden("libraryShowMore");
  if (restoreHide) forceHide(showMore, false);
  (showMore.querySelector("a#endpoint, a, tp-yt-paper-item") || showMore).click();
  if (restoreHide) forceHide(showMore, true);
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

const VIEWS_RE = /\b(wyświetleń|wyświetlenia|wyświetlenie|views)\b/i;
const DATE_RE = /(\btemu\b|\bago\b|premier|opublikowan|streamed|emisj)/i;
const LICENSE_RE = /\b(licencja|license|kategoria|category|lokalizacja|location|creative commons)\b/i;
const FUND_RE = /zbiórk|fundraiser|donate|darowizn/i;
const MORE_CHANNEL_RE = /więcej z tego kanału|more videos|more from this channel|from this channel/i;
const ACTION_RULES = [
  ["subscribe", /^(subskrybuj|subscribe|subskrybujesz|subscribed)$/i],
  ["join", /^(dołącz|join)$/i],
  ["share", /^(udostępnij|share)$/i],
  ["download", /^(pobierz|download)$/i],
  ["save", /^(zapisz|save)$/i],
  ["clip", /^(klip|clip)$/i],
  ["thanks", /super thanks|podziękuj|thanks/i],
  ["notify", /powiadom|notification/i],
  ["offers", /^(towary|bilety|oferty|merch|tickets|offers)$/i],
];

const behaviorLock = { autoplay: 0, theater: 0, expand: 0 };

function onWatchPage() {
  return location.pathname === "/watch";
}

function tagPart(element, part) {
  if (!element || element.dataset.ytcPart === part) return;
  element.dataset.ytcPart = part;
}

function labelOf(element) {
  return (
    element.getAttribute("aria-label") ||
    element.getAttribute("title") ||
    element.innerText ||
    ""
  ).replace(/\s+/g, " ").trim();
}

function tagWatchText() {
  const root = document.querySelector("ytd-watch-metadata");
  if (!root) return;
  const nodes = root.querySelectorAll(
    "#view-count, #date, #info, #info-strings, yt-formatted-string, span, ytd-metadata-row-renderer, ytd-rich-metadata-renderer, #super-title"
  );
  for (const node of nodes) {
    if (node.closest("ytd-comment-renderer, ytd-comments")) continue;
    const text = (node.innerText || "").replace(/\s+/g, " ").trim();
    if (!text || text.length > 180) {
      continue;
    }
    const views = VIEWS_RE.test(text);
    const date = DATE_RE.test(text) || /^\d{1,2}\s+\p{L}+\.?\s+\d{4}$/u.test(text);
    if (views && date) tagPart(node, "views-date");
    else if (views && text.length < 80) tagPart(node, "views");
    else if (date && text.length < 80) tagPart(node, "date");
    else if (LICENSE_RE.test(text)) tagPart(node, "license");
  }
}

function tagWatchActions() {
  const scopes = document.querySelectorAll(
    "ytd-watch-metadata #actions, ytd-watch-metadata #owner, ytd-watch-metadata #top-row, ytd-watch-metadata #menu, .html5-video-player"
  );
  for (const scope of scopes) {
    for (const button of scope.querySelectorAll("button, yt-button-shape, a, tp-yt-paper-button")) {
      const label = labelOf(button);
      if (!label) continue;
      if (MORE_CHANNEL_RE.test(label)) {
        tagPart(button, "more-channel");
        continue;
      }
      if (FUND_RE.test(label) && button.closest("ytd-video-owner-renderer, #owner, #top-row")) {
        tagPart(button, "fundraiser-badge");
        continue;
      }
      const rule = ACTION_RULES.find(([, pattern]) => pattern.test(label));
      if (!rule) continue;
      const target = button.closest("yt-button-view-model, ytd-button-renderer, ytd-menu-service-item-renderer") || button;
      tagPart(target, rule[0]);
    }
  }
}

function clickOnce(element, key) {
  if (!element || Date.now() - behaviorLock[key] < 1200) return;
  behaviorLock[key] = Date.now();
  element.click();
}

function playerPopupOpen() {
  for (const popup of document.querySelectorAll(".html5-video-player .ytp-popup")) {
    if (popup.getAttribute("aria-hidden") === "true") continue;
    const style = getComputedStyle(popup);
    if (style.display !== "none" && style.visibility !== "hidden") return true;
  }
  return false;
}

function applyWatchBehaviors() {
  if (!onWatchPage()) return;
  tagWatchText();
  tagWatchActions();
  if (playerPopupOpen()) return;
  if (settingsState.autoTheater === true) {
    const flexy = document.querySelector("ytd-watch-flexy");
    const button = document.querySelector(".ytp-size-button");
    if (flexy && button && !flexy.hasAttribute("theater") && !flexy.hasAttribute("fullscreen")) {
      clickOnce(button, "theater");
    }
  }
  if (settingsState.expandDescription === true && settingsState.hideDescription !== true) {
    const expander = document.querySelector("ytd-watch-metadata ytd-text-inline-expander, ytd-watch-metadata ytd-expander");
    const button = expander?.querySelector("#expand, button#expand, tp-yt-paper-button#expand");
    if (button && isShown(button)) clickOnce(button, "expand");
  }
}

const UPLOAD_RE = /^(prześlij|przeslij|utwórz|utworz|create|upload)$/i;

function forEachDeep(root, visit) {
  if (!root?.querySelectorAll) return;
  for (const node of root.querySelectorAll("*")) {
    visit(node);
    if (node.shadowRoot) forEachDeep(node.shadowRoot, visit);
  }
}

function uploadHost(node) {
  let current = node;
  while (current) {
    const root = current.getRootNode();
    if (!root || root === document) {
      return current.closest("ytd-topbar-menu-button-renderer, ytd-button-renderer, yt-button-view-model") || current;
    }
    current = root.host;
  }
  return node;
}

const endscreenTargets = new Set();

function classNameOf(node) {
  const value = node.className;
  if (typeof value === "string") return value;
  return value?.baseVal || "";
}

function hideEndscreen() {
  if (!onWatchPage()) return;
  const hide = settingsState.hideEndscreen === true;
  const player = document.querySelector("#movie_player, ytd-player");
  const found = new Set();
  if (player) {
    forEachDeep(player, (node) => {
      const className = classNameOf(node);
      if (!className || !/endscreen|videowall-still|videowall-endscreen/i.test(className)) return;
      if (/html5-video-player/.test(className)) return;
      found.add(node);
      endscreenTargets.add(node);
      forceHide(node, hide);
    });
  }
  for (const element of endscreenTargets) {
    if (found.has(element)) continue;
    if (hide && element.isConnected) continue;
    forceHide(element, false);
    endscreenTargets.delete(element);
  }
}

const TRANSCRIPT_RE = /transkrypc|transcript/i;
const transcriptTargets = new Set();

function transcriptHost(node) {
  let current = node;
  while (current) {
    const root = current.getRootNode();
    if (!root || root === document) {
      return current.closest(
        "ytd-video-description-transcript-section-renderer, ytd-transcript-renderer, ytd-transcript-search-panel-renderer, ytd-button-renderer, yt-button-view-model, button-view-model, button"
      ) || current;
    }
    current = root.host;
  }
  return node;
}

function hideTranscript() {
  if (!onWatchPage()) return;
  const hide = settingsState.hideTranscript === true;
  const root = document.querySelector("ytd-watch-flexy");
  const found = new Set();
  if (root) {
    forEachDeep(root, (node) => {
      const targetId = node.getAttribute("target-id") || "";
      if (/transcript/i.test(targetId)) {
        found.add(node);
        transcriptTargets.add(node);
        forceHide(node, hide);
        return;
      }
      const tag = node.tagName;
      if (
        tag === "YTD-VIDEO-DESCRIPTION-TRANSCRIPT-SECTION-RENDERER" ||
        tag === "YTD-TRANSCRIPT-RENDERER" ||
        tag === "YTD-TRANSCRIPT-SEARCH-PANEL-RENDERER"
      ) {
        found.add(node);
        transcriptTargets.add(node);
        forceHide(node, hide);
        return;
      }
      const label = (node.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
      const text = node.childElementCount === 0 ? (node.textContent || "").replace(/\s+/g, " ").trim() : "";
      if ((!TRANSCRIPT_RE.test(label) && !TRANSCRIPT_RE.test(text)) || text.length > 48) return;
      const host = transcriptHost(node);
      if (!host || host.closest("ytd-comments, ytd-comment-renderer, ytd-comment-thread-renderer")) return;
      host.dataset.ytcPart = "transcript";
      found.add(host);
      transcriptTargets.add(host);
      forceHide(host, hide);
    });
  }
  for (const element of transcriptTargets) {
    if (found.has(element)) continue;
    if (hide && element.isConnected) continue;
    forceHide(element, false);
    if (element.dataset.ytcPart === "transcript") delete element.dataset.ytcPart;
    transcriptTargets.delete(element);
  }
}

const uploadTargets = new Set();

function hideUploadButton() {
  const masthead = document.querySelector("ytd-masthead");
  const hide = settingsState.hideMastheadUpload === true || settingsState.hideMasthead === true;
  const found = new Set();
  if (masthead) {
    forEachDeep(masthead, (node) => {
      if (node.id === "avatar-btn") return;
      const label = (node.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
      const text = node.childElementCount === 0 ? (node.textContent || "").replace(/\s+/g, " ").trim() : "";
      if (!UPLOAD_RE.test(label) && !UPLOAD_RE.test(text)) return;
      const host = uploadHost(node);
      if (!host || host.id === "avatar-btn" || host.closest?.("#avatar-btn")) return;
      host.dataset.ytcUpload = "1";
      found.add(host);
      uploadTargets.add(host);
      forceHide(host, hide);
    });
  }
  for (const element of uploadTargets) {
    if (found.has(element)) continue;
    if (hide && element.isConnected) continue;
    forceHide(element, false);
    delete element.dataset.ytcUpload;
    uploadTargets.delete(element);
  }
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
  hideUploadButton();
  hideTranscript();
  hideEndscreen();
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
      applyWatchBehaviors();
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
  hideSecondary: "ytc-hide-secondary",
  hideRelated: "ytc-hide-related",
  hideLiveChat: "ytc-hide-live-chat",
  hideWatchPlaylist: "ytc-hide-watch-playlist",
  hideFundraiser: "ytc-hide-fundraiser",
  hideAutoplayCard: "ytc-hide-autoplay-card",
  hideRelatedAds: "ytc-hide-related-ads",
  hideRelatedShorts: "ytc-hide-related-shorts",
  hideRelatedChips: "ytc-hide-related-chips",
  hideEndscreen: "ytc-hide-endscreen",
  hideEndCards: "ytc-hide-end-cards",
  hideInfoCards: "ytc-hide-info-cards",
  hidePlayerTime: "ytc-hide-player-time",
  hideHeatmap: "ytc-hide-heatmap",
  hidePaidPromotion: "ytc-hide-paid-promotion",
  hideCaptions: "ytc-hide-captions",
  hideAnnotations: "ytc-hide-annotations",
  hideProgressBar: "ytc-hide-progress-bar",
  hidePlayerTitle: "ytc-hide-player-title",
  hidePlayButton: "ytc-hide-play-button",
  hideReplayButton: "ytc-hide-replay-button",
  hideNextButton: "ytc-hide-next-button",
  hidePrevButton: "ytc-hide-prev-button",
  hideVolume: "ytc-hide-volume",
  hideChapters: "ytc-hide-chapters",
  hideAutonavButton: "ytc-hide-autonav-button",
  hideSubtitlesButton: "ytc-hide-subtitles-button",
  hideSettingsButton: "ytc-hide-settings-button",
  hideMiniplayer: "ytc-hide-miniplayer",
  hideTheaterButton: "ytc-hide-theater-button",
  hideFullscreen: "ytc-hide-fullscreen",
  hideAirplay: "ytc-hide-airplay",
  hideMoreFromChannel: "ytc-hide-more-from-channel",
  hideVideoTitle: "ytc-hide-video-title",
  hideChannelAvatar: "ytc-hide-channel-avatar",
  hideChannelName: "ytc-hide-channel-name",
  hideSubCount: "ytc-hide-sub-count",
  hideFundraiserBadge: "ytc-hide-fundraiser-badge",
  hideVerifiedBadge: "ytc-hide-verified-badge",
  hideLicenseRow: "ytc-hide-license-row",
  hideOffers: "ytc-hide-offers",
  hideSubscribe: "ytc-hide-subscribe",
  hideJoin: "ytc-hide-join",
  hideNotifyBell: "ytc-hide-notify-bell",
  hideLikeBar: "ytc-hide-like-bar",
  hideShare: "ytc-hide-share",
  hideDownload: "ytc-hide-download",
  hideSave: "ytc-hide-save",
  hideClip: "ytc-hide-clip",
  hideThanks: "ytc-hide-thanks",
  hideMoreActions: "ytc-hide-more-actions",
  hideDescription: "ytc-hide-description",
  hideViewCount: "ytc-hide-view-count",
  hidePublishDate: "ytc-hide-publish-date",
  hideHashtags: "ytc-hide-hashtags",
  hideChannelInfo: "ytc-hide-channel-info",
  hideDescriptionChapters: "ytc-hide-description-chapters",
  hideTranscript: "ytc-hide-transcript",
  hideComments: "ytc-hide-comments",
  hideCommentBox: "ytc-hide-comment-box",
  hideCommentAvatars: "ytc-hide-comment-avatars",
  hideCommentLikes: "ytc-hide-comment-likes",
  hideCommentReplies: "ytc-hide-comment-replies",
  hideCommentHearts: "ytc-hide-comment-hearts",
  hideCommentBadges: "ytc-hide-comment-badges",
  hideCommentPinned: "ytc-hide-comment-pinned",
  hideCommentSort: "ytc-hide-comment-sort",
  hideCommentHeader: "ytc-hide-comment-header",
  hideCommentTime: "ytc-hide-comment-time",
  hideMasthead: "ytc-hide-masthead",
  hideMastheadMenu: "ytc-hide-masthead-menu",
  hideMastheadLogo: "ytc-hide-masthead-logo",
  hideMastheadSearch: "ytc-hide-masthead-search",
  hideMastheadMic: "ytc-hide-masthead-mic",
  hideMastheadUpload: "ytc-hide-masthead-upload",
  hideMastheadNotifications: "ytc-hide-masthead-notifications",
  hideMastheadAvatar: "ytc-hide-masthead-avatar",
  hideSearchSuggestions: "ytc-hide-search-suggestions",
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
