// options.js - Multi-Profile API Management Logic

const I18N = globalThis.WebSummarizerI18n;

if (!I18N) {
  throw new Error("Shared i18n data was not loaded.");
}

const TEMPLATES = {
  minimax: {
    apiFormat: "anthropic",
    apiUrl: "https://api.minimaxi.com/anthropic/v1/messages",
    apiKey: "",
    model: "MiniMax-M3",
    maxTokens: 2048,
    temperature: 0.5
  },
  deepseek: {
    apiFormat: "openai",
    apiUrl: "https://api.deepseek.com/chat/completions",
    apiKey: "",
    model: "deepseek-v4-flash",
    maxTokens: 2048,
    temperature: 0.5
  },
  openai: {
    apiFormat: "openai",
    apiUrl: "https://api.openai.com/v1/chat/completions",
    apiKey: "",
    model: "gpt-5.6-luna",
    maxTokens: 2048,
    temperature: 0.5
  },
  claude: {
    apiFormat: "anthropic",
    apiUrl: "https://api.anthropic.com/v1/messages",
    apiKey: "",
    model: "claude-sonnet-5",
    maxTokens: 2048,
    temperature: 0.5
  },
  ollama: {
    apiFormat: "openai",
    apiUrl: "http://localhost:11434/v1/chat/completions",
    apiKey: "",
    model: "gemma4:12b",
    maxTokens: 2048,
    temperature: 0.5
  },
  zai: {
    apiFormat: "openai",
    apiUrl: "https://api.z.ai/api/paas/v4/chat/completions",
    apiKey: "",
    model: "glm-5.3",
    maxTokens: 2048,
    temperature: 0.5
  },
  custom: {
    apiFormat: "openai",
    apiUrl: "https://api.openai.com/v1/chat/completions",
    apiKey: "",
    model: "custom-model",
    maxTokens: 2048,
    temperature: 0.5
  }
};

const TEMPLATE_NAME_KEYS = Object.freeze({
  minimax: "templateMinimaxName",
  deepseek: "templateDeepseekName",
  openai: "templateOpenaiName",
  claude: "templateClaudeName",
  ollama: "templateOllamaName",
  zai: "templateZaiName",
  custom: "templateCustomName"
});

let profiles = [];
let activeProfileId = "";
let selectedProfileId = "";
let currentLocale = I18N.defaultLocale;

