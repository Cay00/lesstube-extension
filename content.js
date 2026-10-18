/*
 * LessTube – content script.
 * Most features are pure CSS generated from shared.js. This file handles what
 * CSS cannot do: localized labels, shadow DOM, collapsible guide sections,
 * redirects, autoplay / theater behaviour and the element picker.
 */
(() => {
  "use strict";

  const Y = globalThis.YTC;
  // Everything that depends on YouTube's display language (button labels, "2 days ago" ...) lives in labels.js.
  const { VIEWS_RE, DATE_RE, ABS_DATE_RE, LICENSE_RE, FUND_RE, MORE_CHANNEL_RE, ACTION_RULES, UPLOAD_RE, TRANSCRIPT_RE, SHOW_MORE, SHOW_LESS } =
    globalThis.YTC_LABELS;
  const root = document.documentElement;

  let S = Y.normalize({}); // saved settings
  let E = S; // effective settings (all off while paused)
  let cssKey = null; // which toggles the generated stylesheet currently covers
  let full = true; // run every module once (after settings change / navigation)
  let storageLoaded = false;
  let scheduled = false;

  const squish = (text) => (text || "").replace(/\s+/g, " ").trim();

  /* ------------------------------------------------------------ styles */

  const styleEl = document.createElement("style");
  styleEl.id = "ytc-style";
  const customEl = document.createElement("style");
  customEl.id = "ytc-custom";
  root.append(styleEl, customEl);

  function paint(settings) {
    S = Y.normalize(settings);
    E = S.enabled ? S : Y.allOff();
    // Stylesheet only holds rules of the switched-on toggles; rebuilt when that set changes.
    const on = Y.TOGGLES.filter((item) => E[item.key] === true).map((item) => item.key);
    const key = on.join();
    if (key !== cssKey) {
      cssKey = key;
      styleEl.textContent = Y.buildCss(E);
    }
    for (const item of Y.TOGGLES) root.classList.toggle(Y.cls(item.key), E[item.key] === true);
    markScreen();
    root.classList.toggle("ytc-columns", E.columns > 0);
    root.style.setProperty("--ytc-columns", String(E.columns > 0 ? E.columns : 4));
    customEl.textContent = S.enabled ? S.customHide.map((s) => s + "{display:none!important}").join("\n") : "";
    full = true;
    schedule();
  }

  // Defaults first, so Shorts/Playables never flash before storage answers.
  paint({});

  /* ---------------------------------------------------------- redirects */

  function maybeRedirect(fromNavigation) {
    if (!S.enabled) return;
    const target = Y.redirectTarget(location, S);
    if (!target) return;
    // Home replacement is the landing page only. Later visits (logo, guide, back) stay.
    const homeTarget = Y.REDIRECTS[S.homeRedirect];
    if (fromNavigation && homeTarget && target === homeTarget) return;
    location.replace(target);
  }

  /* --------------------------------------------------------- grid layout */

  function gridVars() {
    const count = String(E.columns);
    return {
      "--ytd-rich-grid-items-per-row": count,
      "--ytd-rich-grid-posts-per-row": count,
      "--ytd-rich-grid-slim-items-per-row": count,
      "--ytd-rich-grid-game-cards-per-row": count,
      "--ytd-rich-grid-item-margin": "0px",
      "--ytd-rich-grid-item-min-width": "0px",
    };
  }

  const BOX_PROPS = ["width", "max-width", "min-width", "margin", "margin-left", "margin-right", "flex-basis"];

  function clearInlineBox(element) {
    if (!element.hasAttribute("style")) return; // nothing inline, nothing to clear
    for (const prop of BOX_PROPS) element.style.removeProperty(prop);
  }

  function fixGrid(grid) {
    for (const [name, value] of Object.entries(gridVars())) {
      if (grid.style.getPropertyValue(name) !== value || grid.style.getPropertyPriority(name) !== "important") {
        grid.style.setProperty(name, value, "important");
      }
    }
    const contents = grid.querySelector(":scope > #contents");
    if (!contents) return;
    clearInlineBox(contents);
    for (const child of contents.children) {
      if (child.closest("ytd-rich-shelf-renderer") === child) continue;
      clearInlineBox(child);
    }
  }

  function resetGrid(grid) {
    for (const name of Object.keys(gridVars())) grid.style.removeProperty(name);
  }

  function updateGrids() {
    if (E.columns <= 0 && !full) return;
    const grids = document.querySelectorAll("ytd-rich-grid-renderer");
    if (E.columns > 0) grids.forEach(fixGrid);
    else grids.forEach(resetGrid);
  }

  /* ------------------------------------------------- Shorts / Playables */

  const SHORTS_TITLE = /^(shorts|shorty)$/i;
  const GAMES_TITLE = /^(pokój gier|pokoj gier|playables|youtube playables)$/i;

  function shelfTitle(section) {
    for (const title of section.querySelectorAll("#title")) {
      if (title.closest("ytd-rich-item-renderer, ytd-rich-grid-media, ytd-reel-item-renderer")) continue;
      const text = squish(title.textContent);
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
    if (SHORTS_TITLE.test(title) || hrefs.some((h) => h === "/shorts" || h.startsWith("/shorts?"))) return "shorts";
    if (GAMES_TITLE.test(title) || hrefs.some((h) => h === "/playables" || h.startsWith("/playables"))) return "games";
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

  function markWidgets() {
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
      const title = squish(link?.getAttribute("title") || link?.textContent);
      markWidget(entry, widgetKind(title, [href]));
    });
  }

  /* --------------------------------------- already watched (home + watch) */

  const WATCHED_ROOTS = 'ytd-browse[page-subtype="home"], ytd-watch-flexy #secondary';
  const WATCHED_CARDS = "ytd-rich-item-renderer, ytd-compact-video-renderer, yt-lockup-view-model";
  const WATCHED_BARS = "#progress, .ytThumbnailOverlayProgressBarHostWatchedProgressBar, .ytThumbnailOverlayProgressBarHostWatchedProgressBarSegment";
  const WATCHED_BADGES = "ytd-thumbnail-overlay-playback-status-renderer, .yt-badge-shape__text, .badge-shape-wiz__text";
  const WATCHED_WORD = /^(watched|obejrzane|angesehen|visto|vu|assistido|просмотрено|視聴済み|已观看|已觀看|시청함|देखा गया|تمت المشاهدة|ditonton)$/i;

  function watchedPercent(card) {
    let max = 0;
    for (const bar of card.querySelectorAll(WATCHED_BARS)) {
      const match = /width:\s*([\d.]+)\s*%/.exec(bar.getAttribute("style") || "");
      if (match) max = Math.max(max, Number(match[1]));
    }
    if (max >= 90) return max;
    for (const badge of card.querySelectorAll(WATCHED_BADGES)) {
      if (WATCHED_WORD.test(squish(badge.textContent))) return 100;
    }
    return max;
  }

  function markWatched() {
    document.querySelectorAll('[data-ytc-hide="watched"]').forEach((el) => {
      delete el.dataset.ytcHide;
    });
    if (E.hideWatched !== true) return;
    document.querySelectorAll(WATCHED_ROOTS).forEach((root) => {
      root.querySelectorAll(WATCHED_CARDS).forEach((card) => {
        if (card.parentElement?.closest(WATCHED_CARDS)) return;
        if (watchedPercent(card) >= 90) card.dataset.ytcHide = "watched";
      });
    });
  }

  /* --------------------------------------------------------------- guide */

  const GUIDE_RULES = [
    { id: "home", titles: ["strona główna", "home", "startseite", "inicio", "accueil", "главная"], paths: ["/"] },
    { id: "shorts", titles: ["shorts", "shorty"], paths: ["/shorts"] },
    { id: "subscriptions", titles: ["subskrypcje", "subscriptions", "abos", "suscripciones", "abonnements", "iscrizioni", "inscrições", "подписки"], paths: ["/feed/subscriptions"] },
    { id: "you", titles: ["ty", "you", "biblioteka", "library", "du", "tú", "vous", "voi", "você", "вы"], paths: ["/feed/you", "/feed/library"] },
    { id: "channel", titles: ["twój kanał", "twoj kanal", "your channel"] },
    { id: "history", titles: ["historia", "history", "verlauf", "historial", "historique", "cronologia", "histórico", "история"], paths: ["/feed/history"] },
    { id: "playlists", titles: ["playlisty", "playlists", "wiedergabelisten", "listas de reproducción", "listes de lecture", "playlist", "плейлисты"], paths: ["/feed/playlists"] },
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
    { id: "premium", titles: ["youtube premium"], paths: ["/premium", "/paid_memberships"] },
    { id: "music", titles: ["youtube music"], hosts: ["music.youtube.com"] },
    { id: "kids", titles: ["youtube kids", "dzieci", "youtube dzieci"], hosts: ["www.youtubekids.com", "youtubekids.com"] },
    { id: "reports", titles: ["historia zgłoszeń", "historia zgloszen", "report history"], paths: ["/reporthistory"] },
    { id: "showMore", titles: ["pokaż więcej", "pokaz wiecej", "pokaż mniej", "pokaz mniej", "show more", "show less"] },
  ];

  /*
   * Guide entry id <-> setting key: "watchLater" <-> "hideGuideWatchLater".
   * Which entries belong to which section (and its master switch) is read from
   * the schema in shared.js, so adding a guide toggle there is enough.
   */
  const guideFlag = (id) => "hideGuide" + id[0].toUpperCase() + id.slice(1);
  const guideIdsOf = (master) =>
    new Set(Y.GROUPS[master].filter((key) => key.startsWith("hideGuide")).map((key) => key[9].toLowerCase() + key.slice(10)));
  const LIBRARY_GUIDE = guideIdsOf("hideLibrarySection");
  const EXPLORE_GUIDE = guideIdsOf("hideExploreSection");
  const MORE_GUIDE = guideIdsOf("hideMoreSection");

  const GUIDE_KEYS = Y.TOGGLES.filter(
    (i) => Y.ITEM_PANEL[i.key] === "guide" && i.key !== "hideSidebar" && i.key !== "hideMiniGuide"
  ).map((i) => i.key);

  function entryInfo(entry) {
    const link = entry.querySelector("a[href]");
    const rawHref = link?.getAttribute("href") || "";
    let url = null;
    try {
      if (rawHref) url = new URL(rawHref, location.origin);
    } catch {
      url = null;
    }
    const title = squish(entry.innerText || link?.getAttribute("title")).toLowerCase();
    return { url, title };
  }

  const CHANNEL_PATH = /^\/(?:@|channel\/|user\/|c\/)/;

  function guideId(entry) {
    // The collapsible block and its expander / collapser entries have fixed ids, whatever the language.
    if (entry.matches("ytd-guide-collapsible-entry-renderer, #expander-item, #collapser-item")) return "showMore";
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
    const flag = id && guideFlag(id);
    if (!flag || !(flag in E)) return false; // not a toggle (e.g. a plain "show more")
    return E[flag] === true || E[Y.MASTER_OF[flag]] === true;
  }

  function isShown(element) {
    if (!element || element.hidden || element.closest("[hidden]")) return false;
    const style = getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
  }

  function entryLabel(entry) {
    return squish(entry.textContent).toLowerCase();
  }

  function visibleGuideLabel(entry) {
    return isShown(entry) ? squish(entry.innerText).toLowerCase() : "";
  }

  function isSubscriptionSection(section, rows) {
    const ids = rows.filter((row) => row.section === section).map((row) => row.id);
    if (ids.includes("home") || ids.includes("shorts")) return false;
    const headerText = [...section.querySelectorAll("#header, #guide-section-title")]
      .map((header) => squish(header.innerText).toLowerCase())
      .join(" ");
    if (/^(subskrypcje|subscriptions)( |$)/.test(headerText)) return true;
    return ids.includes("subscriptions") && !ids.some((id) => LIBRARY_GUIDE.has(id) || EXPLORE_GUIDE.has(id) || MORE_GUIDE.has(id));
  }

  /** The "Show more" / "Show less" entry of a guide section: by its fixed id first, by label (see labels.js) as a fallback. */
  function findShowToggle(section, expand, visibleOnly) {
    const byId = section.querySelector(expand ? "#expander-item" : "#collapser-item");
    if (byId) return !visibleOnly || isShown(byId) ? byId : null;
    const labels = expand ? SHOW_MORE : SHOW_LESS;
    const labelOf = visibleOnly ? visibleGuideLabel : entryLabel;
    return [...section.querySelectorAll("ytd-guide-entry-renderer")].find((entry) => labels.includes(labelOf(entry))) || null;
  }

  /**
   * Expand / collapse guide rows without following their <a id="endpoint"> href.
   * Clicking the anchor navigates (often to /feed/you) and can brick YouTube's SPA
   * until a full reload — logo and sidebar links then all land on that page.
   */
  function clickGuideToggle(entry) {
    const target = entry.querySelector("tp-yt-paper-item, button") || entry;
    target.click();
  }

  function syncSubscriptionExpansion(section, isSubscriptions) {
    if (!isSubscriptions || E.hideSubscriptionsSection === true || section.dataset.ytcToggleLock === "1") return;
    const expand = E.expandSubscriptions === true;
    // Polymer's expanded/set() are invisible from the isolated world, so the only way is clicking the button.
    const button = findShowToggle(section, expand, true);
    if (!button) return;
    section.dataset.ytcToggleLock = "1";
    setTimeout(() => delete section.dataset.ytcToggleLock, 500);
    clickGuideToggle(button);
  }

  function revealCollapsedLibraryItems(section, rows) {
    if (E.hideLibrarySection === true || section.dataset.ytcLibraryLock === "1") return;
    const shownIds = new Set(rows.filter((row) => row.finalId && isShown(row.entry)).map((row) => row.finalId));
    // Only expand when we need a collapsed entry in the DOM to hide it — not on every
    // visit just because YouTube tucked History / Playlists under "Show more".
    const missingToHide = [...LIBRARY_GUIDE].some(
      (id) => id !== "libraryShowMore" && guideHidden(id) && !shownIds.has(id)
    );
    if (!missingToHide) return;

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
      collapsible.querySelectorAll("#expanded, #expandable-items").forEach((element) => element.removeAttribute("hidden"));
    }
    const showMore = findShowToggle(section, true, false);
    if (!showMore) return;
    section.dataset.ytcLibraryLock = "1";
    setTimeout(() => delete section.dataset.ytcLibraryLock, 500);
    const restoreHide = guideHidden("libraryShowMore");
    if (restoreHide) forceHide(showMore, false);
    clickGuideToggle(showMore);
    if (restoreHide) forceHide(showMore, true);
  }

  const MORE_HEADING = new Set([
    "more from youtube",
    "więcej z youtube",
    "więcej od youtube",
    "más de youtube",
    "mehr von youtube",
    "plus de youtube",
    "mais do youtube",
    "ещё от youtube",
    "еще от youtube",
    "youtube のその他のサービス",
    "youtube から他のサービス",
    "youtube 的更多内容",
    "youtube的更多内容",
    "youtube의 다른 서비스",
    "youtube से और",
    "المزيد من youtube",
    "lainnya dari youtube",
  ]);

  function hideMoreHeading() {
    const hide = E.hideGuideMoreTitle === true || E.hideMoreSection === true;
    document.querySelectorAll("ytd-guide-renderer #guide-section-title, ytd-guide-renderer ytd-guide-collapsible-section-entry-renderer #title").forEach((node) => {
      const text = squish(node.textContent).toLowerCase();
      if (!MORE_HEADING.has(text)) return;
      const header = node.closest("#header");
      const target = header && !header.querySelector("ytd-guide-entry-renderer") ? header : node;
      forceHide(target, hide);
    });
  }

  function hideGuideFooter() {
    const hide = E.hideGuideFooter === true || E.hideMoreSection === true;
    for (const guide of document.querySelectorAll("ytd-guide-renderer")) {
      const scope = guide.shadowRoot || guide;
      scope.querySelectorAll("#footer").forEach((footer) => forceHide(footer, hide));
    }
  }

  function markGuide() {
    const entries = [
      ...document.querySelectorAll(
        "ytd-guide-renderer ytd-guide-entry-renderer, ytd-guide-renderer ytd-guide-collapsible-entry-renderer, ytd-mini-guide-renderer ytd-mini-guide-entry-renderer"
      ),
    ];
    const rows = entries.map((entry) => ({ entry, id: guideId(entry), section: entry.closest("ytd-guide-section-renderer") }));
    const subscriptionSections = new Set(
      [...new Set(rows.map((row) => row.section).filter(Boolean))].filter((section) => isSubscriptionSection(section, rows))
    );
    const librarySections = new Set(rows.filter((row) => row.section && LIBRARY_GUIDE.has(row.id)).map((row) => row.section));
    const exploreSections = new Set(rows.filter((row) => row.section && EXPLORE_GUIDE.has(row.id)).map((row) => row.section));

    // "Your channel" has neither a fixed URL nor a fixed label: it is the channel link among the library entries.
    for (const row of rows) {
      if (row.id || !librarySections.has(row.section)) continue;
      const { url } = entryInfo(row.entry);
      if (url && url.hostname === location.hostname && CHANNEL_PATH.test(url.pathname)) row.id = "channel";
    }

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
      const wantedStillCollapsed =
        librarySections.has(section) &&
        [...LIBRARY_GUIDE].some((id) => id !== "libraryShowMore" && !guideHidden(id) && !inSection.some((row) => row.finalId === id));
      const allHidden = !wantedStillCollapsed && inSection.length > 0 && inSection.every((row) => row.finalId && guideHidden(row.finalId));
      const hideSubscriptionBlock = subscriptionSections.has(section) && E.hideSubscriptionsSection === true;
      forceHide(section, hideSubscriptionBlock || allHidden);
      if (!hideSubscriptionBlock) syncSubscriptionExpansion(section, subscriptionSections.has(section));
      if (librarySections.has(section)) revealCollapsedLibraryItems(section, inSection);
    }
    hideMoreHeading();
    hideGuideFooter();
  }

  /* ------------------------------------------------------- watch page */

  const ACTION_KEYS = ["hideShare", "hideDownload", "hideClip", "hideThanks", "hideAsk", "hideOffers", "hideSubscribe", "hideJoin", "hideFundraiserBadge", "hideMoreFromChannel"];

  const behaviorLock = { expand: 0 };

  const onWatchPage = () => location.pathname === "/watch";

  function tagPart(element, part) {
    if (!element || element.dataset.ytcPart === part) return;
    element.dataset.ytcPart = part;
  }

  const POPUP_ROOT = "ytd-popup-container, ytd-menu-popup-renderer, yt-sheet-view-model, yt-contextual-sheet-layout, tp-yt-iron-dropdown, tp-yt-paper-dialog";

  function labelOf(element) {
    const aria = element.getAttribute("aria-label") || element.getAttribute("title") || "";
    if (aria) return squish(aria);
    // innerText of an open button includes the menu, which would retag the button and close it.
    if (element.closest(POPUP_ROOT)) return "";
    return squish(element.innerText).slice(0, 80);
  }

  function pageMenuOpen() {
    if (playerPopupOpen()) return true;
    const open = document.querySelectorAll(
      "ytd-menu-popup-renderer, yt-sheet-view-model, yt-contextual-sheet-layout, tp-yt-paper-dialog, tp-yt-iron-dropdown"
    );
    for (const popup of open) {
      if (popup.getAttribute("aria-hidden") === "true" || popup.hasAttribute("hidden")) continue;
      if (isShown(popup)) return true;
    }
    return false;
  }

  // True when a smaller element inside `node` already carries the views or the date.
  function hasMatchingDescendant(node) {
    for (const child of node.querySelectorAll("*")) {
      const text = squish(child.textContent);
      if (text && text.length <= 80 && (VIEWS_RE.test(text) || DATE_RE.test(text))) return true;
    }
    return false;
  }

  function tagWatchText() {
    const metadata = document.querySelector("ytd-watch-metadata");
    if (!metadata) return;
    const nodes = metadata.querySelectorAll(
      "#view-count, #date, #info, #info-strings, yt-formatted-string, span, ytd-metadata-row-renderer, ytd-rich-metadata-renderer, #super-title"
    );
    for (const node of nodes) {
      if (node.closest("ytd-comment-renderer, ytd-comments")) continue;
      // textContent, not innerText: the result must not change once part of the text is hidden.
      const text = squish(node.textContent);
      if (!text || text.length > 180) continue;
      const views = VIEWS_RE.test(text);
      const date = DATE_RE.test(text) || ABS_DATE_RE.test(text);
      if ((views || date) && node.children.length && hasMatchingDescendant(node)) continue;
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
        if (button.closest(POPUP_ROOT)) continue;
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

  function findAutonav() {
    const direct = document.querySelector("#movie_player .ytp-autonav-toggle-button, ytd-player .ytp-autonav-toggle-button");
    if (direct) return direct;
    const player = document.querySelector("#movie_player, ytd-player");
    let found = null;
    if (player) {
      forEachDeep(player, (node) => {
        if (!found && node.classList?.contains("ytp-autonav-toggle-button")) found = node;
      });
    }
    return found;
  }

  function autonavOn(button) {
    const box = button.closest(".ytp-autonav-toggle-button-container") || button;
    const flag = box.getAttribute("aria-checked") ?? button.getAttribute("aria-checked") ?? button.getAttribute("aria-pressed");
    return flag === "true";
  }

  // Trusted clicks on the player bar are the user's choice. Ignore our own .click().
  let autoplayHold = 0;

  function rememberAutoplay(on) {
    if (!S.enabled || S.autoplay === on) return;
    S.autoplay = on;
    E.autoplay = on;
    try {
      chrome.storage.local.set({ autoplay: on });
    } catch (e) {
      /* extension context invalidated */
    }
  }

  function syncAutoplay() {
    if (!storageLoaded || !S.enabled || Date.now() < autoplayHold) return;
    const button = findAutonav();
    if (!button) return;
    if (autonavOn(button) === (S.autoplay === true)) return;
    clickOnce(button, "autoplay");
  }

  document.addEventListener(
    "click",
    (e) => {
      if (!e.isTrusted || !S.enabled) return;
      const hit = e.target?.closest?.(".ytp-autonav-toggle-button, .ytp-autonav-toggle-button-container");
      if (!hit || hit.closest("#movie_player, ytd-player") == null) return;
      autoplayHold = Date.now() + 700;
      setTimeout(() => {
        const button = findAutonav();
        if (button) rememberAutoplay(autonavOn(button));
        autoplayHold = 0;
      }, 60);
    },
    true
  );

  function applyWatchBehaviors() {
    if (!onWatchPage()) return;
    if (full || E.hideViewCount || E.hidePublishDate || E.hideLicenseRow) tagWatchText();
    if (full || ACTION_KEYS.some((k) => E[k])) tagWatchActions();
    syncAutoplay();
    if (playerPopupOpen()) return;

    if (E.expandDescription === true && E.hideDescription !== true) {
      const expander = document.querySelector("ytd-watch-metadata ytd-text-inline-expander, ytd-watch-metadata ytd-expander");
      const button = expander?.querySelector("#expand, button#expand, tp-yt-paper-button#expand");
      if (button && isShown(button)) clickOnce(button, "expand");
    }
  }

  /* ------------------------------------------- shadow-DOM aware scanners */

  /** Un-hide targets that were not found on this pass (unless they should stay hidden and still exist). */
  function releaseMissing(targets, found, hide, onRelease) {
    for (const element of targets) {
      if (found.has(element)) continue;
      if (hide && element.isConnected) continue;
      forceHide(element, false);
      if (onRelease) onRelease(element);
      targets.delete(element);
    }
  }

  function forEachDeep(rootNode, visit) {
    if (!rootNode?.querySelectorAll) return;
    for (const node of rootNode.querySelectorAll("*")) {
      visit(node);
      if (node.shadowRoot) forEachDeep(node.shadowRoot, visit);
    }
  }

  function hostInLightDom(node, closestSelector) {
    let current = node;
    while (current) {
      const rootNode = current.getRootNode();
      if (!rootNode || rootNode === document) return current.closest(closestSelector) || current;
      current = rootNode.host;
    }
    return node;
  }

  const uploadTargets = new Set();

  function hideUploadButton() {
    const masthead = document.querySelector("ytd-masthead");
    const hide = E.hideMastheadUpload === true || E.hideMasthead === true;
    const found = new Set();
    if (masthead) {
      forEachDeep(masthead, (node) => {
        if (node.id === "avatar-btn") return;
        const label = squish(node.getAttribute("aria-label"));
        const text = node.childElementCount === 0 ? squish(node.textContent) : "";
        if (!UPLOAD_RE.test(label) && !UPLOAD_RE.test(text)) return;
        const host = hostInLightDom(node, "ytd-topbar-menu-button-renderer, ytd-button-renderer, yt-button-view-model");
        if (!host || host.id === "avatar-btn" || host.closest?.("#avatar-btn")) return;
        host.dataset.ytcUpload = "1";
        found.add(host);
        uploadTargets.add(host);
        forceHide(host, hide);
      });
    }
    releaseMissing(uploadTargets, found, hide, (element) => delete element.dataset.ytcUpload);
  }

  const transcriptTargets = new Set();

  function hideTranscript() {
    if (!onWatchPage()) return;
    const hide = E.hideTranscript === true;
    const watch = document.querySelector("ytd-watch-flexy");
    const found = new Set();
    if (watch) {
      forEachDeep(watch, (node) => {
        const targetId = node.getAttribute("target-id") || "";
        const tag = node.tagName;
        if (
          /transcript/i.test(targetId) ||
          tag === "YTD-VIDEO-DESCRIPTION-TRANSCRIPT-SECTION-RENDERER" ||
          tag === "YTD-TRANSCRIPT-RENDERER" ||
          tag === "YTD-TRANSCRIPT-SEARCH-PANEL-RENDERER"
        ) {
          found.add(node);
          transcriptTargets.add(node);
          forceHide(node, hide);
          return;
        }
        const label = squish(node.getAttribute("aria-label"));
        const text = node.childElementCount === 0 ? squish(node.textContent) : "";
        if ((!TRANSCRIPT_RE.test(label) && !TRANSCRIPT_RE.test(text)) || text.length > 48) return;
        const host = hostInLightDom(
          node,
          "ytd-video-description-transcript-section-renderer, ytd-transcript-renderer, ytd-transcript-search-panel-renderer, ytd-button-renderer, yt-button-view-model, button-view-model, button"
        );
        if (!host || host.closest("ytd-comments, ytd-comment-renderer, ytd-comment-thread-renderer")) return;
        host.dataset.ytcPart = "transcript";
        found.add(host);
        transcriptTargets.add(host);
        forceHide(host, hide);
      });
    }
    releaseMissing(transcriptTargets, found, hide, (element) => {
      if (element.dataset.ytcPart === "transcript") delete element.dataset.ytcPart;
    });
  }

  const endscreenTargets = new Set();

  function classNameOf(node) {
    const value = node.className;
    return typeof value === "string" ? value : value?.baseVal || "";
  }

  /*
   * Watch-page suggestions (and other lockups) render the hover player inside
   * an open shadow root, where the page stylesheet cannot see it.
   */
  const PREVIEW_CSS =
    "animated-thumbnail-overlay-view-model,ytd-video-preview,ytd-moving-thumbnail-renderer,ytd-thumbnail-overlay-loading-preview-renderer,#mouseover-overlay,#inline-preview-player,.ytp-inline-preview-ui{display:none!important}";
  const sealedPreviewRoots = new WeakSet();

  function sealPreviewRoot(rootNode) {
    if (!rootNode?.appendChild || sealedPreviewRoots.has(rootNode)) return;
    sealedPreviewRoots.add(rootNode);
    const style = document.createElement("style");
    style.id = "ytc-hover-preview";
    style.textContent = PREVIEW_CSS;
    rootNode.appendChild(style);
  }

  function rootInPlayer(rootNode) {
    let node = rootNode?.host;
    while (node) {
      if (node.id === "movie_player" || node.localName === "ytd-player" || node.classList?.contains("html5-video-player")) return true;
      const parentRoot = node.getRootNode?.();
      node = parentRoot instanceof ShadowRoot ? parentRoot.host : node.parentElement;
    }
    return false;
  }

  function silencePreviewVideos(rootNode) {
    if (!rootNode?.querySelectorAll || rootInPlayer(rootNode)) return;
    for (const video of rootNode.querySelectorAll("video")) {
      video.muted = true;
      if (!video.paused) video.pause();
    }
  }

  function hideHoverPreviews() {
    if (E.hideHoverPreview !== true) return;
    const hosts = document.querySelectorAll(
      "yt-lockup-view-model, ytd-thumbnail, ytd-compact-video-renderer, ytd-rich-grid-media, ytd-video-renderer, ytd-grid-video-renderer, ytd-playlist-video-renderer"
    );
    for (const host of hosts) {
      const rootNode = host.shadowRoot;
      if (!rootNode) continue;
      sealPreviewRoot(rootNode);
      silencePreviewVideos(rootNode);
      for (const inner of rootNode.querySelectorAll("*")) {
        if (!inner.shadowRoot) continue;
        sealPreviewRoot(inner.shadowRoot);
        silencePreviewVideos(inner.shadowRoot);
      }
    }
  }

  document.addEventListener(
    "pointerover",
    (event) => {
      if (E.hideHoverPreview !== true) return;
      const roots = [];
      for (const node of event.composedPath()) {
        if (!(node instanceof ShadowRoot) || rootInPlayer(node)) continue;
        sealPreviewRoot(node);
        roots.push(node);
      }
      if (!roots.length) return;
      const quiet = () => {
        for (const rootNode of roots) silencePreviewVideos(rootNode);
      };
      quiet();
      requestAnimationFrame(quiet);
      setTimeout(quiet, 300);
    },
    true
  );

  function hideEndscreen() {
    if (!onWatchPage()) return;
    const hide = E.hideEndscreen === true;
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
    releaseMissing(endscreenTargets, found, hide);
  }

  /* ---------------------------------------------------------- scheduler */

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(run, 120);
  }

  function run() {
    scheduled = false;
    // Pausing only clears CSS via paint(); without this, yt-navigate-finish still
    // sets full and markGuide keeps clicking guide rows — which can leave the SPA broken.
    if (!S.enabled) {
      full = false;
      return;
    }
    // Opening Save, the bell, Subscribe or the ⋯ menu adds DOM nodes. Clicking or
    // rewriting those buttons in the same turn makes YouTube close the menu at once.
    const menuOpen = pageMenuOpen();
    try {
      updateGrids();
      if (menuOpen) return;
      if (full || E.hideShorts || E.hideGames) markWidgets();
      if (full || E.hideWatched) markWatched();
      if (full || E.expandSubscriptions || GUIDE_KEYS.some((k) => E[k])) markGuide();
      if (full || E.hideMastheadUpload || E.hideMasthead) hideUploadButton();
      if (full || E.hideTranscript) hideTranscript();
      if (full || E.hideEndscreen) hideEndscreen();
      if (full || E.hideHoverPreview) hideHoverPreviews();
      applyWatchBehaviors();
    } finally {
      if (!menuOpen) full = false;
    }
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1) {
          schedule();
          return;
        }
      }
    }
  });

  /* ------------------------------------------------------- element picker */

  let picker = null;

  // Translated by the popup and sent with the "ytc-pick" message, so this script needs no translation tables.
  let pickerText = {};
  const ui = (key) => pickerText[key] || Y.tr(Y.UI[key], "en");

  function makeEl(tag, css, text) {
    const el = document.createElement(tag);
    el.style.cssText = css;
    if (text) el.textContent = text;
    return el;
  }

  function saveHidden(selector) {
    try {
      chrome.storage.local.get("customHide", (data) => {
        const list = Y.cleanCustom(data.customHide).filter((s) => s !== selector);
        list.push(selector);
        chrome.storage.local.set({ customHide: list.slice(-Y.MAX_CUSTOM) });
      });
    } catch (e) {
      /* extension was reloaded: the page needs a refresh */
    }
  }

  function toast(text) {
    const el = makeEl(
      "div",
      "position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:2147483647;padding:10px 16px;border-radius:10px;" +
        "background:#1b1e23;color:#eceff3;font:500 13px/1.3 system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.45);pointer-events:none",
      text
    );
    el.id = "ytc-toast";
    root.appendChild(el);
    setTimeout(() => el.remove(), 3800);
  }

  function stopPicker() {
    if (!picker) return;
    for (const [type, fn] of picker.listeners) window.removeEventListener(type, fn, true);
    picker.box.remove();
    picker.bar.remove();
    picker = null;
  }

  function startPicker() {
    if (picker) return;
    const box = makeEl(
      "div",
      "position:fixed;z-index:2147483646;pointer-events:none;border:2px solid #f2b134;background:rgba(242,177,52,.16);border-radius:3px;display:none;transition:all 60ms"
    );
    box.id = "ytc-pick-box";
    const bar = makeEl(
      "div",
      "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;width:min(560px,92vw);padding:12px 14px;border-radius:12px;" +
        "background:#1b1e23;color:#eceff3;font:500 13px/1.4 system-ui,sans-serif;box-shadow:0 10px 36px rgba(0,0,0,.5);display:grid;gap:10px"
    );
    bar.id = "ytc-pick-bar";
    const hint = makeEl("div", "color:#c9d0d9", ui("pickHint"));
    const code = makeEl("code", "display:none;padding:6px 8px;border-radius:6px;background:#0f1114;color:#f2b134;font:12px/1.4 ui-monospace,Consolas,monospace;word-break:break-all;max-height:64px;overflow:auto");
    const row = makeEl("div", "display:flex;gap:8px;justify-content:flex-end");
    const btn = (label, primary) =>
      makeEl(
        "button",
        "all:unset;cursor:pointer;padding:7px 13px;border-radius:8px;font:600 13px system-ui,sans-serif;" +
          (primary ? "background:#f2b134;color:#1a1303" : "background:#2a2f37;color:#eceff3"),
        label
      );
    const cancel = btn(ui("pickCancel"), false);
    const parent = btn(ui("pickParent"), false);
    const hide = btn(ui("pickHide"), true);
    for (const b of [parent, hide]) b.style.display = "none";
    row.append(cancel, parent, hide);
    bar.append(hint, code, row);
    root.append(box, bar);

    const state = { box, bar, target: null, locked: false, listeners: [] };
    picker = state;

    const show = (el) => {
      state.target = el;
      const r = el.getBoundingClientRect();
      Object.assign(box.style, { display: "block", left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
    };
    const lock = (el) => {
      state.locked = true;
      show(el);
      code.textContent = Y.selectorFor(el, document);
      code.style.display = "block";
      parent.style.display = hide.style.display = "inline-block";
    };

    const on = (type, fn) => {
      window.addEventListener(type, fn, true);
      state.listeners.push([type, fn]);
    };
    const inBar = (e) => bar.contains(e.target);
    const swallow = (e) => {
      if (inBar(e)) return;
      e.preventDefault();
      e.stopPropagation();
    };

    on("mousemove", (e) => {
      if (state.locked || inBar(e)) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el && el !== root && el !== document.body && !bar.contains(el)) show(el);
    });
    on("click", (e) => {
      if (inBar(e)) return;
      swallow(e);
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el && el !== root && !bar.contains(el)) lock(el);
    });
    for (const type of ["mousedown", "mouseup", "pointerdown", "pointerup", "auxclick", "contextmenu"]) on(type, swallow);
    on("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        stopPicker();
      }
    });
    on("scroll", () => state.target && show(state.target));

    cancel.addEventListener("click", stopPicker);
    parent.addEventListener("click", () => {
      const p = state.target && state.target.parentElement;
      if (p && p !== root && p !== document.body) lock(p);
    });
    hide.addEventListener("click", () => {
      const selector = code.textContent;
      stopPicker();
      if (selector && Y.validSelector(selector)) {
        saveHidden(selector);
        toast(ui("pickDone"));
      }
    });
  }

  /* --------------------------------------------------------------- wiring */

  try {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message && message.type === "ytc-pick") {
        pickerText = (message.ui && typeof message.ui === "object" && message.ui) || {};
        startPicker();
        sendResponse({ ok: true });
      }
    });
  } catch (e) {
    /* not running as an extension (tests) */
  }

  function load() {
    try {
      chrome.storage.local.get(null, (stored) => {
        paint(stored || {});
        if (!storageLoaded) {
          storageLoaded = true;
          maybeRedirect();
        }
      });
    } catch (e) {
      /* extension context invalidated */
    }
  }

  try {
    load();
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local") load();
    });
  } catch (e) {
    /* ignore */
  }

  function start() {
    schedule();
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  function markScreen() {
    const path = location.pathname || "/";
    let screen = "";
    if (path === "/") screen = "home";
    else if (path.startsWith("/feed/subscriptions")) screen = "subscriptions";
    else if (path.startsWith("/results")) screen = "search";
    else if (/^\/(@|channel\/|c\/|user\/)/.test(path)) screen = "channel";
    else if (path.startsWith("/playlist") || path.startsWith("/feed/playlists")) screen = "playlists";
    else if (/^\/feed\/(history|library|you|courses|downloads|clips)\b/.test(path)) screen = "library";
    if (screen) root.dataset.ytcScreen = screen;
    else delete root.dataset.ytcScreen;
  }

  document.addEventListener("yt-navigate-finish", () => {
    full = true;
    markScreen();
    schedule();
    maybeRedirect(true);
  });
})();
