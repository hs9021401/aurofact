// options.js - Multi-Profile API Management Logic

const DEFAULT_SYSTEM_PROMPT = `你是一個專業的內容分析與深入探討助手。請針對使用者提供的網頁內容或選取文字進行精準、結構清晰的繁體中文分析與解答。

初次總結時請遵循以下格式：
### 📌 核心主旨
用 1-2 句話概括全文最重要的核心主旨。

### 💡 關鍵重點摘要
- 條列 3 至 6 個關鍵要點。
- 若有重要數據、關鍵結論或步驟請以**粗體**標註。

### 🎯 結論與洞見
簡短總結作者結論、實用建議或關鍵價值。

在後續多輪對話中，請結合網頁原文與先前的總結，深入、親切且專業地回答使用者的延伸問題。`;

const TEMPLATES = {
  minimax: {
    name: "🟣 MiniMax-M3",
    apiFormat: "anthropic",
    apiUrl: "https://api.minimaxi.com/anthropic/v1/messages",
    apiKey: "",
    model: "MiniMax-M3",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    maxTokens: 2048,
    temperature: 0.5
  },
  deepseek: {
    name: "🔵 DeepSeek-V3",
    apiFormat: "openai",
    apiUrl: "https://api.deepseek.com/chat/completions",
    apiKey: "",
    model: "deepseek-chat",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    maxTokens: 2048,
    temperature: 0.5
  },
  openai: {
    name: "🟢 GPT-4o-mini",
    apiFormat: "openai",
    apiUrl: "https://api.openai.com/v1/chat/completions",
    apiKey: "",
    model: "gpt-4o-mini",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    maxTokens: 2048,
    temperature: 0.5
  },
  claude: {
    name: "🟠 Claude 3.5 Sonnet",
    apiFormat: "anthropic",
    apiUrl: "https://api.anthropic.com/v1/messages",
    apiKey: "",
    model: "claude-3-5-sonnet-20241022",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    maxTokens: 2048,
    temperature: 0.5
  },
  ollama: {
    name: "⚪ Ollama (本地免 Key)",
    apiFormat: "openai",
    apiUrl: "http://localhost:11434/v1/chat/completions",
    apiKey: "",
    model: "llama3.2",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    maxTokens: 2048,
    temperature: 0.5
  },
  custom: {
    name: "⚙️ 自訂模型配置",
    apiFormat: "openai",
    apiUrl: "https://api.openai.com/v1/chat/completions",
    apiKey: "",
    model: "custom-model",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    maxTokens: 2048,
    temperature: 0.5
  }
};

