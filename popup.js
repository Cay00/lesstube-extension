const DEFAULTS = {
  columns: 4,
  homeRedirect: "home",
  hideShorts: true,
  hideGames: true,
};

const REDIRECTS = ["home", "subscriptions", "history", "library"];
const GROUPS = {
  hideHomeSection: ["hideGuideHome", "hideGuideShorts"],
  hideSubscriptionsSection: ["hideGuideSubscriptions", "expandSubscriptions"],
  hideLibrarySection: [
    "hideGuideYou",
    "hideGuideChannel",
    "hideGuideHistory",
    "hideGuidePlaylists",
    "hideGuideWatchLater",
    "hideGuideLiked",
    "hideGuideYourVideos",
    "hideGuideDownloads",
    "hideGuideCourses",
    "hideGuideClips",
    "hideGuideLibraryShowMore",
  ],
  hideExploreSection: [
    "hideGuideExploreMusic",
    "hideGuideMovies",
    "hideGuideHype",
    "hideGuideLive",
    "hideGuideGaming",
    "hideGuideNews",
    "hideGuideSports",
    "hideGuidePodcasts",
    "hideGuidePlayables",
    "hideGuideSupport",
    "hideGuideExploreShowMore",
  ],
  hideMoreSection: ["hideGuideMusic", "hideGuideKids", "hideGuideReports", "hideGuideFooter"],
};

const form = document.querySelector("form");

function syncGroups() {
  for (const [parent, children] of Object.entries(GROUPS)) {
    const locked = form.elements[parent].checked;
    for (const name of children) form.elements[name].disabled = locked;
  }
}

function clampColumns(value) {
  const count = Number(value);
  if (!Number.isInteger(count) || count < 3 || count > 7) return 4;
  return count;
}

chrome.storage.local.get(null, (stored) => {
  const settings = { ...DEFAULTS, ...stored };
  const redirect = REDIRECTS.includes(settings.homeRedirect) ? settings.homeRedirect : "home";
  form.elements.homeRedirect.value = redirect;
  form.elements.columns.value = String(clampColumns(settings.columns));
  for (const input of form.querySelectorAll('input[type="checkbox"]')) {
    const fallback = input.name === "hideShorts" || input.name === "hideGames";
    input.checked = fallback ? settings[input.name] !== false : settings[input.name] === true;
  }
  syncGroups();
});

function save() {
  const settings = {
    columns: clampColumns(form.elements.columns.value),
    homeRedirect: REDIRECTS.includes(form.elements.homeRedirect.value) ? form.elements.homeRedirect.value : "home",
  };
  for (const input of form.querySelectorAll('input[type="checkbox"]')) {
    settings[input.name] = input.checked;
  }
  syncGroups();
  chrome.storage.local.set(settings);
}

form.addEventListener("change", save);
