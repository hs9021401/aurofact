# AI 網頁重點總結 (Web Summarizer & Chat)

<p align="center">
  <img src="icons/icon128.png" width="96" height="96" alt="AI Web Summarizer Logo">
</p>

<p align="center">
  <strong>繁體中文</strong> | <a href="#english">English</a>
</p>

<p align="center">
  專為 Brave 與 Chrome 打造的 AI 網頁重點總結與多輪對話擴充套件 (Manifest V3)。<br>
  支援 <strong>MiniMax-M3、DeepSeek-V3、OpenAI GPT-4o、Claude 3.5 Sonnet、Ollama 本地模型</strong> 等雙協議多模型自由切換。
</p>

---

## 繁體中文

### ✨ 核心功能特色

- 🚀 **右鍵一鍵總結**：在任何網頁點擊右鍵選單，選擇「📝 總結此網頁重點」即可開始摘要。
- 🔍 **所選文字摘要**：選取網頁中特定段落反白後按右鍵，可針對選取文字單獨總結。
- ⚡ **多組 API 配置 (Multi-Profile) 快速切換**：
  - 可儲存任意多組獨立的 API 端點、金鑰、模型與提示詞。
  - **直接在懸浮視窗 Header 切換**：無需開啟設定頁，在網頁視窗上方下拉選單即可一秒切換不同模型！
  - **工具列 Popup 快捷切換**：點擊瀏覽器工具列圖示即可快速切換當前預設模型。
- 🌐 **雙協議 (Anthropic & OpenAI) 全面相容**：
  - 🟣 **MiniMax-M3**（Anthropic 協議，預設推薦）
  - 🔵 **DeepSeek-V3 / R1**（OpenAI 協議）
  - 🟢 **OpenAI GPT-4o / GPT-4o-mini**（OpenAI 官方）
  - 🟠 **Claude 3.5 Sonnet**（Anthropic 協議）
  - ⚪ **Ollama 本地模型**（免金鑰，直連 `localhost:11434`）
  - ⚡ **Groq / OpenRouter / OneAPI**：完全相容自訂端點
- 💬 **多輪延伸問答 (Follow-up Q&A)**：
  - 總結完成後可直接在底部輸入框打字進一步探討，內建上下文記憶。
  - 附帶「🔍 深入解析」、「👶 通俗解釋」、「📋 行動建議」、「⚖️ 批判評估」等快捷標籤。
  - 支援中文輸入法（IME）防誤觸，按 `Enter` 發送、`Shift + Enter` 換行。
- 🛡️ **Shadow DOM 隔離技術 & 防出界拖曳**：
  - 採用 Shadow DOM，完全與宿主網頁 CSS 隔離，不破壞排版、不受網頁樣式污染。
  - 頂部與底部雙拖曳把手，強制邊界限制 `minTop = 10px`，頂部 Header 絕不出界。
  - 支援按兩下快速重設回右下角位置，並監聽瀏覽器視窗縮放自動校正。
- ⚙️ **現代化多配置管理後台 (Options Page)**：
  - 左側配置清單與範本一鍵新增。
  - 獨立測試各組配置的連線狀態與延遲時間（ms）。

---

### 🛠️ 安裝教學（Brave / Chrome）

1. 在 **Brave** 網址列輸入並前往：`brave://extensions` *(Chrome 請輸入 `chrome://extensions`)*
2. 開啟右上角 **「開發人員模式 (Developer mode)」**。
3. 點擊 **「載入未封裝項目 (Load unpacked)」**，選取本外掛專案資料夾。
   *(或解壓縮發布的 `.zip` 檔案後選取該資料夾)*

---

### ⚙️ 管理與切換多組 API

1. 點擊瀏覽器右上角外掛圖示 ➜ 點選 **「多組 API 設定管理」**。
2. 在左側清單點擊 **「➕ 新增配置」**，可快速選擇範本（如 MiniMax、DeepSeek、GPT-4o、Claude、Ollama）。
3. 填入該配置的 **API Key**，點擊 **「⚡ 測試此配置連線」** 確認成功。
4. 點擊 **「設為使用中」** 即可將其設為預設模型，並按下 **「💾 儲存所有設定」**。
5. 在任何網頁進行總結時，可以直接在懸浮視窗的頂部下拉選單即時切換不同的 API 配置！

---

### 📖 使用方式

