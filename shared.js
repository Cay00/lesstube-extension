/*
 * YouTube Customizer – shared definitions.
 * Single source of truth for: settings, popup layout, generated CSS,
 * import/export, redirects and the element-picker selector builder.
 * Loaded by popup.html and by the content script.
 */
(function (global) {
  "use strict";

  const T = (en, pl) => ({ en, pl });
  const kebab = (key) => key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
  const cls = (key) => "ytc-" + kebab(key);
  const tg = (key, en, pl, o) => Object.assign({ type: "toggle", key, label: T(en, pl) }, o);
  const sl = (key, en, pl, options, o) => Object.assign({ type: "select", key, label: T(en, pl), options }, o);
  const opt = (v, en, pl) => ({ v, l: T(en, pl || en) });
  const under = (prefix, list) => list.map((s) => prefix + " " + s);

  const THUMBS = [
    "ytd-thumbnail img",
    "yt-thumbnail-view-model img",
    "yt-collection-thumbnail-view-model img",
    "ytd-playlist-thumbnail img",
    "ytd-moving-thumbnail-renderer img",
  ];
  const AVATARS = [
    "yt-avatar-shape img",
    "ytd-video-owner-renderer #avatar img",
    "#author-thumbnail img",
    "yt-decorated-avatar-view-model img",
    "ytd-guide-entry-renderer yt-img-shadow img",
    "ytd-mini-guide-entry-renderer yt-img-shadow img",
    "ytd-topbar-menu-button-renderer yt-img-shadow img",
  ];
  const HOME = 'ytd-browse[page-subtype="home"]';

  /* ---------------------------------------------------------------- panels */

  const PANELS = [
    {
      id: "home",
      icon: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.8V20h13V9.8"/>',
      title: T("Home", "Strona główna"),
      desc: T("What you see when YouTube opens.", "Co widzisz po otwarciu YouTube."),
      sections: [
        {
          title: T("Start", "Start"),
          items: [
            sl("homeRedirect", "Open instead of Home", "Zamiast strony głównej otwieraj", [
              opt("home", "Home", "Stronę główną"),
              opt("subscriptions", "Subscriptions", "Subskrypcje"),
              opt("history", "History", "Historię"),
              opt("library", "Library", "Bibliotekę"),
              opt("watchLater", "Watch later", "Do obejrzenia"),
            ], {
              def: "home",
              hint: T("Only when YouTube opens. The logo still opens Home.", "Tylko przy otwarciu YouTube. Logo nadal otwiera stronę główną."),
            }),
            sl("columns", "Videos per row", "Filmów w rzędzie", [
              opt(0, "YouTube default", "Domyślnie"),
              opt(3, "3"), opt(4, "4"), opt(5, "5"), opt(6, "6"), opt(7, "7"),
            ], { def: 4 }),
          ],
        },
        {
          title: T("Recommendations", "Rekomendacje"),
          items: [
            tg("hideSuggestions", "Hide the recommended feed", "Ukryj polecane filmy", {
              hint: T("Leaves the Home page empty", "Strona główna zostaje pusta"),
              hide: [HOME + " ytd-rich-grid-renderer > #contents > ytd-rich-item-renderer"],
            }),
            tg("hideMixes", "Hide playlists and mixes", "Ukryj playlisty i miksy", {
              hide: [
                HOME + ' ytd-rich-item-renderer:has(a[href*="list=RD"])',
                HOME + ' ytd-rich-item-renderer:has(a[href*="start_radio=1"])',
                HOME + ' ytd-rich-item-renderer:has(a[href*="/playlist?list="])',
                HOME + " ytd-rich-item-renderer:has(ytd-playlist-thumbnail)",
                HOME + " ytd-rich-item-renderer:has(yt-collection-thumbnail-view-model)",
                HOME + ' ytd-rich-section-renderer:has(a[href*="/playlist?list="])',
              ],
            }),
            tg("hideAds", "Hide ads in the feed", "Ukryj reklamy w feedzie", {
              hint: T("Promoted tiles and banners only", "Tylko kafelki i banery promowane"),
              hide: [
                HOME + " ytd-ad-slot-renderer",
                HOME + " ytd-display-ad-renderer",
                HOME + " ytd-banner-promo-renderer",
                HOME + " ytd-in-feed-ad-layout-renderer",
                HOME + " ytd-rich-item-renderer:has(ytd-ad-slot-renderer)",
                HOME + ' ytd-rich-item-renderer:has([aria-label="Reklama"])',
                HOME + ' ytd-rich-item-renderer:has([aria-label="Sponsorowane"])',
                HOME + ' ytd-rich-item-renderer:has([aria-label="Sponsored"])',
                HOME + ' ytd-rich-item-renderer:has([aria-label="Ad"])',
                "#masthead-ad",
                "ytd-primetime-promo-renderer",
              ],
            }),
            tg("hideFeedChips", "Hide the topic chips bar", "Ukryj pasek kategorii", {
              hide: ["ytd-feed-filter-chip-bar-renderer", "ytd-rich-grid-renderer #chips-wrapper"],
            }),
            tg("hideHomeShelves", "Hide extra shelves", "Ukryj dodatkowe sekcje", {
              hint: T("News, posts, Shorts rows between videos", "Wiadomości, posty, rzędy Shorts między filmami"),
              hide: [HOME + " ytd-rich-section-renderer"],
            }),
            tg("hideCommunityPosts", "Hide community posts", "Ukryj posty społeczności", {
              hide: [
                "ytd-rich-section-renderer:has(ytd-post-renderer)",
                "ytd-rich-item-renderer:has(ytd-post-renderer)",
              ],
            }),
            tg("hideHoverPreview", "Turn off hover previews", "Wyłącz podglądy po najechaniu", {
              hint: T("No video playing inside thumbnails", "Bez odtwarzania filmu w miniaturze"),
              hide: ["ytd-video-preview", "ytd-moving-thumbnail-renderer"],
            }),
          ],
        },
        {
          title: T("Shorts and Playables", "Shorts i gry"),
          items: [
            tg("hideShorts", "Hide Shorts everywhere", "Ukryj Shorts wszędzie", {
              def: true,
              hide: [
                '[data-ytc-hide="shorts"]',
                "ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])",
                "ytd-rich-shelf-renderer[is-shorts]",
                "ytd-reel-shelf-renderer",
                'ytd-guide-entry-renderer:has(a[href="/shorts"])',
                'ytd-mini-guide-entry-renderer:has(a[href="/shorts"])',
                'ytd-rich-item-renderer:has(a[href^="/shorts/"])',
                'ytd-video-renderer:has(a[href^="/shorts/"])',
                'ytd-grid-video-renderer:has(a[href^="/shorts/"])',
                'ytd-compact-video-renderer:has(a[href^="/shorts/"])',
                'yt-lockup-view-model:has(a[href^="/shorts/"])',
                "ytm-shorts-lockup-view-model",
                "ytm-shorts-lockup-view-model-v2",
              ],
            }),
            tg("redirectShorts", "Open Shorts in the normal player", "Otwieraj Shorts w zwykłym odtwarzaczu", {
              hint: T("Stops the endless swipe feed", "Koniec z nieskończonym przewijaniem"),
            }),
            tg("hideGames", "Hide Playables", "Ukryj Pokój gier", {
              def: true,
              hide: [
                '[data-ytc-hide="games"]',
                'ytd-rich-section-renderer:has(a[href="/playables"])',
                'ytd-rich-section-renderer:has(a[href^="/playables"])',
                'ytd-guide-entry-renderer:has(a[href="/playables"])',
                'ytd-guide-entry-renderer:has(a[href^="/playables"])',
                'ytd-mini-guide-entry-renderer:has(a[href="/playables"])',
                'ytd-mini-guide-entry-renderer:has(a[href^="/playables"])',
              ],
            }),
          ],
        },
      ],
    },

    {
      id: "search",
      icon: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.9-4.9"/>',
      title: T("Search", "Wyszukiwanie"),
      desc: T("Search box and results page.", "Wyszukiwarka i strona wyników."),
      sections: [
        {
          title: T("Search box", "Pole wyszukiwania"),
          items: [
            tg("hideSearchSuggestions", "Turn off search suggestions", "Wyłącz podpowiedzi wyszukiwania", {
              hide: [
                "ytd-searchbox #suggestions",
                ".ytSearchboxComponentSuggestionsContainer",
                'yt-searchbox [role="listbox"]',
                ".ytSuggestionComponentSuggestion",
              ],
            }),
          ],
        },
        {
          title: T("Results", "Wyniki"),
          items: [
            tg("hideSearchAds", "Hide promoted results", "Ukryj wyniki promowane", {
              hide: [
                "ytd-search ytd-ad-slot-renderer",
                "ytd-search ytd-search-pyv-renderer",
                "ytd-search ytd-promoted-sparkles-text-search-renderer",
                "ytd-search ytd-promoted-video-renderer",
              ],
            }),
            tg("hideSearchShelves", "Hide “People also watched” rows", "Ukryj rzędy „Inni oglądali”", {
              hide: ["ytd-search ytd-shelf-renderer", "ytd-search ytd-horizontal-card-list-renderer"],
            }),
            tg("hideSearchChips", "Hide related search chips", "Ukryj podpowiedziane frazy", {
              hide: ["ytd-search yt-related-chip-cloud-renderer", "ytd-search ytd-feed-filter-chip-bar-renderer"],
            }),
          ],
        },
      ],
    },

    {
      id: "guide",
      icon: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M9.5 4.5v15"/>',
      title: T("Sidebar", "Panel boczny"),
      desc: T("Pick entries to remove from the left menu.", "Wybierz pozycje do usunięcia z lewego menu."),
      sections: [
        {
          title: T("Whole sidebar", "Cały panel"),
          items: [
            tg("hideSidebar", "Hide sidebar and menu button", "Ukryj panel i przycisk menu", {
              css:
                "& ytd-guide-renderer,& ytd-mini-guide-renderer,& tp-yt-app-drawer#guide,& ytd-masthead #guide-button{display:none!important}" +
                "& ytd-app{--ytd-mini-guide-width:0px!important}& ytd-page-manager{margin-left:0!important}",
            }),
            tg("hideMiniGuide", "Hide the narrow icon bar", "Ukryj wąski pasek ikon", {
              css:
                "& ytd-mini-guide-renderer{display:none!important}" +
                "& ytd-app{--ytd-mini-guide-width:0px!important}& ytd-page-manager{margin-left:0!important}",
            }),
          ],
        },
        {
          title: T("Main", "Główne"),
          master: tg("hideHomeSection", "Hide this section", "Ukryj całą sekcję"),
          items: [
            tg("hideGuideHome", "Home", "Strona główna"),
            tg("hideGuideShorts", "Shorts", "Shorts"),
          ],
        },
        {
          title: T("Subscriptions", "Subskrypcje"),
          master: tg("hideSubscriptionsSection", "Hide this section", "Ukryj całą sekcję"),
          items: [
            tg("hideGuideSubscriptions", "Subscriptions", "Subskrypcje"),
            tg("expandSubscriptions", "Expand the whole list", "Rozwiń całą listę"),
          ],
        },
        {
          title: T("You", "Ty"),
          master: tg("hideLibrarySection", "Hide this section", "Ukryj całą sekcję"),
          items: [
            tg("hideGuideYou", "You", "Ty"),
            tg("hideGuideChannel", "Your channel", "Twój kanał"),
            tg("hideGuideHistory", "History", "Historia"),
            tg("hideGuidePlaylists", "Playlists", "Playlisty"),
            tg("hideGuideWatchLater", "Watch later", "Do obejrzenia"),
            tg("hideGuideLiked", "Liked videos", "Polubione filmy"),
            tg("hideGuideYourVideos", "Your videos", "Twoje filmy"),
            tg("hideGuideDownloads", "Downloads", "Pobrane"),
            tg("hideGuideCourses", "Courses", "Kursy"),
            tg("hideGuideClips", "Clips", "Klipy"),
            tg("hideGuideLibraryShowMore", "“Show more” button", "Przycisk „Pokaż więcej”"),
          ],
        },
        {
          title: T("Explore", "Odkrywaj"),
          master: tg("hideExploreSection", "Hide this section", "Ukryj całą sekcję"),
          items: [
            tg("hideGuideExploreMusic", "Music", "Muzyka"),
            tg("hideGuideMovies", "Movies", "Filmy"),
            tg("hideGuideHype", "Hype", "Podbijanie"),
            tg("hideGuideLive", "Live", "Na żywo"),
            tg("hideGuideGaming", "Gaming", "Gry"),
            tg("hideGuideNews", "News", "Wiadomości"),
            tg("hideGuideSports", "Sports", "Sport"),
            tg("hideGuidePodcasts", "Podcasts", "Podcasty"),
            tg("hideGuidePlayables", "Playables", "Pokój gier"),
            tg("hideGuideSupport", "Channel support", "Wspieranie kanału"),
            tg("hideGuideExploreShowMore", "“Show more” button", "Przycisk „Pokaż więcej”"),
          ],
        },
        {
          title: T("More from YouTube", "Więcej z YouTube"),
          master: tg("hideMoreSection", "Hide this section", "Ukryj całą sekcję"),
          items: [
            tg("hideGuideMusic", "YouTube Music", "YouTube Music"),
            tg("hideGuideKids", "YouTube Kids", "YouTube Kids"),
            tg("hideGuideReports", "Report history", "Historia zgłoszeń"),
            tg("hideGuideFooter", "Footer links", "Linki w stopce"),
          ],
        },
      ],
    },

    {
      id: "topbar",
      icon: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17"/>',
      title: T("Top bar", "Górny pasek"),
      desc: T("Logo, search and account buttons.", "Logo, wyszukiwarka i przyciski konta."),
      sections: [
        {
          title: T("Top bar", "Górny pasek"),
          master: tg("hideMasthead", "Hide the entire bar", "Ukryj cały pasek", {
            css:
              "&,& ytd-app{--ytd-toolbar-height:0px!important;--ytd-masthead-height:0px!important}" +
              "& ytd-masthead,& #masthead-container{display:none!important}",
          }),
          items: [
            tg("hideMastheadMenu", "Menu button", "Przycisk menu", { hide: ["ytd-masthead #guide-button"] }),
            tg("hideMastheadLogo", "Logo", "Logo", {
              hide: ["ytd-masthead ytd-topbar-logo-renderer", "ytd-masthead #logo", "ytd-masthead a#logo"],
            }),
            tg("hideMastheadSearch", "Search bar", "Wyszukiwarka", {
              hide: [
                "ytd-masthead ytd-searchbox form",
                "ytd-masthead yt-searchbox .ytSearchboxComponentInputBox",
                "ytd-masthead yt-searchbox .ytSearchboxComponentSearchButton",
                "ytd-masthead #search-form",
              ],
            }),
            tg("hideMastheadMic", "Microphone", "Mikrofon", {
              hide: [
                "ytd-masthead #voice-search-button",
                "ytd-masthead .ytSearchboxComponentVoiceSearchButton",
                'ytd-masthead button[aria-label*="Wyszukiwanie głosowe" i]',
                'ytd-masthead button[aria-label*="Voice search" i]',
              ],
            }),
            tg("hideMastheadUpload", "Create / upload", "Utwórz / prześlij", {
              hide: [
                "ytd-masthead #buttons > ytd-topbar-menu-button-renderer:not(:has(#avatar-btn))",
                "ytd-masthead #upload-btn",
                'ytd-masthead a[href="/upload"]',
                "[data-ytc-upload]",
              ],
            }),
            tg("hideMastheadNotifications", "Notifications", "Powiadomienia", {
              hide: [
                "ytd-notification-topbar-button-renderer",
                'ytd-masthead button[aria-label*="Powiadomienia" i]',
                'ytd-masthead button[aria-label*="Notifications" i]',
              ],
            }),
            tg("hideMastheadAvatar", "Account avatar", "Awatar konta", {
              hide: [
                "ytd-masthead button#avatar-btn",
                "ytd-masthead #avatar-btn",
                "ytd-masthead ytd-topbar-menu-button-renderer:has(#avatar-btn)",
              ],
            }),
          ],
        },
        {
          title: T("Distractions", "Rozpraszacze"),
          items: [
            tg("hideNotificationBadge", "Hide the unread-notification counter", "Ukryj licznik powiadomień", {
              hide: [
                "ytd-masthead .yt-spec-icon-badge-shape__badge",
                "ytd-notification-topbar-button-renderer .yt-spec-icon-badge-shape__badge",
                "ytd-notification-topbar-button-renderer #notification-count",
              ],
            }),
            tg("hidePremiumPromos", "Hide Premium offers and banners", "Ukryj oferty i banery Premium", {
              hide: [
                "ytd-mealbar-promo-renderer",
                "ytd-statement-banner-renderer",
                "ytd-banner-promo-renderer",
                'ytd-guide-entry-renderer:has(a[href*="/premium"])',
                'ytd-masthead #buttons ytd-button-renderer:has(a[href*="/premium"])',
              ],
            }),
          ],
        },
      ],
    },

    {
      id: "player",
      icon: '<rect x="3.5" y="5.5" width="17" height="13" rx="3"/><path d="m10.5 9.5 4 2.5-4 2.5z"/>',
      title: T("Player", "Odtwarzacz"),
      desc: T("Overlays, buttons and playback behaviour.", "Nakładki, przyciski i zachowanie odtwarzania."),
      sections: [
        {
          title: T("Behaviour", "Zachowanie"),
          items: [
            tg("disableAutoplay", "Turn autoplay off", "Wyłącz autoodtwarzanie", {
              hint: T("Next video never starts by itself", "Następny film nie włącza się sam"),
            }),
            tg("autoTheater", "Start in theater mode", "Zaczynaj w trybie kinowym"),
          ],
        },
        {
          title: T("Overlays", "Nakładki"),
          items: [
            tg("hideEndscreen", "End screen suggestions", "Propozycje po zakończeniu filmu", {
              hide: [
                ".ytp-endscreen-content", ".html5-endscreen", ".ytp-modern-endscreen", ".videowall-endscreen",
                ".ytp-videowall-still", ".ytp-endscreen-previous", ".ytp-endscreen-next", ".ytp-suggestion-set",
                ".ytp-fullscreen-grid-stills-container", ".ytp-autonav-endscreen-countdown-container",
              ],
            }),
            tg("hidePauseOverlay", "“More videos” when paused", "„Więcej filmów” po zatrzymaniu", {
              hint: T("Also the grid shown in fullscreen", "Także siatka w pełnym ekranie"),
              hide: [".ytp-pause-overlay", ".ytp-pause-overlay-container", ".ytp-fullscreen-grid"],
            }),
            tg("hideEndCards", "End cards", "Karty końcowe", {
              hide: [".ytp-ce-element", ".ytp-ce-covering-overlay", ".ytp-ce-element-shadow", ".ytp-ce-video", ".ytp-ce-playlist", ".ytp-ce-channel"],
            }),
            tg("hideInfoCards", "Info cards", "Karty informacyjne", {
              hide: [".ytp-cards-teaser", ".ytp-cards-button", ".ytp-cards-teaser-box"],
            }),
            tg("hideWatermark", "Channel watermark", "Znak wodny kanału", {
              hide: [".iv-branding", ".ytp-watermark"],
            }),
            tg("hidePaidPromotion", "“Includes paid promotion”", "„Zawiera płatną promocję”", {
              hide: [".ytp-paid-content-overlay", ".ytp-paid-content-overlay-text"],
            }),
            tg("hideCaptions", "On-video captions", "Napisy na filmie", {
              hide: [".ytp-caption-window-container", ".caption-window"],
            }),
            tg("hideAnnotations", "Annotations", "Adnotacje", {
              hide: [".annotation", ".ytp-ad-overlay-slot", ".ytp-ad-overlay-container"],
            }),
            tg("hidePlayerTitle", "Title inside the player", "Tytuł w odtwarzaczu", {
              hide: [".ytp-title", ".ytp-title-text", ".ytp-chrome-top .ytp-title-channel"],
            }),
            tg("hideAmbientMode", "Ambient glow behind the video", "Poświata za filmem", {
              hide: ["ytd-watch-flexy #cinematics", "ytd-watch-flexy #cinematics-container"],
            }),
          ],
        },
        {
          title: T("Progress bar", "Pasek postępu"),
          items: [
            tg("hideProgressBar", "Progress bar", "Pasek postępu", { hide: [".ytp-progress-bar-container"] }),
            tg("hideHeatmap", "Most replayed graph", "Wykres najczęściej oglądanych", {
              hide: [".ytp-heat-map-container", ".ytp-heat-map-chapter"],
            }),
            tg("hidePlayerTime", "Video time", "Czas filmu", { hide: [".ytp-time-display"] }),
            tg("hideChapters", "Chapters", "Rozdziały", {
              hide: [".ytp-chapter-container", ".ytp-chapter-title", ".ytp-chapter-hover-container"],
            }),
          ],
        },
        {
          title: T("Control buttons", "Przyciski sterowania"),
          items: [
            tg("hidePlayButton", "Play / pause", "Odtwarzaj / pauza", { hide: [".ytp-play-button"] }),
            tg("hideReplayButton", "Replay", "Powtórz", {
              hide: [".html5-video-player.ended .ytp-play-button", ".ytp-replay-button"],
            }),
            tg("hideNextButton", "Next video", "Następny film", { hide: [".ytp-next-button"] }),
            tg("hidePrevButton", "Previous video", "Poprzedni film", { hide: [".ytp-prev-button"] }),
            tg("hideVolume", "Volume", "Głośność", { hide: [".ytp-volume-area", ".ytp-mute-button", ".ytp-volume-panel"] }),
            tg("hideAutonavButton", "Autoplay switch", "Przełącznik autoodtwarzania", {
              hide: [".ytp-autonav-toggle-button", ".ytp-autonav-toggle-button-container"],
            }),
            tg("hideSubtitlesButton", "Subtitles", "Napisy", { hide: [".ytp-subtitles-button"] }),
            tg("hideSettingsButton", "Settings", "Ustawienia", { hide: [".ytp-settings-button"] }),
            tg("hideMiniplayer", "Miniplayer", "Miniodtwarzacz", { hide: [".ytp-miniplayer-button"] }),
            tg("hideTheaterButton", "Theater mode", "Tryb kinowy", { hide: [".ytp-size-button"] }),
            tg("hideFullscreen", "Full screen", "Pełny ekran", { hide: [".ytp-fullscreen-button"] }),
            tg("hideAirplay", "AirPlay", "AirPlay", {
              hide: [".ytp-airplay-button", '.ytp-button[aria-label*="AirPlay" i]'],
            }),
            tg("hideMoreFromChannel", "“More from this channel”", "„Więcej z tego kanału”", {
              hide: ['[data-ytc-part="more-channel"]'],
            }),
          ],
        },
      ],
    },

    {
      id: "video",
      icon: '<path d="M5 4.5h14v15H5z"/><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4"/>',
      title: T("Video page", "Strona filmu"),
      desc: T("Everything around the player.", "Wszystko wokół odtwarzacza."),
      sections: [
        {
          title: T("Right column", "Prawa kolumna"),
          master: tg("hideSecondary", "Hide the entire column", "Ukryj całą kolumnę", {
            css:
              "& ytd-watch-flexy #secondary{display:none!important}" +
              "& ytd-watch-flexy #primary{max-width:none!important;margin-right:0!important}",
          }),
          items: [
            tg("hideRelated", "Related videos", "Podobne filmy", {
              hide: ["ytd-watch-flexy #related", "ytd-watch-flexy ytd-watch-next-secondary-results-renderer", "ytd-watch-flexy #secondary ytd-item-section-renderer"],
            }),
            tg("hideLiveChat", "Live chat", "Czat na żywo", {
              hide: [
                "ytd-live-chat-frame", "ytd-watch-flexy #chat", "ytd-watch-flexy #chat-container",
                'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-live-chat"]',
              ],
            }),
            tg("hideWatchPlaylist", "Playlist panel", "Panel playlisty", {
              hide: ["ytd-playlist-panel-renderer", "ytd-watch-flexy #playlist"],
            }),
            tg("hideFundraiser", "Fundraiser", "Zbiórka", {
              hide: ["ytd-donation-shelf-renderer", "ytd-fundraiser-shelf-renderer", "ytd-watch-flexy #donation-shelf"],
            }),
            tg("hideAutoplayCard", "“Up next” card", "Karta „Następne”", { hide: ["ytd-compact-autoplay-renderer"] }),
            tg("hideRelatedAds", "Ads in related", "Reklamy w podobnych", {
              hide: [
                "ytd-watch-flexy #secondary ytd-ad-slot-renderer",
                "ytd-watch-flexy #secondary ytd-display-ad-renderer",
                "ytd-watch-flexy #secondary ytd-compact-promoted-video-renderer",
                "ytd-watch-flexy #secondary ytd-promoted-sparkles-web-renderer",
              ],
            }),
            tg("hideRelatedShorts", "Shorts in related", "Shorts w podobnych", {
              hide: [
                "ytd-watch-flexy #secondary ytd-reel-shelf-renderer",
                "ytd-watch-flexy #secondary ytd-rich-shelf-renderer[is-shorts]",
                "ytd-watch-flexy #secondary ytd-reel-item-renderer",
              ],
            }),
            tg("hideRelatedChips", "Filter chips", "Filtry (chipy)", {
              hide: [
                "ytd-watch-flexy #secondary yt-related-chip-cloud-renderer",
                "ytd-watch-flexy #secondary yt-chip-cloud-view-model",
                "ytd-watch-flexy #secondary ytd-watch-next-secondary-results-renderer #chips",
              ],
            }),
          ],
        },
        {
          title: T("Title and channel", "Tytuł i kanał"),
          items: [
            tg("hideVideoTitle", "Video title", "Tytuł filmu", { hide: ["ytd-watch-metadata #title", "ytd-watch-metadata h1"] }),
            tg("hideChannelAvatar", "Channel avatar", "Awatar kanału", {
              hide: ["ytd-video-owner-renderer #avatar", "ytd-video-owner-renderer yt-img-shadow", "ytd-video-owner-renderer yt-avatar-shape", "#owner #avatar"],
            }),
            tg("hideChannelName", "Channel name", "Nazwa kanału", {
              hide: ["ytd-video-owner-renderer ytd-channel-name", "#owner #channel-name", "#upload-info ytd-channel-name"],
            }),
            tg("hideSubCount", "Subscriber count", "Liczba subskrybentów", {
              hide: ["#owner-sub-count", "#subscriber-count", "ytd-video-owner-renderer #owner-sub-count"],
            }),
            tg("hideVerifiedBadge", "Verified badge", "Znaczek weryfikacji", {
              hide: ["ytd-video-owner-renderer ytd-badge-supported-renderer", "ytd-channel-name #badge", ".badge-style-type-verified", ".badge-style-type-verified-artist"],
            }),
            tg("hideFundraiserBadge", "Fundraiser badge", "Znaczek zbiórki", {
              hide: ['[data-ytc-part="fundraiser-badge"]', "ytd-video-owner-renderer ytd-donation-shelf-renderer"],
            }),
          ],
        },
        {
          title: T("Action buttons", "Przyciski akcji"),
          items: [
            tg("hideSubscribe", "Subscribe", "Subskrybuj", { hide: ["ytd-watch-metadata #subscribe-button", '[data-ytc-part="subscribe"]'] }),
            tg("hideNotifyBell", "Notification bell", "Dzwonek", { hide: ["ytd-watch-metadata #notification-preference-button", '[data-ytc-part="notify"]'] }),
            tg("hideJoin", "Join", "Dołącz", { hide: ["ytd-watch-metadata #sponsor-button", '[data-ytc-part="join"]'] }),
            tg("hideLikeBar", "Likes", "Polubienia", {
              hide: [
                "ytd-watch-metadata ytd-segmented-like-dislike-button-renderer",
                "ytd-watch-metadata like-button-view-model",
                "ytd-watch-metadata segmented-like-dislike-button-view-model",
                "ytd-watch-metadata #segmented-like-button",
              ],
            }),
            tg("hideShare", "Share", "Udostępnij", { hide: ['[data-ytc-part="share"]'] }),
            tg("hideDownload", "Download", "Pobierz", { hide: ['[data-ytc-part="download"]'] }),
            tg("hideSave", "Save", "Zapisz", { hide: ['[data-ytc-part="save"]'] }),
            tg("hideClip", "Clip", "Klip", { hide: ['[data-ytc-part="clip"]'] }),
            tg("hideThanks", "Super Thanks", "Super Thanks", { hide: ['[data-ytc-part="thanks"]'] }),
            tg("hideAsk", "Ask (AI) button", "Przycisk Zapytaj (AI)", { hide: ['[data-ytc-part="ask"]'] }),
            tg("hideOffers", "Merch, tickets and offers", "Gadżety, bilety i oferty", {
              hide: [
                "ytd-merch-shelf-renderer", "ytd-ticket-shelf-renderer", "ytd-offer-module-renderer", "#ticket-shelf",
                "ytd-products-in-video-renderer", '[data-ytc-part="offers"]',
              ],
            }),
            tg("hideMoreActions", "“More” menu", "Menu „Więcej”", {
              hide: [
                'ytd-watch-metadata #actions button[aria-label="Więcej"]',
                'ytd-watch-metadata #actions button[aria-label="More"]',
                'ytd-watch-metadata #actions button[aria-label="More actions"]',
                'ytd-watch-metadata #actions button[aria-label*="Więcej działań" i]',
              ],
            }),
          ],
        },
        {
          title: T("Description", "Opis"),
          items: [
            tg("hideDescription", "Hide description", "Ukryj opis", {
              hide: ["ytd-watch-metadata #description", "ytd-watch-metadata ytd-text-inline-expander", "ytd-watch-metadata ytd-expander", "ytd-watch-metadata #description-inline-expander"],
            }),
            tg("expandDescription", "Expand automatically", "Rozwijaj automatycznie"),
            tg("hideViewCount", "View count", "Liczba wyświetleń", {
              hide: ["ytd-watch-metadata #view-count", '[data-ytc-part="views"]', '[data-ytc-part="views-date"]', "ytd-video-view-count-renderer"],
            }),
            tg("hidePublishDate", "Publish date", "Data publikacji", {
              hide: ["ytd-watch-metadata #date", '[data-ytc-part="date"]'],
              css: "&:not(.ytc-hide-view-count) ytd-watch-metadata [data-ytc-part=\"views-date\"]{display:none!important}",
            }),
            tg("hideHashtags", "Hashtags", "Hashtagi", {
              hide: ['ytd-watch-metadata a[href*="/hashtag/"]', 'ytd-watch-metadata yt-formatted-string a[href*="/hashtag/"]'],
            }),
            tg("hideChannelInfo", "Channel box", "Ramka kanału", {
              hide: ["ytd-structured-description-channel-lockup-renderer", "ytd-video-secondary-info-renderer #channel"],
            }),
            tg("hideDescriptionChapters", "Chapters list", "Lista rozdziałów", {
              hide: [
                "ytd-macro-markers-list-renderer",
                'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-macro-markers-description-chapters"]',
                "ytd-watch-metadata ytd-horizontal-card-list-renderer",
              ],
            }),
            tg("hideLicenseRow", "License and metadata rows", "Licencja i metadane", {
              hide: [
                "ytd-watch-metadata ytd-metadata-row-container-renderer", "ytd-watch-metadata ytd-metadata-row-renderer",
                "ytd-watch-metadata ytd-rich-metadata-renderer", "ytd-watch-metadata #super-title", '[data-ytc-part="license"]',
              ],
            }),
            tg("hideTranscript", "Transcript", "Transkrypcja", {
              hide: [
                '[data-ytc-part="transcript"]', "ytd-video-description-transcript-section-renderer", "ytd-transcript-renderer",
                "ytd-transcript-search-panel-renderer", 'ytd-engagement-panel-section-list-renderer[target-id*="transcript"]',
              ],
            }),
          ],
        },
      ],
    },

    {
      id: "comments",
      icon: '<path d="M4.5 5.5h15v10.5H10l-4.5 3.5V16h-1z"/>',
      title: T("Comments", "Komentarze"),
      desc: T("Hide all of it or just the noisy parts.", "Ukryj całość albo tylko hałaśliwe elementy."),
      sections: [
        {
          title: T("Comments", "Komentarze"),
          master: tg("hideComments", "Hide the entire section", "Ukryj całą sekcję", {
            hide: ["ytd-comments", "ytd-watch-flexy #comments"],
          }),
          items: [
            tg("hideCommentBox", "Comment box", "Pole dodawania komentarza", {
              hide: ["ytd-comment-simplebox-renderer", "ytd-commentbox", "ytd-comments #simple-box"],
            }),
            tg("hideCommentHeader", "Header and count", "Nagłówek i liczba", {
              hide: ["ytd-comments-header-renderer #title", "ytd-comments-header-renderer #count", "ytd-comments-header-renderer h2"],
            }),
            tg("hideCommentSort", "Sort menu", "Sortowanie", {
              hide: ["ytd-comments-header-renderer #sort-menu", "ytd-comments-header-renderer #sort-menu-anchor"],
            }),
            tg("hideCommentAvatars", "Avatars", "Awatary", {
              hide: ["ytd-comment-renderer #author-thumbnail", "ytd-comment-view-model #author-thumbnail", "ytd-comment-replies-renderer #author-thumbnail", "ytd-comment-thread-renderer #author-thumbnail"],
            }),
            tg("hideCommentLikes", "Likes", "Polubienia", {
              hide: ["ytd-comment-renderer #vote-count-middle", "ytd-comment-action-buttons-renderer #like-button", "ytd-comment-action-buttons-renderer #dislike-button", "ytd-comment-engagement-bar"],
            }),
            tg("hideCommentReplies", "Replies", "Odpowiedzi", {
              hide: ["ytd-comment-replies-renderer", "ytd-comment-renderer #reply-button-end", "ytd-comment-action-buttons-renderer #reply-button"],
            }),
            tg("hideCommentHearts", "Creator hearts", "Serduszka autora", {
              hide: ["ytd-creator-heart-renderer", "#creator-heart", "ytd-comment-renderer #hearted"],
            }),
            tg("hideCommentBadges", "Badges", "Odznaki", {
              hide: ["ytd-sponsor-comment-badge-renderer", "ytd-comment-renderer #sponsor-comment-badge", "ytd-author-comment-badge-renderer", "#author-comment-badge"],
            }),
            tg("hideCommentPinned", "“Pinned” label", "Etykieta „Przypięty”", {
              hide: ["ytd-pinned-comment-badge-renderer", "#pinned-comment-badge"],
            }),
            tg("hideCommentTime", "Comment time", "Czas komentarza", {
              hide: ["ytd-comment-renderer #published-time-text", "ytd-comment-view-model #published-time-text", "ytd-comment-replies-renderer #published-time-text"],
            }),
          ],
        },
      ],
    },

    {
      id: "look",
      icon: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
      title: T("Look", "Wygląd"),
      desc: T("Make YouTube less eye-catching.", "Spraw, by YouTube mniej przyciągał wzrok."),
      sections: [
        {
          title: T("Grayscale", "Skala szarości"),
          items: [
            tg("grayscaleThumbnails", "Thumbnails", "Miniatury", { css: under("&", THUMBS).join(",") + "{filter:grayscale(1)!important}" }),
            tg("grayscaleAvatars", "Channel avatars", "Awatary kanałów", { css: under("&", AVATARS).join(",") + "{filter:grayscale(1)!important}" }),
            tg("grayscalePlayer", "Video player", "Odtwarzacz", { css: "& video,& .html5-video-player video{filter:grayscale(1)!important}" }),
            tg("grayscalePage", "The whole page", "Cała strona", {
              hint: T("Everything, including the video", "Wszystko, razem z filmem"),
              css: "&{filter:grayscale(1)}",
            }),
          ],
        },
        {
          title: T("Thumbnails", "Miniatury"),
          items: [
            tg("blurThumbnails", "Blur thumbnails until hover", "Rozmyj miniatury do najechania", {
              hint: T("Judge a video by its title, not its cover", "Oceniaj film po tytule, nie po okładce"),
              css:
                under("&", THUMBS).join(",") + "{filter:blur(18px)!important;transition:filter .15s}" +
                under("&", THUMBS.map((s) => s.replace(/ img$/, ":hover img"))).join(",") + "{filter:none!important}" +
                under("html.ytc-grayscale-thumbnails.ytc-blur-thumbnails", THUMBS).join(",") + "{filter:grayscale(1) blur(18px)!important}" +
                under("html.ytc-grayscale-thumbnails.ytc-blur-thumbnails", THUMBS.map((s) => s.replace(/ img$/, ":hover img"))).join(",") + "{filter:grayscale(1)!important}",
            }),
            tg("hideThumbnails", "Make thumbnails invisible", "Ukryj miniatury (zostaw układ)", {
              css: under("&", THUMBS).join(",") + "{opacity:0!important}",
            }),
            tg("hideFeedAvatars", "Hide channel avatars in feeds", "Ukryj awatary kanałów w feedach", {
              hide: [
                "ytd-rich-item-renderer #avatar-container",
                "ytd-rich-item-renderer yt-decorated-avatar-view-model",
                "yt-lockup-view-model yt-decorated-avatar-view-model",
              ],
            }),
          ],
        },
      ],
    },
  ];

  /* -------------------------------------------------------------- flatten */

  const ITEMS = [];
  const ITEM_PANEL = {};
  for (const panel of PANELS) {
    for (const section of panel.sections) {
      const list = (section.master ? [section.master] : []).concat(section.items);
      for (const item of list) {
        ITEMS.push(item);
        ITEM_PANEL[item.key] = panel.id;
      }
    }
  }
  const BY_KEY = Object.fromEntries(ITEMS.map((i) => [i.key, i]));
  const TOGGLES = ITEMS.filter((i) => i.type === "toggle");

  const DEFAULTS = {};
  for (const item of ITEMS) DEFAULTS[item.key] = item.type === "toggle" ? item.def === true : item.def;

  const GROUPS = {};
  for (const panel of PANELS) {
    for (const section of panel.sections) {
      if (section.master) GROUPS[section.master.key] = section.items.map((i) => i.key);
    }
  }

  /* ----------------------------------------------------------------- CSS */

  function buildCss() {
    const out = [];
    for (const item of TOGGLES) {
      const prefix = "html." + cls(item.key);
      if (item.hide) out.push(item.hide.map((s) => prefix + " " + s).join(",\n") + "{display:none!important}");
      if (item.css) out.push(item.css.replace(/&/g, prefix));
    }
    return out.join("\n");
  }

  /* --------------------------------------------------------- UI strings */

  const UI = {
    subtitle: T("Make YouTube yours", "Dopasuj YouTube do siebie"),
    search: T("Search settings…", "Szukaj ustawień…"),
    noResults: T("Nothing matches “{q}”.", "Brak wyników dla „{q}”."),
    on: T("On", "Włączona"),
    paused: T("Paused", "Wstrzymana"),
    pausedNote: T("The extension is paused. YouTube looks the way it ships.", "Wtyczka jest wstrzymana. YouTube wygląda tak jak fabrycznie."),
    active: T("{n} active", "{n} aktywnych"),
    tools: T("Tools", "Narzędzia"),
    toolsDesc: T("Hidden elements and backup.", "Ukryte elementy i kopia ustawień."),
    applied: T("Applied", "Zastosowano"),
    picker: T("Hidden elements", "Ukryte elementy"),
    pickerHint: T("Remove anything on YouTube with a click.", "Usuń z YouTube dowolny element jednym kliknięciem."),
    pick: T("Pick an element on the page", "Wskaż element na stronie"),
    pickNeedTab: T("Switch to a YouTube tab first (reload it if it was already open).", "Przejdź najpierw na kartę YouTube (odśwież ją, jeśli była już otwarta)."),
    selectorPlaceholder: T("or type a CSS selector", "albo wpisz selektor CSS"),
    add: T("Add", "Dodaj"),
    remove: T("Remove", "Usuń"),
    badSelector: T("That is not a valid selector.", "To nie jest poprawny selektor."),
    noneHidden: T("Nothing hidden yet.", "Nic jeszcze nie ukryto."),
    backup: T("Backup", "Kopia ustawień"),
    backupHint: T("Copy this text to move your setup to another browser.", "Skopiuj ten tekst, by przenieść ustawienia do innej przeglądarki."),
    export: T("Export", "Eksportuj"),
    copy: T("Copy", "Kopiuj"),
    copied: T("Copied", "Skopiowano"),
    import: T("Import", "Importuj"),
    importPlaceholder: T("Paste a settings string here…", "Wklej tutaj ciąg ustawień…"),
    importDone: T("Imported {n} settings. Previous ones were replaced.", "Zaimportowano {n} ustawień. Poprzednie zostały zastąpione."),
    importBad: T("This text is not a valid settings string.", "Ten tekst nie jest poprawnym ciągiem ustawień."),
    language: T("Language", "Język"),
    langAuto: T("Automatic", "Automatyczny"),
    reset: T("Reset everything", "Przywróć wszystko"),
    resetConfirm: T("Reset all settings and hidden elements?", "Przywrócić wszystkie ustawienia i ukryte elementy?"),
    pickHint: T("Click the element to hide. Esc cancels.", "Kliknij element do ukrycia. Esc anuluje."),
    pickHide: T("Hide it", "Ukryj"),
    pickParent: T("Select parent", "Zaznacz nadrzędny"),
    pickCancel: T("Cancel", "Anuluj"),
    pickDone: T("Hidden. Undo it in the extension popup → Tools.", "Ukryto. Cofniesz to w oknie wtyczki → Narzędzia."),
  };

  function lang(pref) {
    if (pref === "en" || pref === "pl") return pref;
    const nav = (global.navigator && (global.navigator.language || "")) || "en";
    return /^pl/i.test(nav) ? "pl" : "en";
  }
  const tr = (obj, l) => (obj && (obj[l] != null ? obj[l] : obj.en)) || "";

  /* ---------------------------------------------------------- normalize */

  const MAX_CUSTOM = 200;

  function validSelector(s, doc) {
    if (typeof s !== "string") return false;
    const v = s.trim();
    if (!v || v.length > 400 || /[{};]/.test(v) || v.includes("/*")) return false;
    try {
      (doc || global.document).createDocumentFragment().querySelector(v);
      return true;
    } catch (e) {
      return false;
    }
  }

  function cleanCustom(list, doc) {
    if (!Array.isArray(list)) return [];
    const out = [];
    for (const raw of list) {
      if (typeof raw !== "string") continue;
      const v = raw.trim();
      if (out.includes(v) || !validSelector(v, doc)) continue;
      out.push(v);
      if (out.length >= MAX_CUSTOM) break;
    }
    return out;
  }

  function cleanValue(item, value) {
    if (item.type === "toggle") return typeof value === "boolean" ? value : item.def === true;
    const allowed = item.options.map((o) => o.v);
    return allowed.includes(value) ? value : item.def;
  }

  /** Always returns a complete, type-safe settings object. */
  function normalize(stored, doc) {
    const src = stored && typeof stored === "object" ? stored : {};
    const out = {};
    for (const item of ITEMS) out[item.key] = cleanValue(item, src[item.key]);
    out.customHide = cleanCustom(src.customHide, doc);
    out.enabled = src.enabled !== false;
    out.uiLang = ["auto", "en", "pl"].includes(src.uiLang) ? src.uiLang : "auto";
    return out;
  }

  /** Settings with every feature switched off (used while the extension is paused). */
  function allOff() {
    const out = {};
    for (const item of ITEMS) out[item.key] = item.type === "toggle" ? false : item.key === "columns" ? 0 : "home";
    out.customHide = [];
    out.enabled = false;
    out.uiLang = "auto";
    return out;
  }

  /* ------------------------------------------------------ import/export */

  const PREFIX = "YTC1.";

  function toBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin);
  }
  function fromBase64(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  }

  /** Compact string holding only what differs from the defaults. */
  function encode(settings) {
    const s = normalize(settings);
    const diff = {};
    for (const item of ITEMS) if (s[item.key] !== DEFAULTS[item.key]) diff[item.key] = s[item.key];
    if (s.customHide.length) diff.customHide = s.customHide;
    return PREFIX + toBase64(JSON.stringify(diff));
  }

  /** Returns {ok, settings, count} or {ok:false}. Unknown / invalid keys are ignored. */
  function decode(text, doc) {
    try {
      let t = String(text || "").replace(/\s+/g, "");
      if (t.startsWith(PREFIX)) t = t.slice(PREFIX.length);
      if (!t || t.length > 200000) return { ok: false };
      const data = JSON.parse(fromBase64(t));
      if (!data || typeof data !== "object" || Array.isArray(data)) return { ok: false };
      const picked = {};
      let count = 0;
      for (const item of ITEMS) {
        if (!Object.prototype.hasOwnProperty.call(data, item.key)) continue;
        const clean = cleanValue(item, data[item.key]);
        if (clean !== data[item.key]) continue;
        picked[item.key] = clean;
        count++;
      }
      if (Object.prototype.hasOwnProperty.call(data, "customHide")) {
        picked.customHide = cleanCustom(data.customHide, doc);
        count += picked.customHide.length;
      }
      return { ok: true, settings: picked, count };
    } catch (e) {
      return { ok: false };
    }
  }

  /* ------------------------------------------------------------ redirects */

  const REDIRECTS = {
    subscriptions: "/feed/subscriptions",
    history: "/feed/history",
    library: "/feed/library",
    watchLater: "/playlist?list=WL",
  };

  /** Where should this URL be sent instead? null = stay. */
  function redirectTarget(loc, s) {
    const path = loc.pathname || "/";
    if (s.redirectShorts) {
      const m = /^\/shorts\/([\w-]{5,})/.exec(path);
      if (m) return "/watch?v=" + m[1];
    }
    if (path === "/" && REDIRECTS[s.homeRedirect]) return REDIRECTS[s.homeRedirect];
    return null;
  }

  /* ------------------------------------------------- element picker helper */

  const SAFE_ID = /^[A-Za-z][\w-]{0,40}$/;
  const SAFE_CLASS = /^[A-Za-z][A-Za-z-]{2,30}$/;

  /** Builds a short CSS selector that matches exactly this element. */
  function selectorFor(el, doc) {
    const d = doc || el.ownerDocument;
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && node !== d.documentElement) {
      const tag = node.tagName.toLowerCase();
      let part = tag;
      if (node.id && SAFE_ID.test(node.id) && !/\d{4,}/.test(node.id)) {
        part = "#" + node.id;
      } else {
        const classes = [...node.classList].filter((c) => SAFE_CLASS.test(c) && !c.startsWith("ytc-")).slice(0, 2);
        part = tag + classes.map((c) => "." + c).join("");
        const parent = node.parentElement;
        if (parent) {
          const same = [...parent.children].filter((c) => c.tagName === node.tagName);
          const sameClass = classes.length ? same.filter((c) => classes.every((k) => c.classList.contains(k))) : same;
          if (sameClass.length > 1) part += ":nth-of-type(" + (same.indexOf(node) + 1) + ")";
        }
      }
      parts.unshift(part);
      const sel = parts.join(" > ");
      let hits;
      try { hits = d.querySelectorAll(sel); } catch (e) { hits = []; }
      if (hits.length === 1 && hits[0] === el) return sel;
      if (part.startsWith("#")) break;
      node = node.parentElement;
    }
    return parts.join(" > ");
  }

  global.YTC = {
    PANELS, ITEMS, BY_KEY, TOGGLES, DEFAULTS, GROUPS, ITEM_PANEL, UI, REDIRECTS,
    cls, kebab, buildCss, lang, tr, normalize, allOff, encode, decode,
    redirectTarget, validSelector, cleanCustom, selectorFor, MAX_CUSTOM,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = global.YTC;
})(typeof globalThis !== "undefined" ? globalThis : this);
