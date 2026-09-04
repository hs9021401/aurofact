// background.js - AUROFACT service worker with multi-profile API support

importScripts("i18n.js", "profile-view.js", "profile-schema.js", "prompt-safety.js");

const I18N = globalThis.WebSummarizerI18n;
const PROFILE_VIEW = globalThis.AurofactProfileView;
const PROFILE_SCHEMA = globalThis.AurofactProfileSchema;
const PROMPT_SAFETY = globalThis.AurofactPromptSafety;
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
const LEGACY_SYNC_KEYS = ["apiKey", "apiUrl", "model", "apiFormat"];
const PROFILE_SYNC_KEYS = [
  "profiles",
  "activeProfileId",
  "uiLocale",
  "providerDefaultsVersion",
  "profileSchemaVersion",
  ...LEGACY_SYNC_KEYS
];
const PROFILE_LOCAL_KEYS = ["profileApiKeys"];

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

function storageGet(area, keys) {
  return new Promise((resolve, reject) => {
    try {
      area.get(keys, (items) => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          reject(new Error(lastError.message));
          return;
        }
        resolve(items || {});
      });
    } catch (error) {
      reject(error);
    }
  });
}

function storageSet(area, values) {
  return new Promise((resolve, reject) => {
    try {
      area.set(values, () => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          reject(new Error(lastError.message));
          return;
        }
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

function storageRemove(area, keys) {
  return new Promise((resolve, reject) => {
    try {
      area.remove(keys, () => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          reject(new Error(lastError.message));
          return;
        }
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

function hasOwn(object, key) {
  return PROFILE_SCHEMA.hasOwn(object, key);
}

function isSameExtensionSender(sender) {
  return Boolean(sender && sender.id === chrome.runtime.id);
}

function getPageSenderUrl(sender, pageName) {
  if (!isSameExtensionSender(sender) || typeof sender.url !== "string") return false;
  const senderUrl = sender.url.split(/[?#]/, 1)[0];
  return senderUrl === chrome.runtime.getURL(pageName);
}

function isOptionsPageSender(sender) {
  return getPageSenderUrl(sender, "options.html");
}

function isPopupPageSender(sender) {
  return getPageSenderUrl(sender, "popup.html");
}

function postPortMessage(port, payload) {
  try {
    port.postMessage(payload);
  } catch (error) {
    // The content script may have navigated away or disconnected. Do not let
    // a secondary messaging error crash the service worker.
  }
}

function getProfileErrorResponse(error, fallbackCode = "PROFILE_LOAD_FAILED") {
  const code = error?.code || fallbackCode;
  return { success: false, error: code };
}

function getEndpointPermissionPattern(apiUrl) {
  return PROFILE_VIEW.getEndpointPermissionPattern(apiUrl);
}

function hasEndpointPermission(apiUrl) {
  const originPattern = getEndpointPermissionPattern(apiUrl);
  if (!originPattern || !chrome.permissions?.contains) return Promise.resolve(false);

  return new Promise((resolve) => {
    try {
      chrome.permissions.contains({ origins: [originPattern] }, (granted) => {
        resolve(Boolean(granted) && !chrome.runtime.lastError);
      });
    } catch (error) {
      resolve(false);
    }
  });
}

async function assertEndpointAccess(apiUrl, locale) {
  if (!PROFILE_VIEW.isSupportedEndpoint(apiUrl)) {
    return {
      success: false,
      errorCode: "INVALID_ENDPOINT",
      error: I18N.translate(locale, "invalidEndpoint")
    };
  }

  if (!(await hasEndpointPermission(apiUrl))) {
    return {
      success: false,
      errorCode: "ENDPOINT_PERMISSION_REQUIRED",
      error: I18N.translate(locale, "endpointPermissionRequired")
    };
  }

  return { success: true };
}

async function fetchWithTimeout(url, options, signal, timeoutMs = 60000) {
  const timeoutController = new AbortController();
  const abortFromCaller = () => timeoutController.abort();
  let timeoutId = null;

  if (signal?.aborted) timeoutController.abort();
  if (signal?.addEventListener) signal.addEventListener("abort", abortFromCaller, { once: true });
  timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

  try {
    // API keys are sent in request headers. Never follow a redirect to an
    // attacker-controlled origin where those headers could be disclosed.
    return await fetch(url, {
      ...options,
      redirect: "error",
      signal: timeoutController.signal
    });
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener?.("abort", abortFromCaller);
  }
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

function recreateContextMenus(locale) {
  return new Promise((resolve) => {
    chrome.contextMenus.removeAll(() => {
      const lastError = chrome.runtime.lastError;
      if (lastError) console.warn("Unable to reset context menus:", lastError.message);

      chrome.contextMenus.create({
        id: "summarize_page",
        title: I18N.translate(locale, "contextSummarizePage"),
        contexts: ["page", "frame"]
      });

      chrome.contextMenus.create({
        id: "summarize_selection",
        title: I18N.translate(locale, "contextSummarizeSelection"),
        contexts: ["selection"]
      });
      resolve();
    });
  });
}

// Initialize on extension install/update. Profile migration is also run on
// first use, so a storage error is surfaced instead of being silently ignored.
chrome.runtime.onInstalled.addListener(() => {
  getProfileConfig()
    .then(({ uiLocale }) => recreateContextMenus(uiLocale))
    .catch((error) => console.error("Unable to initialize profile storage:", error));
});

chrome.runtime.onStartup.addListener(() => {
  getProfileConfig()
    .then(({ uiLocale }) => updateContextMenus(uiLocale))
    .catch((error) => console.error("Unable to load profile storage:", error));
});

async function sendSummaryToTab(tabId, payload) {
  try {
    await chrome.tabs.sendMessage(tabId, payload);
  } catch (err) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["i18n.js", "youtube-utils.js", "prompt-safety.js", "input-behavior.js", "content.js"]
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

// Helper: Get active profile and all profiles. Metadata is kept in sync
// storage, while API keys are hydrated from local storage only.
let profileConfigPromise = null;

async function loadProfileConfig() {
  const [syncItems, localItems] = await Promise.all([
    storageGet(chrome.storage.sync, PROFILE_SYNC_KEYS),
    storageGet(chrome.storage.local, PROFILE_LOCAL_KEYS)
  ]);

  const hasStoredProfiles = Array.isArray(syncItems.profiles) && syncItems.profiles.length > 0;
  let rawProfiles = hasStoredProfiles
    ? syncItems.profiles
    : JSON.parse(JSON.stringify(DEFAULT_PROFILES));

  // Migrate the legacy single-profile keys only when no profile array exists.
  if (!hasStoredProfiles) {
    if (syncItems.apiKey) rawProfiles[0].apiKey = syncItems.apiKey;
    if (syncItems.apiUrl) rawProfiles[0].apiUrl = syncItems.apiUrl;
    if (syncItems.model) rawProfiles[0].model = syncItems.model;
    if (syncItems.apiFormat) rawProfiles[0].apiFormat = syncItems.apiFormat;
  }

  const sanitized = PROFILE_SCHEMA.sanitizeProfiles(rawProfiles, DEFAULT_PROFILES);
  let profiles = sanitized.profiles;
  const uiLocale = I18N.normalizeLocale(syncItems.uiLocale);

  const providerMigration = migrateProviderDefaults(profiles, syncItems.providerDefaultsVersion);
  profiles = providerMigration.profiles;
  const localeMigration = migrateProfilesToLocale(profiles, uiLocale);
  profiles = localeMigration.profiles;

  const rawLocalKeyMap = localItems.profileApiKeys;
  const normalizedLocalKeys = PROFILE_SCHEMA.normalizeKeyMap(
    rawLocalKeyMap,
    profiles.map((profile) => profile.id)
  );
  const apiKeys = { ...normalizedLocalKeys.keys };
  let localStorageChanged = normalizedLocalKeys.changed || !hasOwn(localItems, "profileApiKeys");

  profiles = profiles.map((profile) => {
    const hasLocalKey = PROFILE_SCHEMA.hasOwn(rawLocalKeyMap, profile.id);
    let apiKey = "";

    if (hasLocalKey) {
      apiKey = PROFILE_SCHEMA.normalizeApiKey(rawLocalKeyMap[profile.id]);
    } else if (profile.apiKey) {
      // One-time migration from API keys embedded in sync profiles.
      apiKey = PROFILE_SCHEMA.normalizeApiKey(profile.apiKey);
      if (apiKey) apiKeys[profile.id] = apiKey;
      localStorageChanged = true;
    }

    return { ...profile, apiKey };
  });

  if (!hasStoredProfiles && !PROFILE_SCHEMA.hasOwn(rawLocalKeyMap, profiles[0].id)) {
    const legacyKey = PROFILE_SCHEMA.normalizeApiKey(syncItems.apiKey);
    if (legacyKey && !profiles[0].apiKey) {
      profiles[0].apiKey = legacyKey;
      apiKeys[profiles[0].id] = legacyKey;
      localStorageChanged = true;
    }
  }

  const requestedActiveId = typeof syncItems.activeProfileId === "string"
    ? syncItems.activeProfileId
    : "";
  const activeProfile = profiles.find((profile) => profile.id === requestedActiveId) || profiles[0];
  const activeProfileId = activeProfile.id;
  const syncProfiles = profiles.map(PROFILE_SCHEMA.stripApiKey);
  const syncPayload = {
    profiles: syncProfiles,
    activeProfileId,
    uiLocale,
    providerDefaultsVersion: CURRENT_PROVIDER_DEFAULTS_VERSION,
    profileSchemaVersion: PROFILE_SCHEMA.CURRENT_PROFILE_SCHEMA_VERSION
  };

  const syncStorageChanged = sanitized.changed ||
    providerMigration.changed ||
    localeMigration.changed ||
    !hasStoredProfiles ||
    JSON.stringify(syncItems.profiles || null) !== JSON.stringify(syncProfiles) ||
    syncItems.activeProfileId !== activeProfileId ||
    syncItems.uiLocale !== uiLocale ||
    Number(syncItems.providerDefaultsVersion) !== CURRENT_PROVIDER_DEFAULTS_VERSION ||
    Number(syncItems.profileSchemaVersion) !== PROFILE_SCHEMA.CURRENT_PROFILE_SCHEMA_VERSION ||
    LEGACY_SYNC_KEYS.some((key) => hasOwn(syncItems, key));

  // Write the local secret map first. If the sync write fails afterwards, the
  // next load can safely retry the metadata migration without re-exposing keys.
  if (localStorageChanged) {
    await storageSet(chrome.storage.local, { profileApiKeys: apiKeys });
  }
  if (syncStorageChanged) {
    await storageSet(chrome.storage.sync, syncPayload);
    if (LEGACY_SYNC_KEYS.some((key) => hasOwn(syncItems, key))) {
      await storageRemove(chrome.storage.sync, LEGACY_SYNC_KEYS);
    }
  }

  return {
    profiles,
    activeProfileId,
    activeProfile,
    uiLocale
  };
}

function getProfileConfig() {
  if (!profileConfigPromise) {
    profileConfigPromise = loadProfileConfig().finally(() => {
      profileConfigPromise = null;
    });
  }
  return profileConfigPromise;
}

async function saveProfileConfig(rawProfiles, activeProfileId, requestedLocale) {
  const prepared = PROFILE_SCHEMA.prepareProfilesForSave(rawProfiles, activeProfileId);
  const uiLocale = I18N.normalizeLocale(requestedLocale);

  await storageSet(chrome.storage.local, { profileApiKeys: prepared.apiKeys });
  await storageSet(chrome.storage.sync, {
    profiles: prepared.syncProfiles,
    activeProfileId: prepared.activeProfileId,
    uiLocale,
    providerDefaultsVersion: CURRENT_PROVIDER_DEFAULTS_VERSION,
    profileSchemaVersion: PROFILE_SCHEMA.CURRENT_PROFILE_SCHEMA_VERSION
  });
  await storageRemove(chrome.storage.sync, LEGACY_SYNC_KEYS);

  const activeProfile = prepared.profiles.find((profile) => profile.id === prepared.activeProfileId);
  return {
    profiles: prepared.profiles,
    activeProfileId: prepared.activeProfileId,
    activeProfile,
    uiLocale
  };
}

// Handle long-lived streaming connection from content script
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "summarize-stream") return;
  if (!isSameExtensionSender(port.sender)) {
    try {
      port.disconnect();
    } catch (error) {
      // Ignore disconnect failures for an already-closed port.
    }
    return;
  }

  let abortController = new AbortController();

  port.onDisconnect.addListener(() => {
    abortController.abort();
  });

  port.onMessage.addListener((msg) => {
    Promise.resolve().then(async () => {
      if (!msg || typeof msg.action !== "string") return;

      if (msg.action === "START_STREAM_CHAT") {
        const { messages, profileId } = msg;
        await streamChat(port, abortController.signal, messages, profileId);
      } else if (msg.action === "ABORT_STREAM") {
        abortController.abort();
        abortController = new AbortController();
      }
    }).catch((error) => {
      postPortMessage(port, {
        type: "ERROR",
        errorCode: error?.code || "STREAM_REQUEST_FAILED",
        message: "無法處理串流請求，請檢查設定與輸入內容。"
      });
    });
  });
});

// Stream Chat Implementation
async function streamChat(port, signal, rawMessages, requestedProfileId) {
  const { profiles, activeProfile, uiLocale } = await getProfileConfig();
  const cleanMessages = PROFILE_SCHEMA.prepareChatMessages(rawMessages);
  
  // Use requested profile if specified, otherwise active profile
  const profile = requestedProfileId
    ? profiles.find((p) => p.id === requestedProfileId)
    : activeProfile;

  if (!profile) {
    postPortMessage(port, {
      type: "ERROR",
      errorCode: "PROFILE_NOT_FOUND",
      message: "找不到指定的 API 配置。"
    });
    return;
  }

  const apiUrl = profile.apiUrl && profile.apiUrl.trim() !== ""
    ? profile.apiUrl.trim()
    : "https://api.minimaxi.com/anthropic/v1/messages";
  const endpointAccess = await assertEndpointAccess(apiUrl, uiLocale);
  if (!endpointAccess.success) {
    postPortMessage(port, {
      type: "ERROR",
      errorCode: endpointAccess.errorCode,
      message: endpointAccess.error
    });
    return;
  }

  const isOllamaLocal = PROFILE_VIEW.isLocalProfile(profile);

  if ((!profile.apiKey || profile.apiKey.trim() === "") && !isOllamaLocal) {
    postPortMessage(port, {
      type: "ERROR",
      errorCode: "NO_API_KEY",
      message: `尚未設定 [${profile.name || "當前配置"}] 的 API Key！請至外掛設定頁面配置密鑰。`
    });
    return;
  }

  const format = profile.apiFormat || (profile.apiUrl.includes("/chat/completions") ? "openai" : "anthropic");
  const modelName = profile.model || (format === "anthropic" ? "MiniMax-M3" : "gpt-5.6-luna");
  const maxTokens = parseInt(profile.maxTokens, 10) || 2048;
  const temperature = Number.isFinite(Number(profile.temperature)) ? Number(profile.temperature) : 0.5;
  const sysPrompt = PROMPT_SAFETY.appendPromptInjectionGuard(
    profile.systemPrompt || DEFAULT_SYSTEM_PROMPT
  );
  const apiKeyTrimmed = (profile.apiKey || "").trim();

  let headers = { "Content-Type": "application/json" };
  let requestBody = {};

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
    postPortMessage(port, { type: "START", model: modelName, profileName: profile.name });

    const response = await fetchWithTimeout(apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody)
    }, signal);

    if (!response.ok) {
      let errorDetail = "";
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.error?.message || errorJson.message || JSON.stringify(errorJson);
      } catch (e) {
        errorDetail = await response.text();
      }
      errorDetail = String(errorDetail || "").slice(0, 4000);

      postPortMessage(port, {
        type: "ERROR",
        errorCode: "API_HTTP_ERROR",
        message: `[${profile.name}] API 請求失敗 (${response.status} ${response.statusText}):\n${errorDetail || "請檢查 API Key、端點與格式設定。"}`
      });
      return;
    }

    if (!response.body || typeof response.body.getReader !== "function") {
      throw PROFILE_SCHEMA.makeError("EMPTY_RESPONSE", "The API returned no response body.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let streamedChars = 0;

    const emitChunk = (text) => {
      if (typeof text !== "string" || !text) return;
      const remaining = PROFILE_SCHEMA.MAX_STREAM_CHARS - streamedChars;
      if (remaining <= 0) throw PROFILE_SCHEMA.makeError("STREAM_LIMIT_EXCEEDED", "The response is too large.");

      const chunk = text.slice(0, remaining);
      streamedChars += chunk.length;
      postPortMessage(port, { type: "CHUNK", text: chunk });
      if (chunk.length < text.length) {
        throw PROFILE_SCHEMA.makeError("STREAM_LIMIT_EXCEEDED", "The response is too large.");
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      if (buffer.length > PROFILE_SCHEMA.MAX_SSE_BUFFER_CHARS) {
        throw PROFILE_SCHEMA.makeError("STREAM_BUFFER_LIMIT_EXCEEDED", "The streamed response buffer is too large.");
      }
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
              emitChunk(data.delta.text);
            } 
            // OpenAI stream
            else if (data.choices && data.choices[0]?.delta?.content) {
              emitChunk(data.choices[0].delta.content);
            }
            // Direct text fallback
            else if (data.text) {
              emitChunk(data.text);
            }
          } catch (jsonErr) {
            // Non-json SSE data line
          }
        }
      }
    }

    postPortMessage(port, { type: "DONE" });
  } catch (err) {
    if (err.name === "AbortError") {
      postPortMessage(port, { type: "ABORTED" });
      return;
    }

    console.error("Stream chat error:", err);
    postPortMessage(port, {
      type: "ERROR",
      errorCode: err?.code || "NETWORK_ERROR",
      message: err?.code === "STREAM_LIMIT_EXCEEDED" || err?.code === "STREAM_BUFFER_LIMIT_EXCEEDED"
        ? "API 回應過大，已停止串流以避免外掛資源耗盡。"
        : `網路連線或請求錯誤: ${err.message || err}`
    });
  }
}

// Runtime message listener for profiles management & connection testing
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!isSameExtensionSender(sender)) {
    sendResponse({ success: false, error: "UNAUTHORIZED" });
    return false;
  }

  const action = request?.action;

  if (action === "GET_PUBLIC_PROFILES" || action === "GET_PROFILES") {
    getProfileConfig().then((data) => {
      sendResponse({
        success: true,
        ...PROFILE_VIEW.toPublicProfilePayload(data)
      });
    }).catch((error) => {
      sendResponse(getProfileErrorResponse(error));
    });
    return true;
  }

  if (action === "GET_PROFILES_FOR_OPTIONS") {
    if (!isOptionsPageSender(sender)) {
      sendResponse({ success: false, error: "UNAUTHORIZED" });
      return false;
    }

    getProfileConfig().then((data) => sendResponse({ success: true, ...data }))
      .catch((error) => sendResponse(getProfileErrorResponse(error)));
    return true;
  }

  if (action === "SET_ACTIVE_PROFILE") {
    Promise.resolve().then(async () => {
      const data = await getProfileConfig();
      if (typeof request.profileId !== "string" ||
          !data.profiles.some((profile) => profile.id === request.profileId)) {
        throw PROFILE_SCHEMA.makeError("INVALID_PROFILE_DATA", "Unknown active profile.");
      }
      await storageSet(chrome.storage.sync, { activeProfileId: request.profileId });
      return { success: true };
    }).then(sendResponse)
      .catch((error) => sendResponse(getProfileErrorResponse(error, "PROFILE_SAVE_FAILED")));
    return true;
  }

  if (action === "SAVE_ALL_PROFILES") {
    if (!isOptionsPageSender(sender)) {
      sendResponse({ success: false, error: "UNAUTHORIZED" });
      return false;
    }

    saveProfileConfig(request.profiles, request.activeProfileId, request.uiLocale)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse(getProfileErrorResponse(error, "PROFILE_SAVE_FAILED")));
    return true;
  }

  if (action === "OPEN_OPTIONS") {
    chrome.runtime.openOptionsPage();
    sendResponse({ success: true });
    return true;
  }

  if (action === "TEST_PROFILE_CONNECTION") {
    if (!isOptionsPageSender(sender)) {
      sendResponse({ success: false, error: "UNAUTHORIZED" });
      return false;
    }

    Promise.resolve().then(() => {
      const profile = PROFILE_SCHEMA.validateProfileRecord(request.profile);
      return testProfileConnection(profile, request.locale);
    }).then(sendResponse)
      .catch((error) => sendResponse(getProfileErrorResponse(error, "PROFILE_TEST_FAILED")));
    return true;
  }

  if (action === "SET_UI_LOCALE") {
    if (!isOptionsPageSender(sender)) {
      sendResponse({ success: false, error: "UNAUTHORIZED" });
      return false;
    }

    const uiLocale = I18N.normalizeLocale(request.locale);
    storageSet(chrome.storage.sync, { uiLocale })
      .then(() => {
        updateContextMenus(uiLocale);
        sendResponse({ success: true, uiLocale });
      })
      .catch((error) => sendResponse(getProfileErrorResponse(error, "PROFILE_SAVE_FAILED")));
    return true;
  }

  sendResponse({ success: false, error: "UNKNOWN_ACTION" });
  return false;
});

// Test connection for a given profile
async function testProfileConnection(profile, requestedLocale) {
  const locale = I18N.normalizeLocale(requestedLocale);
  const startTime = Date.now();
  const apiUrl = profile.apiUrl && profile.apiUrl.trim() !== ""
    ? profile.apiUrl.trim()
    : "https://api.minimaxi.com/anthropic/v1/messages";
  const endpointAccess = await assertEndpointAccess(apiUrl, locale);
  if (!endpointAccess.success) return endpointAccess;

  const isOllamaLocal = PROFILE_VIEW.isLocalProfile(profile);

  if ((!profile.apiKey || profile.apiKey.trim() === "") && !isOllamaLocal) {
    return {
      success: false,
      error: I18N.translate(locale, "backgroundMissingKey")
    };
  }

  const format = profile.apiFormat || (apiUrl.includes("/chat/completions") ? "openai" : "anthropic");
  const modelName = profile.model || (format === "anthropic" ? "MiniMax-M3" : "gpt-5.6-luna");
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
    const response = await fetchWithTimeout(apiUrl, {
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
      detail = String(detail || "").slice(0, 4000);
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
      reply: replyText.trim().slice(0, 1000)
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
