const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectRoot = path.resolve(__dirname, "..");

class FakeElement {
  constructor(id, attributes = {}) {
    this.id = id;
    this.attributes = attributes;
    this.textContent = "";
    this.innerHTML = "";
    this.value = "";
    this.alt = "";
    this.className = "";
    this.children = [];
    this.listeners = {};
  }

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  getAttribute(name) {
    return this.attributes[name] || null;
  }

  appendChild(child) {
    this.children.push(child);
  }
}

async function runPopup(locale) {
  const ids = [
    "popup-profile-select",
    "status-dot",
    "status-text",
    "status-sub",
    "btn-summarize-now",
    "btn-open-options"
  ];
  const elements = Object.fromEntries(ids.map((id) => [id, new FakeElement(id)]));
  elements["status-text"].attributes["data-i18n"] = "popupStatusLoading";
  elements["status-sub"].attributes["data-i18n"] = "popupStatusReading";
  const translatedElements = [
    new FakeElement("app-title", { "data-i18n": "appTitle" }),
    new FakeElement("profile-label", { "data-i18n": "popupProfileLabel" }),
    elements["status-text"],
    elements["status-sub"],
    new FakeElement("summarize-label", { "data-i18n": "popupSummarizeNow" }),
    new FakeElement("options-label", { "data-i18n": "popupOpenOptions" }),
    new FakeElement("tip-label", { "data-i18n": "popupTipLabel" }),
    new FakeElement("tip-text", { "data-i18n": "popupTipText" })
  ];
  const altElements = [new FakeElement("logo", { "data-i18n-alt": "logoAlt" })];
  const document = {
    documentElement: { lang: "" },
    title: "",
    addEventListener(type, handler) {
      if (type === "DOMContentLoaded") handler();
    },
    getElementById(id) {
      return elements[id];
    },
    querySelectorAll(selector) {
      if (selector === "[data-i18n]") return translatedElements;
      if (selector === "[data-i18n-alt]") return altElements;
      return [];
    },
    createElement() {
      return new FakeElement("option");
    }
  };
  const context = {
    document,
    console,
    setTimeout,
    clearTimeout,
    WebSummarizerI18n: undefined,
    chrome: {
      storage: {
        sync: {
          get(keys, callback) {
            callback({ uiLocale: locale });
          }
        }
      },
      runtime: {
        sendMessage(request, callback) {
          if (request.action === "GET_PROFILES") {
            callback({
              success: true,
              activeProfileId: "profile-1",
              activeProfile: {
                id: "profile-1",
                name: "Office Profile",
                model: "example-model",
                apiUrl: "https://api.example.com",
                apiKey: "test-key"
              },
              profiles: [{
                id: "profile-1",
                name: "Office Profile",
                model: "example-model",
                apiUrl: "https://api.example.com",
                apiKey: "test-key"
              }]
            });
          }
        }
      }
    },
    window: { close() {} }
  };

  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(projectRoot, "i18n.js"), "utf8"), context);
  vm.runInContext(fs.readFileSync(path.join(projectRoot, "popup.js"), "utf8"), context);
  await new Promise((resolve) => setTimeout(resolve, 0));

  return { elements, document, translatedElements, altElements, i18n: context.WebSummarizerI18n };
}

(async () => {
  const locales = ["zh-TW", "en", "ja", "ko", "zh-CN", "fr", "es", "de", "vi", "th", "id"];
  for (const locale of locales) {
    const { elements, document, translatedElements, altElements, i18n } = await runPopup(locale);
    assert.strictEqual(document.documentElement.lang, i18n.getLocale(locale).htmlLang);
    assert.strictEqual(document.title, i18n.translate(locale, "popupPageTitle"));
    assert.strictEqual(elements["status-text"].textContent, i18n.translate(locale, "popupStatusReady"));
    assert.strictEqual(elements["status-sub"].textContent, i18n.translate(locale, "popupStatusConfigured", {
      name: "Office Profile",
      model: "example-model"
    }));
    assert.strictEqual(translatedElements[0].textContent, "AUROFACT");
    assert.notStrictEqual(translatedElements[1].textContent, "popupProfileLabel");
    assert.notStrictEqual(translatedElements[5].textContent, "popupOpenOptions");
    assert.strictEqual(altElements[0].alt, i18n.translate(locale, "logoAlt"));
  }

  const popupHtml = fs.readFileSync(path.join(projectRoot, "popup.html"), "utf8");
  assert.match(popupHtml, /<script src="i18n\.js"><\/script>/);
  assert.match(popupHtml, /data-i18n="popupSummarizeNow"/);

  console.log("Popup i18n regression checks passed.");
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
