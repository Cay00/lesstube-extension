(() => {
  "use strict";

  const Y = globalThis.YTC;
  const $ = (selector) => document.querySelector(selector);

  const TOOLS_ICON = '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>';

  let settings = Y.normalize({});
  let lang = "en";
  let current = "home";
  let query = "";

  const MASTER_OF = {};
  for (const [master, kids] of Object.entries(Y.GROUPS)) for (const key of kids) MASTER_OF[key] = master;

  /* ------------------------------------------------------------- helpers */

  function h(tag, attrs, ...kids) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value == null || value === false) continue;
      if (key === "class") node.className = value;
      else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else if (key === "checked" || key === "value" || key === "disabled" || key === "readOnly") node[key] = value;
      else node.setAttribute(key, value === true ? "" : value);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) node.append(kid);
    return node;
  }

  const svg = (inner) => {
    const wrap = document.createElement("div");
    wrap.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + inner + "</svg>";
    return wrap.firstChild;
  };

  const tx = (obj) => Y.tr(obj, lang);
  const t = (key, vars) => {
    let text = Y.tr(Y.UI[key], lang);
    for (const [name, value] of Object.entries(vars || {})) text = text.replace("{" + name + "}", value);
    return text;
  };

  let toastTimer = 0;
  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
  }

  function persist(patch) {
    chrome.storage.local.set(patch);
  }

  const isLocked = (key) => Boolean(MASTER_OF[key] && settings[MASTER_OF[key]]);

  /* --------------------------------------------------------------- rows */

  function setValue(key, value) {
    settings[key] = value;
    persist({ [key]: value });
    if (Y.GROUPS[key]) refreshLocks();
    renderRail();
  }

  function refreshLocks() {
    for (const row of document.querySelectorAll(".row[data-key]")) {
      const locked = isLocked(row.dataset.key);
      row.classList.toggle("locked", locked);
      const input = row.querySelector("input");
      if (input) input.disabled = locked;
    }
  }

  function textBlock(item, crumb) {
    return h(
      "span",
      { class: "txt" },
      tx(item.label),
      item.hint ? h("span", { class: "hint" }, tx(item.hint)) : null,
      crumb ? h("span", { class: "crumb" }, crumb) : null
    );
  }

  function toggleRow(item, opts) {
    const o = opts || {};
    const locked = isLocked(item.key);
    const input = h("input", { type: "checkbox", role: "switch", checked: settings[item.key], disabled: locked });
    input.addEventListener("change", () => setValue(item.key, input.checked));
    return h(
      "label",
      { class: "row" + (o.master ? " master" : "") + (locked ? " locked" : ""), "data-key": item.key },
      textBlock(item, o.crumb),
      input,
      h("span", { class: "track", "aria-hidden": "true" })
    );
  }

  function selectRow(item, opts) {
    const numeric = typeof item.options[0].v === "number";
    const select = h("select", { name: item.key });
    for (const option of item.options) select.append(h("option", { value: String(option.v) }, tx(option.l)));
    select.value = String(settings[item.key]);
    select.addEventListener("change", () => setValue(item.key, numeric ? Number(select.value) : select.value));
    return h("label", { class: "row row-select", "data-key": item.key }, textBlock(item, opts && opts.crumb), select);
  }

  const rowFor = (item, opts) => (item.type === "select" ? selectRow(item, opts) : toggleRow(item, opts));

  /* -------------------------------------------------------------- panels */

  function renderPanel(panel) {
    const nodes = [h("h2", {}, tx(panel.title)), h("p", { class: "lede" }, tx(panel.desc))];
    for (const section of panel.sections) {
      const sec = h("section", { class: "sec" }, h("h3", {}, tx(section.title)));
      if (section.master) {
        sec.append(toggleRow(section.master, { master: true }));
        sec.append(h("div", { class: "kids" }, section.items.map((item) => rowFor(item))));
      } else {
        sec.append(...section.items.map((item) => rowFor(item)));
      }
      nodes.push(sec);
    }
    return nodes;
  }

  function renderSearch(q) {
    const needle = q.toLowerCase();
    const hits = [];
    for (const panel of Y.PANELS) {
      for (const section of panel.sections) {
        const list = (section.master ? [section.master] : []).concat(section.items);
        for (const item of list) {
          const hay = [item.label.en, item.label.pl, item.hint ? item.hint.en : "", item.hint ? item.hint.pl : "", section.title.en, section.title.pl, panel.title.en, panel.title.pl]
            .join(" ")
            .toLowerCase();
          if (hay.includes(needle)) hits.push(rowFor(item, { crumb: tx(panel.title) + " › " + tx(section.title) }));
        }
      }
    }
    if (!hits.length) return [h("p", { class: "empty" }, t("noResults", { q }))];
    return [h("h2", {}, "“" + q + "”"), h("p", { class: "lede" }, ""), h("section", { class: "sec" }, hits)];
  }

  /* --------------------------------------------------------------- tools */

  function renderTools() {
    const exportBox = h("textarea", { readOnly: true, rows: "3", "aria-label": t("export"), value: Y.encode(settings) });
    const importBox = h("textarea", { rows: "3", placeholder: t("importPlaceholder"), "aria-label": t("import") });
    const adder = h("input", { type: "text", placeholder: t("selectorPlaceholder"), spellcheck: "false", "aria-label": t("selectorPlaceholder") });

    const addSelector = () => {
      const value = adder.value.trim();
      if (!value) return;
      if (!Y.validSelector(value)) return toast(t("badSelector"));
      settings.customHide = Y.cleanCustom(settings.customHide.concat(value));
      persist({ customHide: settings.customHide });
      render();
    };
    adder.addEventListener("keydown", (e) => e.key === "Enter" && addSelector());

    const hiddenList = settings.customHide.length
      ? h(
          "ul",
          { class: "hidden-list" },
          settings.customHide.map((selector) =>
            h(
              "li",
              {},
              h("code", {}, selector),
              h("button", {
                type: "button",
                class: "icon-btn",
                title: t("remove"),
                "aria-label": t("remove") + ": " + selector,
                onclick: () => {
                  settings.customHide = settings.customHide.filter((s) => s !== selector);
                  persist({ customHide: settings.customHide });
                  render();
                },
              }, "×")
            )
          )
        )
      : h("p", { class: "note" }, t("noneHidden"));

    const langSelect = h("select", { "aria-label": t("language") });
    for (const [value, label] of [["auto", t("langAuto")], ["en", "English"], ["pl", "Polski"]]) langSelect.append(h("option", { value }, label));
    langSelect.value = settings.uiLang;
    langSelect.addEventListener("change", () => {
      settings.uiLang = langSelect.value;
      lang = Y.lang(settings.uiLang);
      persist({ uiLang: settings.uiLang });
      applyStaticText();
      render();
    });

    return [
      h("h2", {}, t("tools")),
      h("p", { class: "lede" }, t("toolsDesc")),

      h("section", { class: "sec" }, h("h3", {}, t("picker")), h("p", { class: "note" }, t("pickerHint")),
        h("div", { class: "stack" },
          h("button", { type: "button", class: "btn primary wide", id: "pick", onclick: startPick }, t("pick")),
          h("div", { class: "adder" }, adder, h("button", { type: "button", class: "btn", onclick: addSelector }, t("add"))),
          hiddenList)),

      h("section", { class: "sec" }, h("h3", {}, t("backup")), h("p", { class: "note" }, t("backupHint")),
        h("div", { class: "stack" },
          exportBox,
          h("button", { type: "button", class: "btn wide", id: "copy", onclick: () => copyText(exportBox) }, t("copy")),
          importBox,
          h("button", { type: "button", class: "btn wide", id: "import", onclick: () => doImport(importBox) }, t("import")))),

      h("section", { class: "sec" }, h("h3", {}, t("language")),
        h("label", { class: "row row-select" }, h("span", { class: "txt" }, t("language")), langSelect),
        h("div", { class: "stack" },
          h("button", { type: "button", class: "btn danger wide", id: "reset", onclick: doReset }, t("reset")))),

      h("p", { class: "foot" }, "Customizer for YouTube " + chrome.runtime.getManifest().version),
    ];
  }

  function startPick() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs && tabs[0];
      if (!tab || tab.id == null) return toast(t("pickNeedTab"));
      chrome.tabs.sendMessage(tab.id, { type: "ytc-pick" }, (response) => {
        if (chrome.runtime.lastError || !response) return toast(t("pickNeedTab"));
        window.close();
      });
    });
  }

  async function copyText(box) {
    box.focus();
    box.select();
    let ok = false;
    try {
      await navigator.clipboard.writeText(box.value);
      ok = true;
    } catch (e) {
      try { ok = document.execCommand("copy"); } catch (e2) { ok = false; }
    }
    if (ok) toast(t("copied"));
  }

  function doImport(box) {
    const result = Y.decode(box.value);
    if (!result.ok) return toast(t("importBad"));
    const next = Y.normalize(Object.assign({}, result.settings, { enabled: settings.enabled, uiLang: settings.uiLang }));
    settings = next;
    persist(next);
    render();
    toast(t("importDone", { n: result.count }));
  }

  function doReset() {
    if (!window.confirm(t("resetConfirm"))) return;
    settings = Y.normalize({ uiLang: settings.uiLang, enabled: settings.enabled });
    persist(settings);
    render();
    toast(t("applied"));
  }

  /* ------------------------------------------------------- rail + render */

  function activeCount(panel) {
    let n = 0;
    for (const section of panel.sections) {
      for (const item of (section.master ? [section.master] : []).concat(section.items)) {
        if (item.type === "toggle" && settings[item.key]) n++;
      }
    }
    return n;
  }

  function renderRail() {
    const rail = $("#rail");
    rail.replaceChildren();
    const add = (id, title, icon, count) => {
      const button = h(
        "button",
        {
          type: "button",
          title,
          "aria-label": title,
          "aria-current": !query && current === id ? "page" : null,
          onclick: () => {
            current = id;
            query = "";
            $("#q").value = "";
            try { localStorage.setItem("ytc-panel", id); } catch (e) { /* ignore */ }
            render();
          },
        },
        svg(icon),
        count > 0 ? h("span", { class: "badge", "aria-label": t("active", { n: count }) }, String(count)) : null
      );
      rail.append(button);
    };
    for (const panel of Y.PANELS) add(panel.id, tx(panel.title), panel.icon, activeCount(panel));
    rail.append(h("span", { class: "grow" }));
    add("tools", t("tools"), TOOLS_ICON, settings.customHide.length);
  }

  function render() {
    renderRail();
    const main = $("#main");
    let nodes;
    if (query.trim()) nodes = renderSearch(query.trim());
    else if (current === "tools") nodes = renderTools();
    else nodes = renderPanel(Y.PANELS.find((p) => p.id === current) || Y.PANELS[0]);
    if (!settings.enabled) nodes.unshift(h("p", { class: "paused-note" }, t("pausedNote")));
    main.replaceChildren(...nodes);
    main.scrollTop = 0;
  }

  function applyStaticText() {
    document.documentElement.lang = lang;
    $("#subtitle").textContent = t("subtitle");
    $("#q").placeholder = t("search");
    $("#q").setAttribute("aria-label", t("search"));
    $("#powerLabel").textContent = settings.enabled ? t("on") : t("paused");
    $("#app").classList.toggle("paused", !settings.enabled);
  }

  /* ---------------------------------------------------------------- boot */

  function init(stored) {
    settings = Y.normalize(stored);
    lang = Y.lang(settings.uiLang);
    try {
      const saved = localStorage.getItem("ytc-panel");
      if (saved && (saved === "tools" || Y.PANELS.some((p) => p.id === saved))) current = saved;
    } catch (e) { /* ignore */ }

    const power = $("#enabled");
    power.checked = settings.enabled;
    power.addEventListener("change", () => {
      settings.enabled = power.checked;
      persist({ enabled: settings.enabled });
      applyStaticText();
      render();
    });

    $("#q").addEventListener("input", (e) => {
      query = e.target.value;
      render();
    });
    $("#q").addEventListener("keydown", (e) => {
      if (e.key === "Escape" && query) {
        e.preventDefault();
        e.stopPropagation();
        query = "";
        e.target.value = "";
        render();
      }
    });

    applyStaticText();
    render();
  }

  chrome.storage.local.get(null, init);

  // The element picker saves from the page while the popup is closed, but keep the list in sync if it is open.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes.customHide) return;
    const next = Y.cleanCustom(changes.customHide.newValue);
    if (JSON.stringify(next) === JSON.stringify(settings.customHide)) return;
    settings.customHide = next;
    render();
  });
})();