document.addEventListener("DOMContentLoaded", () => {
  const profileListEl = document.getElementById("profile-list");
  const btnAddProfile = document.getElementById("btn-add-profile");
  const templateMenu = document.getElementById("template-menu");
  
  const editingProfileTitle = document.getElementById("editing-profile-title");
  const activeStatusBadge = document.getElementById("active-status-badge");
  const btnSetActive = document.getElementById("btn-set-active");
  const btnDuplicateProfile = document.getElementById("btn-duplicate-profile");
  const btnDeleteProfile = document.getElementById("btn-delete-profile");

  const profNameInput = document.getElementById("prof-name");
  const profFormatSelect = document.getElementById("prof-format");
  const profUrlInput = document.getElementById("prof-url");
  const profKeyInput = document.getElementById("prof-key");
  const btnToggleKey = document.getElementById("btn-toggle-key");
  const keyStatusBadge = document.getElementById("key-status-badge");
  const keyHelpLink = document.getElementById("key-help-link");
  const profModelInput = document.getElementById("prof-model");
  const profPromptInput = document.getElementById("prof-prompt");
  const btnResetPrompt = document.getElementById("btn-reset-prompt");
  const profMaxTokensRange = document.getElementById("prof-max-tokens");
  const valMaxTokens = document.getElementById("val-max-tokens");
  const profTemperatureRange = document.getElementById("prof-temperature");
  const valTemperature = document.getElementById("val-temperature");

  const testResultBox = document.getElementById("test-result-box");
  const btnTestConn = document.getElementById("btn-test-conn");
  const testBtnText = document.getElementById("test-btn-text");
  const btnSaveAll = document.getElementById("btn-save-all");
  const toast = document.getElementById("toast");
  const languageSelect = document.getElementById("language-select");
  const appVersion = document.getElementById("app-version");

  if (appVersion) {
    appVersion.textContent = chrome.runtime.getManifest().version;
  }

  languageSelect.addEventListener("change", () => {
    changeLocale(languageSelect.value);
  });

  // Load the selected UI locale before profiles so default prompts are localized on first render.
  chrome.storage.sync.get(["uiLocale"], (items) => {
    currentLocale = I18N.normalizeLocale(items.uiLocale);
    applyTranslations();

    // Load profiles from background/storage
    chrome.runtime.sendMessage({ action: "GET_PROFILES" }, (response) => {
      if (response && response.success) {
        profiles = (response.profiles || []).map((profile) => ({ ...profile }));
        activeProfileId = response.activeProfileId || profiles[0]?.id || "";
        selectedProfileId = activeProfileId;

        migrateManagedPrompts();
        migrateManagedProfileNames();
        renderProfileList();
        loadProfileToEditor(selectedProfileId);
      }
    });
  });

  function t(key, values = {}) {
    return I18N.translate(currentLocale, key, values);
  }

  function getDefaultSystemPrompt() {
    return I18N.getPrompt(currentLocale);
  }

  function applyTranslations() {
    const locale = I18N.getLocale(currentLocale);
    document.documentElement.lang = locale.htmlLang;
    document.title = t("pageTitle");
    languageSelect.value = currentLocale;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(element.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      element.placeholder = t(element.getAttribute("data-i18n-placeholder"));
    });

    document.querySelectorAll("[data-i18n-title]").forEach((element) => {
      element.title = t(element.getAttribute("data-i18n-title"));
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
      element.alt = t(element.getAttribute("data-i18n-alt"));
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", t(element.getAttribute("data-i18n-aria-label")));
    });

    testBtnText.textContent = btnTestConn.disabled ? t("testRunningButton") : t("testConnection");
  }

  function changeLocale(nextLocale) {
    const normalizedLocale = I18N.normalizeLocale(nextLocale);
    if (normalizedLocale === currentLocale) {
      applyTranslations();
      return;
    }

    saveCurrentEditorToMemory();
    currentLocale = normalizedLocale;
    migrateManagedPrompts();
    migrateManagedProfileNames();
    applyTranslations();
    renderProfileList();
    loadProfileToEditor(selectedProfileId);

    chrome.runtime.sendMessage({ action: "SET_UI_LOCALE", locale: currentLocale }, (response) => {
      if (chrome.runtime.lastError || !response?.success) {
        chrome.storage.sync.set({ uiLocale: currentLocale });
      }
      showToast(t("languageChanged", { language: I18N.getLocale(currentLocale).label }));
    });
  }

  function migrateManagedPrompts() {
    profiles.forEach((profile) => {
      const prompt = (profile.systemPrompt || "").trim();
      const mode = profile.systemPromptMode || (I18N.isDefaultPrompt(prompt) ? "default" : "custom");

      if (mode === "default") {
        profile.systemPrompt = getDefaultSystemPrompt();
        profile.systemPromptMode = "default";
        profile.systemPromptLocale = currentLocale;
      } else {
        profile.systemPromptMode = "custom";
        delete profile.systemPromptLocale;
      }
    });
  }

  function migrateManagedProfileNames() {
    const legacyTemplateNames = {
      "🟣 MiniMax-M3": "minimax",
      "🔵 DeepSeek-V3": "deepseek",
      "🔵 DeepSeek V4 Flash": "deepseek",
      "🟢 GPT-4o-mini": "openai",
      "🟢 GPT-5.6 Luna": "openai",
      "🟠 Claude 3.5 Sonnet": "claude",
      "🟠 Claude Sonnet 5": "claude",
      "⚪ Ollama (本地免 Key)": "ollama",
      "⚪ Ollama（本地免 Key）": "ollama",
      "⚪ Ollama · Gemma 4 12B": "ollama",
      "🟡 Z.AI GLM-5.3": "zai",
      "🟡 GLM-5.3": "zai",
      "⚙️ 自訂模型配置": "custom",
      "⚙️ 自訂空白配置": "custom"
    };

    profiles.forEach((profile) => {
      const templateKey = profile.profileNameTemplate ||
        (profile.profileNameMode !== "custom" ? legacyTemplateNames[profile.name] : "");
      const mode = profile.profileNameMode || (templateKey ? "default" : "custom");

      if (mode === "default" && TEMPLATE_NAME_KEYS[templateKey]) {
        profile.name = getTemplateName(templateKey);
        profile.profileNameMode = "default";
        profile.profileNameTemplate = templateKey;
      } else {
        profile.profileNameMode = "custom";
        delete profile.profileNameTemplate;
      }
    });
  }

  function getTemplateName(templateKey) {
    return t(TEMPLATE_NAME_KEYS[templateKey] || TEMPLATE_NAME_KEYS.custom);
  }

  // Render Sidebar Profile List
  function renderProfileList() {
    profileListEl.innerHTML = "";

    profiles.forEach((p) => {
      const isSelected = p.id === selectedProfileId;
      const isActive = p.id === activeProfileId;

      const item = document.createElement("div");
      item.className = `profile-item ${isSelected ? "selected" : ""}`;
      item.setAttribute("data-id", p.id);

      const formatLabel = p.apiFormat === "anthropic" ? t("protocolAnthropic") : t("protocolOpenAI");
      const profileName = p.name || t("unnamedProfile");
      const modelName = p.model || t("unsetModel");

      item.innerHTML = `
        <div class="prof-info">
          <span class="prof-title">${escapeHtml(profileName)}</span>
          <div class="prof-meta">
            <span class="prof-tag">${formatLabel}</span>
            <span>${escapeHtml(modelName)}</span>
          </div>
        </div>
        <div>
          ${isActive ? `<span class="prof-active-pill">${t("activePill")}</span>` : ""}
        </div>
      `;

      item.addEventListener("click", () => {
        saveCurrentEditorToMemory();
        selectedProfileId = p.id;
        renderProfileList();
        loadProfileToEditor(selectedProfileId);
      });

      profileListEl.appendChild(item);
    });
  }

  // Load Profile data into Right Editor
  function loadProfileToEditor(profileId) {
    const p = profiles.find((item) => item.id === profileId);
    if (!p) return;

    editingProfileTitle.textContent = t("editingProfile", { name: p.name || t("unnamedProfile") });
    
    const isActive = p.id === activeProfileId;
    if (isActive) {
      activeStatusBadge.textContent = t("activeDefault");
      activeStatusBadge.className = "badge-active-status";
      btnSetActive.style.display = "none";
    } else {
      activeStatusBadge.textContent = t("inactive");
      activeStatusBadge.className = "badge-active-status inactive";
      btnSetActive.style.display = "inline-flex";
    }

    profNameInput.value = p.name || "";
    profFormatSelect.value = p.apiFormat || "anthropic";
    profUrlInput.value = p.apiUrl || "";
    profKeyInput.value = p.apiKey || "";
    profModelInput.value = p.model || "";
    if (!p.systemPrompt) {
      p.systemPrompt = getDefaultSystemPrompt();
      p.systemPromptMode = "default";
      p.systemPromptLocale = currentLocale;
    }
    profPromptInput.value = p.systemPrompt;
    
    profMaxTokensRange.value = p.maxTokens || 2048;
    valMaxTokens.textContent = profMaxTokensRange.value;

    profTemperatureRange.value = p.temperature || 0.5;
    valTemperature.textContent = profTemperatureRange.value;

    updateKeyStatus(p.apiKey, p.apiUrl);
    updateHelpLink(p.apiUrl);
    testResultBox.style.display = "none";
  }

  // Save current editor inputs into memory array
  function saveCurrentEditorToMemory() {
    const p = profiles.find((item) => item.id === selectedProfileId);
    if (!p) return;

    p.name = profNameInput.value.trim();
    p.apiFormat = profFormatSelect.value;
    p.apiUrl = profUrlInput.value.trim();
    p.apiKey = profKeyInput.value.trim();
    p.model = profModelInput.value.trim();
    const systemPrompt = profPromptInput.value.trim();
    p.systemPrompt = systemPrompt || getDefaultSystemPrompt();
    const isManagedDefault = !systemPrompt || (p.systemPromptMode !== "custom" && I18N.isDefaultPrompt(systemPrompt));
    if (isManagedDefault) {
      p.systemPromptMode = "default";
      p.systemPromptLocale = currentLocale;
    } else {
      p.systemPromptMode = "custom";
      delete p.systemPromptLocale;
    }
    p.maxTokens = parseInt(profMaxTokensRange.value, 10);
    p.temperature = parseFloat(profTemperatureRange.value);
  }

  // Live update sidebar name as user types
  profNameInput.addEventListener("input", () => {
    const p = profiles.find((item) => item.id === selectedProfileId);
    if (p) {
      p.name = profNameInput.value;
      p.profileNameMode = "custom";
      delete p.profileNameTemplate;
      renderProfileList();
    }
  });

  profModelInput.addEventListener("input", () => {
    const p = profiles.find((item) => item.id === selectedProfileId);
    if (p) {
      p.model = profModelInput.value;
      renderProfileList();
    }
  });

  profFormatSelect.addEventListener("change", () => {
    const p = profiles.find((item) => item.id === selectedProfileId);
    if (p) {
      p.apiFormat = profFormatSelect.value;
      renderProfileList();
    }
  });

  profUrlInput.addEventListener("input", () => {
    updateHelpLink(profUrlInput.value);
    updateKeyStatus(profKeyInput.value, profUrlInput.value);
  });

  profKeyInput.addEventListener("input", () => {
    updateKeyStatus(profKeyInput.value, profUrlInput.value);
  });

  // Range sliders
  profMaxTokensRange.addEventListener("input", () => {
    valMaxTokens.textContent = profMaxTokensRange.value;
  });
  profTemperatureRange.addEventListener("input", () => {
    valTemperature.textContent = profTemperatureRange.value;
  });

  // Toggle Password
  btnToggleKey.addEventListener("click", () => {
    if (profKeyInput.type === "password") {
      profKeyInput.type = "text";
      btnToggleKey.innerHTML = `
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      `;
    } else {
      profKeyInput.type = "password";
      btnToggleKey.innerHTML = `
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `;
    }
  });

  function updateKeyStatus(key, url) {
    const isOllama = url && url.includes("localhost");
    if (isOllama) {
      keyStatusBadge.textContent = t("localNoKey");
      keyStatusBadge.className = "status-badge status-saved";
    } else if (key && key.trim().length > 0) {
      keyStatusBadge.textContent = t("keyEntered");
      keyStatusBadge.className = "status-badge status-saved";
    } else {
      keyStatusBadge.textContent = t("keyNotSet");
      keyStatusBadge.className = "status-badge status-empty";
    }
  }

  function updateHelpLink(url) {
    if (!url) {
      keyHelpLink.textContent = t("helpGeneric");
      keyHelpLink.removeAttribute("href");
      keyHelpLink.style.display = "inline";
      return;
    }
    // MiniMax's Anthropic-compatible endpoint contains "/anthropic/", so
    // identify MiniMax before the generic Anthropic URL check.
    if (url.includes("minimaxi")) {
      keyHelpLink.textContent = t("helpMinimax");
      keyHelpLink.href = "https://www.minimaxi.com/";
      keyHelpLink.style.display = "inline";
    } else if (url.includes("deepseek")) {
      keyHelpLink.textContent = t("helpDeepseek");
      keyHelpLink.href = "https://platform.deepseek.com";
      keyHelpLink.style.display = "inline";
    } else if (url.includes("openai")) {
      keyHelpLink.textContent = t("helpOpenai");
      keyHelpLink.href = "https://platform.openai.com/api-keys";
      keyHelpLink.style.display = "inline";
    } else if (url.includes("anthropic")) {
      keyHelpLink.textContent = t("helpAnthropic");
      keyHelpLink.href = "https://console.anthropic.com";
      keyHelpLink.style.display = "inline";
    } else if (url.includes("localhost") || url.includes("11434")) {
      keyHelpLink.textContent = t("helpOllama");
      keyHelpLink.href = "https://ollama.com";
      keyHelpLink.style.display = "inline";
    } else if (url.includes("z.ai")) {
      keyHelpLink.textContent = t("helpZai");
      keyHelpLink.href = "https://z.ai";
      keyHelpLink.style.display = "inline";
    } else {
      keyHelpLink.textContent = t("helpGeneric");
      keyHelpLink.removeAttribute("href");
      keyHelpLink.style.display = "inline";
    }
  }

  // Set Profile as Active
  btnSetActive.addEventListener("click", () => {
    saveCurrentEditorToMemory();
    activeProfileId = selectedProfileId;
    renderProfileList();
    loadProfileToEditor(selectedProfileId);
    showToast(t("toastActive"));
  });

  // Duplicate Profile
  btnDuplicateProfile.addEventListener("click", () => {
    saveCurrentEditorToMemory();
    const source = profiles.find((item) => item.id === selectedProfileId);
    if (!source) return;

    const newProfile = JSON.parse(JSON.stringify(source));
    newProfile.id = "profile_" + Date.now();
    newProfile.name = `${source.name || t("unnamedProfile")}${t("duplicateSuffix")}`;
    newProfile.profileNameMode = "custom";
    delete newProfile.profileNameTemplate;

    profiles.push(newProfile);
    selectedProfileId = newProfile.id;
    renderProfileList();
    loadProfileToEditor(selectedProfileId);
    showToast(t("toastDuplicated"));
  });

  // Delete Profile
  btnDeleteProfile.addEventListener("click", () => {
    if (profiles.length <= 1) {
      alert(t("confirmKeepOne"));
      return;
    }

    const currentP = profiles.find((p) => p.id === selectedProfileId);
    if (confirm(t("confirmDelete", { name: currentP?.name || t("unnamedProfile") }))) {
      profiles = profiles.filter((p) => p.id !== selectedProfileId);
      if (activeProfileId === selectedProfileId) {
        activeProfileId = profiles[0].id;
      }
      selectedProfileId = profiles[0].id;

      renderProfileList();
      loadProfileToEditor(selectedProfileId);
      showToast(t("toastDeleted"));
    }
  });

  // Reset System Prompt
  btnResetPrompt.addEventListener("click", () => {
    if (confirm(t("confirmResetPrompt"))) {
      profPromptInput.value = getDefaultSystemPrompt();
      const profile = profiles.find((item) => item.id === selectedProfileId);
      if (profile) {
        profile.systemPrompt = profPromptInput.value;
        profile.systemPromptMode = "default";
        profile.systemPromptLocale = currentLocale;
      }
      showToast(t("toastResetPrompt"));
    }
  });

  // Add Profile Template Menu Toggle
  btnAddProfile.addEventListener("click", (e) => {
    e.stopPropagation();
    templateMenu.style.display = templateMenu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", () => {
    templateMenu.style.display = "none";
  });

  // Template Menu Items
  document.querySelectorAll(".template-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      saveCurrentEditorToMemory();
      const tKey = btn.getAttribute("data-template");
      const template = TEMPLATES[tKey] || TEMPLATES.custom;

      const newP = JSON.parse(JSON.stringify(template));
      newP.id = "profile_" + Date.now();
      newP.name = getTemplateName(tKey);
      newP.profileNameMode = "default";
      newP.profileNameTemplate = tKey;
      newP.systemPrompt = getDefaultSystemPrompt();
      newP.systemPromptMode = "default";
      newP.systemPromptLocale = currentLocale;
      
      profiles.push(newP);
      selectedProfileId = newP.id;
      templateMenu.style.display = "none";

      renderProfileList();
      loadProfileToEditor(selectedProfileId);
      showToast(t("toastAdded", { name: newP.name }));
    });
  });

  // Test Connection for Currently Edited Profile
  btnTestConn.addEventListener("click", async () => {
    saveCurrentEditorToMemory();
    const currentP = profiles.find((p) => p.id === selectedProfileId);
    if (!currentP) return;
    const currentProfileName = currentP.name || t("unnamedProfile");

    const isLocalOllama = currentP.apiUrl && currentP.apiUrl.includes("localhost");

    if (!currentP.apiKey && !isLocalOllama) {
      showTestResult("error", escapeHtml(t("testMissingKey", { name: currentProfileName })));
      profKeyInput.focus();
      return;
    }

    btnTestConn.disabled = true;
    testBtnText.textContent = t("testRunningButton");
    showTestResult("loading", escapeHtml(t("testRequesting", { name: currentProfileName })));

    try {
      const response = await chrome.runtime.sendMessage({
        action: "TEST_PROFILE_CONNECTION",
        profile: currentP,
        locale: currentLocale
      });

      if (response && response.success) {
        showTestResult(
          "success",
          `<strong>${escapeHtml(t("testSuccessHeading", { name: currentProfileName }))}</strong><br>
           • ${escapeHtml(t("testProtocol"))}：${escapeHtml((currentP.apiFormat || "").toUpperCase())}<br>
           • ${escapeHtml(t("testModel"))}：${escapeHtml(response.model || currentP.model || "") }<br>
           • ${escapeHtml(t("testLatency"))}：${escapeHtml(String(response.latency))} ms<br>
           • ${escapeHtml(t("testReply"))}：${escapeHtml(response.reply || t("testReplyFallback"))}`
        );
      } else {
        showTestResult(
          "error",
          `<strong>${escapeHtml(t("testFailedHeading"))}</strong><br>${escapeHtml(response?.error || t("testUnknownError"))}`
        );
      }
    } catch (err) {
      showTestResult("error", escapeHtml(t("testRequestError", { message: err.message })));
    } finally {
      btnTestConn.disabled = false;
      testBtnText.textContent = t("testConnection");
    }
  });

  function showTestResult(type, htmlContent) {
    testResultBox.style.display = "block";
    testResultBox.className = `test-result-box ${type}`;
    testResultBox.innerHTML = htmlContent;
  }

  // Save All Profiles
  btnSaveAll.addEventListener("click", () => {
    saveCurrentEditorToMemory();

    btnSaveAll.disabled = true;
    chrome.runtime.sendMessage({
      action: "SAVE_ALL_PROFILES",
      profiles: profiles,
      activeProfileId: activeProfileId,
      uiLocale: currentLocale
    }, () => {
      btnSaveAll.disabled = false;
      showToast(t("toastSaved"));
      renderProfileList();
      loadProfileToEditor(selectedProfileId);
    });
  });

  // Toast Helper
  let toastTimer = null;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }

  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
});
