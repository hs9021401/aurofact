// background.js - AUROFACT service worker with multi-profile API support

importScripts("i18n.js");

const I18N = globalThis.WebSummarizerI18n;
const DEFAULT_SYSTEM_PROMPT = I18N.getPrompt(I18N.defaultLocale);

const DEFAULT_PROFILES = [
  {
    id: "profile_minimax",
    name: "🟣 MiniMax-M3",
    profileNameMode: "default",
    profileNameTemplate: "minimax",
    apiFormat: "anthropic",
    apiUrl: "https://api.minimaxi.com/anthropic/v1/messages",
    apiKey: "",
    model: "MiniMax-M3",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    systemPromptMode: "default",
    systemPromptLocale: I18N.defaultLocale,
    maxTokens: 2048,
    temperature: 0.5
  },
  {
    id: "profile_deepseek",
    name: "🔵 DeepSeek V4 Flash",
    profileNameMode: "default",
    profileNameTemplate: "deepseek",
    apiFormat: "openai",
    apiUrl: "https://api.deepseek.com/chat/completions",
    apiKey: "",
    model: "deepseek-v4-flash",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    systemPromptMode: "default",
    systemPromptLocale: I18N.defaultLocale,
    maxTokens: 2048,
    temperature: 0.5
  },
  {
    id: "profile_openai",
    name: "🟢 GPT-5.6 Luna",
    profileNameMode: "default",
    profileNameTemplate: "openai",
    apiFormat: "openai",
    apiUrl: "https://api.openai.com/v1/chat/completions",
    apiKey: "",
    model: "gpt-5.6-luna",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    systemPromptMode: "default",
    systemPromptLocale: I18N.defaultLocale,
    maxTokens: 2048,
    temperature: 0.5
  },
  {
    id: "profile_claude",
    name: "🟠 Claude Sonnet 5",
    profileNameMode: "default",
    profileNameTemplate: "claude",
    apiFormat: "anthropic",
    apiUrl: "https://api.anthropic.com/v1/messages",
    apiKey: "",
    model: "claude-sonnet-5",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    systemPromptMode: "default",
    systemPromptLocale: I18N.defaultLocale,
    maxTokens: 2048,
    temperature: 0.5
  },
  {
    id: "profile_ollama",
    name: "⚪ Ollama · Gemma 4 12B",
    profileNameMode: "default",
    profileNameTemplate: "ollama",
    apiFormat: "openai",
    apiUrl: "http://localhost:11434/v1/chat/completions",
    apiKey: "",
    model: "gemma4:12b",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    systemPromptMode: "default",
    systemPromptLocale: I18N.defaultLocale,
    maxTokens: 2048,
    temperature: 0.5
  },
  {
    id: "profile_zai_glm53",
    name: "🟡 Z.AI GLM-5.3",
    profileNameMode: "default",
    profileNameTemplate: "zai",
    apiFormat: "openai",
    apiUrl: "https://api.z.ai/api/paas/v4/chat/completions",
    apiKey: "",
    model: "glm-5.3",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    systemPromptMode: "default",
    systemPromptLocale: I18N.defaultLocale,
    maxTokens: 2048,
    temperature: 0.5
  }
];

const CURRENT_PROVIDER_DEFAULTS_VERSION = 2;

const TEMPLATE_NAME_KEYS = Object.freeze({
  minimax: "templateMinimaxName",
  deepseek: "templateDeepseekName",
  openai: "templateOpenaiName",
  claude: "templateClaudeName",
  ollama: "templateOllamaName",
  zai: "templateZaiName",
  custom: "templateCustomName"
});

const LEGACY_PROFILE_NAME_TEMPLATES = Object.freeze({
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
});

const LEGACY_PROVIDER_MODELS = Object.freeze({
  profile_deepseek: Object.freeze({
    previous: Object.freeze(["deepseek-chat", "deepseek-reasoner", "deepseek-v3", "deepseek-r1"]),
    current: "deepseek-v4-flash"
  }),
  profile_openai: Object.freeze({
    previous: Object.freeze(["gpt-4o", "gpt-4o-mini", "gpt-4.1-mini"]),
    current: "gpt-5.6-luna"
  }),
  profile_claude: Object.freeze({
    previous: Object.freeze([
      "claude-3-5-sonnet-20241022",
      "claude-3-5-sonnet-latest",
      "claude-3-7-sonnet-latest"
    ]),
    current: "claude-sonnet-5"
  }),
  profile_ollama: Object.freeze({
    previous: Object.freeze(["llama3.2", "llama3.2:latest"]),
    current: "gemma4:12b"
  })
});

