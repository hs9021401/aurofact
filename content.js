// content.js - Injected Content Script with Multi-Turn Q&A, Dynamic Profile Switcher, and Safe Viewport Dragging

(function () {
  if (window.__webSummarizerInjected) return;
  window.__webSummarizerInjected = true;

  let currentPort = null;
  let shadowRoot = null;
  let hostElement = null;
  let isGenerating = false;
  let conversationHistory = [];
  let currentStreamingText = "";
  let lastExtractionContext = null;
  let availableProfiles = [];
  let currentActiveProfileId = "";

  // Position tracking
  let currentLeft = 0;
  let currentTop = 0;
  let isDragging = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;
  let isResizing = false;
  let resizeStartX = 0, resizeStartY = 0;
  let resizeStartWidth = 0, resizeStartHeight = 0;
  let resizeObserver = null;
  let windowStateBeforeMaximize = null;

  const RESIZE_MIN_WIDTH = 360;
  const RESIZE_MIN_HEIGHT = 360;
  const VIEWPORT_MARGIN = 12;

  // Listen for trigger messages from background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "TRIGGER_SUMMARY") {
      initiateSummary(request.isSelection, request.selectionText);
      sendResponse({ status: "started" });
    }
  });

  // Extract clean text from the webpage
  function extractPageContent(isSelection, selectionText) {
    if (isSelection && selectionText && selectionText.trim()) {
      return {
        title: document.title || "選取文字",
        url: window.location.href,
        text: selectionText.trim(),
        isSelection: true
      };
    }

    const title = document.title || "";
    const url = window.location.href;

    const selectors = [
      "article", "main", "[role='main']", ".post-content",
      ".article-content", ".entry-content", ".article-body",
      "#article-body", ".markdown-body", ".content-body", "#content"
    ];

    let mainElement = null;
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.innerText && el.innerText.trim().length > 250) {
        mainElement = el;
        break;
      }
    }

    const targetEl = mainElement ? mainElement.cloneNode(true) : document.body.cloneNode(true);

    const removeSelectors = [
      "script", "style", "noscript", "nav", "header", "footer", "aside",
      "form", "svg", "iframe", "[role='banner']", "[role='navigation']",
      "[aria-hidden='true']", ".ad", ".ads", ".advertisement", "#comments",
      ".comments", ".cookie-banner", ".modal", ".popup", "#web-summarizer-host"
    ];

    removeSelectors.forEach((sel) => {
      targetEl.querySelectorAll(sel).forEach((el) => el.remove());
    });

    let rawText = targetEl.innerText || targetEl.textContent || "";
    let cleanText = rawText
      .replace(/\r\n/g, "\n")
      .replace(/\t/g, " ")
      .replace(/[ \u00a0]+/g, " ")
      .replace(/\n\s*\n\s*\n+/g, "\n\n")
      .trim();

    const MAX_CHARS = 35000;
    if (cleanText.length > MAX_CHARS) {
      cleanText = cleanText.substring(0, MAX_CHARS) + "\n\n[...內容過長，已自動截取前 35,000 字進行分析...]";
    }

    return {
      title,
      url,
      text: cleanText,
      isSelection: false
    };
  }

  // Ensure Shadow DOM host and structure
  function ensureUI() {
    if (!hostElement) {
      hostElement = document.createElement("div");
      hostElement.id = "web-summarizer-host";
      document.documentElement.appendChild(hostElement);

      shadowRoot = hostElement.attachShadow({ mode: "open" });
      buildUIStructure();
      attachUIEvents();
      setInitialPosition();

      const card = shadowRoot.getElementById("ws-main-card");
      if (card && typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          syncViewportLayout();
        });
        resizeObserver.observe(card);
      }

      window.addEventListener("resize", syncViewportLayout);
    }
    loadProfilesIntoHeader();
    return shadowRoot;
  }

  // Fetch profiles from background to populate the header selector
  function loadProfilesIntoHeader() {
    chrome.runtime.sendMessage({ action: "GET_PROFILES" }, (res) => {
      if (res && res.success) {
        availableProfiles = res.profiles || [];
        currentActiveProfileId = res.activeProfileId || availableProfiles[0]?.id || "";
        
        const selector = shadowRoot.getElementById("ws-profile-selector");
        if (selector) {
          selector.innerHTML = "";
          availableProfiles.forEach((p) => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = `${p.name} (${p.model})`;
            if (p.id === currentActiveProfileId) {
              opt.selected = true;
            }
            selector.appendChild(opt);
          });
        }
      }
    });
  }

  // Set default bottom-right position with safety bounds
  function setInitialPosition() {
    if (!hostElement || !shadowRoot) return;
    const card = shadowRoot.getElementById("ws-main-card");
    const cardWidth = card ? card.offsetWidth || 480 : 480;
    const cardHeight = card ? card.offsetHeight || 620 : 620;

    currentLeft = Math.max(12, window.innerWidth - cardWidth - 24);
    currentTop = Math.max(12, window.innerHeight - cardHeight - 24);

    hostElement.style.left = `${currentLeft}px`;
    hostElement.style.top = `${currentTop}px`;
    hostElement.style.right = "auto";
    hostElement.style.bottom = "auto";
  }

  // Keep the entire resizable card inside the viewport
  function clampPositionToBounds() {
    if (!hostElement || !shadowRoot) return;
    const card = shadowRoot.getElementById("ws-main-card");
    if (!card) return;

    if (card.classList.contains("ws-maximized")) {
      currentLeft = 0;
      currentTop = 0;
      hostElement.style.left = "0px";
      hostElement.style.top = "0px";
      hostElement.style.right = "auto";
      hostElement.style.bottom = "auto";
      return;
    }

    const cardWidth = card.offsetWidth || 480;
    const cardHeight = card.offsetHeight || 620;

    const minLeft = 10;
    const maxLeft = Math.max(10, window.innerWidth - cardWidth - 10);
    const minTop = 10;
    const maxTop = Math.max(10, window.innerHeight - cardHeight - VIEWPORT_MARGIN);

    currentLeft = Math.min(Math.max(minLeft, currentLeft), maxLeft);
    currentTop = Math.min(Math.max(minTop, currentTop), maxTop);

    hostElement.style.left = `${currentLeft}px`;
    hostElement.style.top = `${currentTop}px`;
  }

  // Keep a maximized card exactly aligned with the current viewport.
  function syncViewportLayout() {
    if (!hostElement || !shadowRoot) return;
    const card = shadowRoot.getElementById("ws-main-card");
    if (!card) return;

    if (!card.classList.contains("ws-maximized")) {
      clampPositionToBounds();
      return;
    }

    const viewportWidth = `${Math.max(0, window.innerWidth)}px`;
    const viewportHeight = `${Math.max(0, window.innerHeight)}px`;

    if (card.style.width !== viewportWidth) card.style.width = viewportWidth;
    if (card.style.height !== viewportHeight) card.style.height = viewportHeight;
    if (hostElement.style.width !== viewportWidth) hostElement.style.width = viewportWidth;
    if (hostElement.style.height !== viewportHeight) hostElement.style.height = viewportHeight;

    currentLeft = 0;
    currentTop = 0;
    hostElement.style.left = "0px";
    hostElement.style.top = "0px";
    hostElement.style.right = "auto";
    hostElement.style.bottom = "auto";
  }

  function getResizeConstraints() {
    const maxWidth = Math.max(0, window.innerWidth - VIEWPORT_MARGIN * 2);
    const maxHeight = Math.max(0, window.innerHeight - VIEWPORT_MARGIN * 2);

    return {
      minWidth: Math.min(RESIZE_MIN_WIDTH, maxWidth),
      maxWidth,
      minHeight: Math.min(RESIZE_MIN_HEIGHT, maxHeight),
      maxHeight
    };
  }

  function clampDimension(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  // Build the complete Shadow DOM HTML
  function buildUIStructure() {
    const style = document.createElement("style");
    style.textContent = getShadowStyles();
    shadowRoot.appendChild(style);

    const container = document.createElement("div");
    container.className = "ws-card";
    container.id = "ws-main-card";
    container.innerHTML = `
      <!-- Header (Top Drag Handle) -->
      <div class="ws-header" id="ws-drag-handle" title="按住拖曳視窗（按兩下重設位置）">
        <div class="ws-header-left">
          <div class="ws-logo-badge">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <span class="ws-title" id="ws-header-title">AI 總結</span>
          
          <!-- Header Profile Quick Switcher -->
          <div class="ws-profile-select-wrapper" title="快速切換 AI 模型/配置">
            <select id="ws-profile-selector" class="ws-profile-select">
              <option value="">載入中...</option>
            </select>
          </div>
        </div>

        <div class="ws-header-actions">
          <button class="ws-btn-icon" id="ws-btn-settings" title="外掛設定">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>
          <button class="ws-btn-icon" id="ws-btn-minimize" title="最小化/還原">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          <button class="ws-btn-icon" id="ws-btn-maximize" title="最大化視窗" aria-label="最大化視窗">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M21 16v5h-5"></path></svg>
          </button>
          <button class="ws-btn-icon ws-btn-close" id="ws-btn-close" title="關閉 (Esc)" aria-label="關閉 (Esc)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <!-- Scrollable Message Body -->
      <div class="ws-body" id="ws-body-content">
        <!-- Initial Loading State -->
        <div class="ws-state-box" id="ws-loading-state">
          <div class="ws-spinner"></div>
          <p class="ws-loading-text" id="ws-loading-text">正在分析網頁內容並調用 AI 進行總結...</p>
        </div>

        <!-- Chat Feed -->
        <div class="ws-chat-feed" id="ws-chat-feed" style="display: none;"></div>

        <!-- Error Box -->
        <div class="ws-error-box" id="ws-error-box" style="display: none;">
          <div class="ws-error-icon">⚠️</div>
          <div class="ws-error-title" id="ws-error-title">發生錯誤</div>
          <div class="ws-error-msg" id="ws-error-msg"></div>
          <div class="ws-error-action" id="ws-error-actions"></div>
        </div>
      </div>

      <!-- Quick Suggestion Chips -->
      <div class="ws-suggestions-bar" id="ws-suggestions-bar" style="display: none;">
        <span class="ws-sug-label">💡 延伸：</span>
        <button type="button" class="ws-chip" data-query="請針對本文的核心論點做更進一步的延伸分析與背景說明。">🔍 深入解析</button>
        <button type="button" class="ws-chip" data-query="請用最簡單白話、通俗易懂的例子向我解釋本文重點。">👶 通俗解釋</button>
        <button type="button" class="ws-chip" data-query="根據這篇文章的內容，可以提煉出哪些具體可執行的行動建議或步驟？">📋 行動建議</button>
        <button type="button" class="ws-chip" data-query="這篇文章提出的觀點有哪些潛在的優缺點、限制或正反面爭議？">⚖️ 批判評估</button>
      </div>

      <!-- Interactive Input Footer -->
      <div class="ws-chat-input-container" id="ws-chat-input-container">
        <div class="ws-input-wrapper">
          <textarea
            id="ws-chat-input"
            class="ws-chat-textarea"
            rows="1"
            placeholder="針對此文章進一步提問... (Enter 發送, Shift+Enter 換行)"
            disabled
          ></textarea>
          <button type="button" id="ws-btn-send" class="ws-btn-send" title="發送提問" disabled>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

      <!-- Bottom Status Bar (Secondary Drag Handle) -->
      <div class="ws-footer" id="ws-footer">
        <div class="ws-footer-left" id="ws-footer-drag" title="按住拖曳視窗（按兩下重設位置）">
          <svg class="ws-grip-icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="2"></circle>
            <circle cx="15" cy="6" r="2"></circle>
            <circle cx="9" cy="12" r="2"></circle>
            <circle cx="15" cy="12" r="2"></circle>
            <circle cx="9" cy="18" r="2"></circle>
            <circle cx="15" cy="18" r="2"></circle>
          </svg>
          <span class="ws-stats-text" id="ws-stats-text">準備中...</span>
        </div>
        <div class="ws-footer-actions">
          <button class="ws-btn-action" id="ws-btn-reset-pos" title="將視窗重設回右下角">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
            <span>重設位置</span>
          </button>
          <button class="ws-btn-action" id="ws-btn-retry" title="重新總結文章">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            <span>重新總結</span>
          </button>
          <button class="ws-btn-action ws-btn-primary" id="ws-btn-copy-all" title="複製完整對話記錄">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span id="ws-copy-btn-text">複製重點</span>
          </button>
        </div>
      </div>

      <!-- Bottom-right Resize Handle -->
      <div class="ws-resize-handle" id="ws-resize-handle" title="拖曳以調整視窗大小" aria-label="拖曳以調整視窗大小">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M13 1L1 13M13 6L6 13M13 11L11 13" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"></path>
        </svg>
      </div>
    `;

    shadowRoot.appendChild(container);
  }

  // Shadow DOM isolated CSS styles with compact, clean typography & header profile select
  function getShadowStyles() {
    return `
      :host {
        all: initial;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang TC", "Microsoft JhengHei", sans-serif;
        font-size: 13.5px;
        line-height: 1.5;
        color: #1e293b;
        z-index: 2147483647;
        position: fixed;
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      .ws-card {
        width: 480px;
        min-width: min(360px, calc(100vw - 24px));
        max-width: calc(100vw - 24px);
        height: 620px;
        min-height: min(360px, calc(100vh - 24px));
        max-height: calc(100vh - 24px);
        background: #ffffff;
        border-radius: 14px;
        box-shadow: 0 20px 44px -10px rgba(0, 0, 0, 0.22), 0 0 1px 1px rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
        transition: height 0.25s ease;
        animation: ws-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid rgba(226, 232, 240, 0.9);
      }

      .ws-card.ws-resizing {
        transition: none;
        user-select: none;
      }

      .ws-card.ws-minimized {
        height: 50px !important;
        min-height: 0 !important;
        max-height: 50px !important;
        flex: 0 0 50px;
        overflow: hidden;
      }

      .ws-card.ws-maximized {
        min-width: 0 !important;
        max-width: none !important;
        min-height: 0 !important;
        max-height: none !important;
        border-radius: 0;
        box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.16);
      }

      .ws-card.ws-minimized .ws-body,
      .ws-card.ws-minimized .ws-suggestions-bar,
      .ws-card.ws-minimized .ws-chat-input-container,
      .ws-card.ws-minimized .ws-footer {
        display: none !important;
      }

      @keyframes ws-slide-up {
        from { opacity: 0; transform: translateY(14px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      /* Header (Top Drag Handle) */
      .ws-header {
        height: 50px;
        min-height: 50px;
        background: linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%);
        color: #ffffff;
        padding: 0 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: grab;
        user-select: none;
      }

      .ws-header:active { cursor: grabbing; }

      .ws-header-left {
        display: flex;
        align-items: center;
        gap: 6px;
        overflow: hidden;
        flex: 1;
      }

      .ws-logo-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        backdrop-filter: blur(4px);
        flex-shrink: 0;
      }

      .ws-title {
        font-weight: 600;
        font-size: 13.5px;
        letter-spacing: 0.2px;
        white-space: nowrap;
        flex-shrink: 0;
      }

      /* Header Profile Select */
      .ws-profile-select-wrapper {
        position: relative;
        max-width: 170px;
        flex-shrink: 1;
      }

      .ws-profile-select {
        background: rgba(255, 255, 255, 0.22);
        border: 1px solid rgba(255, 255, 255, 0.35);
        color: #ffffff;
        font-size: 11px;
        font-weight: 600;
        padding: 2px 20px 2px 7px;
        border-radius: 10px;
        outline: none;
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 6px center;
        width: 100%;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }

      .ws-profile-select option {
        background: #1e293b;
        color: #ffffff;
      }

      .ws-profile-select:hover {
        background-color: rgba(255, 255, 255, 0.3);
      }

      .ws-header-actions {
        display: flex;
        align-items: center;
        gap: 3px;
        flex-shrink: 0;
      }

      .ws-btn-icon {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.85);
        cursor: pointer;
        width: 26px;
        height: 26px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, color 0.15s;
      }

      .ws-btn-icon:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
      }

      .ws-btn-close:hover {
        background: rgba(239, 68, 68, 0.45);
      }

      /* Body & Chat Feed */
      .ws-body {
        flex: 1;
        overflow-y: auto;
        padding: 12px 14px;
        background: #f8fafc;
        position: relative;
      }

      .ws-body::-webkit-scrollbar { width: 5px; }
      .ws-body::-webkit-scrollbar-track { background: transparent; }
      .ws-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      .ws-body::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

      .ws-chat-feed {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      /* Message Bubbles */
      .ws-msg-row {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .ws-msg-user {
        align-self: flex-end;
        max-width: 86%;
        background: #4f46e5;
        color: #ffffff;
        padding: 8px 12px;
        border-radius: 14px 14px 3px 14px;
        font-size: 13.5px;
        line-height: 1.45;
        box-shadow: 0 2px 5px rgba(79, 70, 229, 0.2);
        word-break: break-word;
        white-space: pre-wrap;
      }

      .ws-msg-assistant {
        align-self: flex-start;
        width: 100%;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px 14px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        position: relative;
      }

      .ws-bubble-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
        padding-bottom: 4px;
        border-bottom: 1px solid #f1f5f9;
        font-size: 11.5px;
        color: #64748b;
        font-weight: 600;
      }

      .ws-btn-bubble-copy {
        background: transparent;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 3px;
        transition: all 0.15s ease;
      }

      .ws-btn-bubble-copy:hover {
        background: #f1f5f9;
        color: #4f46e5;
      }

      /* Loading State */
      .ws-state-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 200px;
        text-align: center;
        gap: 14px;
      }

      .ws-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #e2e8f0;
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: ws-spin 0.8s linear infinite;
      }

      @keyframes ws-spin { to { transform: rotate(360deg); } }

      .ws-loading-text {
        font-size: 13px;
        color: #64748b;
      }

      /* Compact Markdown Formatting */
      .ws-markdown-content {
        font-size: 13.5px;
        line-height: 1.55;
        color: #334155;
        word-break: break-word;
      }

      .ws-markdown-content h1,
      .ws-markdown-content h2,
      .ws-markdown-content h3,
      .ws-markdown-content h4 {
        color: #0f172a;
        margin-top: 10px;
        margin-bottom: 4px;
        font-weight: 700;
      }

      .ws-markdown-content h1:first-child,
      .ws-markdown-content h2:first-child,
      .ws-markdown-content h3:first-child,
      .ws-markdown-content h4:first-child {
        margin-top: 2px;
      }

      .ws-markdown-content h1 { font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
      .ws-markdown-content h2 { font-size: 15px; }
      .ws-markdown-content h3 { font-size: 14px; color: #4338ca; }
      .ws-markdown-content h4 { font-size: 13px; }

      .ws-markdown-content p {
        margin-bottom: 6px;
        line-height: 1.55;
      }

      .ws-markdown-content p:last-child {
        margin-bottom: 0;
      }

      .ws-markdown-content ul,
      .ws-markdown-content ol {
        margin-top: 3px;
        margin-bottom: 8px;
        padding-left: 18px;
      }

      .ws-markdown-content li {
        margin-bottom: 3px;
        line-height: 1.5;
      }

      .ws-markdown-content li:last-child {
        margin-bottom: 0;
      }

      .ws-markdown-content li::marker {
        color: #6366f1;
      }

      .ws-markdown-content strong {
        color: #0f172a;
        font-weight: 600;
      }

      .ws-markdown-content blockquote {
        border-left: 3px solid #6366f1;
        background: #f1f5f9;
        padding: 4px 10px;
        margin: 6px 0;
        border-radius: 0 6px 6px 0;
        color: #475569;
        font-style: italic;
        font-size: 13px;
      }

      .ws-markdown-content code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 12px;
        background: #f1f5f9;
        color: #e11d48;
        padding: 1px 4px;
        border-radius: 4px;
      }

      .ws-markdown-content pre {
        background: #0f172a;
        color: #f8fafc;
        padding: 8px 10px;
        border-radius: 6px;
        overflow-x: auto;
        margin: 8px 0;
        font-size: 12px;
        line-height: 1.45;
      }

      .ws-markdown-content pre code { background: transparent; color: inherit; padding: 0; }

      .ws-cursor-pulse {
        display: inline-block;
        width: 4px;
        height: 14px;
        background-color: #6366f1;
        vertical-align: -2px;
        margin-left: 3px;
        border-radius: 2px;
        animation: ws-blink 0.9s infinite;
      }

      @keyframes ws-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      /* Error Box */
      .ws-error-box {
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 10px;
        padding: 16px;
        text-align: center;
        color: #991b1b;
      }

      .ws-error-icon { font-size: 26px; margin-bottom: 4px; }
      .ws-error-title { font-weight: 700; font-size: 14.5px; margin-bottom: 4px; }
      .ws-error-msg { font-size: 12.5px; line-height: 1.45; color: #b91c1c; margin-bottom: 10px; white-space: pre-wrap; word-break: break-word; }
      
      .ws-btn-error-action {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: #ef4444;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.15s;
      }
      .ws-btn-error-action:hover { background: #dc2626; }

      /* Suggestion Chips */
      .ws-suggestions-bar {
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        padding: 6px 12px;
        display: flex;
        align-items: center;
        gap: 5px;
        overflow-x: auto;
        white-space: nowrap;
      }

      .ws-suggestions-bar::-webkit-scrollbar { height: 3px; }
      .ws-suggestions-bar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }

      .ws-sug-label {
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        flex-shrink: 0;
      }

      .ws-chip {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        color: #334155;
        font-size: 11px;
        padding: 3px 9px;
        border-radius: 12px;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.15s ease;
      }

      .ws-chip:hover {
        background: #eef2ff;
        border-color: #6366f1;
        color: #4f46e5;
      }

      /* Interactive Chat Input */
      .ws-chat-input-container {
        background: #ffffff;
        border-top: 1px solid #e2e8f0;
        padding: 8px 12px;
      }

      .ws-input-wrapper {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        border-radius: 18px;
        padding: 3px 5px 3px 12px;
        transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
      }

      .ws-input-wrapper:focus-within {
        border-color: #6366f1;
        background: #ffffff;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
      }

      .ws-chat-textarea {
        flex: 1;
        border: none;
        background: transparent;
        font-family: inherit;
        font-size: 13px;
        line-height: 1.4;
        color: #0f172a;
        resize: none;
        outline: none;
        max-height: 70px;
        padding: 3px 0;
      }

      .ws-chat-textarea::placeholder { color: #94a3b8; }

      .ws-btn-send {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #4f46e5;
        color: #ffffff;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.15s ease;
      }

      .ws-btn-send:hover:not(:disabled) {
        background: #4338ca;
        transform: scale(1.05);
      }

      .ws-btn-send:disabled {
        background: #cbd5e1;
        cursor: not-allowed;
        opacity: 0.6;
      }

      .ws-btn-send.ws-btn-stop {
        background: #ef4444 !important;
        opacity: 1 !important;
        cursor: pointer !important;
      }

      /* Footer (Secondary Drag Handle) */
      .ws-footer {
        height: 40px;
        min-height: 40px;
        background: #ffffff;
        border-top: 1px solid #f1f5f9;
        padding: 0 26px 0 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        user-select: none;
      }

      .ws-footer-left {
        display: flex;
        align-items: center;
        gap: 5px;
        cursor: grab;
        padding: 3px 6px;
        border-radius: 5px;
        transition: background 0.15s;
      }

      .ws-footer-left:hover { background: #f1f5f9; }
      .ws-footer-left:active { cursor: grabbing; }

      .ws-grip-icon {
        color: #94a3b8;
        flex-shrink: 0;
      }

      .ws-stats-text { font-size: 11px; color: #64748b; }

      .ws-footer-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .ws-btn-action {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #cbd5e1;
        padding: 3px 7px;
        border-radius: 5px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .ws-btn-action:hover { background: #e2e8f0; color: #1e293b; }

      .ws-btn-action.ws-btn-primary {
        background: #4f46e5;
        color: #ffffff;
        border-color: #4338ca;
      }

      .ws-btn-action.ws-btn-primary:hover { background: #4338ca; }
      .ws-btn-action:disabled { opacity: 0.5; cursor: not-allowed; }

      /* Bottom-right Resize Handle */
      .ws-resize-handle {
        position: absolute;
        right: 1px;
        bottom: 1px;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        padding: 3px;
        color: #94a3b8;
        background: rgba(255, 255, 255, 0.92);
        border-radius: 8px 0 0 0;
        cursor: nwse-resize;
        touch-action: none;
        z-index: 20;
        transition: color 0.15s ease, background 0.15s ease;
      }

      .ws-resize-handle:hover {
        color: #4f46e5;
        background: #eef2ff;
      }

      .ws-card.ws-minimized .ws-resize-handle { display: none; }
      .ws-card.ws-maximized .ws-resize-handle { display: none; }
    `;
  }

  // Attach UI Event Listeners
  function attachUIEvents() {
    const card = shadowRoot.getElementById("ws-main-card");
    const dragHandleTop = shadowRoot.getElementById("ws-drag-handle");
    const dragHandleBottom = shadowRoot.getElementById("ws-footer-drag");
    const btnClose = shadowRoot.getElementById("ws-btn-close");
    const btnMinimize = shadowRoot.getElementById("ws-btn-minimize");
    const btnMaximize = shadowRoot.getElementById("ws-btn-maximize");
    const btnSettings = shadowRoot.getElementById("ws-btn-settings");
    const btnCopyAll = shadowRoot.getElementById("ws-btn-copy-all");
    const btnRetry = shadowRoot.getElementById("ws-btn-retry");
    const btnResetPos = shadowRoot.getElementById("ws-btn-reset-pos");
    const chatInput = shadowRoot.getElementById("ws-chat-input");
    const btnSend = shadowRoot.getElementById("ws-btn-send");
    const profileSelector = shadowRoot.getElementById("ws-profile-selector");

    // Close
    btnClose.addEventListener("click", () => {
      stopCurrentGeneration();
      stopResize();
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      window.removeEventListener("resize", syncViewportLayout);
      windowStateBeforeMaximize = null;
      if (hostElement) {
        hostElement.remove();
        hostElement = null;
        shadowRoot = null;
      }
    });

    // Minimize
    btnMinimize.addEventListener("click", () => {
      if (card.classList.contains("ws-maximized")) {
        const wasMinimized = windowStateBeforeMaximize?.wasMinimized === true;
        restoreWindowFromMaximized();
        if (!wasMinimized) card.classList.add("ws-minimized");
      } else {
        card.classList.toggle("ws-minimized");
      }
      clampPositionToBounds();
    });

    // Maximize / restore to the full viewport
    btnMaximize.addEventListener("click", () => {
      if (card.classList.contains("ws-maximized")) {
        restoreWindowFromMaximized();
      } else {
        maximizeWindow();
      }
    });

    // Settings
    btnSettings.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "OPEN_OPTIONS" });
    });

    // Switch Profile in Header
    profileSelector.addEventListener("change", () => {
      const selectedId = profileSelector.value;
      if (!selectedId) return;
      currentActiveProfileId = selectedId;
      chrome.runtime.sendMessage({ action: "SET_ACTIVE_PROFILE", profileId: selectedId });
    });

    // Reset position to bottom right
    btnResetPos.addEventListener("click", () => {
      resetWindowPosition();
    });

    // Double click handles to reset position
    dragHandleTop.addEventListener("dblclick", (e) => {
      if (e.target.closest("button") || e.target.closest("select")) return;
      resetWindowPosition();
    });
    dragHandleBottom.addEventListener("dblclick", (e) => {
      if (e.target.closest("button")) return;
      resetWindowPosition();
    });

    // Copy All Conversation
    btnCopyAll.addEventListener("click", () => {
      if (conversationHistory.length === 0) return;
      
      const fullText = conversationHistory
        .filter(m => m.role === "assistant")
        .map(m => m.content)
        .join("\n\n---\n\n");

      if (!fullText) return;

      navigator.clipboard.writeText(fullText).then(() => {
        const copyTextEl = shadowRoot.getElementById("ws-copy-btn-text");
        const orig = copyTextEl.textContent;
        copyTextEl.textContent = "已複製！";
        setTimeout(() => {
          if (copyTextEl) copyTextEl.textContent = orig;
        }, 1800);
      });
    });

    // Retry initial summary
    btnRetry.addEventListener("click", () => {
      if (lastExtractionContext) {
        startInitialSummary(lastExtractionContext);
      }
    });

    // Send / Stop button click
    btnSend.addEventListener("click", () => {
      if (isGenerating) {
        stopCurrentGeneration();
        finalizeAssistantStreaming();
        return;
      }
      sendUserFollowUp();
    });

    // Enter key press in textarea (with IME guard for Chinese typing)
    chatInput.addEventListener("keydown", (e) => {
      if (e.isComposing || e.keyCode === 229) return;

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendUserFollowUp();
      }
    });

    // Auto-resize textarea
    chatInput.addEventListener("input", () => {
      chatInput.style.height = "auto";
      chatInput.style.height = Math.min(chatInput.scrollHeight, 70) + "px";
    });

    // Suggestion chips
    shadowRoot.querySelectorAll(".ws-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const query = chip.getAttribute("data-query");
        if (query && !isGenerating) {
          chatInput.value = query;
          sendUserFollowUp();
        }
      });
    });

    // Attach dual drag handles (Top Header + Bottom Footer)
    bindDragHandle(dragHandleTop);
    bindDragHandle(dragHandleBottom);
    bindResizeHandle(shadowRoot.getElementById("ws-resize-handle"));
    updateMaximizeButton();

    function updateMaximizeButton() {
      const isMaximized = card.classList.contains("ws-maximized");
      const label = isMaximized ? "還原視窗大小" : "最大化視窗";

      btnMaximize.title = label;
      btnMaximize.setAttribute("aria-label", label);
      btnMaximize.innerHTML = isMaximized
        ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="7" width="10" height="10" rx="1"></rect><path d="M5 17H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"></path></svg>'
        : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M21 16v5h-5"></path></svg>';
    }

    function maximizeWindow() {
      if (card.classList.contains("ws-maximized")) return;

      windowStateBeforeMaximize = {
        width: card.style.width,
        height: card.style.height,
        left: currentLeft,
        top: currentTop,
        wasMinimized: card.classList.contains("ws-minimized")
      };

      card.classList.remove("ws-minimized");
      card.classList.add("ws-maximized");
      syncViewportLayout();
      updateMaximizeButton();
    }

    function restoreWindowFromMaximized() {
      if (!card.classList.contains("ws-maximized")) return;

      const savedState = windowStateBeforeMaximize;
      card.classList.remove("ws-maximized");

      if (savedState) {
        if (savedState.width) {
          card.style.width = savedState.width;
        } else {
          card.style.removeProperty("width");
        }
        if (savedState.height) {
          card.style.height = savedState.height;
        } else {
          card.style.removeProperty("height");
        }
        currentLeft = savedState.left;
        currentTop = savedState.top;
        if (savedState.wasMinimized) {
          card.classList.add("ws-minimized");
        }
      } else {
        setInitialPosition();
      }

      hostElement.style.removeProperty("width");
      hostElement.style.removeProperty("height");
      windowStateBeforeMaximize = null;
      clampPositionToBounds();
      updateMaximizeButton();
    }

    function resetWindowPosition() {
      if (card.classList.contains("ws-maximized")) {
        restoreWindowFromMaximized();
      }
      setInitialPosition();
      clampPositionToBounds();
    }

    function bindDragHandle(el) {
      el.addEventListener("mousedown", (e) => {
        if (e.target.closest("button") || e.target.closest("a") || e.target.closest("textarea") || e.target.closest("select")) return;
        if (card.classList.contains("ws-maximized")) return;
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const rect = hostElement.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        e.preventDefault();
      });
    }

    function onMouseMove(e) {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const card = shadowRoot.getElementById("ws-main-card");
      if (card?.classList.contains("ws-maximized")) return;
      const cardWidth = card ? card.offsetWidth || 480 : 480;
      const cardHeight = card ? card.offsetHeight || 620 : 620;

      const minLeft = 10;
      const maxLeft = Math.max(10, window.innerWidth - cardWidth - 10);
      const minTop = 10;
      const maxTop = Math.max(10, window.innerHeight - cardHeight - VIEWPORT_MARGIN);

      currentLeft = Math.min(Math.max(minLeft, initialLeft + deltaX), maxLeft);
      currentTop = Math.min(Math.max(minTop, initialTop + deltaY), maxTop);

      hostElement.style.left = `${currentLeft}px`;
      hostElement.style.top = `${currentTop}px`;
    }

    function onMouseUp() {
      if (isDragging) {
        isDragging = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }
    }

    function bindResizeHandle(el) {
      if (!el) return;

      el.addEventListener("mousedown", (e) => {
        if (e.button !== 0 || card.classList.contains("ws-minimized")) return;

        const rect = card.getBoundingClientRect();
        isResizing = true;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        resizeStartWidth = rect.width;
        resizeStartHeight = rect.height;
        card.classList.add("ws-resizing");

        document.addEventListener("mousemove", onResizeMove);
        document.addEventListener("mouseup", onResizeUp);
        e.preventDefault();
        e.stopPropagation();
      });
    }

    function onResizeMove(e) {
      if (!isResizing) return;

      const constraints = getResizeConstraints();
      const nextWidth = clampDimension(
        resizeStartWidth + e.clientX - resizeStartX,
        constraints.minWidth,
        constraints.maxWidth
      );
      const nextHeight = clampDimension(
        resizeStartHeight + e.clientY - resizeStartY,
        constraints.minHeight,
        constraints.maxHeight
      );

      card.style.width = `${Math.round(nextWidth)}px`;
      card.style.height = `${Math.round(nextHeight)}px`;
      clampPositionToBounds();
      e.preventDefault();
    }

    function onResizeUp() {
      stopResize();
    }

    function stopResize() {
      if (!isResizing) return;

      isResizing = false;
      card.classList.remove("ws-resizing");
      document.removeEventListener("mousemove", onResizeMove);
      document.removeEventListener("mouseup", onResizeUp);
      clampPositionToBounds();
    }

    // Escape closes modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && hostElement) {
        btnClose.click();
      }
    });
  }

  // Stop active generation
  function stopCurrentGeneration() {
    if (currentPort) {
      try {
        currentPort.postMessage({ action: "ABORT_STREAM" });
        currentPort.disconnect();
      } catch (e) {}
      currentPort = null;
    }
    isGenerating = false;
    updateInputState(true);
  }

  // Update input controls based on generation status
  function updateInputState(enabled) {
    const chatInput = shadowRoot.getElementById("ws-chat-input");
    const btnSend = shadowRoot.getElementById("ws-btn-send");
    const btnRetry = shadowRoot.getElementById("ws-btn-retry");
    const btnCopyAll = shadowRoot.getElementById("ws-btn-copy-all");

    if (enabled) {
      chatInput.disabled = false;
      btnSend.disabled = false;
      btnSend.classList.remove("ws-btn-stop");
      btnSend.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      `;
      btnSend.title = "發送提問";
      btnRetry.disabled = false;
      btnCopyAll.disabled = false;
      chatInput.focus();
    } else {
      chatInput.disabled = true;
      btnSend.disabled = false;
      btnSend.classList.add("ws-btn-stop");
      btnSend.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2"></rect>
        </svg>
      `;
      btnSend.title = "停止生成";
      btnRetry.disabled = true;
      btnCopyAll.disabled = true;
    }
  }

  // Start initial summary workflow
  function initiateSummary(isSelection, selectionText) {
    ensureUI();
    const card = shadowRoot.getElementById("ws-main-card");
    card.classList.remove("ws-minimized");

    const extraction = extractPageContent(isSelection, selectionText);
    lastExtractionContext = extraction;

    const titleEl = shadowRoot.getElementById("ws-header-title");
    titleEl.textContent = extraction.isSelection ? "選取摘要" : "AI 總結";

    clampPositionToBounds();
    startInitialSummary(extraction);
  }

  // Execute initial summary
  function startInitialSummary(extraction) {
    stopCurrentGeneration();
    conversationHistory = [];

    const promptContent = extraction.isSelection
      ? `請總結以下使用者在網頁【${extraction.title || "未命名網頁"}】中選取的重點文字：\n\n【選取內容】\n${extraction.text}`
      : `請總結以下網頁的完整內容重點：\n\n【網頁標題】${extraction.title || "未命名網頁"}\n【網頁網址】${extraction.url || "無"}\n\n【網頁正文內容】\n${extraction.text}`;

    conversationHistory.push({ role: "user", content: promptContent });

    const loadingState = shadowRoot.getElementById("ws-loading-state");
    const chatFeed = shadowRoot.getElementById("ws-chat-feed");
    const errorBox = shadowRoot.getElementById("ws-error-box");
    const suggestionsBar = shadowRoot.getElementById("ws-suggestions-bar");
    const statsText = shadowRoot.getElementById("ws-stats-text");

    loadingState.style.display = "flex";
    chatFeed.style.display = "none";
    chatFeed.innerHTML = "";
    errorBox.style.display = "none";
    suggestionsBar.style.display = "none";
    statsText.textContent = "連接 AI 模型中...";
    updateInputState(false);

    executeStreamRequest();
  }

  // Handle user follow-up question
  function sendUserFollowUp() {
    const chatInput = shadowRoot.getElementById("ws-chat-input");
    const userText = chatInput.value.trim();
    if (!userText || isGenerating) return;

    chatInput.value = "";
    chatInput.style.height = "auto";

    conversationHistory.push({ role: "user", content: userText });
    appendUserBubble(userText);
    executeStreamRequest();
  }

  // Core stream request runner
  function executeStreamRequest() {
    stopCurrentGeneration();
    isGenerating = true;
    currentStreamingText = "";
    updateInputState(false);

    const statsText = shadowRoot.getElementById("ws-stats-text");
    const loadingState = shadowRoot.getElementById("ws-loading-state");
    const chatFeed = shadowRoot.getElementById("ws-chat-feed");
    const suggestionsBar = shadowRoot.getElementById("ws-suggestions-bar");

    const assistantBubbleContent = appendAssistantBubble();

    try {
      currentPort = chrome.runtime.connect({ name: "summarize-stream" });

      currentPort.onMessage.addListener((msg) => {
        if (msg.type === "START") {
          loadingState.style.display = "none";
          chatFeed.style.display = "flex";
          statsText.textContent = `[${msg.profileName || msg.model}] 正在回答...`;
          renderStreamingBubble(assistantBubbleContent, currentStreamingText);
        } else if (msg.type === "CHUNK") {
          currentStreamingText += msg.text;
          renderStreamingBubble(assistantBubbleContent, currentStreamingText);
          statsText.textContent = `生成中 (${currentStreamingText.length} 字)...`;
        } else if (msg.type === "DONE") {
          isGenerating = false;
          finalizeAssistantStreaming(assistantBubbleContent);
          statsText.textContent = `已完成 (${currentStreamingText.length} 字)`;
          suggestionsBar.style.display = "flex";
          updateInputState(true);
          if (currentPort) {
            currentPort.disconnect();
            currentPort = null;
          }
        } else if (msg.type === "ERROR") {
          isGenerating = false;
          showErrorState(msg.errorCode, msg.message);
          updateInputState(true);
        }
      });

      currentPort.onDisconnect.addListener(() => {
        if (isGenerating) {
          isGenerating = false;
          finalizeAssistantStreaming(assistantBubbleContent);
          suggestionsBar.style.display = "flex";
          updateInputState(true);
        }
      });

      // Pass currently selected profile ID
      currentPort.postMessage({
        action: "START_STREAM_CHAT",
        messages: conversationHistory,
        profileId: currentActiveProfileId
      });
    } catch (err) {
      showErrorState("CONNECTION_FAILED", `無法建立通訊: ${err.message}`);
      updateInputState(true);
    }
  }

  // Append user message bubble into feed
  function appendUserBubble(text) {
    const chatFeed = shadowRoot.getElementById("ws-chat-feed");
    const row = document.createElement("div");
    row.className = "ws-msg-row";
    row.innerHTML = `<div class="ws-msg-user">${escapeHtml(text)}</div>`;
    chatFeed.appendChild(row);
    scrollToBottom();
  }

  // Append assistant message bubble container into feed
  function appendAssistantBubble() {
    const chatFeed = shadowRoot.getElementById("ws-chat-feed");
    const isFirstTurn = conversationHistory.filter(m => m.role === "assistant").length === 0;

    const row = document.createElement("div");
    row.className = "ws-msg-row";
    
    const card = document.createElement("div");
    card.className = "ws-msg-assistant";

    const header = document.createElement("div");
    header.className = "ws-bubble-header";
    header.innerHTML = `
      <span>${isFirstTurn ? "📄 網頁重點摘要" : "🤖 AI 解答"}</span>
      <button type="button" class="ws-btn-bubble-copy" title="複製此段內容">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <span>複製</span>
      </button>
    `;

    const contentDiv = document.createElement("div");
    contentDiv.className = "ws-markdown-content";
    contentDiv.innerHTML = '<span class="ws-cursor-pulse"></span>';

    card.appendChild(header);
    card.appendChild(contentDiv);
    row.appendChild(card);
    chatFeed.appendChild(row);

    const btnCopy = header.querySelector(".ws-btn-bubble-copy");
    btnCopy.addEventListener("click", () => {
      const textToCopy = contentDiv.innerText || "";
      if (!textToCopy) return;
      navigator.clipboard.writeText(textToCopy).then(() => {
        const span = btnCopy.querySelector("span");
        span.textContent = "已複製！";
        setTimeout(() => { span.textContent = "複製"; }, 1600);
      });
    });

    scrollToBottom();
    return contentDiv;
  }

  // Render assistant streaming markdown
  function renderStreamingBubble(contentEl, text) {
    if (!contentEl) return;
    contentEl.innerHTML = parseMarkdown(text) + '<span class="ws-cursor-pulse"></span>';
    scrollToBottom();
  }

  // Finalize assistant streaming
  function finalizeAssistantStreaming(contentEl) {
    if (contentEl && currentStreamingText) {
      contentEl.innerHTML = parseMarkdown(currentStreamingText);
      conversationHistory.push({ role: "assistant", content: currentStreamingText });
    }
    scrollToBottom();
  }

  function scrollToBottom() {
    const body = shadowRoot.getElementById("ws-body-content");
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
  }

  // Display error state
  function showErrorState(code, message) {
    const loadingState = shadowRoot.getElementById("ws-loading-state");
    const errorBox = shadowRoot.getElementById("ws-error-box");
    const errorTitle = shadowRoot.getElementById("ws-error-title");
    const errorMsg = shadowRoot.getElementById("ws-error-msg");
    const errorActions = shadowRoot.getElementById("ws-error-actions");
    const statsText = shadowRoot.getElementById("ws-stats-text");

    loadingState.style.display = "none";
    errorBox.style.display = "block";
    statsText.textContent = "生成失敗";

    if (code === "NO_API_KEY") {
      errorTitle.textContent = "尚未配置 API Key";
      errorMsg.textContent = message || "請先設定此模型的 API Key，即可開始使用。";
      errorActions.innerHTML = `
        <button class="ws-btn-error-action" id="ws-btn-go-settings">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          前往多組 API 設定
        </button>
      `;
      shadowRoot.getElementById("ws-btn-go-settings").addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "OPEN_OPTIONS" });
      });
    } else {
      errorTitle.textContent = "請求失敗";
      errorMsg.textContent = message || "發生未預期的錯誤，請稍後重試。";
      errorActions.innerHTML = `
        <button class="ws-btn-error-action" id="ws-btn-err-retry">重試</button>
      `;
      shadowRoot.getElementById("ws-btn-err-retry").addEventListener("click", () => {
        if (conversationHistory.length > 0) executeStreamRequest();
      });
    }
  }

  // Safe lightweight Markdown to HTML parser
  function parseMarkdown(md) {
    if (!md) return "";

    let escaped = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code blocks
    escaped = escaped.replace(/```([\s\S]*?)```/g, (match, p1) => {
      return `<pre><code>${p1.trim()}</code></pre>`;
    });

    // Inline code
    escaped = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Headings
    escaped = escaped.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
    escaped = escaped.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    escaped = escaped.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    escaped = escaped.replace(/^# (.*$)/gim, "<h1>$1</h1>");

    // Bold & Italic
    escaped = escaped.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    escaped = escaped.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Blockquotes
    escaped = escaped.replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>");

    const lines = escaped.split("\n");
    let result = [];
    let inUl = false;
    let inOl = false;

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();

      if (trimmed === "") {
        continue;
      }

      const ulMatch = trimmed.match(/^[\*\-\+]\s+(.*)$/);
      if (ulMatch) {
        if (!inUl) {
          if (inOl) { result.push("</ol>"); inOl = false; }
          result.push("<ul>");
          inUl = true;
        }
        result.push(`<li>${ulMatch[1]}</li>`);
        continue;
      }

      const olMatch = trimmed.match(/^\d+[\.\)]\s+(.*)$/);
      if (olMatch) {
        if (!inOl) {
          if (inUl) { result.push("</ul>"); inUl = false; }
          result.push("<ol>");
          inOl = true;
        }
        result.push(`<li>${olMatch[1]}</li>`);
        continue;
      }

      if (inUl) { result.push("</ul>"); inUl = false; }
      if (inOl) { result.push("</ol>"); inOl = false; }

      if (trimmed.startsWith("<h") || trimmed.startsWith("<blockquote") || trimmed.startsWith("<pre") || trimmed.startsWith("</pre>")) {
        result.push(trimmed);
      } else {
        result.push(`<p>${trimmed}</p>`);
      }
    }

    if (inUl) result.push("</ul>");
    if (inOl) result.push("</ol>");

    return result.join("\n");
  }

  function escapeHtml(text) {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
})();