- **方法 A：右鍵選單總結全頁** ➜ 在網頁空白處按右鍵 ➜ 點選 **「📝 總結此網頁重點」**。
- **方法 B：右鍵總結選取文字** ➜ 反白選取文字後按右鍵 ➜ 點選 **「📝 總結所選文字」**。
- **方法 C：工具列快捷總結** ➜ 點擊瀏覽器工具列外掛圖示 ➜ 點選 **「⚡ 立即總結當前網頁」**。

---

## English

<a id="english"></a>

### ✨ Key Features

- 🚀 **Right-Click Instant Summary**: Right-click anywhere on a webpage and click **"📝 Summarize Page"** to get structured key points immediately.
- 🔍 **Selection-Based Summarization**: Highlight any text passage, right-click, and select **"📝 Summarize Selected Text"**.
- ⚡ **Multi-Profile API Management & Instant Switching**:
  - Save unlimited custom API profiles with distinct endpoints, keys, models, and system prompts.
  - **In-Modal Quick Switcher**: Switch models on the fly directly from the floating modal's header dropdown without opening settings!
  - **Toolbar Popup Switcher**: Quickly change the active model from the extension icon popup.
- 🌐 **Dual Protocol (Anthropic & OpenAI) Compatible**:
  - 🟣 **MiniMax-M3** (Anthropic Messages API, Default Recommended)
  - 🔵 **DeepSeek-V3 / R1** (OpenAI Chat Completions API)
  - 🟢 **OpenAI GPT-4o / GPT-4o-mini** (OpenAI Official API)
  - 🟠 **Claude 3.5 Sonnet** (Anthropic API)
  - ⚪ **Ollama Local LLM** (No API key needed, connects to `localhost:11434`)
  - ⚡ **Groq / OpenRouter / OneAPI**: Fully compatible with any custom endpoint.
- 💬 **Multi-Turn Follow-Up Q&A**:
  - Chat seamlessly with the AI about the webpage content with persistent context memory.
  - Built-in prompt chips for one-click exploration: *"In-depth Analysis"*, *"Explain Simply"*, *"Actionable Steps"*, and *"Pros & Cons Evaluation"*.
  - Full IME guard for Asian languages (`Enter` to send, `Shift + Enter` for new line).
- 🛡️ **Shadow DOM Isolation & Anti-Clipping Dragging**:
  - 100% CSS isolation via Shadow DOM — immune to host page stylesheets and reset rules.
  - Dual drag handles (Top Header + Bottom Status Bar) with strict boundary clamping (`minTop = 10px`).
  - Double-click to auto-reset position to the bottom-right corner.
- ⚙️ **Modern Options Dashboard**:
  - Manage multiple profiles, clone configurations, and test latency (ms) per profile in real-time.

---

### 🛠️ Installation (Brave / Chrome)

1. Open **Brave** and navigate to `brave://extensions` *(or `chrome://extensions` in Chrome)*.
2. Toggle on **"Developer mode"** in the top-right corner.
3. Click **"Load unpacked"** in the top-left corner and select this project directory.
   *(Or unzip the release `.zip` and select the unzipped folder)*.

---

### ⚙️ API Configuration

1. Click the extension icon in your browser toolbar ➜ Select **"Multi-Profile Settings"**.
2. Click **"➕ Add Profile"** in the left sidebar and choose a template (*MiniMax, DeepSeek, OpenAI, Claude, Ollama, etc.*).
3. Enter your **API Key** and click **"⚡ Test Connection"** to verify latency.
4. Click **"Set as Active"** and hit **"💾 Save All Settings"**.
5. When summarizing, you can switch between models anytime using the header dropdown on the floating window!

---

### 📖 How to Use

- **Method A: Summarize Full Webpage** ➜ Right-click anywhere on the page ➜ Click **"📝 Summarize Page"**.
- **Method B: Summarize Selected Text** ➜ Highlight any text ➜ Right-click ➜ Click **"📝 Summarize Selected Text"**.
- **Method C: Toolbar Action** ➜ Click the extension icon in the toolbar ➜ Click **"⚡ Summarize Current Tab"**.

---

### 📦 Build Distribution Package

To rebuild the standalone `.zip` distribution package:
```powershell
python build_package.py
```
Output will be generated in `dist/ai-web-summarizer-v1.0.0.zip`.

---

### 🔒 Privacy Policy

- **100% Client-Side (BYOK)**: All API keys and settings are stored strictly in your local browser storage (`chrome.storage.sync` / `local`).
- **Direct Connection**: Requests are sent directly from your browser to your designated LLM provider API endpoint (e.g., MiniMax, OpenAI, Anthropic, or local Ollama). No middleman servers or third-party tracking.

---

### 📄 License

MIT License. Free and open source for everyone.
