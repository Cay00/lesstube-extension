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
  hideMasthead: [
    "hideMastheadMenu",
    "hideMastheadLogo",
    "hideMastheadSearch",
    "hideMastheadMic",
    "hideMastheadUpload",
    "hideMastheadNotifications",
    "hideMastheadAvatar",
  ],
  hideSecondary: [
    "hideRelated",
    "hideLiveChat",
    "hideWatchPlaylist",
    "hideFundraiser",
    "hideAutoplayCard",
    "hideRelatedAds",
    "hideRelatedShorts",
    "hideRelatedChips",
  ],
  hideComments: [
    "hideCommentBox",
    "hideCommentAvatars",
    "hideCommentLikes",
    "hideCommentReplies",
    "hideCommentHearts",
    "hideCommentBadges",
    "hideCommentPinned",
    "hideCommentSort",
    "hideCommentHeader",
    "hideCommentTime",
  ],
};

const form = document.querySelector("form");
const picker = document.querySelector(".picker");
const pickerButton = picker.querySelector(".picker-button");
const pickerMenu = picker.querySelector(".picker-menu");
const pickerLabel = picker.querySelector(".picker-label");
const menuItems = picker.querySelectorAll(".menu-item");
const PANEL_KEY = "ytc-panel";

function setMenuOpen(open) {
  picker.classList.toggle("is-open", open);
  pickerButton.setAttribute("aria-expanded", String(open));
  pickerMenu.hidden = !open;
}

function showPanel(id) {
  const panel = form.querySelector(`fieldset[data-panel="${id}"]`);
  if (!panel) {
    if (id !== "home") showPanel("home");
    return;
  }
  for (const item of menuItems) {
    const active = item.dataset.panel === id;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-selected", String(active));
    if (active) pickerLabel.textContent = item.dataset.label || item.textContent.trim();
  }
  for (const fieldset of form.querySelectorAll("fieldset")) {
    fieldset.hidden = fieldset.dataset.panel !== id;
  }
  setMenuOpen(false);
  sessionStorage.setItem(PANEL_KEY, id);
}

pickerButton.addEventListener("click", () => setMenuOpen(pickerMenu.hidden));

for (const item of menuItems) {
  item.addEventListener("click", () => showPanel(item.dataset.panel));
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuOpen(false);
});

showPanel(sessionStorage.getItem(PANEL_KEY) || "home");

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
