# YouTube 影片摘要可行性評估

更新日期：2026-09-02

## 結論

AUROFACT 可以支援 YouTube 影片摘要；若影片有可用字幕，最適合的第一版方案是讀取 YouTube 頁面上由使用者開啟的轉錄稿（Transcript），清理轉錄稿文字後交給現有的 LLM 摘要流程。這條路不需要下載影片或音訊，也不必使用 YouTube Data API 取得一般公開影片的字幕。

沒有字幕的影片也可以做，但需要額外的音訊擷取與語音轉文字服務，複雜度、成本、權限與隱私風險都明顯較高，不建議列入第一版。

## MVP 實作狀態

目前 MVP 已採用 DOM-only 方案：在 YouTube 影片頁面由使用者先開啟 **Show transcript／顯示轉錄稿**，外掛再擷取轉錄稿段落與時間戳記，交給既有的摘要與串流對話流程。一般網頁摘要與選取文字流程不受影響。

若目前頁面沒有可辨識的轉錄稿，外掛不會把 YouTube 播放器、推薦影片或控制介面誤當成文章內容，而會顯示提示要求先開啟轉錄稿。音訊擷取與語音轉文字仍不在 MVP 範圍內。

## 官方資料與限制

### YouTube 本身提供 Transcript

YouTube 官方說明指出，只要影片有字幕，使用者就能從影片說明區選擇 **Show transcript** 查看完整轉錄稿；轉錄稿也會隨播放進度捲動。這表示「有字幕的影片」具備可供摘要的文字來源。

來源：[View video transcripts - YouTube Help](https://support.google.com/youtube/answer/15930243?hl=en)

### 自動字幕不代表內容一定可靠

YouTube 的自動字幕由語音辨識產生，官方提醒其品質可能因發音、口音、方言、背景噪音或多人重疊說話而有所差異；部分影片也可能因語言、音質、片長或處理狀態而沒有自動字幕。因此摘要介面應標示字幕來源與「自動字幕可能有誤」的提示。

來源：[Use automatic captioning - YouTube Help](https://support.google.com/youtube/answer/6373554?hl=en)

### YouTube Data API 不適合直接抓任意公開影片字幕

YouTube Data API 的 `captions.list` 需要 OAuth 2.0 授權，而且回應只列出字幕軌，不包含實際字幕文字；`captions.download` 雖可下載字幕軌，但官方明確要求授權使用者必須具有編輯該影片的權限。這不符合「使用者在觀看任意公開影片時直接摘要」的需求。

來源：[Captions: list - YouTube Data API](https://developers.google.com/youtube/v3/docs/captions/list)、[Captions: download - YouTube Data API](https://developers.google.com/youtube/v3/docs/captions/download)

### 瀏覽器擴充功能可以讀取頁面 DOM

Chrome Extensions 官方文件說明，content script 可以讀取與修改宿主頁面的 DOM，並透過訊息與擴充功能的其他部分溝通。AUROFACT 目前的 [manifest.json](../manifest.json) 使用 `activeTab` 與 `scripting` 權限，使用者明確觸發摘要時才動態注入 content script，因此以 YouTube 頁面 DOM 為來源的 MVP 在現有架構上是可行的。

來源：[Content scripts - Chrome for Developers](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)、[The activeTab permission - Chrome for Developers](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab)

### 沒有字幕時可擷取分頁音訊，但不是低成本方案

Chrome 的 `chrome.tabCapture` 可以在使用者觸發擴充功能後取得目前分頁的音訊串流；官方文件也提醒，開始擷取後分頁音訊不會再直接播放給使用者，必須自行透過 `AudioContext` 路由回輸出。之後還需要語音轉文字引擎、長音訊分段、進度與錯誤處理，因此不適合作為第一階段的預設路徑。

來源：[chrome.tabCapture - Chrome for Developers](https://developer.chrome.com/docs/extensions/reference/api/tabCapture)、[Audio recording and screen capture - Chrome Extensions](https://developer.chrome.com/docs/extensions/how-to/web-platform/screen-capture)

## 建議的實作分階段

### Phase 1：字幕摘要 MVP（建議先做）

1. 偵測目前網址是否為 YouTube watch 頁面，例如 `youtube.com/watch?v=...`。
2. 使用者按下「摘要此影片」後，優先尋找已顯示的 Transcript。
3. 讀取字幕段落與時間戳，移除重複文字、時間標記及不必要的 UI 內容。
4. 將字幕與影片標題、網址組成現有的摘要輸入格式，沿用目前的浮窗與 LLM Provider 流程。
5. 影片過長時採用分段摘要，再合併成總結，避免目前單次內容長度限制造成截斷。
6. 在摘要結果中保留字幕語言、是否為自動字幕，以及可選的時間戳連結。

最穩妥的 UX 是要求使用者先在 YouTube 點擊 **Show transcript**，再按 AUROFACT 的「摘要字幕」；也可以嘗試由外掛協助展開，但 YouTube 的內部 DOM 結構不是穩定的公開 API，應預期需要持續維護。

### Phase 2：更自動化的字幕偵測

透過 YouTube SPA 頁面變化與 DOM 觀察器，在影片切換、Transcript 延遲載入或語言變更後重新偵測字幕。這能降低使用者操作，但更容易受到 YouTube UI 改版影響，應保留「請先開啟 Transcript」的 fallback。

### Phase 3：無字幕影片的語音轉文字

只有在產品確實需要時再評估 `tabCapture` 或使用者自行提供的音訊／轉錄稿。這一階段需另外處理：使用者明確同意錄音、音訊回放、長影片分段、語音轉文字 Provider、資料保留政策、費用與服務條款。

## 主要風險

| 項目 | 評估 |
| --- | --- |
| 有 Transcript 的公開影片 | 高可行性；適合第一版 |
| 有字幕但 Transcript 尚未展開 | 中等可行性；需處理 YouTube 動態 DOM |
| 自動字幕品質 | 可用但需提醒可能誤辨識，LLM 也可能因錯誤字幕產生錯誤結論 |
| 使用 YouTube Data API 抓任意影片字幕 | 不建議；字幕下載需要影片編輯權限 |
| 沒有字幕、直接摘要音訊 | 中低可行性；需音訊擷取與 STT，權限及隱私成本高 |
| 將字幕傳給 LLM | 技術上沿用現有流程，但需明確告知使用者字幕會傳送到所選 Provider，並避免長期保存原文 |

若未來使用 YouTube API Services，還需要遵守 YouTube 的 Developer Policies，包括透明告知、隱私政策、YouTube Terms of Service 連結，以及不得削弱或替換 YouTube 的標準播放體驗。

來源：[Complying with YouTube's Developer Policies](https://developers.google.com/youtube/terms/developer-policies-guide)、[YouTube API Services Terms of Service](https://developers.google.com/youtube/terms/api-services-terms-of-service)

## 建議

先做 **Phase 1 字幕摘要 MVP**：只處理 YouTube watch 頁面、由使用者明確觸發、以頁面 Transcript 為唯一來源、沒有字幕時提供清楚的 fallback。這樣可以最大限度重用 AUROFACT 現有的浮窗、串流、Markdown 呈現、多輪對話與 Provider 設定，同時避開 YouTube Data API 的 OAuth／影片所有權限制與音訊擷取風險。
