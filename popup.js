// popup.js - Extension Popup Logic with Multi-Profile Selector

document.addEventListener("DOMContentLoaded", async () => {
  const profileSelect = document.getElementById("popup-profile-select");
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");
  const statusSub = document.getElementById("status-sub");
  const btnSummarizeNow = document.getElementById("btn-summarize-now");
  const btnOpenOptions = document.getElementById("btn-open-options");

  let loadedProfiles = [];

  // Load all profiles
  chrome.runtime.sendMessage({ action: "GET_PROFILES" }, (response) => {
    if (response && response.success) {
      loadedProfiles = response.profiles || [];
      const activeId = response.activeProfileId;

      profileSelect.innerHTML = "";
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
    }
  });

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
    const isOllama = profile.apiUrl && profile.apiUrl.includes("localhost");
    const hasKey = (profile.apiKey && profile.apiKey.trim().length > 0) || isOllama;

    if (hasKey) {
      statusDot.className = "status-indicator ready";
      statusText.textContent = "API 已就緒";
      statusSub.textContent = `已配置 ${profile.name} (${profile.model})`;
    } else {
      statusDot.className = "status-indicator unconfigured";
      statusText.textContent = "尚未設定 API Key";
      statusSub.textContent = `請至設定頁填入「${profile.name}」的密鑰`;
    }
  }

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
          files: ["content.js"]
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
