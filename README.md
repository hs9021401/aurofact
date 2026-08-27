# AI 網頁重點總結 (Web Summarizer) - Brave / Chrome 擴充套件

這是一個專為 **Brave** 與 **Chrome** 打造的瀏覽器擴充外掛（Manifest V3）。支援右鍵一鍵總結網頁內容或選取文字，並支援 **多組 API 配置管理與快速切換**，完美相容 **MiniMax-M3、DeepSeek-V3、OpenAI GPT-4o、Claude 3.5 Sonnet、Ollama 本地模型** 等各大主流 LLM 服務。

---

## ✨ 核心功能特色

- 🚀 **右鍵一鍵總結**：在任何網頁點擊右鍵選單，選擇「📝 總結此網頁重點」即可開始摘要。
- 🔍 **所選文字摘要**：選取網頁中特定段落反白後按右鍵，可針對選取文字單獨總結。
- ⚡ **多組 API 配置 (Multi-Profile) 快速切換**：
  - 可儲存任意多組獨立的 API 端點、金鑰、模型與提示詞。
  - **直接在懸浮視窗 Header 切換**：無需開啟設定頁，在網頁視窗上方下拉即可一秒切換不同模型！
  - **工具列 Popup 快捷切換**：點擊瀏覽器工具列圖示即可選擇當前使用的模型。
- 🌐 **雙協議 (Anthropic & OpenAI) 全面相容**：
  - 🟣 **MiniMax-M3**（Anthropic 協議，預設推薦）
  - 🔵 **DeepSeek-V3 / R1**（OpenAI 協議）
  - 🟢 **OpenAI GPT-4o / GPT-4o-mini**（OpenAI 官方）
  - 🟠 **Claude 3.5 Sonnet**（Anthropic 協議）
  - ⚪ **Ollama 本地模型**（免金鑰，直連 `localhost:11434`）
- 💬 **多輪延伸問答 (Follow-up Q&A)**：
  - 總結完成後可直接在底部打字進一步探討，內建上下文記憶。
  - 附帶「深入解析」、「通俗解釋」、「行動建議」等快捷標籤。
- 🛡️ **Shadow DOM 隔離技術 & 防出界拖曳**：
  - 完全與宿主網頁 CSS 隔離，不破壞排版。
  - 頂部與底部雙拖曳把手，強制限制 `minTop = 10px`，頂部 Header 絕不出界。
  - 支援按兩下快速重設回右下角位置。
- ⚙️ **現代化多配置管理後台 (Options Page)**：
  - 左側配置清單與範本一鍵新增。
  - 獨立測試各組配置的連線狀態與延遲時間。

---

## 🛠️ 安裝教學（Brave / Chrome）

1. 在 **Brave** 網址列輸入並前往：`brave://extensions` *(Chrome 請輸入 `chrome://extensions`)*
2. 開啟右上角 **「開發人員模式 (Developer mode)」**。
3. 點擊 **「載入未封裝項目 (Load unpacked)」**，選取本外掛專案資料夾。
   *(或解壓縮發布的 `.zip` 檔案後選取該資料夾)*

---

## ⚙️ 管理與切換多組 API

1. 點擊瀏覽器右上角外掛圖示 ➜ 點選 **「多組 API 設定管理」**。
2. 在左側清單點擊 **「➕ 新增配置」**，可快速選擇範本（如 MiniMax、DeepSeek、GPT-4o、Claude、Ollama）。
3. 填入該配置的 **API Key**，點擊 **「⚡ 測試此配置連線」** 確認成功。
4. 點擊 **「設為使用中」** 即可將其設為預設模型，並按下 **「💾 儲存所有設定」**。
5. 在任何網頁進行總結時，可以直接在懸浮視窗的頂部下拉選單即時切換不同的 API 配置！

---

## 📦 打包安裝包

```powershell
python build_package.py
```
執行後會在 `dist/` 目錄產生最新的壓縮包。

---

## 🔒 隱私安全承諾 (Privacy Policy)

- 本套件為純本地擴充功能（BYOK 模式），所有 API Key 及使用者設定均儲存於使用者的瀏覽器本地空間（`chrome.storage`）。
- 網頁內容與請求僅於使用者觸發時，直接發送至使用者所指定的官方 API 端點，不經由任何第三方伺服器中轉或收集。