const LEGACY_PROVIDER_MODELS_BY_TEMPLATE = Object.freeze({
  deepseek: LEGACY_PROVIDER_MODELS.profile_deepseek,
  openai: LEGACY_PROVIDER_MODELS.profile_openai,
  claude: LEGACY_PROVIDER_MODELS.profile_claude,
  ollama: LEGACY_PROVIDER_MODELS.profile_ollama
});

function migrateProviderDefaults(rawProfiles, storedVersion) {
  const version = Number(storedVersion) || 0;
  if (version >= CURRENT_PROVIDER_DEFAULTS_VERSION) {
    return { profiles: rawProfiles, changed: false, version };
  }

  let changed = false;
  const migratedProfiles = rawProfiles.map((profile) => {
    const nextProfile = { ...profile };
    const templateKey = nextProfile.profileNameTemplate || LEGACY_PROFILE_NAME_TEMPLATES[nextProfile.name];
    const migration = LEGACY_PROVIDER_MODELS[nextProfile.id] || LEGACY_PROVIDER_MODELS_BY_TEMPLATE[templateKey];
    if (migration && migration.previous.includes(nextProfile.model)) {
      nextProfile.model = migration.current;
      changed = true;
    }
    return nextProfile;
  });

  const hasZaiProfile = migratedProfiles.some((profile) =>
    profile.id === "profile_zai_glm53" ||
    profile.profileNameTemplate === "zai" ||
    profile.model === "glm-5.3" ||
    (typeof profile.apiUrl === "string" && profile.apiUrl.includes("api.z.ai"))
  );

  if (!hasZaiProfile) {
    migratedProfiles.push(JSON.parse(JSON.stringify(DEFAULT_PROFILES.find((profile) => profile.id === "profile_zai_glm53"))));
    changed = true;
  }

  return {
    profiles: migratedProfiles,
    changed,
    version: CURRENT_PROVIDER_DEFAULTS_VERSION
  };
}

function migrateProfilesToLocale(rawProfiles, locale) {
  let changed = false;
  const defaultPrompt = I18N.getPrompt(locale);
  const migratedProfiles = rawProfiles.map((profile) => {
    const nextProfile = { ...profile };
    const profileNameTemplate = nextProfile.profileNameTemplate ||
      (nextProfile.profileNameMode !== "custom" ? LEGACY_PROFILE_NAME_TEMPLATES[nextProfile.name] : "");
    const profileNameMode = nextProfile.profileNameMode || (profileNameTemplate ? "default" : "custom");

    if (profileNameMode === "default" && TEMPLATE_NAME_KEYS[profileNameTemplate]) {
      const localizedName = I18N.translate(locale, TEMPLATE_NAME_KEYS[profileNameTemplate]);
      if (nextProfile.name !== localizedName || nextProfile.profileNameMode !== "default" || nextProfile.profileNameTemplate !== profileNameTemplate) {
        changed = true;
      }
      nextProfile.name = localizedName;
      nextProfile.profileNameMode = "default";
      nextProfile.profileNameTemplate = profileNameTemplate;
    } else {
      if (nextProfile.profileNameMode !== "custom" || nextProfile.profileNameTemplate) {
        changed = true;
      }
      nextProfile.profileNameMode = "custom";
      delete nextProfile.profileNameTemplate;
    }

    const prompt = typeof nextProfile.systemPrompt === "string" ? nextProfile.systemPrompt.trim() : "";
    const mode = nextProfile.systemPromptMode || (I18N.isDefaultPrompt(prompt) ? "default" : "custom");

    if (mode === "default") {
      if (nextProfile.systemPrompt !== defaultPrompt || nextProfile.systemPromptMode !== "default" || nextProfile.systemPromptLocale !== locale) {
        changed = true;
      }
      nextProfile.systemPrompt = defaultPrompt;
      nextProfile.systemPromptMode = "default";
      nextProfile.systemPromptLocale = locale;
    } else {
      if (nextProfile.systemPromptMode !== "custom" || nextProfile.systemPromptLocale) {
        changed = true;
      }
      nextProfile.systemPromptMode = "custom";
      delete nextProfile.systemPromptLocale;
    }

    return nextProfile;
  });

  return { profiles: migratedProfiles, changed };
}

function updateContextMenus(locale) {
  const normalizedLocale = I18N.normalizeLocale(locale);
  chrome.contextMenus.update("summarize_page", {
    title: I18N.translate(normalizedLocale, "contextSummarizePage")
  });
  chrome.contextMenus.update("summarize_selection", {
    title: I18N.translate(normalizedLocale, "contextSummarizeSelection")
  });
}

