const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectRoot = path.resolve(__dirname, "..");

class FakeElement {
  constructor(id, attributes = {}) {
    this.id = id;
    this.attributes = attributes;
    this.listeners = {};
    this.children = [];
    this.style = {};
    this.classList = { add() {}, remove() {} };
    this.value = "";
    this.textContent = "";
    this.type = "text";
    this.disabled = false;
    this.hidden = false;
    this.innerHTML = "";
    this.throwOnNextInnerHTML = false;
  }

  set innerHTML(value) {
    if (this.throwOnNextInnerHTML) {
      this.throwOnNextInnerHTML = false;
      throw new Error("simulated profile list render failure");
    }
    this._innerHTML = value;
    if (value === "") this.children = [];
  }

  get innerHTML() { return this._innerHTML || ""; }
  addEventListener(type, handler) { this.listeners[type] = handler; }
  getAttribute(name) { return this.attributes[name] || null; }
  setAttribute(name, value) { this.attributes[name] = value; }
  removeAttribute(name) { delete this.attributes[name]; }
  appendChild(child) { this.children.push(child); }
  focus() { this.focused = true; }
  click(event = {}) { return this.listeners.click?.(event); }
  input() { return this.listeners.input?.(); }
  change() { return this.listeners.change?.(); }
}

async function createOptionsPage(locale = "en") {
  const ids = [
    "profile-list", "btn-add-profile", "template-menu", "editing-profile-title",
    "active-status-badge", "btn-set-active", "btn-duplicate-profile", "btn-delete-profile",
    "prof-name", "prof-format", "prof-url", "prof-url-warning", "prof-key",
    "btn-toggle-key", "key-status-badge", "key-help-link", "prof-model", "prof-prompt",
    "btn-reset-prompt", "prof-max-tokens", "val-max-tokens", "prof-temperature",
    "val-temperature", "test-result-box", "btn-test-conn", "test-btn-text",
    "btn-save-all", "toast", "language-select", "app-version"
  ];
  const elements = Object.fromEntries(ids.map((id) => [id, new FakeElement(id)]));
  elements["prof-max-tokens"].min = "512";
  elements["prof-max-tokens"].value = "2048";
  elements["prof-temperature"].value = "0.5";
  elements["prof-format"].value = "openai";
  const templateButtons = [];
  let ready;
  let savedRequest;
  let testRequest;
  let testResponse = {
    success: true,
    hasResponseText: true,
    model: "model-a",
    latency: 12,
    reply: "A real response"
  };
  let saveResponse = { success: true };
  let saveTransportError = null;
  let endpointPermissionGranted = true;
  const consoleErrors = [];
  const translatedElements = [];
  const document = {
    documentElement: { lang: "" },
    title: "",
    addEventListener(type, handler) { if (type === "DOMContentLoaded") ready = handler; },
    getElementById(id) { return elements[id]; },
    querySelectorAll(selector) {
      if (selector === ".template-item") return templateButtons;
      if (selector === "[data-i18n]" || selector === "[data-i18n-placeholder]" ||
          selector === "[data-i18n-title]" || selector === "[data-i18n-alt]" ||
          selector === "[data-i18n-aria-label]") return translatedElements;
      return [];
    },
    createElement(tag) { return new FakeElement(tag); }
  };
  const profile = {
    id: "profile-a", name: "A", model: "model-a", apiFormat: "openai",
    apiUrl: "https://api.example.com/v1", apiKey: "secret-a", systemPrompt: "Prompt",
    systemPromptMode: "custom", maxTokens: 2048, temperature: 0
  };
  const secondProfile = {
    id: "profile-b", name: "B", model: "model-b", apiFormat: "openai",
    apiUrl: "https://api.example.org/v1", apiKey: "secret-b", systemPrompt: "Prompt B",
    systemPromptMode: "custom", maxTokens: 1024, temperature: 0.7
  };
  const context = {
    document,
    URL,
    console: { error(...args) { consoleErrors.push(args); } },
    setTimeout,
    clearTimeout,
    confirm: () => true,
    alert() {},
    chrome: {
      runtime: {
        lastError: null,
        getManifest: () => ({ version: "1.4.0" }),
        sendMessage(request, callback) {
          if (request.action === "GET_PROFILES_FOR_OPTIONS") {
            callback({ success: true, activeProfileId: profile.id, profiles: [profile, secondProfile] });
          } else if (request.action === "TEST_PROFILE_CONNECTION") {
            testRequest = request;
            callback(testResponse);
          } else {
            savedRequest = request;
            if (saveTransportError) {
              context.chrome.runtime.lastError = { message: saveTransportError };
              callback(undefined);
              context.chrome.runtime.lastError = null;
              return;
            }
            callback(saveResponse);
          }
        }
      },
      storage: { sync: { get(_keys, callback) { callback({ uiLocale: locale }); } } },
      permissions: { request(_request, callback) { callback(endpointPermissionGranted); } }
    }
  };
  vm.createContext(context);
  for (const file of ["i18n.js", "profile-view.js", "model-request-policy.js", "options.js"]) {
    vm.runInContext(fs.readFileSync(path.join(projectRoot, file), "utf8"), context, { filename: file });
  }
  ready();
  await new Promise((resolve) => setImmediate(resolve));
  return { elements, i18n: context.WebSummarizerI18n,
    get savedRequest() { return savedRequest; },
    get testRequest() { return testRequest; },
    set saveResponse(value) { saveResponse = value; },
    set saveTransportError(value) { saveTransportError = value; },
    set testResponse(value) { testResponse = value; },
    set endpointPermissionGranted(value) { endpointPermissionGranted = value; },
    consoleErrors };
}

