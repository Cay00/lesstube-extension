const DEFAULTS = { hideShorts: true, hideGames: true, columns: 4 };
const form = document.querySelector("form");
const columns = form.elements.columns;

function clampColumns(value) {
  const count = Number(value);
  if (!Number.isInteger(count) || count < 3 || count > 7) return 4;
  return count;
}

chrome.storage.local.get(DEFAULTS, (settings) => {
  columns.value = String(clampColumns(settings.columns));
  for (const input of form.querySelectorAll('input[type="checkbox"]')) {
    input.checked = settings[input.name] !== false;
  }
});

function save() {
  const settings = { columns: clampColumns(columns.value) };
  for (const input of form.querySelectorAll('input[type="checkbox"]')) {
    settings[input.name] = input.checked;
  }
  chrome.storage.local.set(settings);
}

form.addEventListener("change", save);
