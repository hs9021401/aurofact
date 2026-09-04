// popup.js - AUROFACT Extension Popup Logic with Multi-Profile Selector

const I18N = globalThis.WebSummarizerI18n;

if (!I18N) {
  throw new Error("Shared i18n data was not loaded.");
}

document.addEventListener("DOMContentLoaded", async () => {
  const profileSelect = document.getElementById("popup-profile-select");
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");
  const statusSub = document.getElementById("status-sub");
  const btnSummarizeNow = document.getElementById("btn-summarize-now");
  const btnOpenOptions = document.getElementById("btn-open-options");

  let loadedProfiles = [];
  let currentLocale = I18N.defaultLocale;

  function t(key, values = {}) {
    return I18N.translate(currentLocale, key, values);
  }

  function applyTranslations() {
    const locale = I18N.getLocale(currentLocale);
    document.documentElement.lang = locale.htmlLang;
    document.title = t("popupPageTitle");

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(element.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
      element.alt = t(element.getAttribute("data-i18n-alt"));
    });
  }

  function loadProfiles() {
    // Load all profiles
    chrome.runtime.sendMessage({ action: "GET_PUBLIC_PROFILES" }, (response) => {
      if (chrome.runtime.lastError || !response?.success) {
        statusDot.className = "status-indicator unconfigured";
        statusText.textContent = t("profileLoadFailed");
        statusSub.textContent = "";
        return;
      }

      loadedProfiles = response.profiles || [];
      const activeId = response.activeProfileId;

      profileSelect.textContent = "";
      loadedProfiles.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.name} (${p.model})`;
        if (p.id === activeId) {
          opt.selected = true;
        }
        profileSelect.appendChild(opt);
      });

      updateStatusUI(response.activeProfile);
    });
  }

  // Switch active profile when dropdown changes
  profileSelect.addEventListener("change", () => {
    const selectedId = profileSelect.value;
    chrome.runtime.sendMessage({ action: "SET_ACTIVE_PROFILE", profileId: selectedId }, () => {
      const selectedP = loadedProfiles.find((p) => p.id === selectedId);
      updateStatusUI(selectedP);
    });
  });

  function updateStatusUI(profile) {
    if (!profile) return;
    const isOllama = Boolean(profile.isLocal);
    const hasKey = Boolean(profile.hasKey) || isOllama;

    if (hasKey) {
      statusDot.className = "status-indicator ready";
      statusText.textContent = t("popupStatusReady");
      statusSub.textContent = t("popupStatusConfigured", { name: profile.name, model: profile.model });
    } else {
      statusDot.className = "status-indicator unconfigured";
      statusText.textContent = t("popupStatusNoKey");
      statusSub.textContent = t("popupStatusConfigure", { name: profile.name });
    }
  }

  // Read the same locale selected on the options page before rendering any Popup content.
  chrome.storage.sync.get(["uiLocale"], (items) => {
    if (chrome.runtime.lastError) {
      currentLocale = I18N.defaultLocale;
      applyTranslations();
      statusText.textContent = t("profileLoadFailed");
      statusSub.textContent = "";
      return;
    }

    currentLocale = I18N.normalizeLocale(items?.uiLocale);
    applyTranslations();
    loadProfiles();
  });

  // Open Options
  btnOpenOptions.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  // Trigger Summary on active tab
  btnSummarizeNow.addEventListener("click", async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) return;

      const payload = {
        action: "TRIGGER_SUMMARY",
        isSelection: false,
        selectionText: null
      };

      try {
        await chrome.tabs.sendMessage(tab.id, payload);
      } catch (err) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["i18n.js", "youtube-utils.js", "prompt-safety.js", "input-behavior.js", "content.js"]
        });
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, payload).catch((e) => {
            console.error("Failed to trigger summary:", e);
          });
        }, 100);
      }

      window.close();
    } catch (e) {
      console.error("Cannot summarize current tab:", e);
    }
  });
});