// Initialize on extension install
chrome.runtime.onInstalled.addListener(() => {
  // Check and initialize profiles storage
  chrome.storage.sync.get(["profiles", "activeProfileId", "apiKey", "apiUrl", "uiLocale"], (items) => {
    let profiles = items.profiles;
    let activeProfileId = items.activeProfileId;
    const uiLocale = I18N.normalizeLocale(items.uiLocale);

    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: "summarize_page",
        title: I18N.translate(uiLocale, "contextSummarizePage"),
        contexts: ["page", "frame"]
      });

      chrome.contextMenus.create({
        id: "summarize_selection",
        title: I18N.translate(uiLocale, "contextSummarizeSelection"),
        contexts: ["selection"]
      });
    });

    // Migrate from legacy single-profile config if exists
    if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
      profiles = JSON.parse(JSON.stringify(DEFAULT_PROFILES));
      if (items.apiKey) {
        profiles[0].apiKey = items.apiKey;
      }
      if (items.apiUrl) {
        profiles[0].apiUrl = items.apiUrl;
      }
      activeProfileId = profiles[0].id;

      chrome.storage.sync.set({ profiles, activeProfileId, uiLocale });
    } else if (!items.uiLocale || items.uiLocale !== uiLocale) {
      chrome.storage.sync.set({ uiLocale });
    }
  });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get(["uiLocale"], (items) => {
    updateContextMenus(I18N.normalizeLocale(items.uiLocale));
  });
});

async function sendSummaryToTab(tabId, payload) {
  try {
    await chrome.tabs.sendMessage(tabId, payload);
  } catch (err) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["i18n.js", "youtube-utils.js", "content.js"]
      });
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, payload).catch((e) => {
          console.error("Failed to send message after injection:", e);
        });
      }, 100);
    } catch (injectErr) {
      console.error("Cannot inject content script on this tab:", injectErr);
    }
  }
}

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== "summarize-current-page" || !tab?.id) return;

  await sendSummaryToTab(tab.id, {
    action: "TRIGGER_SUMMARY",
    isSelection: false,
    selectionText: null
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  const isSelection = info.menuItemId === "summarize_selection";
  await sendSummaryToTab(tab.id, isSelection
    ? {
        action: "TRIGGER_SELECTION_ACTIONS",
        selectionText: info.selectionText || "",
        title: tab.title || "",
        url: tab.url || ""
      }
    : {
        action: "TRIGGER_SUMMARY",
        isSelection: false,
        selectionText: null
      });
});

// Helper: Get active profile and all profiles
async function getProfileConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["profiles", "activeProfileId", "apiKey", "apiUrl", "model", "apiFormat", "uiLocale", "providerDefaultsVersion"], (items) => {
      let profiles = items.profiles;
      let activeProfileId = items.activeProfileId;
      const uiLocale = I18N.normalizeLocale(items.uiLocale);

      if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
        profiles = JSON.parse(JSON.stringify(DEFAULT_PROFILES));
        if (items.apiKey) profiles[0].apiKey = items.apiKey;
        if (items.apiUrl) profiles[0].apiUrl = items.apiUrl;
        if (items.model) profiles[0].model = items.model;
        if (items.apiFormat) profiles[0].apiFormat = items.apiFormat;
        activeProfileId = profiles[0].id;
      }

      const providerMigration = migrateProviderDefaults(profiles, items.providerDefaultsVersion);
      profiles = providerMigration.profiles;
      const localeMigration = migrateProfilesToLocale(profiles, uiLocale);
      profiles = localeMigration.profiles;
      const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
      const valuesToPersist = {};

      if (providerMigration.changed || localeMigration.changed || !items.profiles || !Array.isArray(items.profiles) || items.profiles.length === 0) {
        valuesToPersist.profiles = profiles;
      }
      if (providerMigration.version !== Number(items.providerDefaultsVersion) || !Number.isFinite(Number(items.providerDefaultsVersion))) {
        valuesToPersist.providerDefaultsVersion = providerMigration.version;
      }
      if (!items.uiLocale || items.uiLocale !== uiLocale) {
        valuesToPersist.uiLocale = uiLocale;
      }

      const finish = () => resolve({
        profiles,
        activeProfileId: activeProfile.id,
        activeProfile,
        uiLocale
      });

      if (Object.keys(valuesToPersist).length > 0) {
        chrome.storage.sync.set(valuesToPersist, finish);
      } else {
        finish();
      }
    });
  });
}