let profiles = [];
let activeProfileId = "";
let selectedProfileId = "";

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

  // Load profiles from background/storage
  chrome.runtime.sendMessage({ action: "GET_PROFILES" }, (response) => {
    if (response && response.success) {
      profiles = response.profiles || [];
      activeProfileId = response.activeProfileId || profiles[0]?.id || "";
      selectedProfileId = activeProfileId;

      renderProfileList();
      loadProfileToEditor(selectedProfileId);
    }
  });

  // Render Sidebar Profile List
  function renderProfileList() {
    profileListEl.innerHTML = "";

    profiles.forEach((p) => {
      const isSelected = p.id === selectedProfileId;
      const isActive = p.id === activeProfileId;

      const item = document.createElement("div");
      item.className = `profile-item ${isSelected ? "selected" : ""}`;
      item.setAttribute("data-id", p.id);

      const formatLabel = p.apiFormat === "anthropic" ? "Anthropic" : "OpenAI";

      item.innerHTML = `
        <div class="prof-info">
          <span class="prof-title">${escapeHtml(p.name || "未命名配置")}</span>
          <div class="prof-meta">
            <span class="prof-tag">${formatLabel}</span>
            <span>${escapeHtml(p.model || "未設定模型")}</span>
          </div>
        </div>
        <div>
          ${isActive ? '<span class="prof-active-pill">● 使用中</span>' : ""}
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

    editingProfileTitle.textContent = `編輯：${p.name || "未命名配置"}`;
    
    const isActive = p.id === activeProfileId;
    if (isActive) {
      activeStatusBadge.textContent = "● 預設使用中";
      activeStatusBadge.className = "badge-active-status";
      btnSetActive.style.display = "none";
    } else {
      activeStatusBadge.textContent = "未啟用";
      activeStatusBadge.className = "badge-active-status inactive";
      btnSetActive.style.display = "inline-flex";
    }

    profNameInput.value = p.name || "";
    profFormatSelect.value = p.apiFormat || "anthropic";
    profUrlInput.value = p.apiUrl || "";
    profKeyInput.value = p.apiKey || "";
    profModelInput.value = p.model || "";
    profPromptInput.value = p.systemPrompt || DEFAULT_SYSTEM_PROMPT;
    
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

    p.name = profNameInput.value.trim() || "未命名配置";
    p.apiFormat = profFormatSelect.value;
    p.apiUrl = profUrlInput.value.trim();
    p.apiKey = profKeyInput.value.trim();
    p.model = profModelInput.value.trim();
    p.systemPrompt = profPromptInput.value.trim() || DEFAULT_SYSTEM_PROMPT;
    p.maxTokens = parseInt(profMaxTokensRange.value, 10);
    p.temperature = parseFloat(profTemperatureRange.value);
  }

  // Live update sidebar name as user types
  profNameInput.addEventListener("input", () => {
    const p = profiles.find((item) => item.id === selectedProfileId);
    if (p) {
      p.name = profNameInput.value;
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
      keyStatusBadge.textContent = "本地免 Key";
      keyStatusBadge.className = "status-badge status-saved";
    } else if (key && key.trim().length > 0) {
      keyStatusBadge.textContent = "已輸入 Key";
      keyStatusBadge.className = "status-badge status-saved";
    } else {
      keyStatusBadge.textContent = "尚未設定";
      keyStatusBadge.className = "status-badge status-empty";
    }
  }

  function updateHelpLink(url) {
    if (!url) return;
    if (url.includes("deepseek")) {
      keyHelpLink.textContent = "前往 DeepSeek 開放平台獲取 API Key ↗";
      keyHelpLink.href = "https://platform.deepseek.com";
      keyHelpLink.style.display = "inline";
    } else if (url.includes("openai")) {
      keyHelpLink.textContent = "前往 OpenAI Platform 獲取 API Key ↗";
      keyHelpLink.href = "https://platform.openai.com/api-keys";
      keyHelpLink.style.display = "inline";
    } else if (url.includes("anthropic")) {
      keyHelpLink.textContent = "前往 Anthropic Console 獲取 API Key ↗";
      keyHelpLink.href = "https://console.anthropic.com";
      keyHelpLink.style.display = "inline";
    } else if (url.includes("localhost") || url.includes("11434")) {
      keyHelpLink.textContent = "Ollama 本地運行中 (無須金鑰)";
      keyHelpLink.href = "https://ollama.com";
      keyHelpLink.style.display = "inline";
    } else {
      keyHelpLink.textContent = "前往 MiniMax 開放平台獲取 API Key ↗";
      keyHelpLink.href = "https://platform.minimaxi.com";
      keyHelpLink.style.display = "inline";
    }
  }

  // Set Profile as Active
  btnSetActive.addEventListener("click", () => {
    saveCurrentEditorToMemory();
    activeProfileId = selectedProfileId;
    renderProfileList();
    loadProfileToEditor(selectedProfileId);
    showToast("已將此配置設為當前預設！");
  });

  // Duplicate Profile
  btnDuplicateProfile.addEventListener("click", () => {
    saveCurrentEditorToMemory();
    const source = profiles.find((item) => item.id === selectedProfileId);
    if (!source) return;

    const newProfile = JSON.parse(JSON.stringify(source));
    newProfile.id = "profile_" + Date.now();
    newProfile.name = `${source.name} (副本)`;

    profiles.push(newProfile);
    selectedProfileId = newProfile.id;
    renderProfileList();
    loadProfileToEditor(selectedProfileId);
    showToast("已複製新配置！");
  });

  // Delete Profile
  btnDeleteProfile.addEventListener("click", () => {
    if (profiles.length <= 1) {
      alert("至少必須保留一組 API 配置，無法刪除最後一組。");
      return;
    }

    const currentP = profiles.find((p) => p.id === selectedProfileId);
    if (confirm(`確定要刪除「${currentP?.name || "此配置"}」嗎？`)) {
      profiles = profiles.filter((p) => p.id !== selectedProfileId);
      if (activeProfileId === selectedProfileId) {
        activeProfileId = profiles[0].id;
      }
      selectedProfileId = profiles[0].id;

      renderProfileList();
      loadProfileToEditor(selectedProfileId);
      showToast("已刪除配置");
    }
  });

  // Reset System Prompt
  btnResetPrompt.addEventListener("click", () => {
    if (confirm("確定要將系統提示詞還原為預設範本嗎？")) {
      profPromptInput.value = DEFAULT_SYSTEM_PROMPT;
      showToast("已還原預設提示詞");
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
      
      profiles.push(newP);
      selectedProfileId = newP.id;
      templateMenu.style.display = "none";

      renderProfileList();
      loadProfileToEditor(selectedProfileId);
      showToast(`已新增 ${newP.name} 配置！`);
    });
  });

  // Test Connection for Currently Edited Profile
  btnTestConn.addEventListener("click", async () => {
    saveCurrentEditorToMemory();
    const currentP = profiles.find((p) => p.id === selectedProfileId);
    if (!currentP) return;

    const isLocalOllama = currentP.apiUrl && currentP.apiUrl.includes("localhost");

    if (!currentP.apiKey && !isLocalOllama) {
      showTestResult("error", `⚠️ 請先輸入「${currentP.name}」的 API Key 才能進行連線測試！`);
      profKeyInput.focus();
      return;
    }

    btnTestConn.disabled = true;
    testBtnText.textContent = "連線測試中...";
    showTestResult("loading", `⏳ 正在向 [${currentP.name}] 發送測試請求...`);

    try {
      const response = await chrome.runtime.sendMessage({
        action: "TEST_PROFILE_CONNECTION",
        profile: currentP
      });

      if (response && response.success) {
        showTestResult(
          "success",
          `✅ <strong>[${escapeHtml(currentP.name)}] 連線成功！</strong><br>
           • 協議格式：${currentP.apiFormat.toUpperCase()}<br>
           • 模型響應：${response.model || currentP.model}<br>
           • 延遲時間：${response.latency} ms<br>
           • 測試回復：${escapeHtml(response.reply || "OK")}`
        );
      } else {
        showTestResult(
          "error",
          `❌ <strong>連線失敗：</strong><br>${escapeHtml(response?.error || "未知錯誤，請檢查端點、金鑰與格式設定。")}`
        );
      }
    } catch (err) {
      showTestResult("error", `❌ 請求發送異常：${escapeHtml(err.message)}`);
    } finally {
      btnTestConn.disabled = false;
      testBtnText.textContent = "測試此配置連線";
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
      activeProfileId: activeProfileId
    }, () => {
      btnSaveAll.disabled = false;
      showToast("🎉 所有 API 配置已成功儲存！");
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
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
});
