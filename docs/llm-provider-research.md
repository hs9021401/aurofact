# LLM Provider 模型版本與相容性研究筆記

- 研究日期：2026-08-28
- 研究範圍：各 Provider 官方模型/API 文件；專案目前的 Provider 設定與串流解析實作。

## 結論

Z.AI 的 GLM-5.3 可用現有外掛的 OpenAI-compatible 分支接入，建議設定如下：

```text
apiFormat: openai
apiUrl: https://api.z.ai/api/paas/v4/chat/completions
model: glm-5.3
Authorization: Bearer <YOUR_ZAI_API_KEY>
stream: true
```

這個結論是「官方 API 格式」與「目前專案實作」交叉比對後的相容性推論；研究記錄不直接修改程式碼，實際同步內容見下方「本次程式同步範圍」。

## 2026-08-28 Provider 預設版本選擇

以下是本次同步到外掛預設範本的選擇。這裡的「預設」是以官方目前提供、適合網頁摘要的穩定 model ID 與協議相容性決定，不宣稱它們在所有地區、價格層級或工作負載下都是唯一的全球熱門模型。

| Provider | 外掛預設顯示名稱 | 實際 model ID | 選擇與相容性備註 |
| --- | --- | --- | --- |
| MiniMax | MiniMax-M3 | `MiniMax-M3` | 官方 API overview 的目前主力語言模型；維持 Anthropic Messages API 範本。 |
| DeepSeek | DeepSeek V4 Flash | `deepseek-v4-flash` | DeepSeek V4 系列目前可用的快速版本；`deepseek-v4-pro` 可在設定頁手動填入。舊的 `deepseek-chat` / `deepseek-reasoner` 已不再作為新預設。 |
| OpenAI | GPT-5.6 Luna | `gpt-5.6-luna` | GPT-5.6 系列中偏高頻、低延遲與成本敏感場景的選擇；使用 Chat Completions API。 |
| Anthropic | Claude Sonnet 5 | `claude-sonnet-5` | Claude 系列中速度與能力平衡的選擇；Sonnet 5 請求不送 `temperature`，避免官方對非預設 sampling 參數的限制。 |
| Ollama | Ollama · Gemma 4 12B | `gemma4:12b` | 現代本地模型的平衡預設；`qwen3.5:9b` 也可直接在設定頁替換。 |
| Z.AI | Z.AI GLM-5.3 | `glm-5.3` | 依 Z.AI 官方 HTTP 文件使用 OpenAI-compatible Chat Completions endpoint；本次新增為獨立預設範本。 |

