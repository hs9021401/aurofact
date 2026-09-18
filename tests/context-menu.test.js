const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectRoot = path.resolve(__dirname, "..");
const backgroundSource = fs.readFileSync(path.join(projectRoot, "background.js"), "utf8");
const contentSource = fs.readFileSync(path.join(projectRoot, "content.js"), "utf8");

assert.match(backgroundSource, /id:\s*["']open_panel["']/);
assert.match(backgroundSource, /contextOpenPanel/);
assert.match(backgroundSource, /info\.menuItemId === ["']open_panel["']/);
assert.match(backgroundSource, /action:\s*["']OPEN_PANEL["']/);
assert.match(backgroundSource, /contexts:\s*\[["']page["'],\s*["']frame["']\]/);

const openPanelStart = contentSource.indexOf("function openFloatingPanel()");
assert.ok(openPanelStart >= 0, "openFloatingPanel should exist");
const openPanelEnd = contentSource.indexOf("\n  // Fetch profiles from background", openPanelStart);
assert.ok(openPanelEnd > openPanelStart, "openFloatingPanel should end before profile loading");
const openPanelSource = contentSource.slice(openPanelStart, openPanelEnd);
assert.match(openPanelSource, /ensureUI\(\)/);
assert.match(openPanelSource, /standalonePanelOpen = true/);
assert.doesNotMatch(openPanelSource, /extractPageContent|startInitialSummary|executeStreamRequest/);

const i18nContext = {};
vm.createContext(i18nContext);
vm.runInContext(fs.readFileSync(path.join(projectRoot, "i18n.js"), "utf8"), i18nContext);
const i18n = i18nContext.WebSummarizerI18n;
for (const locale of i18n.supportedLocales) {
  assert.notStrictEqual(i18n.translate(locale, "contextOpenPanel"), "contextOpenPanel", `${locale} is missing contextOpenPanel`);
}

console.log("Context menu open-panel checks passed.");
