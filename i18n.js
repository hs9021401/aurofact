// i18n.js - Shared locale strings and localized default system prompts

(function (root) {
  const locales = {
    "zh-TW": {
      label: "繁體中文",
      htmlLang: "zh-TW",
      prompt: `你是一個專業的內容分析與深入探討助手。請針對使用者提供的網頁內容或選取文字進行精準、結構清晰的繁體中文分析與解答。

初次總結時請遵循以下格式：
### 📌 核心主旨
用 1-2 句話概括全文最重要的核心主旨。

### 💡 關鍵重點摘要
- 條列 3 至 6 個關鍵要點。
- 若有重要數據、關鍵結論或步驟請以**粗體**標註。

### 🎯 結論與洞見
簡短總結作者結論、實用建議或關鍵價值。

在後續多輪對話中，請結合網頁原文與先前的總結，深入、親切且專業地回答使用者的延伸問題。`,
      strings: {
        pageTitle: "AUROFACT｜AI 網頁摘要與洞見助手 - 外掛設定",
        logoAlt: "外掛圖示",
        appTitle: "AUROFACT",
        subtitle: "AI 網頁摘要與洞見助手",
        languageLabel: "語言",
        languageOptionZhTw: "繁體中文",
        languageOptionEn: "英文",
        languageOptionJa: "日文",
        languageOptionKo: "韓文",
        languageChanged: "介面語言已切換為 {language}。預設 System Prompt 也已同步；自訂 Prompt 不會被覆蓋。",
        multiProfileBadge: "多組 API 自由切換",
        profilesHeading: "API 配置清單",
        contextSummarizePage: "📝 總結此網頁重點",
        contextSummarizeSelection: "📝 AI 處理選取文字",
        editingProfileEmpty: "編輯配置",
        activeInitial: "使用中",
        addProfile: "新增配置",
        addProfileTitle: "新增一組 API 配置",
        templateMenuTitle: "選擇要新增的模型範本：",
        templateMinimaxName: "🟣 MiniMax-M3",
        templateMinimaxSub: "Anthropic 協議",
        templateDeepseekName: "🔵 DeepSeek V4 Flash",
        templateDeepseekSub: "OpenAI 協議",
        templateOpenaiName: "🟢 GPT-5.6 Luna",
        templateOpenaiSub: "OpenAI 官方協議",
        templateClaudeName: "🟠 Claude Sonnet 5",
        templateClaudeSub: "Anthropic 協議",
        templateOllamaName: "⚪ Ollama · Gemma 4 12B",
        templateOllamaSub: "localhost:11434（免 Key）",
        templateZaiName: "🟡 Z.AI GLM-5.3",
        templateZaiSub: "OpenAI 相容協議",
        templateCustomName: "⚙️ 自訂空白配置",
        templateCustomSub: "自訂端點與模型",
        editingProfile: "編輯：{name}",
        activeDefault: "● 預設使用中",
        inactive: "未啟用",
        setActive: "設為使用中",
        setActiveTitle: "將此配置設為當前預設使用",
        duplicate: "複製",
        duplicateTitle: "複製此配置",
        duplicateSuffix: "（副本）",
        delete: "刪除",
        deleteTitle: "刪除此配置",
        profileNameLabel: "配置名稱（Profile Display Name）",
        profileNamePlaceholder: "例如：🟣 MiniMax-M3 或辦公室專用 DeepSeek",
        protocolFormatLabel: "API 協議格式（Protocol Format）",
        anthropicOption: "Anthropic Messages API 格式（MiniMax、Claude）",
        openaiOption: "OpenAI Chat Completions API 格式（OpenAI、DeepSeek、Z.AI、Groq、Ollama、OpenRouter）",
        endpointLabel: "API 端點 URL（Endpoint）",
        endpointPlaceholder: "https://api.minimaxi.com/anthropic/v1/messages",
        apiKeyLabel: "API Key（密鑰）",
        apiKeyPlaceholder: "輸入 API Key（例：eyJhbGciOi... 或 sk-...）",
        toggleKeyTitle: "顯示／隱藏 API Key",
        keyNotSet: "尚未設定",
        keyEntered: "已輸入 Key",
        localNoKey: "本地免 Key",
        helpMinimax: "前往 MiniMax 開放平台獲取 API Key ↗",
        helpDeepseek: "前往 DeepSeek 開放平台獲取 API Key ↗",
        helpOpenai: "前往 OpenAI Platform 獲取 API Key ↗",
        helpAnthropic: "前往 Anthropic Console 獲取 API Key ↗",
        helpOllama: "Ollama 本地運行中（無須金鑰）",
        helpZai: "前往 Z.AI 開放平台獲取 API Key ↗",
        helpGeneric: "前往 API 開放平台獲取 API Key ↗",
        modelNameLabel: "模型名稱（Model Name）",
        modelPlaceholder: "MiniMax-M3",
        systemPromptLabel: "系統提示詞（System Prompt）",
        resetPrompt: "還原預設提示詞",
        systemPromptPlaceholder: "輸入引導 AI 如何總結與回答的提示詞…",
        maxTokensLabel: "最大輸出 Token",
        temperatureLabel: "生成溫度",
        testConnection: "測試此配置連線",
        saveAll: "儲存所有設定",
        unnamedProfile: "未命名配置",
        unsetModel: "未設定模型",
        protocolAnthropic: "Anthropic",
        protocolOpenAI: "OpenAI",
        activePill: "● 使用中",
        confirmKeepOne: "至少必須保留一組 API 配置，無法刪除最後一組。",
        confirmDelete: "確定要刪除「{name}」嗎？",
        confirmResetPrompt: "確定要將系統提示詞還原為預設範本嗎？",
        toastActive: "已將此配置設為當前預設！",
        toastDuplicated: "已複製新配置！",
        toastDeleted: "已刪除配置",
        toastResetPrompt: "已還原預設提示詞",
        toastAdded: "已新增 {name} 配置！",
        testMissingKey: "⚠️ 請先輸入「{name}」的 API Key 才能進行連線測試！",
        testRunningButton: "連線測試中…",
        testRequesting: "⏳ 正在向 [{name}] 發送測試請求…",
        testSuccessHeading: "✅ [{name}] 連線成功！",
        testProtocol: "協議格式",
        testModel: "模型響應",
        testLatency: "延遲時間",
        testReply: "測試回復",
        testReplyFallback: "OK",
        testFailedHeading: "❌ 連線失敗：",
        testUnknownError: "未知錯誤，請檢查端點、金鑰與格式設定。",
        testRequestError: "❌ 請求發送異常：{message}",
        toastSaved: "🎉 所有 API 配置已成功儲存！",
        backgroundMissingKey: "請先輸入 API Key",
        backgroundHttpError: "連線失敗（HTTP {status}）：{detail}",
        backgroundConnectionError: "連線異常：{message}"
      }
    },
    en: {
      label: "English",
      htmlLang: "en",
      prompt: `You are a professional content analysis and in-depth discussion assistant. Analyze and answer precisely and clearly in English based on the webpage content or selected text provided by the user.

For the initial summary, follow this format:
### 📌 Core Topic
Summarize the most important central topic in 1–2 sentences.

### 💡 Key Points
- List 3 to 6 key points.
- Bold important data, conclusions, or steps using **bold**.

### 🎯 Conclusion & Insights
Briefly summarize the author's conclusion, practical recommendations, or key value.

For subsequent multi-turn conversations, combine the original webpage content and the previous summary to answer the user's follow-up questions in a thorough, friendly, and professional manner.`,
      strings: {
        pageTitle: "AUROFACT｜AI Web Summarizer & Insight Assistant - Settings",
        logoAlt: "Extension icon",
        appTitle: "AUROFACT",
        subtitle: "AI Web Summarizer & Insight Assistant",
        languageLabel: "Language",
        languageOptionZhTw: "Traditional Chinese",
        languageOptionEn: "English",
        languageOptionJa: "Japanese",
        languageOptionKo: "Korean",
        languageChanged: "Interface language changed to {language}. The default System Prompt was synchronized; custom prompts were preserved.",
        multiProfileBadge: "Switch between API profiles",
        profilesHeading: "API Profiles",
        contextSummarizePage: "📝 Summarize this webpage",
        contextSummarizeSelection: "📝 Process selected text with AI",
        editingProfileEmpty: "Edit profile",
        activeInitial: "Active",
        addProfile: "Add Profile",
        addProfileTitle: "Add an API profile",
        templateMenuTitle: "Choose a model template to add:",
        templateMinimaxName: "🟣 MiniMax-M3",
        templateMinimaxSub: "Anthropic protocol",
        templateDeepseekName: "🔵 DeepSeek V4 Flash",
        templateDeepseekSub: "OpenAI protocol",
        templateOpenaiName: "🟢 GPT-5.6 Luna",
        templateOpenaiSub: "Official OpenAI protocol",
        templateClaudeName: "🟠 Claude Sonnet 5",
        templateClaudeSub: "Anthropic protocol",
        templateOllamaName: "⚪ Ollama · Gemma 4 12B",
        templateOllamaSub: "localhost:11434 (no key)",
        templateZaiName: "🟡 Z.AI GLM-5.3",
        templateZaiSub: "OpenAI-compatible protocol",
        templateCustomName: "⚙️ Custom blank profile",
        templateCustomSub: "Custom endpoint and model",
        editingProfile: "Edit: {name}",
        activeDefault: "● Active by default",
        inactive: "Inactive",
        setActive: "Set active",
        setActiveTitle: "Use this profile as the current default",
        duplicate: "Duplicate",
        duplicateTitle: "Duplicate this profile",
        duplicateSuffix: " (copy)",
        delete: "Delete",
        deleteTitle: "Delete this profile",
        profileNameLabel: "Profile Name",
        profileNamePlaceholder: "e.g. 🟣 MiniMax-M3 or Office DeepSeek",
        protocolFormatLabel: "API Protocol Format",
        anthropicOption: "Anthropic Messages API (MiniMax, Claude)",
        openaiOption: "OpenAI Chat Completions API (OpenAI, DeepSeek, Z.AI, Groq, Ollama, OpenRouter)",
        endpointLabel: "API Endpoint URL",
        endpointPlaceholder: "https://api.minimaxi.com/anthropic/v1/messages",
        apiKeyLabel: "API Key",
        apiKeyPlaceholder: "Enter an API key (e.g. eyJhbGciOi... or sk-...)",
        toggleKeyTitle: "Show / hide API key",
        keyNotSet: "Not set",
        keyEntered: "Key entered",
        localNoKey: "Local; no key",
        helpMinimax: "Get an API key from the MiniMax Open Platform ↗",
        helpDeepseek: "Get an API key from the DeepSeek Open Platform ↗",
        helpOpenai: "Get an API key from the OpenAI Platform ↗",
        helpAnthropic: "Get an API key from the Anthropic Console ↗",
        helpOllama: "Ollama is running locally (no key required)",
        helpZai: "Get an API key from the Z.AI Open Platform ↗",
        helpGeneric: "Get an API key from the API provider ↗",
        modelNameLabel: "Model Name",
        modelPlaceholder: "MiniMax-M3",
        systemPromptLabel: "System Prompt",
        resetPrompt: "Restore default prompt",
        systemPromptPlaceholder: "Enter instructions for how the AI should summarize and answer…",
        maxTokensLabel: "Maximum Output Tokens",
        temperatureLabel: "Temperature",
        testConnection: "Test Connection",
        saveAll: "Save All Settings",
        unnamedProfile: "Unnamed profile",
        unsetModel: "Model not set",
        protocolAnthropic: "Anthropic",
        protocolOpenAI: "OpenAI",
        activePill: "● Active",
        confirmKeepOne: "At least one API profile must remain; the last profile cannot be deleted.",
        confirmDelete: "Are you sure you want to delete “{name}”?",
        confirmResetPrompt: "Restore the System Prompt to the default template?",
        toastActive: "This profile is now the current default!",
        toastDuplicated: "Profile duplicated!",
        toastDeleted: "Profile deleted",
        toastResetPrompt: "Default prompt restored",
        toastAdded: "Added the {name} profile!",
        testMissingKey: "⚠️ Enter the API key for “{name}” before testing the connection.",
        testRunningButton: "Testing connection…",
        testRequesting: "⏳ Sending a test request to [{name}]…",
        testSuccessHeading: "✅ [{name}] connection succeeded!",
        testProtocol: "Protocol",
        testModel: "Model response",
        testLatency: "Latency",
        testReply: "Test reply",
        testReplyFallback: "OK",
        testFailedHeading: "❌ Connection failed:",
        testUnknownError: "Unknown error. Check the endpoint, key, and protocol format.",
        testRequestError: "❌ Request error: {message}",
        toastSaved: "🎉 All API profiles were saved successfully!",
        backgroundMissingKey: "Enter an API key first",
        backgroundHttpError: "Connection failed (HTTP {status}): {detail}",
        backgroundConnectionError: "Connection error: {message}"
      }
    },
    ja: {
      label: "日本語",
      htmlLang: "ja",
      prompt: `あなたは、コンテンツ分析と深い考察を専門とするアシスタントです。ユーザーが提供したウェブページの内容または選択したテキストを、正確かつ構造的に分析し、日本語で回答してください。

最初の要約では、以下の形式に従ってください：
### 📌 中心テーマ
全文の最も重要な中心テーマを1～2文でまとめてください。

### 💡 重要ポイント
- 重要なポイントを3～6個、箇条書きにしてください。
- 重要なデータ、結論、手順は**太字**で示してください。

### 🎯 結論と洞察
著者の結論、実用的な提案、または主な価値を簡潔にまとめてください。

その後の複数ターンの会話では、ウェブページの原文と以前の要約を踏まえ、丁寧で親しみやすく専門的にユーザーの追加質問へ回答してください。`,
      strings: {
        pageTitle: "拡張機能の設定 - AI Web 要約（複数 API 管理）",
        logoAlt: "拡張機能のアイコン",
        appTitle: "AI Web 要約",
        subtitle: "複数の LLM API プロファイルを管理・切り替え（MiniMax / DeepSeek / OpenAI / Claude / Ollama / Z.AI）",
        languageLabel: "言語",
        languageOptionZhTw: "繁体字中国語",
        languageOptionEn: "英語",
        languageOptionJa: "日本語",
        languageOptionKo: "韓国語",
        languageChanged: "表示言語を {language} に変更しました。既定の System Prompt も同期しました。カスタム Prompt は保持されています。",
        multiProfileBadge: "API プロファイルを切り替え",
        profilesHeading: "API プロファイル",
        contextSummarizePage: "📝 このウェブページを要約",
        contextSummarizeSelection: "📝 選択テキストを AI で処理",
        editingProfileEmpty: "プロファイルを編集",
        activeInitial: "使用中",
        addProfile: "プロファイルを追加",
        addProfileTitle: "API プロファイルを追加",
        templateMenuTitle: "追加するモデルテンプレートを選択：",
        templateMinimaxName: "🟣 MiniMax-M3",
        templateMinimaxSub: "Anthropic プロトコル",
        templateDeepseekName: "🔵 DeepSeek V4 Flash",
        templateDeepseekSub: "OpenAI プロトコル",
        templateOpenaiName: "🟢 GPT-5.6 Luna",
        templateOpenaiSub: "OpenAI 公式プロトコル",
        templateClaudeName: "🟠 Claude Sonnet 5",
        templateClaudeSub: "Anthropic プロトコル",
        templateOllamaName: "⚪ Ollama · Gemma 4 12B",
        templateOllamaSub: "localhost:11434（キー不要）",
        templateZaiName: "🟡 Z.AI GLM-5.3",
        templateZaiSub: "OpenAI 互換プロトコル",
        templateCustomName: "⚙️ カスタム空白プロファイル",
        templateCustomSub: "カスタムエンドポイントとモデル",
        editingProfile: "編集：{name}",
        activeDefault: "● 既定として使用中",
        inactive: "無効",
        setActive: "使用中に設定",
        setActiveTitle: "このプロファイルを現在の既定に設定",
        duplicate: "複製",
        duplicateTitle: "このプロファイルを複製",
        duplicateSuffix: "（コピー）",
        delete: "削除",
        deleteTitle: "このプロファイルを削除",
        profileNameLabel: "プロファイル名",
        profileNamePlaceholder: "例：🟣 MiniMax-M3 またはオフィス用 DeepSeek",
        protocolFormatLabel: "API プロトコル形式",
        anthropicOption: "Anthropic Messages API（MiniMax、Claude）",
        openaiOption: "OpenAI Chat Completions API（OpenAI、DeepSeek、Z.AI、Groq、Ollama、OpenRouter）",
        endpointLabel: "API エンドポイント URL",
        endpointPlaceholder: "https://api.minimaxi.com/anthropic/v1/messages",
        apiKeyLabel: "API Key",
        apiKeyPlaceholder: "API Key を入力（例：eyJhbGciOi... または sk-...）",
        toggleKeyTitle: "API Key の表示／非表示",
        keyNotSet: "未設定",
        keyEntered: "Key 入力済み",
        localNoKey: "ローカル・Key 不要",
        helpMinimax: "MiniMax Open Platform で API Key を取得 ↗",
        helpDeepseek: "DeepSeek Open Platform で API Key を取得 ↗",
        helpOpenai: "OpenAI Platform で API Key を取得 ↗",
        helpAnthropic: "Anthropic Console で API Key を取得 ↗",
        helpOllama: "Ollama はローカルで実行中（Key 不要）",
        helpZai: "Z.AI Open Platform で API Key を取得 ↗",
        helpGeneric: "API プロバイダーで API Key を取得 ↗",
        modelNameLabel: "モデル名",
        modelPlaceholder: "MiniMax-M3",
        systemPromptLabel: "システムプロンプト（System Prompt）",
        resetPrompt: "既定のプロンプトに戻す",
        systemPromptPlaceholder: "AI の要約・回答方法を指示するプロンプトを入力…",
        maxTokensLabel: "最大出力 Token",
        temperatureLabel: "生成温度",
        testConnection: "接続をテスト",
        saveAll: "すべての設定を保存",
        unnamedProfile: "名前なしプロファイル",
        unsetModel: "モデル未設定",
        protocolAnthropic: "Anthropic",
        protocolOpenAI: "OpenAI",
        activePill: "● 使用中",
        confirmKeepOne: "少なくとも1つの API プロファイルが必要です。最後のプロファイルは削除できません。",
        confirmDelete: "「{name}」を削除しますか？",
        confirmResetPrompt: "System Prompt を既定のテンプレートに戻しますか？",
        toastActive: "このプロファイルを現在の既定に設定しました！",
        toastDuplicated: "プロファイルを複製しました！",
        toastDeleted: "プロファイルを削除しました",
        toastResetPrompt: "既定のプロンプトに戻しました",
        toastAdded: "{name} プロファイルを追加しました！",
        testMissingKey: "⚠️ 接続をテストする前に「{name}」の API Key を入力してください。",
        testRunningButton: "接続をテスト中…",
        testRequesting: "⏳ [{name}] にテストリクエストを送信中…",
        testSuccessHeading: "✅ [{name}] 接続に成功しました！",
        testProtocol: "プロトコル",
        testModel: "モデル応答",
        testLatency: "遅延時間",
        testReply: "テスト応答",
        testReplyFallback: "OK",
        testFailedHeading: "❌ 接続に失敗しました：",
        testUnknownError: "不明なエラーです。エンドポイント、Key、形式を確認してください。",
        testRequestError: "❌ リクエストエラー：{message}",
        toastSaved: "🎉 すべての API プロファイルを保存しました！",
        backgroundMissingKey: "API Key を先に入力してください",
        backgroundHttpError: "接続に失敗しました（HTTP {status}）：{detail}",
        backgroundConnectionError: "接続エラー：{message}"
      }
    },
    ko: {
      label: "한국어",
      htmlLang: "ko",
      prompt: `당신은 콘텐츠 분석과 심층 토론을 전문으로 하는 어시스턴트입니다. 사용자가 제공한 웹 페이지 내용이나 선택한 텍스트를 정확하고 구조적으로 분석하여 한국어로 답변하세요.

첫 요약은 다음 형식을 따르세요:
### 📌 핵심 주제
전체 내용의 가장 중요한 핵심 주제를 1~2문장으로 요약하세요.

### 💡 주요 요점
- 핵심 요점을 3~6개 글머리표로 정리하세요.
- 중요한 데이터, 결론 또는 단계는 **굵게** 표시하세요.

### 🎯 결론 및 인사이트
작성자의 결론, 실용적인 제안 또는 핵심 가치를 간단히 요약하세요.

이후의 여러 차례 대화에서는 웹 페이지 원문과 이전 요약을 함께 고려하여 사용자의 후속 질문에 친절하고 전문적으로 답변하세요.`,
      strings: {
        pageTitle: "확장 프로그램 설정 - AI 웹 요약（다중 API 관리）",
        logoAlt: "확장 프로그램 아이콘",
        appTitle: "AI 웹 요약",
        subtitle: "여러 LLM API 프로필 관리 및 빠른 전환 (MiniMax / DeepSeek / OpenAI / Claude / Ollama / Z.AI)",
        languageLabel: "언어",
        languageOptionZhTw: "번체 중국어",
        languageOptionEn: "영어",
        languageOptionJa: "일본어",
        languageOptionKo: "한국어",
        languageChanged: "인터페이스 언어를 {language}(으)로 변경했습니다. 기본 System Prompt도 동기화했으며 사용자 지정 Prompt는 유지했습니다.",
        multiProfileBadge: "API 프로필 전환",
        profilesHeading: "API 프로필 목록",
        contextSummarizePage: "📝 이 웹 페이지 요약",
        contextSummarizeSelection: "📝 선택한 텍스트를 AI로 처리",
        editingProfileEmpty: "프로필 편집",
        activeInitial: "사용 중",
        addProfile: "프로필 추가",
        addProfileTitle: "API 프로필 추가",
        templateMenuTitle: "추가할 모델 템플릿을 선택하세요:",
        templateMinimaxName: "🟣 MiniMax-M3",
        templateMinimaxSub: "Anthropic 프로토콜",
        templateDeepseekName: "🔵 DeepSeek V4 Flash",
        templateDeepseekSub: "OpenAI 프로토콜",
        templateOpenaiName: "🟢 GPT-5.6 Luna",
        templateOpenaiSub: "공식 OpenAI 프로토콜",
        templateClaudeName: "🟠 Claude Sonnet 5",
        templateClaudeSub: "Anthropic 프로토콜",
        templateOllamaName: "⚪ Ollama · Gemma 4 12B",
        templateOllamaSub: "localhost:11434（키 불필요）",
        templateZaiName: "🟡 Z.AI GLM-5.3",
        templateZaiSub: "OpenAI 호환 프로토콜",
        templateCustomName: "⚙️ 사용자 지정 빈 프로필",
        templateCustomSub: "사용자 지정 엔드포인트 및 모델",
        editingProfile: "편집: {name}",
        activeDefault: "● 기본 사용 중",
        inactive: "비활성",
        setActive: "활성 프로필로 설정",
        setActiveTitle: "이 프로필을 현재 기본 프로필로 사용",
        duplicate: "복제",
        duplicateTitle: "이 프로필 복제",
        duplicateSuffix: " (복사본)",
        delete: "삭제",
        deleteTitle: "이 프로필 삭제",
        profileNameLabel: "프로필 이름",
        profileNamePlaceholder: "예: 🟣 MiniMax-M3 또는 사무실용 DeepSeek",
        protocolFormatLabel: "API 프로토콜 형식",
        anthropicOption: "Anthropic Messages API 형식 (MiniMax, Claude)",
        openaiOption: "OpenAI Chat Completions API 형식 (OpenAI, DeepSeek, Z.AI, Groq, Ollama, OpenRouter)",
        endpointLabel: "API 엔드포인트 URL",
        endpointPlaceholder: "https://api.minimaxi.com/anthropic/v1/messages",
        apiKeyLabel: "API Key (키)",
        apiKeyPlaceholder: "API Key 입력 (예: eyJhbGciOi... 또는 sk-...)",
        toggleKeyTitle: "API Key 표시／숨기기",
        keyNotSet: "설정되지 않음",
        keyEntered: "Key 입력됨",
        localNoKey: "로컬 사용 (Key 불필요)",
        helpMinimax: "MiniMax Open Platform에서 API Key 받기 ↗",
        helpDeepseek: "DeepSeek Open Platform에서 API Key 받기 ↗",
        helpOpenai: "OpenAI Platform에서 API Key 받기 ↗",
        helpAnthropic: "Anthropic Console에서 API Key 받기 ↗",
        helpOllama: "Ollama가 로컬에서 실행 중입니다 (키 불필요)",
        helpZai: "Z.AI Open Platform에서 API Key 받기 ↗",
        helpGeneric: "API 제공업체에서 API Key 받기 ↗",
        modelNameLabel: "모델 이름",
        modelPlaceholder: "MiniMax-M3",
        systemPromptLabel: "시스템 프롬프트 (System Prompt)",
        resetPrompt: "기본 프롬프트 복원",
        systemPromptPlaceholder: "AI의 요약 및 답변 방식을 안내하는 프롬프트 입력…",
        maxTokensLabel: "최대 출력 Token",
        temperatureLabel: "생성 온도",
        testConnection: "연결 테스트",
        saveAll: "모든 설정 저장",
        unnamedProfile: "이름 없는 프로필",
        unsetModel: "모델 미설정",
        protocolAnthropic: "Anthropic",
        protocolOpenAI: "OpenAI",
        activePill: "● 사용 중",
        confirmKeepOne: "API 프로필을 하나 이상 유지해야 하므로 마지막 프로필은 삭제할 수 없습니다.",
        confirmDelete: "“{name}”을(를) 삭제하시겠습니까?",
        confirmResetPrompt: "시스템 프롬프트를 기본 템플릿으로 복원하시겠습니까?",
        toastActive: "이 프로필을 현재 기본 프로필로 설정했습니다!",
        toastDuplicated: "프로필을 복제했습니다!",
        toastDeleted: "프로필을 삭제했습니다",
        toastResetPrompt: "기본 프롬프트를 복원했습니다",
        toastAdded: "{name} 프로필을 추가했습니다!",
        testMissingKey: "⚠️ 연결을 테스트하기 전에 “{name}”의 API Key를 입력하세요.",
        testRunningButton: "연결 테스트 중…",
        testRequesting: "⏳ [{name}]에 테스트 요청을 보내는 중…",
        testSuccessHeading: "✅ [{name}] 연결 성공!",
        testProtocol: "프로토콜",
        testModel: "모델 응답",
        testLatency: "지연 시간",
        testReply: "테스트 응답",
        testReplyFallback: "OK",
        testFailedHeading: "❌ 연결 실패:",
        testUnknownError: "알 수 없는 오류입니다. 엔드포인트, 키, 형식을 확인하세요.",
        testRequestError: "❌ 요청 오류: {message}",
        toastSaved: "🎉 모든 API 프로필을 성공적으로 저장했습니다!",
        backgroundMissingKey: "API Key를 먼저 입력하세요",
        backgroundHttpError: "연결 실패 (HTTP {status}): {detail}",
        backgroundConnectionError: "연결 오류: {message}"
      }
    }
  };

  Object.assign(locales, {
    "zh-CN": {
      label: "简体中文",
      htmlLang: "zh-CN",
      prompt: `你是一名专业的内容分析与深度讨论助手。请根据用户提供的网页内容或选中的文字，用准确、清晰、有条理的简体中文进行分析和回答。

首次总结请遵循以下格式：
### 📌 核心主题
用 1-2 句话概括全文最重要的核心主题。

### 💡 关键要点
- 列出 3 至 6 个关键要点。
- 重要数据、结论或步骤请使用**粗体**标注。

### 🎯 结论与洞察
简要总结作者的结论、实用建议或核心价值。

后续多轮对话中，请结合网页原文和之前的总结，以亲切、专业的方式回答用户的后续问题。`,
      strings: {
        pageTitle: "扩展程序设置 - AI 网页重点总结（多组 API 管理）", logoAlt: "扩展程序图标", appTitle: "AI 网页重点总结", subtitle: "管理并快速切换多组 LLM API 配置（MiniMax / DeepSeek / OpenAI / Claude / Ollama / Z.AI）", languageLabel: "语言", languageOptionZhTw: "繁体中文", languageOptionEn: "英语", languageOptionJa: "日语", languageOptionKo: "韩语", languageChanged: "界面语言已切换为 {language}。默认 System Prompt 也已同步；自定义 Prompt 不会被覆盖。", multiProfileBadge: "多组 API 自由切换", profilesHeading: "API 配置列表", contextSummarizePage: "📝 总结此网页重点", contextSummarizeSelection: "📝 AI 处理选中文字", editingProfileEmpty: "编辑配置", activeInitial: "使用中", addProfile: "新增配置", addProfileTitle: "新增一组 API 配置", templateMenuTitle: "选择要新增的模型模板：", templateMinimaxName: "🟣 MiniMax-M3", templateMinimaxSub: "Anthropic 协议", templateDeepseekName: "🔵 DeepSeek V4 Flash", templateDeepseekSub: "OpenAI 协议", templateOpenaiName: "🟢 GPT-5.6 Luna", templateOpenaiSub: "OpenAI 官方协议", templateClaudeName: "🟠 Claude Sonnet 5", templateClaudeSub: "Anthropic 协议", templateOllamaName: "⚪ Ollama · Gemma 4 12B", templateOllamaSub: "localhost:11434（无需 Key）", templateZaiName: "🟡 Z.AI GLM-5.3", templateZaiSub: "兼容 OpenAI 协议", templateCustomName: "⚙️ 自定义空白配置", templateCustomSub: "自定义端点与模型", editingProfile: "编辑：{name}", activeDefault: "● 默认使用中", inactive: "未启用", setActive: "设为使用中", setActiveTitle: "将此配置设为当前默认使用", duplicate: "复制", duplicateTitle: "复制此配置", duplicateSuffix: "（副本）", delete: "删除", deleteTitle: "删除此配置", profileNameLabel: "配置名称（Profile Display Name）", profileNamePlaceholder: "例如：🟣 MiniMax-M3 或办公专用 DeepSeek", protocolFormatLabel: "API 协议格式（Protocol Format）", anthropicOption: "Anthropic Messages API 格式（MiniMax、Claude）", openaiOption: "OpenAI Chat Completions API 格式（OpenAI、DeepSeek、Z.AI、Groq、Ollama、OpenRouter）", endpointLabel: "API 端点 URL（Endpoint）", endpointPlaceholder: "https://api.minimaxi.com/anthropic/v1/messages", apiKeyLabel: "API Key（密钥）", apiKeyPlaceholder: "输入 API Key（例如：eyJhbGciOi... 或 sk-...）", toggleKeyTitle: "显示／隐藏 API Key", keyNotSet: "尚未设置", keyEntered: "已输入 Key", localNoKey: "本地免 Key", helpMinimax: "前往 MiniMax 开放平台获取 API Key ↗", helpDeepseek: "前往 DeepSeek 开放平台获取 API Key ↗", helpOpenai: "前往 OpenAI Platform 获取 API Key ↗", helpAnthropic: "前往 Anthropic Console 获取 API Key ↗", helpOllama: "Ollama 正在本地运行（无需密钥）", helpZai: "前往 Z.AI 开放平台获取 API Key ↗", helpGeneric: "前往 API 开放平台获取 API Key ↗", modelNameLabel: "模型名称（Model Name）", modelPlaceholder: "MiniMax-M3", systemPromptLabel: "系统提示词（System Prompt）", resetPrompt: "还原默认提示词", systemPromptPlaceholder: "输入引导 AI 如何总结与回答的提示词…", maxTokensLabel: "最大输出 Token", temperatureLabel: "生成温度", testConnection: "测试此配置连接", saveAll: "保存所有设置", unnamedProfile: "未命名配置", unsetModel: "未设置模型", protocolAnthropic: "Anthropic", protocolOpenAI: "OpenAI", activePill: "● 使用中", confirmKeepOne: "至少必须保留一组 API 配置，无法删除最后一组。", confirmDelete: "确定要删除“{name}”吗？", confirmResetPrompt: "确定要将系统提示词还原为默认模板吗？", toastActive: "已将此配置设为当前默认！", toastDuplicated: "已复制新配置！", toastDeleted: "已删除配置", toastResetPrompt: "已还原默认提示词", toastAdded: "已新增 {name} 配置！", testMissingKey: "⚠️ 请先输入“{name}”的 API Key 才能进行连接测试！", testRunningButton: "连接测试中…", testRequesting: "⏳ 正在向 [{name}] 发送测试请求…", testSuccessHeading: "✅ [{name}] 连接成功！", testProtocol: "协议格式", testModel: "模型响应", testLatency: "延迟时间", testReply: "测试回复", testReplyFallback: "OK", testFailedHeading: "❌ 连接失败：", testUnknownError: "未知错误，请检查端点、密钥与格式设置。", testRequestError: "❌ 请求发送异常：{message}", toastSaved: "🎉 所有 API 配置已成功保存！", backgroundMissingKey: "请先输入 API Key", backgroundHttpError: "连接失败（HTTP {status}）：{detail}", backgroundConnectionError: "连接异常：{message}"
      }
    },
    fr: {
      label: "Français", htmlLang: "fr",
      prompt: `Vous êtes un assistant professionnel spécialisé dans l’analyse de contenu et les discussions approfondies. Analysez et répondez avec précision et clarté en français à partir du contenu de la page web ou du texte sélectionné fourni par l’utilisateur.

Pour le résumé initial, suivez ce format :
### 📌 Sujet principal
Résumez le sujet central le plus important en 1 à 2 phrases.

### 💡 Points clés
- Listez 3 à 6 points clés.
- Mettez en **gras** les données, conclusions ou étapes importantes.

### 🎯 Conclusion et perspectives
Résumez brièvement la conclusion de l’auteur, les recommandations pratiques ou la valeur principale.

Dans les échanges suivants, utilisez le contenu original de la page et le résumé précédent pour répondre de manière approfondie, aimable et professionnelle.`,
      strings: {
        pageTitle: "Paramètres de l’extension - Résumeur web IA (profils API)", logoAlt: "Icône de l’extension", appTitle: "Résumeur web IA", subtitle: "Gérez et changez rapidement de profil API LLM (MiniMax / DeepSeek / OpenAI / Claude / Ollama / Z.AI)", languageLabel: "Langue", languageOptionZhTw: "Chinois traditionnel", languageOptionEn: "Anglais", languageOptionJa: "Japonais", languageOptionKo: "Coréen", languageChanged: "La langue de l’interface est passée à {language}. Le System Prompt par défaut a également été synchronisé ; les prompts personnalisés sont conservés.", multiProfileBadge: "Changer de profil API", profilesHeading: "Profils API", contextSummarizePage: "📝 Résumer cette page web", contextSummarizeSelection: "📝 Traiter le texte sélectionné avec l’IA", editingProfileEmpty: "Modifier le profil", activeInitial: "Actif", addProfile: "Ajouter un profil", addProfileTitle: "Ajouter un profil API", templateMenuTitle: "Choisissez un modèle à ajouter :", templateMinimaxName: "🟣 MiniMax-M3", templateMinimaxSub: "Protocole Anthropic", templateDeepseekName: "🔵 DeepSeek V4 Flash", templateDeepseekSub: "Protocole OpenAI", templateOpenaiName: "🟢 GPT-5.6 Luna", templateOpenaiSub: "Protocole officiel OpenAI", templateClaudeName: "🟠 Claude Sonnet 5", templateClaudeSub: "Protocole Anthropic", templateOllamaName: "⚪ Ollama · Gemma 4 12B", templateOllamaSub: "localhost:11434 (sans clé)", templateZaiName: "🟡 Z.AI GLM-5.3", templateZaiSub: "Compatible OpenAI", templateCustomName: "⚙️ Profil vierge personnalisé", templateCustomSub: "Endpoint et modèle personnalisés", editingProfile: "Modifier : {name}", activeDefault: "● Actif par défaut", inactive: "Inactif", setActive: "Activer", setActiveTitle: "Utiliser ce profil comme profil par défaut", duplicate: "Dupliquer", duplicateTitle: "Dupliquer ce profil", duplicateSuffix: " (copie)", delete: "Supprimer", deleteTitle: "Supprimer ce profil", profileNameLabel: "Nom du profil", profileNamePlaceholder: "ex. 🟣 MiniMax-M3 ou DeepSeek professionnel", protocolFormatLabel: "Format du protocole API", anthropicOption: "Anthropic Messages API (MiniMax, Claude)", openaiOption: "OpenAI Chat Completions API (OpenAI, DeepSeek, Z.AI, Groq, Ollama, OpenRouter)", endpointLabel: "URL de l’endpoint API", endpointPlaceholder: "https://api.minimaxi.com/anthropic/v1/messages", apiKeyLabel: "API Key", apiKeyPlaceholder: "Saisissez une API Key (ex. eyJhbGciOi... ou sk-...)", toggleKeyTitle: "Afficher / masquer l’API Key", keyNotSet: "Non définie", keyEntered: "Clé saisie", localNoKey: "Local, sans clé", helpMinimax: "Obtenir une API Key sur MiniMax Open Platform ↗", helpDeepseek: "Obtenir une API Key sur DeepSeek Open Platform ↗", helpOpenai: "Obtenir une API Key sur OpenAI Platform ↗", helpAnthropic: "Obtenir une API Key sur Anthropic Console ↗", helpOllama: "Ollama fonctionne en local (aucune clé requise)", helpZai: "Obtenir une API Key sur Z.AI Open Platform ↗", helpGeneric: "Obtenir une API Key auprès du fournisseur ↗", modelNameLabel: "Nom du modèle", modelPlaceholder: "MiniMax-M3", systemPromptLabel: "System Prompt", resetPrompt: "Restaurer le prompt par défaut", systemPromptPlaceholder: "Indiquez comment l’IA doit résumer et répondre…", maxTokensLabel: "Nombre maximal de tokens", temperatureLabel: "Température", testConnection: "Tester la connexion", saveAll: "Enregistrer tous les paramètres", unnamedProfile: "Profil sans nom", unsetModel: "Modèle non défini", protocolAnthropic: "Anthropic", protocolOpenAI: "OpenAI", activePill: "● Actif", confirmKeepOne: "Au moins un profil API doit être conservé ; le dernier ne peut pas être supprimé.", confirmDelete: "Voulez-vous supprimer « {name} » ?", confirmResetPrompt: "Restaurer le System Prompt par défaut ?", toastActive: "Ce profil est maintenant le profil par défaut !", toastDuplicated: "Profil dupliqué !", toastDeleted: "Profil supprimé", toastResetPrompt: "Prompt par défaut restauré", toastAdded: "Profil {name} ajouté !", testMissingKey: "⚠️ Saisissez l’API Key de « {name} » avant de tester la connexion.", testRunningButton: "Test de connexion…", testRequesting: "⏳ Envoi d’une requête de test à [{name}]…", testSuccessHeading: "✅ Connexion réussie pour [{name}] !", testProtocol: "Protocole", testModel: "Réponse du modèle", testLatency: "Latence", testReply: "Réponse de test", testReplyFallback: "OK", testFailedHeading: "❌ Échec de la connexion :", testUnknownError: "Erreur inconnue. Vérifiez l’endpoint, la clé et le format.", testRequestError: "❌ Erreur de requête : {message}", toastSaved: "🎉 Tous les profils API ont été enregistrés !", backgroundMissingKey: "Saisissez d’abord une API Key", backgroundHttpError: "Échec de la connexion (HTTP {status}) : {detail}", backgroundConnectionError: "Erreur de connexion : {message}"
      }
    },
    es: {
      label: "Español", htmlLang: "es",
      prompt: `Eres un asistente profesional especializado en el análisis de contenidos y la conversación profunda. Analiza y responde con precisión y claridad en español basándote en el contenido de la página web o el texto seleccionado proporcionado por el usuario.

Para el resumen inicial, sigue este formato:
### 📌 Tema principal
Resume el tema central más importante en 1 o 2 frases.

### 💡 Puntos clave
- Enumera de 3 a 6 puntos clave.
- Marca en **negrita** los datos, conclusiones o pasos importantes.

### 🎯 Conclusión e ideas
Resume brevemente la conclusión del autor, las recomendaciones prácticas o el valor principal.

En las conversaciones posteriores, combina el texto original de la página y el resumen anterior para responder de forma detallada, cordial y profesional.`,
      strings: {
        pageTitle: "Configuración de la extensión - Resumidor web con IA (perfiles API)", logoAlt: "Icono de la extensión", appTitle: "Resumidor web con IA", subtitle: "Administra y cambia rápidamente entre perfiles de API LLM (MiniMax / DeepSeek / OpenAI / Claude / Ollama / Z.AI)", languageLabel: "Idioma", languageOptionZhTw: "Chino tradicional", languageOptionEn: "Inglés", languageOptionJa: "Japonés", languageOptionKo: "Coreano", languageChanged: "El idioma de la interfaz cambió a {language}. El System Prompt predeterminado también se sincronizó; los prompts personalizados se conservaron.", multiProfileBadge: "Cambiar entre perfiles API", profilesHeading: "Perfiles API", contextSummarizePage: "📝 Resumir esta página web", contextSummarizeSelection: "📝 Procesar el texto seleccionado con IA", editingProfileEmpty: "Editar perfil", activeInitial: "Activo", addProfile: "Añadir perfil", addProfileTitle: "Añadir un perfil API", templateMenuTitle: "Elige una plantilla de modelo para añadir:", templateMinimaxName: "🟣 MiniMax-M3", templateMinimaxSub: "Protocolo Anthropic", templateDeepseekName: "🔵 DeepSeek V4 Flash", templateDeepseekSub: "Protocolo OpenAI", templateOpenaiName: "🟢 GPT-5.6 Luna", templateOpenaiSub: "Protocolo oficial de OpenAI", templateClaudeName: "🟠 Claude Sonnet 5", templateClaudeSub: "Protocolo Anthropic", templateOllamaName: "⚪ Ollama · Gemma 4 12B", templateOllamaSub: "localhost:11434 (sin clave)", templateZaiName: "🟡 Z.AI GLM-5.3", templateZaiSub: "Compatible con OpenAI", templateCustomName: "⚙️ Perfil vacío personalizado", templateCustomSub: "Endpoint y modelo personalizados", editingProfile: "Editar: {name}", activeDefault: "● Activo por defecto", inactive: "Inactivo", setActive: "Activar", setActiveTitle: "Usar este perfil como predeterminado", duplicate: "Duplicar", duplicateTitle: "Duplicar este perfil", duplicateSuffix: " (copia)", delete: "Eliminar", deleteTitle: "Eliminar este perfil", profileNameLabel: "Nombre del perfil", profileNamePlaceholder: "p. ej. 🟣 MiniMax-M3 o DeepSeek de oficina", protocolFormatLabel: "Formato del protocolo API", anthropicOption: "Anthropic Messages API (MiniMax, Claude)", openaiOption: "OpenAI Chat Completions API (OpenAI, DeepSeek, Z.AI, Groq, Ollama, OpenRouter)", endpointLabel: "URL del endpoint API", endpointPlaceholder: "https://api.minimaxi.com/anthropic/v1/messages", apiKeyLabel: "API Key", apiKeyPlaceholder: "Introduce una API Key (p. ej. eyJhbGciOi... o sk-...)", toggleKeyTitle: "Mostrar / ocultar API Key", keyNotSet: "No configurada", keyEntered: "Clave introducida", localNoKey: "Local, sin clave", helpMinimax: "Obtén una API Key en MiniMax Open Platform ↗", helpDeepseek: "Obtén una API Key en DeepSeek Open Platform ↗", helpOpenai: "Obtén una API Key en OpenAI Platform ↗", helpAnthropic: "Obtén una API Key en Anthropic Console ↗", helpOllama: "Ollama se ejecuta localmente (no requiere clave)", helpZai: "Obtén una API Key en Z.AI Open Platform ↗", helpGeneric: "Obtén una API Key del proveedor de API ↗", modelNameLabel: "Nombre del modelo", modelPlaceholder: "MiniMax-M3", systemPromptLabel: "System Prompt", resetPrompt: "Restaurar prompt predeterminado", systemPromptPlaceholder: "Indica cómo debe resumir y responder la IA…", maxTokensLabel: "Tokens máximos de salida", temperatureLabel: "Temperatura", testConnection: "Probar conexión", saveAll: "Guardar todos los ajustes", unnamedProfile: "Perfil sin nombre", unsetModel: "Modelo no configurado", protocolAnthropic: "Anthropic", protocolOpenAI: "OpenAI", activePill: "● Activo", confirmKeepOne: "Debe quedar al menos un perfil API; no se puede eliminar el último.", confirmDelete: "¿Seguro que quieres eliminar «{name}»?", confirmResetPrompt: "¿Restaurar el System Prompt predeterminado?", toastActive: "Este perfil es ahora el predeterminado.", toastDuplicated: "¡Perfil duplicado!", toastDeleted: "Perfil eliminado", toastResetPrompt: "Prompt predeterminado restaurado", toastAdded: "¡Perfil {name} añadido!", testMissingKey: "⚠️ Introduce la API Key de «{name}» antes de probar la conexión.", testRunningButton: "Probando conexión…", testRequesting: "⏳ Enviando una solicitud de prueba a [{name}]…", testSuccessHeading: "✅ ¡Conexión correcta para [{name}]!", testProtocol: "Protocolo", testModel: "Respuesta del modelo", testLatency: "Latencia", testReply: "Respuesta de prueba", testReplyFallback: "OK", testFailedHeading: "❌ Error de conexión:", testUnknownError: "Error desconocido. Comprueba el endpoint, la clave y el formato.", testRequestError: "❌ Error de solicitud: {message}", toastSaved: "🎉 ¡Todos los perfiles API se guardaron correctamente!", backgroundMissingKey: "Introduce primero una API Key", backgroundHttpError: "Error de conexión (HTTP {status}): {detail}", backgroundConnectionError: "Error de conexión: {message}"
      }
    },
    de: {
      label: "Deutsch", htmlLang: "de",
      prompt: `Du bist ein professioneller Assistent für Inhaltsanalyse und vertiefende Diskussionen. Analysiere die vom Nutzer bereitgestellten Webseiteninhalte oder ausgewählten Text präzise, klar und strukturiert auf Deutsch und beantworte die Fragen entsprechend.

Verwende für die erste Zusammenfassung dieses Format:
### 📌 Kernthema
Fasse das wichtigste zentrale Thema in 1–2 Sätzen zusammen.

### 💡 Wichtige Punkte
- Liste 3 bis 6 wichtige Punkte auf.
- Hebe wichtige Daten, Schlussfolgerungen oder Schritte mit **Fettdruck** hervor.

### 🎯 Fazit und Erkenntnisse
Fasse das Fazit des Autors, praktische Empfehlungen oder den wichtigsten Nutzen kurz zusammen.

Beziehe dich in weiteren Gesprächsrunden auf den ursprünglichen Webseiteninhalt und die vorherige Zusammenfassung und antworte freundlich, gründlich und professionell.`,
      strings: {
        pageTitle: "Erweiterungseinstellungen - KI-Webzusammenfassung (API-Profile)", logoAlt: "Erweiterungssymbol", appTitle: "KI-Webzusammenfassung", subtitle: "Mehrere LLM-API-Profile verwalten und schnell wechseln (MiniMax / DeepSeek / OpenAI / Claude / Ollama / Z.AI)", languageLabel: "Sprache", languageOptionZhTw: "Traditionelles Chinesisch", languageOptionEn: "Englisch", languageOptionJa: "Japanisch", languageOptionKo: "Koreanisch", languageChanged: "Die Oberflächensprache wurde auf {language} geändert. Der standardmäßige System Prompt wurde ebenfalls synchronisiert; benutzerdefinierte Prompts bleiben erhalten.", multiProfileBadge: "Zwischen API-Profilen wechseln", profilesHeading: "API-Profile", contextSummarizePage: "📝 Diese Webseite zusammenfassen", contextSummarizeSelection: "📝 Ausgewählten Text mit KI verarbeiten", editingProfileEmpty: "Profil bearbeiten", activeInitial: "Aktiv", addProfile: "Profil hinzufügen", addProfileTitle: "API-Profil hinzufügen", templateMenuTitle: "Wähle eine Modellvorlage aus:", templateMinimaxName: "🟣 MiniMax-M3", templateMinimaxSub: "Anthropic-Protokoll", templateDeepseekName: "🔵 DeepSeek V4 Flash", templateDeepseekSub: "OpenAI-Protokoll", templateOpenaiName: "🟢 GPT-5.6 Luna", templateOpenaiSub: "Offizielles OpenAI-Protokoll", templateClaudeName: "🟠 Claude Sonnet 5", templateClaudeSub: "Anthropic-Protokoll", templateOllamaName: "⚪ Ollama · Gemma 4 12B", templateOllamaSub: "localhost:11434 (kein Key)", templateZaiName: "🟡 Z.AI GLM-5.3", templateZaiSub: "OpenAI-kompatibles Protokoll", templateCustomName: "⚙️ Leeres benutzerdefiniertes Profil", templateCustomSub: "Benutzerdefinierter Endpunkt und Modell", editingProfile: "Bearbeiten: {name}", activeDefault: "● Standardmäßig aktiv", inactive: "Inaktiv", setActive: "Aktiv setzen", setActiveTitle: "Dieses Profil als aktuellen Standard verwenden", duplicate: "Duplizieren", duplicateTitle: "Dieses Profil duplizieren", duplicateSuffix: " (Kopie)", delete: "Löschen", deleteTitle: "Dieses Profil löschen", profileNameLabel: "Profilname", profileNamePlaceholder: "z. B. 🟣 MiniMax-M3 oder DeepSeek Büro", protocolFormatLabel: "API-Protokollformat", anthropicOption: "Anthropic Messages API (MiniMax, Claude)", openaiOption: "OpenAI Chat Completions API (OpenAI, DeepSeek, Z.AI, Groq, Ollama, OpenRouter)", endpointLabel: "API-Endpunkt-URL", endpointPlaceholder: "https://api.minimaxi.com/anthropic/v1/messages", apiKeyLabel: "API Key", apiKeyPlaceholder: "API Key eingeben (z. B. eyJhbGciOi... oder sk-...)", toggleKeyTitle: "API Key anzeigen / ausblenden", keyNotSet: "Nicht festgelegt", keyEntered: "Key eingegeben", localNoKey: "Lokal, kein Key erforderlich", helpMinimax: "API Key auf der MiniMax Open Platform erhalten ↗", helpDeepseek: "API Key auf der DeepSeek Open Platform erhalten ↗", helpOpenai: "API Key auf der OpenAI Platform erhalten ↗", helpAnthropic: "API Key über die Anthropic Console erhalten ↗", helpOllama: "Ollama läuft lokal (kein Key erforderlich)", helpZai: "API Key auf der Z.AI Open Platform erhalten ↗", helpGeneric: "API Key beim API-Anbieter erhalten ↗", modelNameLabel: "Modellname", modelPlaceholder: "MiniMax-M3", systemPromptLabel: "System Prompt", resetPrompt: "Standard-Prompt wiederherstellen", systemPromptPlaceholder: "Anweisungen für Zusammenfassungen und Antworten der KI eingeben…", maxTokensLabel: "Maximale Ausgabe-Tokens", temperatureLabel: "Temperatur", testConnection: "Verbindung testen", saveAll: "Alle Einstellungen speichern", unnamedProfile: "Unbenanntes Profil", unsetModel: "Modell nicht festgelegt", protocolAnthropic: "Anthropic", protocolOpenAI: "OpenAI", activePill: "● Aktiv", confirmKeepOne: "Mindestens ein API-Profil muss bleiben; das letzte Profil kann nicht gelöscht werden.", confirmDelete: "Möchtest du „{name}“ wirklich löschen?", confirmResetPrompt: "System Prompt auf die Standardvorlage zurücksetzen?", toastActive: "Dieses Profil ist jetzt der aktuelle Standard!", toastDuplicated: "Profil dupliziert!", toastDeleted: "Profil gelöscht", toastResetPrompt: "Standard-Prompt wiederhergestellt", toastAdded: "Profil {name} hinzugefügt!", testMissingKey: "⚠️ Gib vor dem Verbindungstest den API Key für „{name}“ ein.", testRunningButton: "Verbindung wird getestet…", testRequesting: "⏳ Testanfrage an [{name}] wird gesendet…", testSuccessHeading: "✅ Verbindung für [{name}] erfolgreich!", testProtocol: "Protokoll", testModel: "Modellantwort", testLatency: "Latenz", testReply: "Testantwort", testReplyFallback: "OK", testFailedHeading: "❌ Verbindung fehlgeschlagen:", testUnknownError: "Unbekannter Fehler. Prüfe Endpunkt, Key und Format.", testRequestError: "❌ Anfragefehler: {message}", toastSaved: "🎉 Alle API-Profile wurden erfolgreich gespeichert!", backgroundMissingKey: "Gib zuerst einen API Key ein", backgroundHttpError: "Verbindung fehlgeschlagen (HTTP {status}): {detail}", backgroundConnectionError: "Verbindungsfehler: {message}"
      }
    },
    vi: {
      label: "Tiếng Việt", htmlLang: "vi",
      prompt: `Bạn là trợ lý chuyên nghiệp về phân tích nội dung và thảo luận chuyên sâu. Hãy phân tích chính xác, rõ ràng bằng tiếng Việt dựa trên nội dung trang web hoặc văn bản được người dùng chọn.

Với bản tóm tắt ban đầu, hãy dùng định dạng sau:
### 📌 Chủ đề chính
Tóm tắt chủ đề trung tâm quan trọng nhất trong 1-2 câu.

### 💡 Các điểm chính
- Liệt kê 3 đến 6 điểm chính.
- In đậm dữ liệu, kết luận hoặc bước quan trọng bằng **in đậm**.

### 🎯 Kết luận và thông tin chi tiết
Tóm tắt ngắn gọn kết luận, đề xuất thực tế hoặc giá trị chính của tác giả.

Trong các lượt trò chuyện tiếp theo, hãy kết hợp nội dung trang web gốc và bản tóm tắt trước đó để trả lời thân thiện, chuyên nghiệp và đầy đủ.`,
      strings: {
        pageTitle: "Cài đặt tiện ích - Tóm tắt web AI (nhiều hồ sơ API)", logoAlt: "Biểu tượng tiện ích", appTitle: "Tóm tắt web AI", subtitle: "Quản lý và chuyển nhanh giữa nhiều hồ sơ API LLM (MiniMax / DeepSeek / OpenAI / Claude / Ollama / Z.AI)", languageLabel: "Ngôn ngữ", languageOptionZhTw: "Tiếng Trung phồn thể", languageOptionEn: "Tiếng Anh", languageOptionJa: "Tiếng Nhật", languageOptionKo: "Tiếng Hàn", languageChanged: "Ngôn ngữ giao diện đã chuyển sang {language}. System Prompt mặc định cũng đã được đồng bộ; Prompt tùy chỉnh được giữ nguyên.", multiProfileBadge: "Chuyển đổi hồ sơ API", profilesHeading: "Danh sách hồ sơ API", contextSummarizePage: "📝 Tóm tắt trang web này", contextSummarizeSelection: "📝 Dùng AI xử lý văn bản đã chọn", editingProfileEmpty: "Chỉnh sửa hồ sơ", activeInitial: "Đang dùng", addProfile: "Thêm hồ sơ", addProfileTitle: "Thêm hồ sơ API", templateMenuTitle: "Chọn mẫu mô hình muốn thêm:", templateMinimaxName: "🟣 MiniMax-M3", templateMinimaxSub: "Giao thức Anthropic", templateDeepseekName: "🔵 DeepSeek V4 Flash", templateDeepseekSub: "Giao thức OpenAI", templateOpenaiName: "🟢 GPT-5.6 Luna", templateOpenaiSub: "Giao thức chính thức của OpenAI", templateClaudeName: "🟠 Claude Sonnet 5", templateClaudeSub: "Giao thức Anthropic", templateOllamaName: "⚪ Ollama · Gemma 4 12B", templateOllamaSub: "localhost:11434 (không cần Key)", templateZaiName: "🟡 Z.AI GLM-5.3", templateZaiSub: "Tương thích OpenAI", templateCustomName: "⚙️ Hồ sơ trống tùy chỉnh", templateCustomSub: "Endpoint và mô hình tùy chỉnh", editingProfile: "Chỉnh sửa: {name}", activeDefault: "● Đang dùng mặc định", inactive: "Chưa kích hoạt", setActive: "Đặt làm hồ sơ đang dùng", setActiveTitle: "Dùng hồ sơ này làm mặc định hiện tại", duplicate: "Nhân bản", duplicateTitle: "Nhân bản hồ sơ này", duplicateSuffix: " (bản sao)", delete: "Xóa", deleteTitle: "Xóa hồ sơ này", profileNameLabel: "Tên hồ sơ", profileNamePlaceholder: "ví dụ: 🟣 MiniMax-M3 hoặc DeepSeek văn phòng", protocolFormatLabel: "Định dạng giao thức API", anthropicOption: "Anthropic Messages API (MiniMax, Claude)", openaiOption: "OpenAI Chat Completions API (OpenAI, DeepSeek, Z.AI, Groq, Ollama, OpenRouter)", endpointLabel: "URL endpoint API", endpointPlaceholder: "https://api.minimaxi.com/anthropic/v1/messages", apiKeyLabel: "API Key", apiKeyPlaceholder: "Nhập API Key (ví dụ: eyJhbGciOi... hoặc sk-...)", toggleKeyTitle: "Hiện / ẩn API Key", keyNotSet: "Chưa thiết lập", keyEntered: "Đã nhập Key", localNoKey: "Cục bộ, không cần Key", helpMinimax: "Lấy API Key từ MiniMax Open Platform ↗", helpDeepseek: "Lấy API Key từ DeepSeek Open Platform ↗", helpOpenai: "Lấy API Key từ OpenAI Platform ↗", helpAnthropic: "Lấy API Key từ Anthropic Console ↗", helpOllama: "Ollama đang chạy cục bộ (không cần Key)", helpZai: "Lấy API Key từ Z.AI Open Platform ↗", helpGeneric: "Lấy API Key từ nhà cung cấp API ↗", modelNameLabel: "Tên mô hình", modelPlaceholder: "MiniMax-M3", systemPromptLabel: "System Prompt", resetPrompt: "Khôi phục Prompt mặc định", systemPromptPlaceholder: "Nhập hướng dẫn cách AI tóm tắt và trả lời…", maxTokensLabel: "Token đầu ra tối đa", temperatureLabel: "Nhiệt độ tạo", testConnection: "Kiểm tra kết nối", saveAll: "Lưu tất cả cài đặt", unnamedProfile: "Hồ sơ chưa đặt tên", unsetModel: "Chưa đặt mô hình", protocolAnthropic: "Anthropic", protocolOpenAI: "OpenAI", activePill: "● Đang dùng", confirmKeepOne: "Phải giữ lại ít nhất một hồ sơ API; không thể xóa hồ sơ cuối cùng.", confirmDelete: "Bạn có chắc muốn xóa “{name}” không?", confirmResetPrompt: "Khôi phục System Prompt về mẫu mặc định?", toastActive: "Đã đặt hồ sơ này làm mặc định hiện tại!", toastDuplicated: "Đã nhân bản hồ sơ!", toastDeleted: "Đã xóa hồ sơ", toastResetPrompt: "Đã khôi phục Prompt mặc định", toastAdded: "Đã thêm hồ sơ {name}!", testMissingKey: "⚠️ Hãy nhập API Key của “{name}” trước khi kiểm tra kết nối.", testRunningButton: "Đang kiểm tra kết nối…", testRequesting: "⏳ Đang gửi yêu cầu kiểm tra đến [{name}]…", testSuccessHeading: "✅ Kết nối [{name}] thành công!", testProtocol: "Giao thức", testModel: "Phản hồi mô hình", testLatency: "Độ trễ", testReply: "Phản hồi kiểm tra", testReplyFallback: "OK", testFailedHeading: "❌ Kết nối thất bại:", testUnknownError: "Lỗi không xác định. Hãy kiểm tra endpoint, Key và định dạng.", testRequestError: "❌ Lỗi yêu cầu: {message}", toastSaved: "🎉 Đã lưu thành công tất cả hồ sơ API!", backgroundMissingKey: "Trước tiên hãy nhập API Key", backgroundHttpError: "Kết nối thất bại (HTTP {status}): {detail}", backgroundConnectionError: "Lỗi kết nối: {message}"
      }
    },
    th: {
      label: "ไทย", htmlLang: "th",
      prompt: `คุณเป็นผู้ช่วยมืออาชีพด้านการวิเคราะห์เนื้อหาและการอภิปรายเชิงลึก โปรดวิเคราะห์และตอบเป็นภาษาไทยอย่างแม่นยำ ชัดเจน และเป็นระบบ โดยอ้างอิงจากเนื้อหาเว็บหรือข้อความที่ผู้ใช้เลือก

สำหรับสรุปครั้งแรก ให้ใช้รูปแบบต่อไปนี้:
### 📌 ประเด็นหลัก
สรุปประเด็นสำคัญที่สุดของเนื้อหาใน 1-2 ประโยค

### 💡 ประเด็นสำคัญ
- ระบุประเด็นสำคัญ 3 ถึง 6 ข้อ
- ใช้ **ตัวหนา** กับข้อมูล ข้อสรุป หรือขั้นตอนที่สำคัญ

### 🎯 บทสรุปและข้อค้นพบ
สรุปข้อสรุปของผู้เขียน คำแนะนำที่นำไปใช้ได้จริง หรือคุณค่าหลักอย่างกระชับ

ในการสนทนาต่อเนื่อง ให้ผสานเนื้อหาเว็บต้นฉบับและบทสรุปก่อนหน้า เพื่อตอบคำถามอย่างเป็นมิตร ละเอียด และเป็นมืออาชีพ`,
      strings: {
        pageTitle: "การตั้งค่าส่วนขยาย - AI สรุปเว็บ (หลายโปรไฟล์ API)", logoAlt: "ไอคอนส่วนขยาย", appTitle: "AI สรุปเว็บ", subtitle: "จัดการและสลับโปรไฟล์ LLM API หลายชุดได้อย่างรวดเร็ว (MiniMax / DeepSeek / OpenAI / Claude / Ollama / Z.AI)", languageLabel: "ภาษา", languageOptionZhTw: "ภาษาจีนตัวเต็ม", languageOptionEn: "ภาษาอังกฤษ", languageOptionJa: "ภาษาญี่ปุ่น", languageOptionKo: "ภาษาเกาหลี", languageChanged: "เปลี่ยนภาษาของอินเทอร์เฟซเป็น {language} แล้ว System Prompt เริ่มต้นก็ซิงค์แล้ว ส่วน Prompt ที่กำหนดเองจะยังคงเดิม", multiProfileBadge: "สลับโปรไฟล์ API", profilesHeading: "รายการโปรไฟล์ API", contextSummarizePage: "📝 สรุปหน้าเว็บนี้", contextSummarizeSelection: "📝 ให้ AI ประมวลผลข้อความที่เลือก", editingProfileEmpty: "แก้ไขโปรไฟล์", activeInitial: "ใช้งานอยู่", addProfile: "เพิ่มโปรไฟล์", addProfileTitle: "เพิ่มโปรไฟล์ API", templateMenuTitle: "เลือกเทมเพลตโมเดลที่จะเพิ่ม:", templateMinimaxName: "🟣 MiniMax-M3", templateMinimaxSub: "โปรโตคอล Anthropic", templateDeepseekName: "🔵 DeepSeek V4 Flash", templateDeepseekSub: "โปรโตคอล OpenAI", templateOpenaiName: "🟢 GPT-5.6 Luna", templateOpenaiSub: "โปรโตคอลอย่างเป็นทางการของ OpenAI", templateClaudeName: "🟠 Claude Sonnet 5", templateClaudeSub: "โปรโตคอล Anthropic", templateOllamaName: "⚪ Ollama · Gemma 4 12B", templateOllamaSub: "localhost:11434 (ไม่ต้องใช้ Key)", templateZaiName: "🟡 Z.AI GLM-5.3", templateZaiSub: "โปรโตคอลที่เข้ากันได้กับ OpenAI", templateCustomName: "⚙️ โปรไฟล์ว่างกำหนดเอง", templateCustomSub: "Endpoint และโมเดลกำหนดเอง", editingProfile: "แก้ไข: {name}", activeDefault: "● ใช้งานเป็นค่าเริ่มต้น", inactive: "ไม่ได้เปิดใช้งาน", setActive: "ตั้งเป็นโปรไฟล์ที่ใช้งาน", setActiveTitle: "ใช้โปรไฟล์นี้เป็นค่าเริ่มต้นปัจจุบัน", duplicate: "ทำสำเนา", duplicateTitle: "ทำสำเนาโปรไฟล์นี้", duplicateSuffix: " (สำเนา)", delete: "ลบ", deleteTitle: "ลบโปรไฟล์นี้", profileNameLabel: "ชื่อโปรไฟล์", profileNamePlaceholder: "เช่น 🟣 MiniMax-M3 หรือ DeepSeek สำหรับสำนักงาน", protocolFormatLabel: "รูปแบบโปรโตคอล API", anthropicOption: "Anthropic Messages API (MiniMax, Claude)", openaiOption: "OpenAI Chat Completions API (OpenAI, DeepSeek, Z.AI, Groq, Ollama, OpenRouter)", endpointLabel: "URL Endpoint ของ API", endpointPlaceholder: "https://api.minimaxi.com/anthropic/v1/messages", apiKeyLabel: "API Key", apiKeyPlaceholder: "ป้อน API Key (เช่น eyJhbGciOi... หรือ sk-...)", toggleKeyTitle: "แสดง / ซ่อน API Key", keyNotSet: "ยังไม่ได้ตั้งค่า", keyEntered: "ป้อน Key แล้ว", localNoKey: "ใช้ในเครื่อง ไม่ต้องใช้ Key", helpMinimax: "รับ API Key จาก MiniMax Open Platform ↗", helpDeepseek: "รับ API Key จาก DeepSeek Open Platform ↗", helpOpenai: "รับ API Key จาก OpenAI Platform ↗", helpAnthropic: "รับ API Key จาก Anthropic Console ↗", helpOllama: "Ollama กำลังทำงานในเครื่อง (ไม่ต้องใช้ Key)", helpZai: "รับ API Key จาก Z.AI Open Platform ↗", helpGeneric: "รับ API Key จากผู้ให้บริการ API ↗", modelNameLabel: "ชื่อโมเดล", modelPlaceholder: "MiniMax-M3", systemPromptLabel: "System Prompt", resetPrompt: "คืนค่า Prompt เริ่มต้น", systemPromptPlaceholder: "ป้อนคำแนะนำวิธีให้ AI สรุปและตอบ…", maxTokensLabel: "Token เอาต์พุตสูงสุด", temperatureLabel: "อุณหภูมิการสร้าง", testConnection: "ทดสอบการเชื่อมต่อ", saveAll: "บันทึกการตั้งค่าทั้งหมด", unnamedProfile: "โปรไฟล์ไม่มีชื่อ", unsetModel: "ยังไม่ได้ตั้งโมเดล", protocolAnthropic: "Anthropic", protocolOpenAI: "OpenAI", activePill: "● ใช้งานอยู่", confirmKeepOne: "ต้องมีโปรไฟล์ API อย่างน้อยหนึ่งรายการ ไม่สามารถลบโปรไฟล์สุดท้ายได้", confirmDelete: "ต้องการลบ “{name}” ใช่หรือไม่", confirmResetPrompt: "คืนค่า System Prompt เป็นเทมเพลตเริ่มต้นหรือไม่", toastActive: "ตั้งโปรไฟล์นี้เป็นค่าเริ่มต้นปัจจุบันแล้ว!", toastDuplicated: "ทำสำเนาโปรไฟล์แล้ว!", toastDeleted: "ลบโปรไฟล์แล้ว", toastResetPrompt: "คืนค่า Prompt เริ่มต้นแล้ว", toastAdded: "เพิ่มโปรไฟล์ {name} แล้ว!", testMissingKey: "⚠️ ป้อน API Key ของ “{name}” ก่อนทดสอบการเชื่อมต่อ", testRunningButton: "กำลังทดสอบการเชื่อมต่อ…", testRequesting: "⏳ กำลังส่งคำขอทดสอบไปยัง [{name}]…", testSuccessHeading: "✅ เชื่อมต่อ [{name}] สำเร็จ!", testProtocol: "โปรโตคอล", testModel: "การตอบกลับของโมเดล", testLatency: "เวลาแฝง", testReply: "การตอบกลับทดสอบ", testReplyFallback: "OK", testFailedHeading: "❌ เชื่อมต่อล้มเหลว:", testUnknownError: "ข้อผิดพลาดที่ไม่รู้จัก โปรดตรวจสอบ Endpoint, Key และรูปแบบ", testRequestError: "❌ ข้อผิดพลาดของคำขอ: {message}", toastSaved: "🎉 บันทึกโปรไฟล์ API ทั้งหมดสำเร็จ!", backgroundMissingKey: "โปรดป้อน API Key ก่อน", backgroundHttpError: "เชื่อมต่อล้มเหลว (HTTP {status}): {detail}", backgroundConnectionError: "ข้อผิดพลาดการเชื่อมต่อ: {message}"
      }
    },
    id: {
      label: "Bahasa Indonesia", htmlLang: "id",
      prompt: `Anda adalah asisten profesional untuk analisis konten dan diskusi mendalam. Analisis dan jawab dengan tepat, jelas, dan terstruktur dalam bahasa Indonesia berdasarkan isi halaman web atau teks yang dipilih pengguna.

Untuk ringkasan awal, gunakan format berikut:
### 📌 Topik Utama
Ringkas topik utama yang paling penting dalam 1-2 kalimat.

### 💡 Poin Penting
- Daftar 3 hingga 6 poin penting.
- Tebalkan data, kesimpulan, atau langkah penting dengan **tebal**.

### 🎯 Kesimpulan dan Wawasan
Ringkas kesimpulan penulis, rekomendasi praktis, atau nilai utama secara singkat.

Dalam percakapan berikutnya, gabungkan isi asli halaman web dan ringkasan sebelumnya untuk menjawab pertanyaan lanjutan pengguna secara ramah, menyeluruh, dan profesional.`,
      strings: {
        pageTitle: "Pengaturan Ekstensi - Ringkasan Web AI (Profil API)", logoAlt: "Ikon ekstensi", appTitle: "Ringkasan Web AI", subtitle: "Kelola dan beralih dengan cepat di antara beberapa profil API LLM (MiniMax / DeepSeek / OpenAI / Claude / Ollama / Z.AI)", languageLabel: "Bahasa", languageOptionZhTw: "Bahasa Tionghoa Tradisional", languageOptionEn: "Bahasa Inggris", languageOptionJa: "Bahasa Jepang", languageOptionKo: "Bahasa Korea", languageChanged: "Bahasa antarmuka diubah ke {language}. System Prompt default juga disinkronkan; Prompt khusus tetap dipertahankan.", multiProfileBadge: "Beralih antarprofil API", profilesHeading: "Daftar Profil API", contextSummarizePage: "📝 Ringkas halaman web ini", contextSummarizeSelection: "📝 Proses teks yang dipilih dengan AI", editingProfileEmpty: "Edit profil", activeInitial: "Aktif", addProfile: "Tambah Profil", addProfileTitle: "Tambah profil API", templateMenuTitle: "Pilih template model yang akan ditambahkan:", templateMinimaxName: "🟣 MiniMax-M3", templateMinimaxSub: "Protokol Anthropic", templateDeepseekName: "🔵 DeepSeek V4 Flash", templateDeepseekSub: "Protokol OpenAI", templateOpenaiName: "🟢 GPT-5.6 Luna", templateOpenaiSub: "Protokol resmi OpenAI", templateClaudeName: "🟠 Claude Sonnet 5", templateClaudeSub: "Protokol Anthropic", templateOllamaName: "⚪ Ollama · Gemma 4 12B", templateOllamaSub: "localhost:11434 (tanpa Key)", templateZaiName: "🟡 Z.AI GLM-5.3", templateZaiSub: "Kompatibel dengan OpenAI", templateCustomName: "⚙️ Profil kosong khusus", templateCustomSub: "Endpoint dan model khusus", editingProfile: "Edit: {name}", activeDefault: "● Aktif sebagai default", inactive: "Tidak aktif", setActive: "Jadikan aktif", setActiveTitle: "Gunakan profil ini sebagai default saat ini", duplicate: "Duplikat", duplicateTitle: "Duplikat profil ini", duplicateSuffix: " (salinan)", delete: "Hapus", deleteTitle: "Hapus profil ini", profileNameLabel: "Nama Profil", profileNamePlaceholder: "mis. 🟣 MiniMax-M3 atau DeepSeek kantor", protocolFormatLabel: "Format Protokol API", anthropicOption: "Anthropic Messages API (MiniMax, Claude)", openaiOption: "OpenAI Chat Completions API (OpenAI, DeepSeek, Z.AI, Groq, Ollama, OpenRouter)", endpointLabel: "URL Endpoint API", endpointPlaceholder: "https://api.minimaxi.com/anthropic/v1/messages", apiKeyLabel: "API Key", apiKeyPlaceholder: "Masukkan API Key (mis. eyJhbGciOi... atau sk-...)", toggleKeyTitle: "Tampilkan / sembunyikan API Key", keyNotSet: "Belum diatur", keyEntered: "Key telah dimasukkan", localNoKey: "Lokal, tanpa Key", helpMinimax: "Dapatkan API Key dari MiniMax Open Platform ↗", helpDeepseek: "Dapatkan API Key dari DeepSeek Open Platform ↗", helpOpenai: "Dapatkan API Key dari OpenAI Platform ↗", helpAnthropic: "Dapatkan API Key dari Anthropic Console ↗", helpOllama: "Ollama berjalan secara lokal (tidak perlu Key)", helpZai: "Dapatkan API Key dari Z.AI Open Platform ↗", helpGeneric: "Dapatkan API Key dari penyedia API ↗", modelNameLabel: "Nama Model", modelPlaceholder: "MiniMax-M3", systemPromptLabel: "System Prompt", resetPrompt: "Pulihkan Prompt default", systemPromptPlaceholder: "Masukkan petunjuk cara AI merangkum dan menjawab…", maxTokensLabel: "Token Output Maksimum", temperatureLabel: "Suhu Generasi", testConnection: "Uji Koneksi", saveAll: "Simpan Semua Pengaturan", unnamedProfile: "Profil tanpa nama", unsetModel: "Model belum diatur", protocolAnthropic: "Anthropic", protocolOpenAI: "OpenAI", activePill: "● Aktif", confirmKeepOne: "Setidaknya satu profil API harus dipertahankan; profil terakhir tidak dapat dihapus.", confirmDelete: "Yakin ingin menghapus “{name}”?", confirmResetPrompt: "Pulihkan System Prompt ke template default?", toastActive: "Profil ini sekarang menjadi default!", toastDuplicated: "Profil diduplikasi!", toastDeleted: "Profil dihapus", toastResetPrompt: "Prompt default dipulihkan", toastAdded: "Profil {name} ditambahkan!", testMissingKey: "⚠️ Masukkan API Key untuk “{name}” sebelum menguji koneksi.", testRunningButton: "Menguji koneksi…", testRequesting: "⏳ Mengirim permintaan uji ke [{name}]…", testSuccessHeading: "✅ Koneksi [{name}] berhasil!", testProtocol: "Protokol", testModel: "Respons model", testLatency: "Latensi", testReply: "Balasan uji", testReplyFallback: "OK", testFailedHeading: "❌ Koneksi gagal:", testUnknownError: "Kesalahan tidak dikenal. Periksa endpoint, Key, dan format.", testRequestError: "❌ Kesalahan permintaan: {message}", toastSaved: "🎉 Semua profil API berhasil disimpan!", backgroundMissingKey: "Masukkan API Key terlebih dahulu", backgroundHttpError: "Koneksi gagal (HTTP {status}): {detail}", backgroundConnectionError: "Kesalahan koneksi: {message}"
      }
    }
  });

  const versionLabels = Object.freeze({
    "zh-TW": "版本",
    en: "Version",
    ja: "バージョン",
    ko: "버전",
    "zh-CN": "版本",
    fr: "Version",
    es: "Versión",
    de: "Version",
    vi: "Phiên bản",
    th: "เวอร์ชัน",
    id: "Versi"
  });

  Object.keys(versionLabels).forEach((locale) => {
    locales[locale].strings.versionLabel = versionLabels[locale];
  });

  const BRAND_NAME = "AUROFACT";
  const BRAND_PAGE_TITLES = Object.freeze({
    "zh-TW": "AUROFACT｜AI 網頁摘要與洞見助手 - 外掛設定",
    en: "AUROFACT｜AI Web Summarizer & Insight Assistant - Settings",
    ja: "AUROFACT｜AIウェブ要約・洞察アシスタント - 拡張機能設定",
    ko: "AUROFACT｜AI 웹 요약 및 인사이트 어시스턴트 - 확장 프로그램 설정",
    "zh-CN": "AUROFACT｜AI 网页摘要与洞察助手 - 扩展程序设置",
    fr: "AUROFACT｜Assistant IA de résumé et d’analyse du Web - Paramètres",
    es: "AUROFACT｜Asistente de IA para resúmenes y perspectivas web - Configuración",
    de: "AUROFACT｜KI-Assistent für Webzusammenfassungen und Einblicke - Erweiterungseinstellungen",
    vi: "AUROFACT｜Trợ lý AI tóm tắt và phân tích web - Cài đặt tiện ích",
    th: "AUROFACT｜ผู้ช่วย AI สรุปและวิเคราะห์เว็บ - การตั้งค่าส่วนขยาย",
    id: "AUROFACT｜Asisten AI untuk Ringkasan dan Wawasan Web - Pengaturan Ekstensi"
  });
  const BRAND_SUBTITLES = Object.freeze({
    "zh-TW": "AI 網頁摘要與洞見助手",
    en: "AI Web Summarizer & Insight Assistant",
    ja: "AIウェブ要約・洞察アシスタント",
    ko: "AI 웹 요약 및 인사이트 어시스턴트",
    "zh-CN": "AI 网页摘要与洞察助手",
    fr: "Assistant IA de résumé et d’analyse du Web",
    es: "Asistente de IA para resúmenes y perspectivas web",
    de: "KI-Assistent für Webzusammenfassungen und Einblicke",
    vi: "Trợ lý AI tóm tắt và phân tích web",
    th: "ผู้ช่วย AI สรุปและวิเคราะห์เว็บ",
    id: "Asisten AI untuk Ringkasan dan Wawasan Web"
  });

  // Keep the public brand consistent across every localized options-page copy.
  Object.keys(locales).forEach((locale) => {
    locales[locale].strings.appTitle = BRAND_NAME;
    locales[locale].strings.pageTitle = BRAND_PAGE_TITLES[locale];
    locales[locale].strings.subtitle = BRAND_SUBTITLES[locale];
  });

  const POPUP_STRINGS = Object.freeze({
    "zh-TW": {
      popupPageTitle: "AUROFACT｜AI 網頁摘要與洞見助手",
      popupProfileLabel: "⚡ 當前使用模型 / API：",
      popupStatusLoading: "檢查設定中…",
      popupStatusReading: "讀取 API 配置",
      popupStatusReady: "API 已就緒",
      popupStatusConfigured: "已配置 {name} ({model})",
      popupStatusNoKey: "尚未設定 API Key",
      popupStatusConfigure: "請至設定頁填入「{name}」的密鑰",
      popupSummarizeNow: "立即總結當前網頁",
      popupOpenOptions: "多組 API 設定管理",
      popupTipLabel: "小提示：",
      popupTipText: "在任何網頁點擊右鍵，即可一鍵總結重點或選取段落。"
    },
    en: {
      popupPageTitle: "AUROFACT｜AI Web Summarizer & Insight Assistant",
      popupProfileLabel: "⚡ Active model / API:",
      popupStatusLoading: "Checking settings…",
      popupStatusReading: "Loading API configuration",
      popupStatusReady: "API ready",
      popupStatusConfigured: "Configured {name} ({model})",
      popupStatusNoKey: "API key not set",
      popupStatusConfigure: "Open Settings to enter the key for “{name}”",
      popupSummarizeNow: "Summarize this webpage",
      popupOpenOptions: "Manage API profiles",
      popupTipLabel: "Tip:",
      popupTipText: "Right-click on any webpage to summarize it or process selected text."
    },
    ja: {
      popupPageTitle: "AUROFACT｜AIウェブ要約・洞察アシスタント",
      popupProfileLabel: "⚡ 現在のモデル / API:",
      popupStatusLoading: "設定を確認中…",
      popupStatusReading: "API設定を読み込み中",
      popupStatusReady: "API 準備完了",
      popupStatusConfigured: "設定済み: {name} ({model})",
      popupStatusNoKey: "APIキー未設定",
      popupStatusConfigure: "設定ページで「{name}」のキーを入力してください",
      popupSummarizeNow: "このページを要約",
      popupOpenOptions: "APIプロファイルを管理",
      popupTipLabel: "ヒント:",
      popupTipText: "ウェブページを右クリックすると、要約または選択したテキストの処理ができます。"
    },
    ko: {
      popupPageTitle: "AUROFACT｜AI 웹 요약 및 인사이트 어시스턴트",
      popupProfileLabel: "⚡ 현재 모델 / API:",
      popupStatusLoading: "설정 확인 중…",
      popupStatusReading: "API 구성 로드 중",
      popupStatusReady: "API 준비 완료",
      popupStatusConfigured: "{name} ({model}) 설정됨",
      popupStatusNoKey: "API 키가 설정되지 않음",
      popupStatusConfigure: "설정 페이지에서 ‘{name}’의 키를 입력하세요",
      popupSummarizeNow: "현재 웹페이지 요약",
      popupOpenOptions: "API 프로필 관리",
      popupTipLabel: "팁:",
      popupTipText: "웹페이지에서 마우스 오른쪽 버튼을 클릭하면 요약하거나 선택한 텍스트를 처리할 수 있습니다."
    },
    "zh-CN": {
      popupPageTitle: "AUROFACT｜AI 网页摘要与洞察助手",
      popupProfileLabel: "⚡ 当前使用模型 / API：",
      popupStatusLoading: "正在检查设置…",
      popupStatusReading: "正在读取 API 配置",
      popupStatusReady: "API 已就绪",
      popupStatusConfigured: "已配置 {name} ({model})",
      popupStatusNoKey: "尚未设置 API Key",
      popupStatusConfigure: "请前往设置页填写“{name}”的密钥",
      popupSummarizeNow: "立即总结当前网页",
      popupOpenOptions: "管理 API 配置",
      popupTipLabel: "小提示：",
      popupTipText: "在任何网页点击右键，即可一键总结重点或处理选中的段落。"
    },
    fr: {
      popupPageTitle: "AUROFACT｜Assistant IA de résumé et d’analyse du Web",
      popupProfileLabel: "⚡ Modèle / API actif :",
      popupStatusLoading: "Vérification des paramètres…",
      popupStatusReading: "Chargement de la configuration API",
      popupStatusReady: "API prête",
      popupStatusConfigured: "{name} ({model}) est configuré",
      popupStatusNoKey: "API Key non définie",
      popupStatusConfigure: "Ouvrez les paramètres pour saisir la clé de « {name} »",
      popupSummarizeNow: "Résumer cette page web",
      popupOpenOptions: "Gérer les profils API",
      popupTipLabel: "Astuce :",
      popupTipText: "Sur une page web, faites un clic droit pour résumer le contenu ou traiter le texte sélectionné."
    },
    es: {
      popupPageTitle: "AUROFACT｜Asistente de IA para resúmenes y perspectivas web",
      popupProfileLabel: "⚡ Modelo / API activo:",
      popupStatusLoading: "Comprobando la configuración…",
      popupStatusReading: "Cargando la configuración de API",
      popupStatusReady: "API lista",
      popupStatusConfigured: "{name} ({model}) configurado",
      popupStatusNoKey: "API Key no configurada",
      popupStatusConfigure: "Ve a Configuración para introducir la clave de «{name}»",
      popupSummarizeNow: "Resumir esta página web",
      popupOpenOptions: "Gestionar perfiles API",
      popupTipLabel: "Consejo:",
      popupTipText: "Haz clic derecho en cualquier página web para resumirla o procesar el texto seleccionado."
    },
    de: {
      popupPageTitle: "AUROFACT｜KI-Assistent für Webzusammenfassungen und Einblicke",
      popupProfileLabel: "⚡ Aktives Modell / API:",
      popupStatusLoading: "Einstellungen werden geprüft…",
      popupStatusReading: "API-Konfiguration wird geladen",
      popupStatusReady: "API bereit",
      popupStatusConfigured: "{name} ({model}) konfiguriert",
      popupStatusNoKey: "API-Key nicht eingerichtet",
      popupStatusConfigure: "Öffne die Einstellungen, um den Schlüssel für „{name}“ einzugeben",
      popupSummarizeNow: "Diese Webseite zusammenfassen",
      popupOpenOptions: "API-Profile verwalten",
      popupTipLabel: "Tipp:",
      popupTipText: "Klicke auf einer Webseite mit der rechten Maustaste, um sie zusammenzufassen oder ausgewählten Text zu verarbeiten."
    },
    vi: {
      popupPageTitle: "AUROFACT｜Trợ lý AI tóm tắt và phân tích web",
      popupProfileLabel: "⚡ Mô hình / API đang dùng:",
      popupStatusLoading: "Đang kiểm tra cài đặt…",
      popupStatusReading: "Đang tải cấu hình API",
      popupStatusReady: "API đã sẵn sàng",
      popupStatusConfigured: "Đã cấu hình {name} ({model})",
      popupStatusNoKey: "Chưa thiết lập API Key",
      popupStatusConfigure: "Mở Cài đặt để nhập khóa cho “{name}”",
      popupSummarizeNow: "Tóm tắt trang web này",
      popupOpenOptions: "Quản lý các hồ sơ API",
      popupTipLabel: "Mẹo:",
      popupTipText: "Nhấp chuột phải trên bất kỳ trang web nào để tóm tắt hoặc xử lý văn bản đã chọn."
    },
    th: {
      popupPageTitle: "AUROFACT｜ผู้ช่วย AI สรุปและวิเคราะห์เว็บ",
      popupProfileLabel: "⚡ โมเดล / API ที่ใช้งานอยู่:",
      popupStatusLoading: "กำลังตรวจสอบการตั้งค่า…",
      popupStatusReading: "กำลังโหลดการตั้งค่า API",
      popupStatusReady: "API พร้อมใช้งาน",
      popupStatusConfigured: "ตั้งค่า {name} ({model}) แล้ว",
      popupStatusNoKey: "ยังไม่ได้ตั้งค่า API Key",
      popupStatusConfigure: "ไปที่การตั้งค่าเพื่อกรอกคีย์ของ “{name}”",
      popupSummarizeNow: "สรุปหน้าเว็บนี้",
      popupOpenOptions: "จัดการโปรไฟล์ API",
      popupTipLabel: "เคล็ดลับ:",
      popupTipText: "คลิกขวาบนหน้าเว็บใดก็ได้เพื่อสรุปเนื้อหาหรือประมวลผลข้อความที่เลือก"
    },
    id: {
      popupPageTitle: "AUROFACT｜Asisten AI untuk Ringkasan dan Wawasan Web",
      popupProfileLabel: "⚡ Model / API aktif:",
      popupStatusLoading: "Memeriksa pengaturan…",
      popupStatusReading: "Memuat konfigurasi API",
      popupStatusReady: "API siap",
      popupStatusConfigured: "{name} ({model}) telah dikonfigurasi",
      popupStatusNoKey: "API Key belum diatur",
      popupStatusConfigure: "Buka Pengaturan untuk memasukkan kunci “{name}”",
      popupSummarizeNow: "Ringkas halaman web ini",
      popupOpenOptions: "Kelola profil API",
      popupTipLabel: "Tips:",
      popupTipText: "Klik kanan di halaman web mana pun untuk merangkum atau memproses teks yang dipilih."
    }
  });

  Object.keys(POPUP_STRINGS).forEach((locale) => {
    Object.assign(locales[locale].strings, POPUP_STRINGS[locale]);
  });

  const HTTP_ENDPOINT_STRINGS = Object.freeze({
    "zh-TW": "⚠️ 安全性提醒：HTTP 不會加密傳輸，API Key 與摘要內容可能被攔截。若是本機或可信任的區域網路 LLM Server，可以維持 HTTP；遠端服務則建議使用 HTTPS。",
    en: "⚠️ Security notice: HTTP does not encrypt traffic, so your API key and summary content could be intercepted. HTTP is acceptable for a local or trusted LAN LLM server; HTTPS is recommended for remote services.",
    ja: "⚠️ セキュリティのお知らせ：HTTP は通信を暗号化しないため、API Key や要約内容が傍受される可能性があります。ローカルまたは信頼できる LAN の LLM Server では HTTP を使用できますが、リモートサービスには HTTPS を推奨します。",
    ko: "⚠️ 보안 안내: HTTP는 통신을 암호화하지 않으므로 API Key와 요약 내용이 가로채질 수 있습니다. 로컬 또는 신뢰할 수 있는 LAN LLM Server에서는 HTTP를 사용할 수 있지만, 원격 서비스에는 HTTPS를 권장합니다.",
    "zh-CN": "⚠️ 安全提示：HTTP 不会加密传输，API Key 和摘要内容可能被拦截。如果是本机或可信任的局域网 LLM Server，可以继续使用 HTTP；远程服务建议使用 HTTPS。",
    fr: "⚠️ Avis de sécurité : HTTP ne chiffre pas les communications ; votre clé API et le contenu des résumés peuvent être interceptés. HTTP peut être conservé pour un serveur LLM local ou de confiance sur le réseau ; HTTPS est recommandé pour les services distants.",
    es: "⚠️ Aviso de seguridad: HTTP no cifra la comunicación, por lo que la API Key y el contenido de los resúmenes podrían ser interceptados. Puede mantener HTTP para un servidor LLM local o de confianza en la red; se recomienda HTTPS para los servicios remotos.",
    de: "⚠️ Sicherheitshinweis: HTTP verschlüsselt die Übertragung nicht; API-Key und Zusammenfassungsinhalte könnten abgefangen werden. Für einen lokalen oder vertrauenswürdigen LLM-Server im LAN kann HTTP beibehalten werden; für entfernte Dienste wird HTTPS empfohlen.",
    vi: "⚠️ Lưu ý bảo mật: HTTP không mã hóa dữ liệu truyền đi, nên API Key và nội dung tóm tắt có thể bị chặn. Có thể tiếp tục dùng HTTP với LLM Server cục bộ hoặc đáng tin cậy trong mạng LAN; nên dùng HTTPS cho dịch vụ từ xa.",
    th: "⚠️ แจ้งเตือนความปลอดภัย: HTTP ไม่เข้ารหัสการรับส่งข้อมูล จึงอาจถูกดักจับ API Key และเนื้อหาสรุปได้ สามารถใช้ HTTP ต่อได้กับ LLM Server ในเครื่องหรือใน LAN ที่เชื่อถือได้ แต่แนะนำให้ใช้ HTTPS สำหรับบริการระยะไกล",
    id: "⚠️ Pemberitahuan keamanan: HTTP tidak mengenkripsi lalu lintas, sehingga API Key dan isi ringkasan dapat disadap. HTTP dapat tetap digunakan untuk LLM Server lokal atau LAN tepercaya; HTTPS disarankan untuk layanan jarak jauh."
  });

  Object.keys(HTTP_ENDPOINT_STRINGS).forEach((locale) => {
    locales[locale].strings.httpEndpointWarning = HTTP_ENDPOINT_STRINGS[locale];
  });

  const SECURITY_STRINGS = Object.freeze({
    "zh-TW": {
      profileLoadFailed: "⚠️ 無法讀取 API 配置，請重新載入設定頁。",
      invalidProfileData: "⚠️ API 配置資料格式無效，請檢查後再儲存。",
      storageSaveFailed: "⚠️ 設定儲存失敗，請稍後再試。",
      storageQuotaExceeded: "⚠️ 設定太大，已超過瀏覽器同步儲存容量。",
      endpointPermissionDenied: "⚠️ 尚未授予此 API endpoint 的存取權；已保留設定，但測試／摘要前需允許存取。",
      endpointPermissionRequired: "請在設定頁允許此外掛存取指定 API endpoint。",
      toastSavedWithoutEndpointPermission: "⚠️ 設定已儲存，但尚未授予部分 endpoint 的存取權。",
      invalidEndpoint: "API endpoint 必須是有效的 HTTP 或 HTTPS URL。",
      promptInjectionNotice: "⚠️ 隱私與安全提醒：網頁／選取文字會傳送至目前的 LLM Provider；其中的指令會被視為不受信任資料並要求模型忽略。請勿把機密貼入網頁或選取文字。"
    },
    en: {
      profileLoadFailed: "⚠️ Unable to load API profiles. Reload the settings page.",
      invalidProfileData: "⚠️ The API profile data is invalid. Check it before saving.",
      storageSaveFailed: "⚠️ Settings could not be saved. Please try again.",
      storageQuotaExceeded: "⚠️ The settings exceed the browser sync-storage limit.",
      endpointPermissionDenied: "⚠️ Access to this API endpoint was not granted. The setting was kept, but access is required before testing or summarizing.",
      endpointPermissionRequired: "Allow the extension to access this API endpoint in the settings page.",
      toastSavedWithoutEndpointPermission: "⚠️ Settings saved, but access to some endpoints was not granted.",
      invalidEndpoint: "The API endpoint must be a valid HTTP or HTTPS URL.",
      promptInjectionNotice: "⚠️ Privacy and security: Webpage or selected text is sent to the current LLM provider. Instructions inside it are treated as untrusted data and the model is asked to ignore them. Do not place secrets in webpage text."
    },
    ja: {
      profileLoadFailed: "⚠️ API プロファイルを読み込めません。設定ページを再読み込みしてください。",
      invalidProfileData: "⚠️ API プロファイルの形式が無効です。保存前に確認してください。",
      storageSaveFailed: "⚠️ 設定を保存できませんでした。もう一度お試しください。",
      storageQuotaExceeded: "⚠️ 設定がブラウザの同期ストレージ容量を超えています。",
      endpointPermissionDenied: "⚠️ API endpoint へのアクセスが許可されませんでした。設定は保持しましたが、テストや要約には許可が必要です。",
      endpointPermissionRequired: "設定ページで、この拡張機能による API endpoint へのアクセスを許可してください。",
      toastSavedWithoutEndpointPermission: "⚠️ 設定を保存しましたが、一部 endpoint のアクセスは許可されていません。",
      invalidEndpoint: "API endpoint は有効な HTTP または HTTPS URL である必要があります。",
      promptInjectionNotice: "⚠️ プライバシーとセキュリティ：ウェブページや選択テキストは現在の LLM Provider に送信されます。内部の指示は信頼できないデータとして扱い、モデルに無視させます。ページに秘密情報を貼り付けないでください。"
    },
    ko: {
      profileLoadFailed: "⚠️ API 프로필을 불러올 수 없습니다. 설정 페이지를 새로 고치세요.",
      invalidProfileData: "⚠️ API 프로필 형식이 올바르지 않습니다. 저장하기 전에 확인하세요.",
      storageSaveFailed: "⚠️ 설정을 저장하지 못했습니다. 다시 시도하세요.",
      storageQuotaExceeded: "⚠️ 설정이 브라우저 동기화 저장 용량을 초과했습니다.",
      endpointPermissionDenied: "⚠️ API endpoint 액세스가 허용되지 않았습니다. 설정은 보존했지만 테스트나 요약 전에 허용이 필요합니다.",
      endpointPermissionRequired: "설정 페이지에서 이 확장 프로그램의 API endpoint 액세스를 허용하세요.",
      toastSavedWithoutEndpointPermission: "⚠️ 설정은 저장했지만 일부 endpoint 액세스가 허용되지 않았습니다.",
      invalidEndpoint: "API endpoint는 유효한 HTTP 또는 HTTPS URL이어야 합니다.",
      promptInjectionNotice: "⚠️ 개인정보 및 보안: 웹페이지나 선택한 텍스트가 현재 LLM Provider로 전송됩니다. 내부 지시는 신뢰할 수 없는 데이터로 처리하여 모델에 무시하도록 요청합니다. 웹페이지에 비밀 정보를 입력하지 마세요."
    },
    "zh-CN": {
      profileLoadFailed: "⚠️ 无法读取 API 配置，请重新加载设置页。",
      invalidProfileData: "⚠️ API 配置数据格式无效，请检查后再保存。",
      storageSaveFailed: "⚠️ 设置保存失败，请稍后重试。",
      storageQuotaExceeded: "⚠️ 设置过大，已超过浏览器同步存储容量。",
      endpointPermissionDenied: "⚠️ 尚未授予此 API endpoint 的访问权限；设置已保留，但测试或总结前需要允许访问。",
      endpointPermissionRequired: "请在设置页允许此扩展访问指定 API endpoint。",
      toastSavedWithoutEndpointPermission: "⚠️ 设置已保存，但尚未授予部分 endpoint 的访问权限。",
      invalidEndpoint: "API endpoint 必须是有效的 HTTP 或 HTTPS URL。",
      promptInjectionNotice: "⚠️ 隐私与安全提示：网页或选中文字会发送至当前 LLM Provider；其中的指令会被视为不受信任数据并要求模型忽略。请勿把机密贴入网页或选中文字。"
    },
    fr: {
      profileLoadFailed: "⚠️ Impossible de charger les profils API. Rechargez la page des paramètres.",
      invalidProfileData: "⚠️ Le profil API est invalide. Vérifiez-le avant de l’enregistrer.",
      storageSaveFailed: "⚠️ Les paramètres n’ont pas pu être enregistrés. Réessayez.",
      storageQuotaExceeded: "⚠️ Les paramètres dépassent la capacité du stockage synchronisé du navigateur.",
      endpointPermissionDenied: "⚠️ L’accès à cet endpoint API n’a pas été autorisé. Le réglage est conservé, mais l’accès est requis avant le test ou le résumé.",
      endpointPermissionRequired: "Autorisez l’extension à accéder à cet endpoint API dans la page des paramètres.",
      toastSavedWithoutEndpointPermission: "⚠️ Paramètres enregistrés, mais l’accès à certains endpoints n’a pas été autorisé.",
      invalidEndpoint: "L’endpoint API doit être une URL HTTP ou HTTPS valide.",
      promptInjectionNotice: "⚠️ Confidentialité et sécurité : le contenu de la page ou la sélection est envoyé au fournisseur LLM actuel. Les instructions qu’il contient sont traitées comme des données non fiables et le modèle est invité à les ignorer. Ne collez pas de secrets dans la page."
    },
    es: {
      profileLoadFailed: "⚠️ No se pueden cargar los perfiles API. Recarga la página de configuración.",
      invalidProfileData: "⚠️ Los datos del perfil API no son válidos. Revísalos antes de guardar.",
      storageSaveFailed: "⚠️ No se pudieron guardar los ajustes. Inténtalo de nuevo.",
      storageQuotaExceeded: "⚠️ Los ajustes superan el límite del almacenamiento sincronizado del navegador.",
      endpointPermissionDenied: "⚠️ No se concedió acceso a este endpoint API. Se conservó el ajuste, pero se necesita permiso antes de probar o resumir.",
      endpointPermissionRequired: "Permite que la extensión acceda a este endpoint API en la página de configuración.",
      toastSavedWithoutEndpointPermission: "⚠️ Ajustes guardados, pero no se concedió acceso a algunos endpoints.",
      invalidEndpoint: "El endpoint API debe ser una URL HTTP o HTTPS válida.",
      promptInjectionNotice: "⚠️ Privacidad y seguridad: el contenido de la página o la selección se envía al proveedor LLM actual. Sus instrucciones se tratan como datos no confiables y se pide al modelo que las ignore. No introduzcas secretos en la página."
    },
    de: {
      profileLoadFailed: "⚠️ API-Profile konnten nicht geladen werden. Laden Sie die Einstellungsseite neu.",
      invalidProfileData: "⚠️ Die API-Profildaten sind ungültig. Prüfen Sie sie vor dem Speichern.",
      storageSaveFailed: "⚠️ Die Einstellungen konnten nicht gespeichert werden. Versuchen Sie es erneut.",
      storageQuotaExceeded: "⚠️ Die Einstellungen überschreiten das synchronisierte Speicherlimit des Browsers.",
      endpointPermissionDenied: "⚠️ Der Zugriff auf diesen API-Endpunkt wurde nicht erlaubt. Die Einstellung bleibt erhalten, aber vor Test oder Zusammenfassung ist eine Freigabe erforderlich.",
      endpointPermissionRequired: "Erlauben Sie der Erweiterung auf der Einstellungsseite den Zugriff auf diesen API-Endpunkt.",
      toastSavedWithoutEndpointPermission: "⚠️ Einstellungen gespeichert, aber der Zugriff auf einige Endpunkte wurde nicht erlaubt.",
      invalidEndpoint: "Der API-Endpunkt muss eine gültige HTTP- oder HTTPS-URL sein.",
      promptInjectionNotice: "⚠️ Datenschutz und Sicherheit: Webseiten- oder Auswahltext wird an den aktuellen LLM-Anbieter gesendet. Enthaltene Anweisungen werden als nicht vertrauenswürdige Daten behandelt und sollen vom Modell ignoriert werden. Füge keine Geheimnisse in Webseiten ein."
    },
    vi: {
      profileLoadFailed: "⚠️ Không thể tải hồ sơ API. Hãy tải lại trang cài đặt.",
      invalidProfileData: "⚠️ Dữ liệu hồ sơ API không hợp lệ. Hãy kiểm tra trước khi lưu.",
      storageSaveFailed: "⚠️ Không thể lưu cài đặt. Vui lòng thử lại.",
      storageQuotaExceeded: "⚠️ Cài đặt vượt quá dung lượng lưu trữ đồng bộ của trình duyệt.",
      endpointPermissionDenied: "⚠️ Chưa cấp quyền truy cập endpoint API này. Cài đặt đã được giữ lại, nhưng cần cấp quyền trước khi kiểm tra hoặc tóm tắt.",
      endpointPermissionRequired: "Hãy cho phép tiện ích truy cập endpoint API này trong trang cài đặt.",
      toastSavedWithoutEndpointPermission: "⚠️ Đã lưu cài đặt, nhưng chưa cấp quyền truy cập một số endpoint.",
      invalidEndpoint: "Endpoint API phải là URL HTTP hoặc HTTPS hợp lệ.",
      promptInjectionNotice: "⚠️ Quyền riêng tư và bảo mật: Nội dung trang web hoặc văn bản đã chọn sẽ được gửi đến LLM Provider hiện tại. Các chỉ dẫn bên trong được xem là dữ liệu không đáng tin và yêu cầu mô hình bỏ qua. Không dán thông tin bí mật vào trang web."
    },
    th: {
      profileLoadFailed: "⚠️ ไม่สามารถโหลดโปรไฟล์ API ได้ โปรดโหลดหน้าการตั้งค่าใหม่",
      invalidProfileData: "⚠️ ข้อมูลโปรไฟล์ API ไม่ถูกต้อง โปรดตรวจสอบก่อนบันทึก",
      storageSaveFailed: "⚠️ ไม่สามารถบันทึกการตั้งค่าได้ โปรดลองอีกครั้ง",
      storageQuotaExceeded: "⚠️ การตั้งค่าเกินขีดจำกัดพื้นที่จัดเก็บแบบซิงค์ของเบราว์เซอร์",
      endpointPermissionDenied: "⚠️ ยังไม่ได้อนุญาตให้เข้าถึง API endpoint นี้ บันทึกการตั้งค่าไว้แล้ว แต่ต้องอนุญาตก่อนทดสอบหรือสรุป",
      endpointPermissionRequired: "โปรดอนุญาตให้ส่วนขยายเข้าถึง API endpoint นี้ในหน้าการตั้งค่า",
      toastSavedWithoutEndpointPermission: "⚠️ บันทึกการตั้งค่าแล้ว แต่ยังไม่ได้อนุญาตบาง endpoint",
      invalidEndpoint: "API endpoint ต้องเป็น URL HTTP หรือ HTTPS ที่ถูกต้อง",
      promptInjectionNotice: "⚠️ ความเป็นส่วนตัวและความปลอดภัย: เนื้อหาหน้าเว็บหรือข้อความที่เลือกจะถูกส่งไปยัง LLM Provider ปัจจุบัน คำสั่งภายในจะถือเป็นข้อมูลที่ไม่น่าเชื่อถือและขอให้โมเดลละเว้น โปรดอย่าวางข้อมูลลับไว้ในหน้าเว็บ"
    },
    id: {
      profileLoadFailed: "⚠️ Profil API tidak dapat dimuat. Muat ulang halaman pengaturan.",
      invalidProfileData: "⚠️ Data profil API tidak valid. Periksa sebelum menyimpan.",
      storageSaveFailed: "⚠️ Pengaturan tidak dapat disimpan. Silakan coba lagi.",
      storageQuotaExceeded: "⚠️ Pengaturan melebihi batas penyimpanan sinkronisasi browser.",
      endpointPermissionDenied: "⚠️ Akses ke endpoint API ini tidak diberikan. Pengaturan tetap disimpan, tetapi izin diperlukan sebelum menguji atau merangkum.",
      endpointPermissionRequired: "Izinkan ekstensi mengakses endpoint API ini di halaman pengaturan.",
      toastSavedWithoutEndpointPermission: "⚠️ Pengaturan tersimpan, tetapi akses ke beberapa endpoint belum diberikan.",
      invalidEndpoint: "Endpoint API harus berupa URL HTTP atau HTTPS yang valid.",
      promptInjectionNotice: "⚠️ Privasi dan keamanan: Konten halaman atau teks yang dipilih dikirim ke LLM Provider saat ini. Instruksi di dalamnya diperlakukan sebagai data tidak tepercaya dan model diminta untuk mengabaikannya. Jangan menaruh rahasia di teks halaman."
    }
  });

  Object.keys(SECURITY_STRINGS).forEach((locale) => {
    Object.assign(locales[locale].strings, SECURITY_STRINGS[locale]);
  });

  const defaultLocale = "zh-TW";
  const supportedLocales = Object.freeze(Object.keys(locales));
  const promptValues = Object.freeze(Object.values(locales).map((locale) => locale.prompt));

  function normalizeLocale(locale) {
    if (!locale) return defaultLocale;
    if (locales[locale]) return locale;

    const normalized = String(locale).toLowerCase();
    if (normalized === "zh-tw" || normalized === "zh-hant" || normalized === "zh-hk" || normalized === "zh-mo") return "zh-TW";
    if (normalized === "zh-cn" || normalized === "zh-hans" || normalized === "zh-sg" || normalized === "zh-my") return "zh-CN";
    if (normalized.startsWith("en")) return "en";
    if (normalized.startsWith("ja")) return "ja";
    if (normalized.startsWith("ko")) return "ko";
    if (normalized.startsWith("fr")) return "fr";
    if (normalized.startsWith("es")) return "es";
    if (normalized.startsWith("de")) return "de";
    if (normalized.startsWith("vi")) return "vi";
    if (normalized.startsWith("th")) return "th";
    if (normalized.startsWith("id") || normalized.startsWith("in")) return "id";
    return defaultLocale;
  }

  function interpolate(template, values) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match;
    });
  }

  function getLocale(locale) {
    return locales[normalizeLocale(locale)];
  }

  function translate(locale, key, values = {}) {
    const selected = getLocale(locale);
    const fallback = locales[defaultLocale];
    const template = selected.strings[key] || fallback.strings[key] || key;
    return interpolate(template, values);
  }

  function getPrompt(locale) {
    return getLocale(locale).prompt;
  }

  function isDefaultPrompt(prompt) {
    const normalized = String(prompt || "").trim();
    return !normalized || promptValues.includes(normalized);
  }

  root.WebSummarizerI18n = Object.freeze({
    defaultLocale,
    supportedLocales,
    locales,
    normalizeLocale,
    getLocale,
    translate,
    getPrompt,
    isDefaultPrompt
  });
})(typeof self !== "undefined" ? self : globalThis);