// Handle long-lived streaming connection from content script
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "summarize-stream") return;

  let abortController = new AbortController();

  port.onDisconnect.addListener(() => {
    abortController.abort();
  });

  port.onMessage.addListener(async (msg) => {
    if (msg.action === "START_STREAM_CHAT") {
      const { messages, profileId } = msg;
      await streamChat(port, abortController.signal, messages, profileId);
    } else if (msg.action === "ABORT_STREAM") {
      abortController.abort();
      abortController = new AbortController();
    }
  });
});

// Stream Chat Implementation
async function streamChat(port, signal, rawMessages, requestedProfileId) {
  const { profiles, activeProfile } = await getProfileConfig();
  
  // Use requested profile if specified, otherwise active profile
  const profile = (requestedProfileId && profiles.find((p) => p.id === requestedProfileId)) || activeProfile;

  const isOllamaLocal = profile.apiUrl && profile.apiUrl.includes("localhost");

  if ((!profile.apiKey || profile.apiKey.trim() === "") && !isOllamaLocal) {
    port.postMessage({
      type: "ERROR",
      errorCode: "NO_API_KEY",
      message: `尚未設定 [${profile.name || "當前配置"}] 的 API Key！請至外掛設定頁面配置密鑰。`
    });
    return;
  }

  const format = profile.apiFormat || (profile.apiUrl.includes("/chat/completions") ? "openai" : "anthropic");
  const modelName = profile.model || (format === "anthropic" ? "MiniMax-M3" : "gpt-5.6-luna");
  const maxTokens = parseInt(profile.maxTokens, 10) || 2048;
  const temperature = parseFloat(profile.temperature) || 0.5;
  const sysPrompt = profile.systemPrompt || DEFAULT_SYSTEM_PROMPT;
  const apiKeyTrimmed = (profile.apiKey || "").trim();

  let apiUrl = profile.apiUrl && profile.apiUrl.trim() !== ""
    ? profile.apiUrl.trim()
    : "https://api.minimaxi.com/anthropic/v1/messages";

  let headers = { "Content-Type": "application/json" };
  let requestBody = {};

  // Clean and merge messages to alternate user / assistant
  const cleanMessages = [];
  for (let i = 0; i < rawMessages.length; i++) {
    const m = rawMessages[i];
    if (m.role !== "user" && m.role !== "assistant") continue;
    if (!m.content || m.content.trim() === "") continue;

    if (cleanMessages.length > 0 && cleanMessages[cleanMessages.length - 1].role === m.role) {
      cleanMessages[cleanMessages.length - 1].content += "\n\n" + m.content;
    } else {
      cleanMessages.push({ role: m.role, content: m.content });
    }
  }

  if (cleanMessages.length === 0) {
    port.postMessage({ type: "ERROR", errorCode: "EMPTY_MESSAGES", message: "對話內容為空。" });
    return;
  }

  if (format === "anthropic") {
    headers["x-api-key"] = apiKeyTrimmed;
    headers["Authorization"] = `Bearer ${apiKeyTrimmed}`;
    headers["anthropic-version"] = "2023-06-01";

    requestBody = {
      model: modelName,
      max_tokens: maxTokens,
      stream: true,
      system: sysPrompt,
      messages: cleanMessages
    };
    // Claude Sonnet 5 rejects non-default sampling parameters such as temperature.
    if (!String(modelName).startsWith("claude-sonnet-5")) {
      requestBody.temperature = temperature;
    }
  } else {
    if (apiKeyTrimmed) {
      headers["Authorization"] = `Bearer ${apiKeyTrimmed}`;
    }

    requestBody = {
      model: modelName,
      max_tokens: maxTokens,
      temperature: temperature,
      stream: true,
      messages: [
        { role: "system", content: sysPrompt },
        ...cleanMessages
      ]
    };
  }

  try {
    port.postMessage({ type: "START", model: modelName, profileName: profile.name });

    const response = await fetch(apiUrl, {
      method: "POST",
      signal: signal,
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      let errorDetail = "";
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.error?.message || errorJson.message || JSON.stringify(errorJson);
      } catch (e) {
        errorDetail = await response.text();
      }

      port.postMessage({
        type: "ERROR",
        errorCode: "API_HTTP_ERROR",
        message: `[${profile.name}] API 請求失敗 (${response.status} ${response.statusText}):\n${errorDetail || "請檢查 API Key、端點與格式設定。"}`
      });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(":")) continue;

        if (trimmed.startsWith("data: ")) {
          const dataStr = trimmed.substring(6).trim();
          if (dataStr === "[DONE]") continue;

          try {
            const data = JSON.parse(dataStr);
            
            // Anthropic stream
            if (data.type === "content_block_delta" && data.delta && data.delta.text) {
              port.postMessage({ type: "CHUNK", text: data.delta.text });
            } 
            // OpenAI stream
            else if (data.choices && data.choices[0]?.delta?.content) {
              port.postMessage({ type: "CHUNK", text: data.choices[0].delta.content });
            }
            // Direct text fallback
            else if (data.text) {
              port.postMessage({ type: "CHUNK", text: data.text });
            }
          } catch (jsonErr) {
            // Non-json SSE data line
          }
        }
      }
    }

    port.postMessage({ type: "DONE" });
  } catch (err) {
    if (err.name === "AbortError") {
      port.postMessage({ type: "ABORTED" });
      return;
    }

    console.error("Stream chat error:", err);
    port.postMessage({
      type: "ERROR",
      errorCode: "NETWORK_ERROR",
      message: `網路連線或請求錯誤: ${err.message || err}`
    });
  }
}

