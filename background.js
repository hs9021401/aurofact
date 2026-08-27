// background.js - Service Worker for AI Web Summarizer with Multi-Profile API Support

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

const DEFAULT_PROFILES = [
  {
    id: "profile_minimax",
    name: "🟣 MiniMax-M3",
    apiFormat: "anthropic",
    apiUrl: "https://api.minimaxi.com/anthropic/v1/messages",
    apiKey: "",
    model: "MiniMax-M3",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    maxTokens: 2048,
    temperature: 0.5
  },
  {
    id: "profile_deepseek",
    name: "🔵 DeepSeek-V3",
    apiFormat: "openai",
    apiUrl: "https://api.deepseek.com/chat/completions",
    apiKey: "",
    model: "deepseek-chat",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    maxTokens: 2048,
    temperature: 0.5
  },
  {
    id: "profile_openai",
    name: "🟢 GPT-4o-mini",
    apiFormat: "openai",
    apiUrl: "https://api.openai.com/v1/chat/completions",
    apiKey: "",
    model: "gpt-4o-mini",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    maxTokens: 2048,
    temperature: 0.5
  },
  {
    id: "profile_claude",
    name: "🟠 Claude 3.5 Sonnet",
    apiFormat: "anthropic",
    apiUrl: "https://api.anthropic.com/v1/messages",
    apiKey: "",
    model: "claude-3-5-sonnet-20241022",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    maxTokens: 2048,
    temperature: 0.5
  },
  {
    id: "profile_ollama",
    name: "⚪ Ollama (本地免 Key)",
    apiFormat: "openai",
    apiUrl: "http://localhost:11434/v1/chat/completions",
    apiKey: "",
    model: "llama3.2",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    maxTokens: 2048,
    temperature: 0.5
  }
];

// Initialize on extension install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "summarize_page",
      title: "📝 總結此網頁重點",
      contexts: ["page", "frame"]
    });

    chrome.contextMenus.create({
      id: "summarize_selection",
      title: "📝 總結所選文字",
      contexts: ["selection"]
    });
  });

  // Check and initialize profiles storage
  chrome.storage.sync.get(["profiles", "activeProfileId", "apiKey", "apiUrl"], (items) => {
    let profiles = items.profiles;
    let activeProfileId = items.activeProfileId;

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

      chrome.storage.sync.set({ profiles, activeProfileId });
    }
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  const isSelection = info.menuItemId === "summarize_selection";
  const payload = {
    action: "TRIGGER_SUMMARY",
    isSelection: isSelection,
    selectionText: isSelection ? (info.selectionText || "") : null
  };

  try {
    await chrome.tabs.sendMessage(tab.id, payload);
  } catch (err) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, payload).catch((e) => {
          console.error("Failed to send message after injection:", e);
        });
      }, 100);
    } catch (injectErr) {
      console.error("Cannot inject content script on this tab:", injectErr);
    }
  }
});

// Helper: Get active profile and all profiles
async function getProfileConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["profiles", "activeProfileId", "apiKey", "apiUrl", "model", "apiFormat"], (items) => {
      let profiles = items.profiles;
      let activeProfileId = items.activeProfileId;

      if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
        profiles = JSON.parse(JSON.stringify(DEFAULT_PROFILES));
        if (items.apiKey) profiles[0].apiKey = items.apiKey;
        if (items.apiUrl) profiles[0].apiUrl = items.apiUrl;
        if (items.model) profiles[0].model = items.model;
        if (items.apiFormat) profiles[0].apiFormat = items.apiFormat;
        activeProfileId = profiles[0].id;
      }

      let activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
      resolve({ profiles, activeProfileId: activeProfile.id, activeProfile });
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
  const modelName = profile.model || (format === "anthropic" ? "MiniMax-M3" : "gpt-4o-mini");
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
      temperature: temperature,
      stream: true,
      system: sysPrompt,
      messages: cleanMessages
    };
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
      activeProfileId: request.activeProfileId
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
    testProfileConnection(request.profile).then((result) => {
      sendResponse(result);
    });
    return true;
  }
});

// Test connection for a given profile
async function testProfileConnection(profile) {
  const startTime = Date.now();
  const isOllamaLocal = profile.apiUrl && profile.apiUrl.includes("localhost");

  if ((!profile.apiKey || profile.apiKey.trim() === "") && !isOllamaLocal) {
    return {
      success: false,
      error: "請先輸入 API Key"
    };
  }

  const format = profile.apiFormat || (profile.apiUrl.includes("/chat/completions") ? "openai" : "anthropic");
  const modelName = profile.model || (format === "anthropic" ? "MiniMax-M3" : "gpt-4o-mini");
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
        error: `連線失敗 (HTTP ${response.status}): ${detail}`
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
      error: `連線異常: ${err.message || err}`
    };
  }
}
