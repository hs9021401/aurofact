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
        pageTitle: "外掛設定 - AI 網頁重點總結（多組 API 管理）",
        logoAlt: "外掛圖示",
        appTitle: "AI 網頁重點總結",
        subtitle: "管理與快速切換多組 LLM API 配置（MiniMax / DeepSeek / OpenAI / Claude / Ollama / Z.AI）",
        languageLabel: "語言",
        languageOptionZhTw: "繁體中文",
        languageOptionEn: "英文",
        languageOptionJa: "日文",
        languageOptionKo: "韓文",
        languageChanged: "介面語言已切換為 {language}。預設 System Prompt 也已同步；自訂 Prompt 不會被覆蓋。",
        multiProfileBadge: "多組 API 自由切換",
        profilesHeading: "API 配置清單",
        contextSummarizePage: "📝 總結此網頁重點",
        contextSummarizeSelection: "📝 總結所選文字",
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
        pageTitle: "Extension Settings - AI Web Summarizer (Multi-Profile API)",
        logoAlt: "Extension icon",
        appTitle: "AI Web Summarizer",
        subtitle: "Manage and quickly switch between multiple LLM API profiles (MiniMax / DeepSeek / OpenAI / Claude / Ollama / Z.AI)",
        languageLabel: "Language",
        languageOptionZhTw: "Traditional Chinese",
        languageOptionEn: "English",
        languageOptionJa: "Japanese",
        languageOptionKo: "Korean",
        languageChanged: "Interface language changed to {language}. The default System Prompt was synchronized; custom prompts were preserved.",
        multiProfileBadge: "Switch between API profiles",
        profilesHeading: "API Profiles",
        contextSummarizePage: "📝 Summarize this webpage",
        contextSummarizeSelection: "📝 Summarize selected text",
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
        contextSummarizeSelection: "📝 選択したテキストを要約",
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
        contextSummarizeSelection: "📝 선택한 텍스트 요약",
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

  const defaultLocale = "zh-TW";
  const supportedLocales = Object.freeze(Object.keys(locales));
  const promptValues = Object.freeze(Object.values(locales).map((locale) => locale.prompt));

  function normalizeLocale(locale) {
    if (!locale) return defaultLocale;
    if (locales[locale]) return locale;

    const normalized = String(locale).toLowerCase();
    if (normalized === "zh-tw" || normalized === "zh-hant" || normalized === "zh-hk" || normalized === "zh-mo") return "zh-TW";
    if (normalized.startsWith("en")) return "en";
    if (normalized.startsWith("ja")) return "ja";
    if (normalized.startsWith("ko")) return "ko";
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