官方依據：MiniMax [API Overview](https://platform.minimaxi.com/docs/api-reference/api-overview)、DeepSeek [Updates](https://api-docs.deepseek.com/updates/) 與 [Chat Completions](https://api-docs.deepseek.com/api/create-chat-completion/)、OpenAI [Models](https://developers.openai.com/api/docs/models) 與 [model comparison](https://developers.openai.com/api/docs/models/compare)、Anthropic [Models overview](https://platform.claude.com/docs/en/models/overview) 與 [Claude Sonnet 5](https://platform.claude.com/docs/en/docs/about-claude/models/whats-new-sonnet-5)、Ollama [Gemma 4](https://ollama.com/library/gemma4) 與 [Qwen3.5](https://ollama.com/library/qwen3.5)。

## 本次程式同步範圍

- 新安裝的預設 Profiles 與設定頁範本已使用上表的 model ID。
- 既有安裝會透過 `providerDefaultsVersion` 做一次性 migration：只替換已知的舊內建 model ID，保留使用者自行填入的模型；同時補入缺少的 Z.AI GLM-5.3 Profile。
- Claude Sonnet 5 的串流請求會省略 `temperature`；其他 Anthropic 模型仍沿用原本的可調溫度設定。
- GLM-5.3 的推理增量欄位 `reasoning_content` 目前不顯示，外掛只串接最終回答的 `delta.content`，符合摘要介面目前的需求。

## 官方事實

### Endpoint、驗證與請求格式

Z.AI 官方 HTTP 文件將一般 API endpoint 定義為 `https://api.z.ai/api/paas/v4/`；聊天完成請求使用其下的 `/chat/completions` 路徑。因此本專案可使用完整 URL `https://api.z.ai/api/paas/v4/chat/completions`。Z.AI 另有 Coding Plan 專用 endpoint `https://api.z.ai/api/coding/paas/v4`，不應在一般 API 情境混用。

官方要求的基本 headers 是：

```http
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

官方範例另外帶有 `Accept-Language: en-US,en`；它不是 HTTP 文件列出的最低必要 header，但可作為選配 header。API Key 不能寫入研究筆記或提交到版本庫。

官方的 chat completions JSON 使用 OpenAI-style 欄位：

```json
{
  "model": "glm-5.3",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello"}
  ],
  "temperature": 1.0,
  "max_tokens": 1024,
  "stream": true
}
```

`model` 與 `messages` 為必要欄位；官方 API reference 將 `glm-5.3` 列為模型代碼與預設模型。GLM-5.3 的 `temperature` 官方範圍是 `0` 到 `1`，預設值為 `1`；最大輸出 `max_tokens` 為 131072。專案目前使用 `temperature: 0.5`、`max_tokens: 2048`，落在官方可接受範圍內。

### Streaming SSE

Z.AI 官方 streaming 文件明確要求以 `stream: true` 啟用串流，回應格式為 Server-Sent Events。官方示例的事件內容包含：

```text
data: {"model":"glm-5.3","choices":[{"delta":{"content":"Spring"},"finish_reason":null}]}
data: {"model":"glm-5.3","choices":[{"delta":{"content":" comes"},"finish_reason":null}]}
data: [DONE]
```

官方描述的增量文字欄位是 `choices[0].delta.content`；最後事件可帶 `finish_reason` 與 `usage`。推理內容若啟用 thinking，可能出現在 `choices[0].delta.reasoning_content`，這是另一個欄位，不應與一般回答文字混接，除非產品明確要顯示推理內容。

### 模型 ID 與變體查證

- 官方 Chat Completion API reference 目前列出 `glm-5.3`、`glm-5.2`、`glm-5.1`、`glm-5-turbo` 等模型；GLM-5.3 的 API model ID 是小寫 `glm-5.3`。
- 官方 API reference 的 thinking 參數說明提到 `GLM-5.3-FLASH`，而官方 ZCode 文件也列出可使用 `GLM-5.3-Flash`；官方 Z.AI 部落格另有 GLM-5.3-Flash 的產品公告。因此 `GLM-5.3-Flash` 是官方存在的變體/產品名稱。
- 但在本次查閱的「一般 Chat Completion API reference」可用模型 enum 中，沒有看到 `glm-5.3-flash`；文件同一頁雖在 thinking 說明中提到 `GLM-5.3-FLASH`，兩處資訊並不完全一致。故不能僅憑該提及就推定一般 PaaS endpoint 對所有帳號都接受 `model: "glm-5.3-flash"`，應以帳號可用模型與實際 API 回應再確認。
- 在本次查閱的 Z.AI 官方文件、API reference、模型總覽與官方產品資料中，沒有找到 `GLM-5.3-Hot` 或 `glm-5.3-hot` 的官方模型/API 定義。不要把 Hot 當成已確認可用的 model ID。

## 專案相容性判斷（推論）

目前 `background.js` 的 OpenAI 分支：

1. 在 `apiFormat === "openai"` 時，以 JSON POST 送出 `model`、`messages`、`temperature`、`max_tokens` 與 `stream: true`。
2. 若有 API key，送出 `Authorization: Bearer <key>`，並一律送出 `Content-Type: application/json`。
3. 逐行處理 SSE `data: `，忽略空行與冒號註解，遇到 `[DONE]` 結束該事件。
4. 對 JSON chunk 讀取 `data.choices[0]?.delta?.content`。

這與 Z.AI 官方的 headers、OpenAI-compatible chat completions body、SSE 事件與增量文字欄位相符。因此 `apiFormat=openai`、Bearer Authorization、`stream=true` 與 `data.choices[0].delta.content` parser 對 `glm-5.3` 是相容的推論。

需注意兩個邊界：

- 專案的 parser 會忽略 `delta.reasoning_content`；這不影響只需要最終回答文字的摘要流程，但不會呈現 GLM-5.3 的串流推理內容。
- 專案的 SSE buffer 只在讀到換行時處理事件，且結束讀取後沒有再解析最後一段未以換行結尾的 buffer。官方範例以換行分隔事件，通常可正常運作；若要宣稱完整 SSE robustness，仍應另行測試或修改程式碼（本研究依要求未修改）。

## 建議設定範例

以下是可在外掛設定頁建立的 profile 概念值；其中 API key 僅為佔位符：

```json
{
  "name": "Z.AI GLM-5.3",
  "apiFormat": "openai",
  "apiUrl": "https://api.z.ai/api/paas/v4/chat/completions",
  "apiKey": "YOUR_ZAI_API_KEY",
  "model": "glm-5.3",
  "maxTokens": 2048,
  "temperature": 0.5
}
```

若使用 GLM Coding Plan，請先確認該方案是否要求 Coding 專用 endpoint；一般網頁摘要用途依官方說明優先使用一般 endpoint。對 `glm-5.3-flash`，只有在 Z.AI 帳號/官方 API 明確顯示該 model ID 可用時才建議把 `model` 改成 `glm-5.3-flash`；本筆記不建議猜測 `glm-5.3-hot`。

## 官方來源

1. [Z.AI HTTP API Calls：一般 endpoint、headers、API Key 與請求範例](https://docs.z.ai/guides/develop/http/introduction)
2. [Z.AI Chat Completion API Reference：model enum、參數與 GLM-5.3 說明](https://docs.z.ai/api-reference/llm/chat-completion)
3. [Z.AI Streaming Messages：SSE、`stream` 與 `choices[0].delta.content`](https://docs.z.ai/guides/capabilities/streaming)
4. [Z.AI API Overview：官方模型總覽](https://docs.z.ai/guides/overview/overview)
5. [ZCode 官方文件：GLM-5.3 與 GLM-5.3-Flash 產品支援](https://zcode.z.ai/en/docs/welcome)
6. [Z.AI 官方部落格：GLM-5.3-Flash](https://z.ai/blog/glm-5.3-flash)

---

# 2026-08-28 官方資料核對補充

本節是針對目前外掛可配置的供應商所做的獨立核對。上方既有內容完整保留；本節以 2026-08-28 查閱到的第一方官方文件為準，並把「官方文件明確列出」與「未能由官方來源確認」分開記錄。官方產品名稱、展示名稱、模型版本名稱與實際 API `model` ID 不一定相同；下文的「已確認 ID」只指官方 API 文件可直接用於請求的字串。

## 核對摘要

| 供應商／目標 | 官方資料確認的主流或推薦選項 | 已確認 API model ID | 官方 endpoint／protocol | 對本插件的判定 |
| --- | --- | --- | --- | --- |
| MiniMax | MiniMax-M3；官方也列出 M2.7、M2.5、M2.1 等 | `MiniMax-M3` | `https://api.minimaxi.com/anthropic/v1/messages`（Anthropic-compatible，官方推薦）；亦有 `/v1/chat/completions`（OpenAI-compatible） | Anthropic 分支相容；OpenAI 分支可用於官方列出的 OpenAI-compatible 模型與 M3 文件範例 |
| DeepSeek V4 | V4-Pro、V4-Flash | `deepseek-v4-pro`、`deepseek-v4-flash` | `https://api.deepseek.com/chat/completions`（OpenAI-compatible）；Anthropic-compatible base URL 為 `https://api.deepseek.com/anthropic` | OpenAI 分支相容；thinking 的 reasoning 內容目前會被插件忽略 |
| OpenAI GPT-5.6 | Sol／Terra／Luna；官方 alias `gpt-5.6` 指向 Sol | `gpt-5.6-sol`、`gpt-5.6-terra`、`gpt-5.6-luna`；alias `gpt-5.6` | `https://api.openai.com/v1/chat/completions` 與 `/v1/responses`；官方 GPT-5.6 指引推薦 Responses API | 目前 OpenAI Chat Completions endpoint 列為支援，但插件使用的欄位需注意新版參數差異 |
| Anthropic Claude Sonnet 5 | Sonnet 5 | `claude-sonnet-5` | `https://api.anthropic.com/v1/messages`（Anthropic Messages API） | Anthropic 分支相容；插件已對此模型省略 `temperature` |
| Ollama 本地模型 | 官方 library 可查到 Gemma 4、Qwen 3.5；官方 OpenAI-compatible 範例使用 `gpt-oss:20b` | 例如 `gemma4:12b`、`qwen3.5:4b`、`gpt-oss:20b`；實際 ID 取決於本機已 pull 的 tag | `http://localhost:11434/v1/chat/completions`（OpenAI-compatible）；原生 API 另為 `/api/chat` | 使用 OpenAI-compatible endpoint 時相容；不要把原生 `/api/chat` 與本插件的 OpenAI parser 混用 |
| Z.AI GLM-5.3 | 官方 GLM-5.3 模型頁列出的目前模型 | `glm-5.3` | `https://api.z.ai/api/paas/v4/chat/completions`（OpenAI-compatible） | 可用現有 OpenAI 分支接入；通用 model enum 與產品模型頁若有更新不同步，仍應以帳號可用模型與 API 回應為準 |