// Runtime message listener for profiles management & connection testing
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_PROFILES") {
    getProfileConfig().then((data) => sendResponse({ success: true, ...data }));
    return true;
  }

  if (request.action === "SET_ACTIVE_PROFILE") {
    chrome.storage.sync.set({ activeProfileId: request.profileId }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === "SAVE_ALL_PROFILES") {
    chrome.storage.sync.set({
      profiles: request.profiles,
      activeProfileId: request.activeProfileId,
      uiLocale: I18N.normalizeLocale(request.uiLocale)
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === "OPEN_OPTIONS") {
    chrome.runtime.openOptionsPage();
    sendResponse({ success: true });
    return true;
  }

  if (request.action === "TEST_PROFILE_CONNECTION") {
    testProfileConnection(request.profile, request.locale).then((result) => {
      sendResponse(result);
    });
    return true;
  }

  if (request.action === "SET_UI_LOCALE") {
    const uiLocale = I18N.normalizeLocale(request.locale);
    chrome.storage.sync.set({ uiLocale }, () => {
      updateContextMenus(uiLocale);
      sendResponse({ success: true, uiLocale });
    });
    return true;
  }
});

// Test connection for a given profile
async function testProfileConnection(profile, requestedLocale) {
  const locale = I18N.normalizeLocale(requestedLocale);
  const startTime = Date.now();
  const isOllamaLocal = profile.apiUrl && profile.apiUrl.includes("localhost");

  if ((!profile.apiKey || profile.apiKey.trim() === "") && !isOllamaLocal) {
    return {
      success: false,
      error: I18N.translate(locale, "backgroundMissingKey")
    };
  }

  const format = profile.apiFormat || (profile.apiUrl.includes("/chat/completions") ? "openai" : "anthropic");
  const modelName = profile.model || (format === "anthropic" ? "MiniMax-M3" : "gpt-5.6-luna");
  const apiUrl = profile.apiUrl && profile.apiUrl.trim() !== ""
    ? profile.apiUrl.trim()
    : "https://api.minimaxi.com/anthropic/v1/messages";
  const apiKeyTrimmed = (profile.apiKey || "").trim();

  let headers = { "Content-Type": "application/json" };
  let requestBody = {};

  if (format === "anthropic") {
    headers["x-api-key"] = apiKeyTrimmed;
    headers["Authorization"] = `Bearer ${apiKeyTrimmed}`;
    headers["anthropic-version"] = "2023-06-01";
    requestBody = {
      model: modelName,
      max_tokens: 20,
      messages: [{ role: "user", content: "Ping" }]
    };
  } else {
    if (apiKeyTrimmed) {
      headers["Authorization"] = `Bearer ${apiKeyTrimmed}`;
    }
    requestBody = {
      model: modelName,
      max_tokens: 20,
      messages: [{ role: "user", content: "Ping" }]
    };
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      let detail = "";
      try {
        const errJson = await response.json();
        detail = errJson.error?.message || errJson.message || JSON.stringify(errJson);
      } catch (e) {
        detail = await response.text();
      }
      return {
        success: false,
        status: response.status,
        error: I18N.translate(locale, "backgroundHttpError", {
          status: response.status,
          detail
        })
      };
    }

    const data = await response.json();
    let replyText = "";
    
    if (data.content && Array.isArray(data.content) && data.content[0]?.text) {
      replyText = data.content[0].text;
    } else if (data.choices && Array.isArray(data.choices) && data.choices[0]?.message?.content) {
      replyText = data.choices[0].message.content;
    } else {
      replyText = "OK (響應成功)";
    }

    return {
      success: true,
      latency: latency,
      model: data.model || modelName,
      reply: replyText.trim()
    };
  } catch (err) {
    return {
      success: false,
      error: I18N.translate(locale, "backgroundConnectionError", {
        message: err.message || err
      })
    };
  }
}