(async () => {
  const page = await createOptionsPage();
  const { elements } = page;

  assert.strictEqual(elements["prof-temperature"].value, 0,
    "loading a valid zero temperature must not replace it with the default");
  assert.strictEqual(elements["prof-key"].type, "password");
  elements["btn-toggle-key"].click();
  assert.strictEqual(elements["prof-key"].type, "text");
  assert.ok(elements["btn-toggle-key"].innerHTML.includes('line x1="1"'),
    "visible key should use the crossed-eye icon");
  elements["profile-list"].children[1].click();
  assert.strictEqual(elements["prof-key"].type, "password",
    "switching profiles must hide the previously revealed API key");
  assert.ok(elements["btn-toggle-key"].innerHTML.includes("<circle"),
    "loading a profile should restore the show-key eye icon");
  assert.ok(!elements["btn-toggle-key"].innerHTML.includes('line x1="1"'),
    "the icon must not remain crossed while the key is hidden");
  assert.strictEqual(elements["prof-key"].value, "secret-b");
  elements["profile-list"].children[0].click();
  assert.strictEqual(elements["prof-key"].value, "secret-a",
    "switching profiles must preserve each profile's editor API key");

  elements["prof-key"].value = "";
  await elements["btn-test-conn"].click();
  assert.strictEqual(page.testRequest, undefined, "connection testing requires an API key for remote endpoints");
  assert.strictEqual(elements["prof-key"].focused, true);
  elements["prof-key"].value = "secret-a";
  await elements["btn-test-conn"].click();
  assert.strictEqual(page.testRequest.action, "TEST_PROFILE_CONNECTION");
  assert.strictEqual(elements["test-result-box"].className, "test-result-box success");
  assert.ok(elements["test-result-box"].innerHTML.includes("A real response"),
    "a response marked as present should display its actual text");

  page.testResponse = {
    success: true, hasResponseText: false, model: "model-a", latency: 10,
    reply: "must not be shown"
  };
  await elements["btn-test-conn"].click();
  assert.ok(elements["test-result-box"].innerHTML.includes(
    page.i18n.translate("en", "testNoResponseText")
  ), "a successful connection without response text should show an explanatory message");
  assert.ok(!elements["test-result-box"].innerHTML.includes("OK"),
    "the options page must not invent an OK reply when no text was returned");
  assert.ok(!elements["test-result-box"].innerHTML.includes("must not be shown"),
    "hasResponseText=false must suppress any reply payload");

  elements["prof-key"].value = "  changed-secret  ";
  elements["prof-key"].input();
  elements["btn-save-all"].click();
  await new Promise((resolve) => setImmediate(resolve));
  assert.strictEqual(page.savedRequest.action, "SAVE_ALL_PROFILES");
  assert.strictEqual(page.savedRequest.profiles[0].apiKey, "changed-secret");
  assert.strictEqual(page.savedRequest.profiles[1].apiKey, "secret-b");
  assert.strictEqual(elements["key-status-badge"].textContent, "Key entered");
  assert.ok(elements.toast.textContent.includes("saved"), "successful save should show a success message");

  const secondPage = await createOptionsPage();
  secondPage.elements["profile-list"].throwOnNextInnerHTML = true;
  secondPage.elements["btn-save-all"].click();
  await new Promise((resolve) => setImmediate(resolve));
  assert.strictEqual(secondPage.savedRequest.action, "SAVE_ALL_PROFILES",
    "the save request must succeed before post-save rendering is attempted");
  assert.strictEqual(secondPage.elements.toast.textContent,
    secondPage.i18n.translate("en", "toastSavedButUiRefreshFailed"),
    "a post-save rendering exception should prompt the user to reload the page");
  assert.ok(!secondPage.elements.toast.textContent.includes("could not be saved"));
  assert.strictEqual(secondPage.consoleErrors.length, 1,
    "post-save rendering errors should be reported for debugging without changing save status");

  const failedSavePage = await createOptionsPage();
  failedSavePage.saveResponse = { success: false, error: "PROFILE_SAVE_FAILED" };
  failedSavePage.elements["btn-save-all"].click();
  await new Promise((resolve) => setImmediate(resolve));
  assert.strictEqual(failedSavePage.elements.toast.textContent,
    failedSavePage.i18n.translate("en", "storageSaveFailed"),
    "an explicit backend save failure must keep the existing failure message");

  const unknownSavePage = await createOptionsPage();
  unknownSavePage.saveTransportError = "The message channel closed before a response arrived.";
  unknownSavePage.elements["btn-save-all"].click();
  await new Promise((resolve) => setImmediate(resolve));
  assert.strictEqual(unknownSavePage.elements.toast.textContent,
    unknownSavePage.i18n.translate("en", "storageSaveStatusUnknown"),
    "a lost response channel must not claim that persistence failed");

  const partialSavePage = await createOptionsPage();
  partialSavePage.saveResponse = { success: false, error: "PROFILE_SAVE_PARTIAL" };
  partialSavePage.elements["btn-save-all"].click();
  await new Promise((resolve) => setImmediate(resolve));
  assert.strictEqual(partialSavePage.elements.toast.textContent,
    partialSavePage.i18n.translate("en", "profileSavePartial"),
    "partial-save responses should tell users to reload and inspect API keys and profiles");

  const cleanupWarningPage = await createOptionsPage();
  cleanupWarningPage.saveResponse = { success: true, warning: "LEGACY_CLEANUP_FAILED" };
  cleanupWarningPage.endpointPermissionGranted = false;
  cleanupWarningPage.elements["profile-list"].throwOnNextInnerHTML = true;
  cleanupWarningPage.elements["btn-save-all"].click();
  await new Promise((resolve) => setImmediate(resolve));
  const cleanupWarning = cleanupWarningPage.i18n.translate("en", "legacyCleanupFailed");
  assert.ok(cleanupWarningPage.elements.toast.textContent.includes(cleanupWarning),
    "the legacy-data cleanup warning must remain visible when other warnings occur");
  assert.ok(cleanupWarningPage.elements.toast.textContent.includes(
    cleanupWarningPage.i18n.translate("en", "toastSavedButUiRefreshFailed")
  ), "the UI refresh warning should also remain visible");
  assert.ok(cleanupWarningPage.elements.toast.textContent.includes(
    cleanupWarningPage.i18n.translate("en", "toastSavedWithoutEndpointPermission")
  ), "the endpoint permission warning should also remain visible");

  const localizationContext = {};
  vm.createContext(localizationContext);
  vm.runInContext(fs.readFileSync(path.join(projectRoot, "i18n.js"), "utf8"), localizationContext);
  const localizedI18n = localizationContext.WebSummarizerI18n;
  const recoveryKeys = [
    "toastSavedButUiRefreshFailed", "profileSavePartial", "legacyCleanupFailed",
    "storageSaveStatusUnknown", "testNoResponseText"
  ];
  for (const locale of localizedI18n.supportedLocales) {
    for (const key of recoveryKeys) {
      assert.notStrictEqual(localizedI18n.translate(locale, key), key,
        `${key} should be translated or fall back for ${locale}`);
    }
  }
  const frenchPartialSave = localizedI18n.locales.fr.strings.profileSavePartial;
  delete localizedI18n.locales.fr.strings.profileSavePartial;
  assert.strictEqual(
    localizedI18n.translate("fr", "profileSavePartial"),
    localizedI18n.translate("zh-TW", "profileSavePartial"),
    "missing locale strings should fall back to the default language"
  );
  localizedI18n.locales.fr.strings.profileSavePartial = frenchPartialSave;
  const frenchCleanupWarning = localizedI18n.locales.fr.strings.legacyCleanupFailed;
  delete localizedI18n.locales.fr.strings.legacyCleanupFailed;
  assert.strictEqual(
    localizedI18n.translate("fr", "legacyCleanupFailed"),
    localizedI18n.translate("zh-TW", "legacyCleanupFailed"),
    "the cleanup warning should also use the default-language fallback"
  );
  localizedI18n.locales.fr.strings.legacyCleanupFailed = frenchCleanupWarning;

  console.log("Options page load, profile switching, API key, and save checks passed.");
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