## MiniMax

### 官方核對結果

MiniMax 的 Anthropic-compatible Messages API 文件目前明確列出 `MiniMax-M3`，並列出 `MiniMax-M2.7`、`MiniMax-M2.7-highspeed`、`MiniMax-M2.5`、`MiniMax-M2.5-highspeed`、`MiniMax-M2.1`、`MiniMax-M2.1-highspeed` 與 `MiniMax-M2`。因此 `MiniMax-M3` 是本次核對可確認的實際 ID；不要把產品標題或大小寫變體當成另一個 API ID。[MiniMax Messages API 官方參考](https://platform.minimaxi.com/docs/api-reference/text-chat-anthropic)

官方推薦的 Anthropic-compatible endpoint 是：

```text
POST https://api.minimaxi.com/anthropic/v1/messages
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

請求需要 `model` 與 `messages`；`system`、`stream`、`max_tokens`、`temperature`、`top_p`、`thinking` 等欄位由官方文件描述。M3 的 `max_tokens` 官方建議值為 131072、上限為 524288；本插件目前送出的 2048 在範圍內。M3 的 `temperature` 範圍是 0 到 2，因此目前 0.5 也在範圍內。[MiniMax Messages API 請求欄位](https://platform.minimaxi.com/docs/api-reference/text-chat-anthropic)

MiniMax 也提供 OpenAI-compatible 的 `POST https://api.minimaxi.com/v1/chat/completions`，其官方頁面同樣列出 `MiniMax-M3`，並使用 Bearer Authorization、`model`、`messages` 與串流欄位。該頁將 OpenAI-compatible 的舊 `max_tokens` 標為 deprecated，建議使用 `max_completion_tokens`；因此本插件目前在 MiniMax OpenAI 分支雖可能仍能工作，但 `max_tokens` 不應視為長期穩定的推薦寫法。[MiniMax OpenAI-compatible Chat Completions 官方參考](https://platform.minimaxi.com/docs/api-reference/text-chat-openai)

### 與本插件的相容性

- 目前預設的 Anthropic 分支會送出 `x-api-key`、`Authorization: Bearer ...`、`anthropic-version: 2023-06-01`、`max_tokens`、`stream`、`system` 與 `messages`。MiniMax 官方頁面要求 Bearer Authorization，並說同時存在 `Authorization` 與 `x-api-key` 時優先使用 Authorization；所以這組 headers 與官方格式一致。
- Anthropic-compatible 的官方頁面明確說 `stream: true` 會分批回傳；本插件的 Anthropic SSE parser 讀取 `content_block_delta` 事件中的 `delta.text`。MiniMax 頁面沒有在同一頁完整列出每一個 SSE event schema，因此若某個帳號或模型回傳格式不同，應以實際 response 驗證，不宣稱已完成線上端到端測試。
- M3 官方預設 adaptive thinking，回應可能含 thinking content block；本插件只累積可見文字，未處理 thinking 專用欄位。這不影響只要摘要正文的用途，但不會顯示思考內容。

## DeepSeek V4

### 官方核對結果

DeepSeek 官方 Models & Pricing 頁面目前列出 V4-Flash 與 V4-Pro；同頁的 model version 分別是 `DeepSeek-V4-Flash-0731` 與 `DeepSeek-V4-Pro-0813`，但官方 API 呼叫方式使用的 model ID 仍是 `deepseek-v4-flash` 與 `deepseek-v4-pro`。官方首頁也把這兩個字串列為可用模型。[DeepSeek Models & Pricing 官方文件](https://api-docs.deepseek.com/quick_start/pricing/)、[DeepSeek API 首次呼叫官方文件](https://api-docs.deepseek.com/)

因此下列名稱要區分：

- 已確認 API ID：`deepseek-v4-flash`、`deepseek-v4-pro`。
- 官方版本／展示名稱：`DeepSeek-V4-Flash-0731`、`DeepSeek-V4-Pro-0813`；不能直接推定它們也是可呼叫的 `model` ID。
- `deepseek-v4`（沒有 `-flash` 或 `-pro`）在本次查閱的官方 API 文件中沒有被列為 model ID，標記為**未證實／不可確認**。

OpenAI-compatible Chat Completions endpoint 是：

```text
POST https://api.deepseek.com/chat/completions
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

Chat Completions 官方 schema 列出 `model`、`messages`、`thinking`、`reasoning_effort`、`max_tokens`、`stream`、`temperature`、`top_p` 等欄位；`stream: true` 回傳 data-only SSE，並以 `data: [DONE]` 結束。[DeepSeek Chat Completions 官方參考](https://api-docs.deepseek.com/api/create-chat-completion/)

### 與本插件的相容性

- 插件目前的 OpenAI 分支 endpoint、Bearer Authorization、`model`、`messages`、`max_tokens`、`temperature` 與 `stream` 形狀符合 Chat Completions 基本請求。
- V4 thinking 預設開啟。官方明確說 thinking mode 不支援 `temperature`、`top_p`、`presence_penalty`、`frequency_penalty` 的效果；即使傳入也不一定報錯，但不會生效。因此插件的 `temperature: 0.5` 對預設 thinking 請求不可當成有效的隨機性控制。[DeepSeek Thinking Mode 官方文件](https://api-docs.deepseek.com/guides/thinking_mode/)
- 串流 chunk 的可見答案在 `choices[0].delta.content`，推理內容在 `choices[0].delta.reasoning_content`。本插件只讀 `delta.content`，所以可避免把 reasoning 混進摘要正文，但會捨棄推理串流。
- 若未來要切換到 DeepSeek Responses API，不能只更換 URL：該 API 使用 `input` 與不同的 response event/輸出結構；本插件目前沒有 Responses parser。官方文件目前列出 Responses API 支援 V4-Flash 與 V4-Pro，但這不改變本插件現行 OpenAI Chat Completions 路徑的判定。[DeepSeek Responses API 官方參考](https://api-docs.deepseek.com/api/create-response/)

## OpenAI GPT-5.6 系列

### 官方核對結果

OpenAI 官方模型目錄目前列出三個 GPT-5.6 型號：

- `gpt-5.6-sol`：旗艦／複雜 reasoning 與 coding。
- `gpt-5.6-terra`：平衡能力與成本。
- `gpt-5.6-luna`：成本敏感與高流量工作負載。

官方另說明 alias `gpt-5.6` 會路由到 `gpt-5.6-sol`。因此插件目前模板使用的 `gpt-5.6-luna` 是官方確認的實際 ID；`gpt-5.6` 是官方確認的 alias，不是另一個固定 snapshot。[OpenAI GPT-5.6 模型目錄](https://developers.openai.com/api/docs/models)、[OpenAI GPT-5.6 指引](https://developers.openai.com/api/docs/guides/latest-model)

GPT-5.6 Luna 官方模型頁列出 Chat Completions 與 Responses endpoint，且支援 streaming；OpenAI 一般 API base URL 因此為：

```text
POST https://api.openai.com/v1/chat/completions
POST https://api.openai.com/v1/responses
Authorization: Bearer <OPENAI_API_KEY>
Content-Type: application/json
```

但 OpenAI GPT-5.6 官方指引推薦 reasoning、tool-calling 與多輪工作流使用 Responses API，並使用 `reasoning.effort`。本插件目前只實作 Chat Completions body，不是 Responses body。[GPT-5.6 Luna 官方模型頁](https://developers.openai.com/api/docs/models/gpt-5.6-luna)、[OpenAI Responses API／模型指引](https://developers.openai.com/api/docs/guides/latest-model)

### 與本插件的相容性

- endpoint、Bearer Authorization、`messages`、`stream` 及 `choices[0].delta.content` 是 Chat Completions 路徑的相容形狀；官方模型頁把 `v1/chat/completions` 列為 Luna 的 endpoint，故不能說該 endpoint 完全不可用。
- OpenAI Chat API reference 已將 `max_tokens` 標為 deprecated，推薦 `max_completion_tokens`；而且 API reference 明確提醒參數支援會依模型而異。插件目前固定送 `max_tokens`，這是 GPT-5.6 整合的主要風險，不能在沒有實際請求驗證時宣稱其對所有 GPT-5.6 變體都穩定相容。[OpenAI Chat Completions API reference](https://developers.openai.com/api/reference/resources/chat)
- 插件目前送 `temperature: 0.5`，但 GPT-5.6 模型頁未在模型層級確認此欄位的適用範圍；應以該模型的實際 API 回應或逐模型參數文件確認，不把一般 Chat API 欄位表直接推成 GPT-5.6 的保證。
- OpenAI Chat Completions stream 使用 SSE，插件的 `choices[0].delta.content` parser 可處理可見文字；若改用官方推薦的 Responses API，事件會改為 Responses event schema，現有 parser 不相容。

## Anthropic Claude Sonnet 5

### 官方核對結果

Anthropic 官方在 2026-06-30 的產品公告明確寫出開發者可透過 Claude API 使用 `claude-sonnet-5`；官方模型總覽也把 Sonnet 5 的 Claude API ID 列為 `claude-sonnet-5`，並把它定位為速度與能力的平衡選項。[Anthropic Claude Sonnet 5 公告](https://www.anthropic.com/news/claude-sonnet-5)、[Anthropic 模型總覽](https://docs.anthropic.com/en/docs/about-claude/models)

直連 Claude API 的 Messages endpoint 與必要 headers 是：

```text
POST https://api.anthropic.com/v1/messages
x-api-key: <ANTHROPIC_API_KEY>
anthropic-version: 2023-06-01
content-type: application/json
```

官方 API overview 將 `model`、`max_tokens`、`messages` 與 `stream` 的 Messages API 路徑列為 `POST /v1/messages`；驗證可使用 `x-api-key` 或特定 OAuth `Authorization`，`anthropic-version` 與 `content-type` 必須存在。[Anthropic API overview](https://docs.anthropic.com/en/api/getting-started)

### 與本插件的相容性

- 插件 Anthropic 分支送出的 `x-api-key`、`Authorization: Bearer ...`、`anthropic-version`、`model`、`max_tokens`、`system`、`messages` 與 `stream` 基本形狀符合 Messages API。官方要求的是 `x-api-key` 或 `Authorization` 其中之一；插件同時送兩者時，實際使用的 API gateway 若對多重 credentials 有額外規則，仍應以測試請求確認。
- Sonnet 5 官方模型頁標示 adaptive thinking；插件對 `claude-sonnet-5` 特別不送 `temperature`，這避免把未在本次模型頁確認的 sampling 欄位當成必要參數。
- Anthropic 官方 streaming 文件定義 `content_block_delta` 事件，其中文字增量是 `delta.type: "text_delta"` 與 `delta.text`；插件目前讀取 `data.type === "content_block_delta"` 與 `data.delta.text`，因此會取得可見文字。插件不處理 thinking delta、tool input delta 或錯誤 event。[Anthropic Streaming Messages 官方文件](https://docs.anthropic.com/en/docs/build-with-claude/streaming)

## Ollama 現代本地模型

### 官方核對結果

Ollama 沒有一個固定的雲端模型 ID；`model` 是本機已安裝模型的名稱與 tag。官方目前 library 可直接查到 `gemma4:12b`、`gemma4:26b`、`gemma4:31b` 等 Gemma 4 tags，也可查到 `qwen3.5:4b`、`qwen3.5:9b` 等 Qwen 3.5 tags。這些是截至本次查閱可由 Ollama 官方 library 證實的現代選項，不等於對所有硬體都適合。[Ollama Gemma 4 tags](https://ollama.com/library/gemma4/tags)、[Ollama Qwen 3.5 tags](https://ollama.com/library/qwen3.5/tags)

Ollama 官方 OpenAI compatibility 文件的範例使用 `gpt-oss:20b`，並把 base URL 設為 `http://localhost:11434/v1/`；本插件應使用完整路徑：

```text
POST http://localhost:11434/v1/chat/completions
Content-Type: application/json
model: gemma4:12b  # 或本機已 pull 的其他 tag
```

官方 OpenAI-compatible Chat Completions 支援 `model`、`messages`、`stream`、`temperature`、`max_tokens` 等與本插件相近的欄位；官方範例的 `api_key` 是必要的 SDK 參數但會被忽略，直接 HTTP 請求則不需要雲端 API key。[Ollama OpenAI compatibility 官方文件](https://docs.ollama.com/api/openai-compatibility)

Ollama 原生聊天 endpoint 是 `POST http://localhost:11434/api/chat`，body 使用 `model`、`messages`、`options` 與 `stream`，原生 response 的文字位於 `message.content`，且預設 stream 為 true。[Ollama native Chat API 官方參考](https://docs.ollama.com/api/chat)

### 與本插件的相容性

- 插件的 Ollama template 使用 OpenAI-compatible `/v1/chat/completions`，這與官方 compatibility 文件一致；目前預設 `gemma4:12b` 也可在官方 library 找到。
- 不要把 endpoint 改成原生 `/api/chat` 後仍使用 `apiFormat: openai`：兩者的 streaming response schema 不同。原生 API 是 NDJSON／`message.content`，而插件 OpenAI parser 期待 `choices[0].delta.content`。
- 插件會在 localhost 情況允許空 API key；這符合本地 Ollama 不需要雲端 key 的使用情境。是否能連線仍取決於 Ollama service、模型是否已 pull、瀏覽器 extension host 的 localhost 權限與 CORS／host permissions。
- `gemma4:12b` 官方 tag 同時標示文字與圖片輸入，但本插件目前只送文字 `messages`；不能由這個模型 tag 的多模態能力推定插件已支援圖片摘要。

## Z.AI GLM-5.3：模型頁與通用 API 清單的差異

Z.AI 官方 [GLM-5.3 模型頁](https://docs.z.ai/guides/llm/glm-5.3) 明確列出模型代碼 `glm-5.3`、一般 PaaS endpoint 與 streaming 支援，因此本外掛將 `glm-5.3` 作為可配置的預設 model ID。通用 Chat Completion reference 的模型 enum、產品頁與帳號可用模型清單可能不會同時更新；若個別帳號回傳 model-not-found，應以該帳號 API 可用清單為準，而不是把 `glm-5.3` 靜默換成另一個模型。

目前可由 Z.AI HTTP 文件與 GLM-5.3 模型頁交叉確認的 OpenAI-compatible 路徑是：

```text
POST https://api.z.ai/api/paas/v4/chat/completions
Authorization: Bearer <ZAI_API_KEY>
Content-Type: application/json
model: glm-5.3
```

官方文件列出 `messages`、`stream`、`thinking`、`temperature`（0 到 1）、`top_p`、`max_tokens`（上限 131072）等欄位。官方 HTTP 文件也明確區分一般 PaaS endpoint 與 GLM Coding Plan 專用 endpoint `https://api.z.ai/api/coding/paas/v4`；後者不應拿來推定一般摘要 API 的可用性。[Z.AI HTTP API 官方文件](https://docs.z.ai/guides/develop/http/introduction)

### 與本插件的相容性

- 若帳號已開通 `glm-5.3`，OpenAI-compatible endpoint、Bearer header、`model`、`messages`、`temperature: 0.5`、`max_tokens: 2048` 與 `stream: true` 形狀符合官方欄位範圍。
- Z.AI streaming 回應的可見文字在 OpenAI-style `choices[0].delta.content`；reasoning 會在 `reasoning_content`。本插件的 parser 可累積前者，但忽略後者。
- `glm-5.3-flash` 與 `glm-5.3-hot` 在本次查閱的通用 PaaS model enum 中未能與 `glm-5.3` 一樣明確確認，因此不放入預設範本；只有在 Z.AI 帳號或官方 API 明確顯示可用時，才建議手動填入。

## 對本插件的整體實作影響

目前 `background.js` 的 parser 只處理三種主要文字位置：Anthropic `content_block_delta` 的 `delta.text`、OpenAI-compatible `choices[0].delta.content`，以及直接 `text` fallback。依官方文件交叉比對：

1. MiniMax Anthropic、Anthropic Claude Sonnet 5：主要可見文字路徑相符；thinking／tool delta 不會被顯示。
2. DeepSeek V4、OpenAI GPT-5.6、Ollama OpenAI-compatible、Z.AI 現行 OpenAI-compatible 模型：主要 Chat Completions 可見文字路徑相符；reasoning 內容會被忽略。
3. OpenAI Responses API、Ollama 原生 `/api/chat`：response／stream schema 不同，不能只改 endpoint；目前插件不支援這兩條路徑。
4. `max_tokens` 是跨供應商最需要留意的欄位：Anthropic、DeepSeek、Ollama、Z.AI 文件仍直接描述它；MiniMax OpenAI-compatible 與 OpenAI Chat API 文件則標為 deprecated 或推薦 `max_completion_tokens`。本次程式已按目前預設範本同步 model ID，未擴大改動跨 Provider 的 token 欄位協議。

## 本次新增核對使用的第一方來源

- [MiniMax Anthropic-compatible Messages API](https://platform.minimaxi.com/docs/api-reference/text-chat-anthropic)
- [MiniMax OpenAI-compatible Chat Completions API](https://platform.minimaxi.com/docs/api-reference/text-chat-openai)
- [DeepSeek Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing/)
- [DeepSeek Chat Completions API](https://api-docs.deepseek.com/api/create-chat-completion/)
- [DeepSeek Thinking Mode](https://api-docs.deepseek.com/guides/thinking_mode/)
- [OpenAI Models](https://developers.openai.com/api/docs/models)
- [OpenAI GPT-5.6 Model Guidance](https://developers.openai.com/api/docs/guides/latest-model)
- [OpenAI GPT-5.6 Luna Model](https://developers.openai.com/api/docs/models/gpt-5.6-luna)
- [OpenAI Chat API Reference](https://developers.openai.com/api/reference/resources/chat)
- [Anthropic Claude Sonnet 5 公告](https://www.anthropic.com/news/claude-sonnet-5)
- [Anthropic Models Overview](https://docs.anthropic.com/en/docs/about-claude/models)
- [Anthropic API Overview](https://docs.anthropic.com/en/api/getting-started)
- [Anthropic Streaming Messages](https://docs.anthropic.com/en/docs/build-with-claude/streaming)
- [Ollama OpenAI Compatibility](https://docs.ollama.com/api/openai-compatibility)
- [Ollama native Chat API](https://docs.ollama.com/api/chat)
- [Ollama Gemma 4 tags](https://ollama.com/library/gemma4/tags)
- [Ollama Qwen 3.5 tags](https://ollama.com/library/qwen3.5/tags)
- [Z.AI Chat Completion](https://docs.z.ai/api-reference/llm/chat-completion)
- [Z.AI GLM-5.3 模型頁](https://docs.z.ai/guides/llm/glm-5.3)
- [Z.AI Models Overview](https://docs.z.ai/guides/overview/overview)
- [Z.AI HTTP API Calls](https://docs.z.ai/guides/develop/http/introduction)
