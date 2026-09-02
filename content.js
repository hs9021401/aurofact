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
  let currentLocale = "zh-TW";
  let selectionActionContext = null;
  let pendingCustomSelection = false;

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
  const AUTO_SCROLL_THRESHOLD = 32;

  const FLOATING_TEXT = {
    "zh-TW": { title: "AI 總結", selected: "選取文字", selectedSummary: "選取摘要", loading: "正在分析網頁內容並調用 AI 進行總結...", connecting: "連接 AI 模型中...", input: "針對此文章進一步提問... (Enter 發送, Shift+Enter 換行)", selection: "先選擇上方操作，或點選「自訂」輸入指令...", custom: "輸入要對選取文字執行的操作... (Enter 發送)", selectedPrefix: "已選取：", send: "發送提問", stop: "停止生成", actions: ["總結", "翻譯", "解釋", "改寫", "修正文法", "自訂"] },
    en: { title: "AI Summary", selected: "Selected Text", selectedSummary: "Selection Summary", loading: "Analyzing the webpage and asking the AI for a summary...", connecting: "Connecting to AI model...", input: "Ask a follow-up question... (Enter to send, Shift+Enter for a new line)", selection: "Choose an action above, or click Custom to enter an instruction...", custom: "Enter an operation for the selected text... (Enter to send)", selectedPrefix: "Selected: ", send: "Send question", stop: "Stop generation", actions: ["Summarize", "Translate", "Explain", "Rewrite", "Fix grammar", "Custom"] },
    "zh-CN": { title: "AI 总结", selected: "选中文字", selectedSummary: "选中文字总结", loading: "正在分析网页内容并调用 AI 进行总结...", connecting: "正在连接 AI 模型...", input: "针对本文继续提问...（Enter 发送，Shift+Enter 换行）", selection: "请先选择上方操作，或点击“自定义”输入指令...", custom: "输入要对选中文字执行的操作...（Enter 发送）", selectedPrefix: "已选择：", send: "发送提问", stop: "停止生成", actions: ["总结", "翻译", "解释", "改写", "修正语法", "自定义"] },
    fr: { title: "Résumé IA", selected: "Texte sélectionné", selectedSummary: "Résumé de la sélection", loading: "Analyse de la page et préparation du résumé par l’IA...", connecting: "Connexion au modèle IA...", input: "Posez une question complémentaire... (Entrée pour envoyer, Maj+Entrée pour un saut de ligne)", selection: "Choisissez une action ci-dessus ou cliquez sur Personnalisé pour saisir une instruction...", custom: "Saisissez une opération pour le texte sélectionné... (Entrée pour envoyer)", selectedPrefix: "Sélection : ", send: "Envoyer la question", stop: "Arrêter la génération", actions: ["Résumer", "Traduire", "Expliquer", "Réécrire", "Corriger la grammaire", "Personnalisé"] },
    es: { title: "Resumen de IA", selected: "Texto seleccionado", selectedSummary: "Resumen de la selección", loading: "Analizando la página y solicitando el resumen a la IA...", connecting: "Conectando con el modelo de IA...", input: "Haz una pregunta de seguimiento... (Enter para enviar, Shift+Enter para nueva línea)", selection: "Elige una acción arriba o pulsa Personalizado para introducir una instrucción...", custom: "Introduce una operación para el texto seleccionado... (Enter para enviar)", selectedPrefix: "Seleccionado: ", send: "Enviar pregunta", stop: "Detener generación", actions: ["Resumir", "Traducir", "Explicar", "Reescribir", "Corregir gramática", "Personalizado"] },
    de: { title: "KI-Zusammenfassung", selected: "Ausgewählter Text", selectedSummary: "Zusammenfassung der Auswahl", loading: "Webseite wird analysiert und von der KI zusammengefasst...", connecting: "Verbindung zum KI-Modell wird hergestellt...", input: "Stelle eine Folgefrage... (Enter zum Senden, Umschalt+Enter für neue Zeile)", selection: "Wähle oben eine Aktion oder klicke auf Benutzerdefiniert, um eine Anweisung einzugeben...", custom: "Gib eine Aktion für den ausgewählten Text ein... (Enter zum Senden)", selectedPrefix: "Ausgewählt: ", send: "Frage senden", stop: "Generierung stoppen", actions: ["Zusammenfassen", "Übersetzen", "Erklären", "Umschreiben", "Grammatik korrigieren", "Benutzerdefiniert"] },
    vi: { title: "Tóm tắt AI", selected: "Văn bản đã chọn", selectedSummary: "Tóm tắt văn bản đã chọn", loading: "Đang phân tích trang web và yêu cầu AI tóm tắt...", connecting: "Đang kết nối mô hình AI...", input: "Đặt câu hỏi tiếp theo... (Enter để gửi, Shift+Enter để xuống dòng)", selection: "Chọn một thao tác ở trên hoặc nhấn Tùy chỉnh để nhập chỉ dẫn...", custom: "Nhập thao tác cho văn bản đã chọn... (Enter để gửi)", selectedPrefix: "Đã chọn: ", send: "Gửi câu hỏi", stop: "Dừng tạo", actions: ["Tóm tắt", "Dịch", "Giải thích", "Viết lại", "Sửa ngữ pháp", "Tùy chỉnh"] },
    th: { title: "สรุปโดย AI", selected: "ข้อความที่เลือก", selectedSummary: "สรุปข้อความที่เลือก", loading: "กำลังวิเคราะห์หน้าเว็บและขอให้ AI สรุป...", connecting: "กำลังเชื่อมต่อโมเดล AI...", input: "ถามคำถามต่อเนื่อง... (กด Enter เพื่อส่ง, Shift+Enter เพื่อขึ้นบรรทัดใหม่)", selection: "เลือกการดำเนินการด้านบน หรือคลิกกำหนดเองเพื่อป้อนคำสั่ง...", custom: "ป้อนการดำเนินการสำหรับข้อความที่เลือก... (กด Enter เพื่อส่ง)", selectedPrefix: "เลือกแล้ว: ", send: "ส่งคำถาม", stop: "หยุดการสร้าง", actions: ["สรุป", "แปล", "อธิบาย", "เขียนใหม่", "แก้ไวยากรณ์", "กำหนดเอง"] },
    id: { title: "Ringkasan AI", selected: "Teks yang Dipilih", selectedSummary: "Ringkasan Teks yang Dipilih", loading: "Menganalisis halaman web dan meminta AI membuat ringkasan...", connecting: "Menghubungkan ke model AI...", input: "Ajukan pertanyaan lanjutan... (Enter untuk mengirim, Shift+Enter untuk baris baru)", selection: "Pilih tindakan di atas atau klik Kustom untuk memasukkan instruksi...", custom: "Masukkan operasi untuk teks yang dipilih... (Enter untuk mengirim)", selectedPrefix: "Dipilih: ", send: "Kirim pertanyaan", stop: "Hentikan pembuatan", actions: ["Ringkas", "Terjemahkan", "Jelaskan", "Tulis ulang", "Perbaiki tata bahasa", "Kustom"] },
    ja: { title: "AI要約", selected: "選択テキスト", selectedSummary: "選択テキストの要約", loading: "ウェブページを分析し、AIに要約を依頼しています...", connecting: "AIモデルに接続中...", input: "追加の質問を入力...（Enterで送信、Shift+Enterで改行）", selection: "上の操作を選択するか、「カスタム」で指示を入力してください...", custom: "選択テキストへの操作を入力...（Enterで送信）", selectedPrefix: "選択済み：", send: "質問を送信", stop: "生成を停止", actions: ["要約", "翻訳", "説明", "書き換え", "文法修正", "カスタム"] },
    ko: { title: "AI 요약", selected: "선택한 텍스트", selectedSummary: "선택 텍스트 요약", loading: "웹페이지를 분석하고 AI에 요약을 요청하는 중...", connecting: "AI 모델에 연결하는 중...", input: "추가 질문 입력... (Enter 전송, Shift+Enter 줄바꿈)", selection: "위 작업을 선택하거나 ‘사용자 지정’을 눌러 지시를 입력하세요...", custom: "선택한 텍스트에 수행할 작업 입력... (Enter 전송)", selectedPrefix: "선택됨: ", send: "질문 보내기", stop: "생성 중지", actions: ["요약", "번역", "설명", "다시 쓰기", "문법 수정", "사용자 지정"] }
  };
  const ft = () => FLOATING_TEXT[currentLocale] || FLOATING_TEXT["zh-TW"];
  const FLOATING_LABELS = {
    "zh-TW": {
      drag: "按住拖曳視窗（按兩下重設位置）", settings: "外掛設定", minimize: "最小化/還原", maximize: "最大化視窗", restore: "還原視窗大小", close: "關閉 (Esc)", profile: "快速切換 AI 模型/配置", ready: "準備中...", explore: "💡 延伸：", suggestions: ["🔍 深入解析", "👶 通俗解釋", "📋 行動建議", "⚖️ 批判評估"], suggestionQueries: ["請針對本文的核心論點做更進一步的延伸分析與背景說明。", "請用最簡單白話、通俗易懂的例子向我解釋本文重點。", "根據這篇文章的內容，可以提煉出哪些具體可執行的行動建議或步驟？", "這篇文章提出的觀點有哪些潛在的優缺點、限制或正反面爭議？"], reset: "重設位置", resetTitle: "將視窗重設回右下角", retry: "重新總結", retryTitle: "重新總結文章", copy: "複製重點", copyTitle: "複製完整對話記錄", export: "匯出", exportTitle: "匯出完整對話記錄", exportFormat: "選擇匯出格式", copied: "已複製！", copyShort: "複製", exported: "已匯出", answer: "正在回答...", generating: "生成中", completed: "已完成", chars: "字", error: "生成失敗", noKey: "尚未配置 API Key", noKeyMessage: "請先設定此模型的 API Key，即可開始使用。", requestFailed: "請求失敗", unexpected: "發生未預期的錯誤，請稍後重試。", settingsAction: "前往多組 API 設定", retryAction: "重試", resize: "拖曳以調整視窗大小", pageSummary: "📄 網頁重點摘要", aiAnswer: "🤖 AI 解答" },
    en: {
      drag: "Drag to move (double-click to reset position)", settings: "Extension settings", minimize: "Minimize/restore", maximize: "Maximize", restore: "Restore window size", close: "Close (Esc)", profile: "Quickly switch AI model/profile", ready: "Ready...", explore: "💡 Explore: ", suggestions: ["🔍 Deep analysis", "👶 Explain simply", "📋 Action steps", "⚖️ Pros & cons"], suggestionQueries: ["Analyze the core arguments of this article in greater depth and provide relevant background.", "Explain the key points of this article in the simplest possible language with easy examples.", "Based on this article, what concrete and actionable recommendations or steps can be derived?", "What are the potential advantages, disadvantages, limitations, or controversies of the views in this article?"], reset: "Reset position", resetTitle: "Reset the window to the bottom-right corner", retry: "Summarize again", retryTitle: "Summarize the article again", copy: "Copy summary", copyTitle: "Copy the full conversation", export: "Export", exportTitle: "Export the full conversation", exportFormat: "Choose export format", copied: "Copied!", copyShort: "Copy", exported: "Exported", answer: "Answering...", generating: "Generating", completed: "Completed", chars: "chars", error: "Generation failed", noKey: "API key not configured", noKeyMessage: "Set an API key for this model to get started.", requestFailed: "Request failed", unexpected: "An unexpected error occurred. Please try again later.", settingsAction: "Open API profiles", retryAction: "Retry", resize: "Drag to resize", pageSummary: "📄 Webpage Summary", aiAnswer: "🤖 AI Answer" },
    "zh-CN": { drag: "按住拖动窗口（双击重置位置）", settings: "扩展程序设置", minimize: "最小化/还原", maximize: "最大化窗口", restore: "还原窗口大小", close: "关闭（Esc）", profile: "快速切换 AI 模型/配置", ready: "准备就绪...", explore: "💡 延伸：", suggestions: ["🔍 深入分析", "👶 通俗解释", "📋 行动建议", "⚖️ 优缺点评估"], suggestionQueries: ["请进一步分析本文的核心论点，并补充相关背景。", "请用最简单易懂的语言和例子解释本文重点。", "根据本文可以提炼出哪些具体、可执行的建议或步骤？", "本文观点有哪些潜在的优点、缺点、限制或争议？"], reset: "重置位置", resetTitle: "将窗口重置到右下角", retry: "重新总结", retryTitle: "重新总结文章", copy: "复制总结", copyTitle: "复制完整对话", export: "导出", exportTitle: "导出完整对话", exportFormat: "选择导出格式", copied: "已复制！", copyShort: "复制", exported: "已导出", answer: "正在回答...", generating: "生成中", completed: "已完成", chars: "字", error: "生成失败", noKey: "尚未配置 API Key", noKeyMessage: "请先为此模型设置 API Key。", requestFailed: "请求失败", unexpected: "发生未预期的错误，请稍后重试。", settingsAction: "打开 API 配置", retryAction: "重试", resize: "拖动以调整大小", pageSummary: "📄 网页重点总结", aiAnswer: "🤖 AI 回答" },
    fr: { drag: "Faire glisser pour déplacer (double-cliquer pour réinitialiser)", settings: "Paramètres de l’extension", minimize: "Réduire/restaurer", maximize: "Agrandir", restore: "Restaurer la taille", close: "Fermer (Échap)", profile: "Changer de modèle/profil IA", ready: "Prêt...", explore: "💡 Explorer : ", suggestions: ["🔍 Analyse approfondie", "👶 Expliquer simplement", "📋 Étapes pratiques", "⚖️ Pour et contre"], suggestionQueries: ["Analysez plus en profondeur les arguments centraux de cet article et donnez le contexte pertinent.", "Expliquez les points clés de cet article avec le langage le plus simple et des exemples.", "Quelles recommandations ou étapes concrètes et réalisables peut-on déduire de cet article ?", "Quels sont les avantages, inconvénients, limites ou controverses possibles des opinions de cet article ?"], reset: "Réinitialiser la position", resetTitle: "Replacer la fenêtre en bas à droite", retry: "Résumer à nouveau", retryTitle: "Résumer à nouveau l’article", copy: "Copier le résumé", copyTitle: "Copier toute la conversation", export: "Exporter", exportTitle: "Exporter toute la conversation", exportFormat: "Choisir le format d’export", copied: "Copié !", copyShort: "Copier", exported: "Exporté", answer: "Réponse en cours...", generating: "Génération", completed: "Terminé", chars: "caractères", error: "Échec de la génération", noKey: "API Key non configurée", noKeyMessage: "Configurez une API Key pour ce modèle pour commencer.", requestFailed: "Échec de la requête", unexpected: "Une erreur inattendue s’est produite. Réessayez plus tard.", settingsAction: "Ouvrir les profils API", retryAction: "Réessayer", resize: "Faire glisser pour redimensionner", pageSummary: "📄 Résumé de la page web", aiAnswer: "🤖 Réponse de l’IA" },
    es: { drag: "Arrastra para mover (doble clic para restablecer la posición)", settings: "Configuración de la extensión", minimize: "Minimizar/restaurar", maximize: "Maximizar", restore: "Restaurar tamaño", close: "Cerrar (Esc)", profile: "Cambiar rápidamente de modelo/perfil de IA", ready: "Listo...", explore: "💡 Explorar: ", suggestions: ["🔍 Análisis profundo", "👶 Explicar fácilmente", "📋 Pasos de acción", "⚖️ Ventajas y desventajas"], suggestionQueries: ["Analiza con más profundidad los argumentos centrales de este artículo y aporta contexto relevante.", "Explica los puntos clave de este artículo con el lenguaje más sencillo y ejemplos fáciles.", "¿Qué recomendaciones o pasos concretos y aplicables pueden deducirse de este artículo?", "¿Qué ventajas, desventajas, limitaciones o controversias potenciales tienen las ideas de este artículo?"], reset: "Restablecer posición", resetTitle: "Restablecer la ventana abajo a la derecha", retry: "Resumir de nuevo", retryTitle: "Volver a resumir el artículo", copy: "Copiar resumen", copyTitle: "Copiar toda la conversación", export: "Exportar", exportTitle: "Exportar toda la conversación", exportFormat: "Elegir formato de exportación", copied: "¡Copiado!", copyShort: "Copiar", exported: "Exportado", answer: "Respondiendo...", generating: "Generando", completed: "Completado", chars: "caracteres", error: "Error de generación", noKey: "API Key no configurada", noKeyMessage: "Configura una API Key para este modelo para comenzar.", requestFailed: "Error en la solicitud", unexpected: "Se produjo un error inesperado. Inténtalo más tarde.", settingsAction: "Abrir perfiles API", retryAction: "Reintentar", resize: "Arrastra para cambiar el tamaño", pageSummary: "📄 Resumen de la página web", aiAnswer: "🤖 Respuesta de la IA" },
    de: { drag: "Zum Verschieben ziehen (Doppelklick zum Zurücksetzen)", settings: "Erweiterungseinstellungen", minimize: "Minimieren/wiederherstellen", maximize: "Maximieren", restore: "Fenstergröße wiederherstellen", close: "Schließen (Esc)", profile: "KI-Modell/-Profil schnell wechseln", ready: "Bereit...", explore: "💡 Erkunden: ", suggestions: ["🔍 Tiefenanalyse", "👶 Einfach erklären", "📋 Handlungsschritte", "⚖️ Vor- und Nachteile"], suggestionQueries: ["Analysiere die zentralen Argumente dieses Artikels ausführlicher und liefere relevanten Hintergrund.", "Erkläre die wichtigsten Punkte dieses Artikels mit möglichst einfacher Sprache und Beispielen.", "Welche konkreten und umsetzbaren Empfehlungen oder Schritte lassen sich aus diesem Artikel ableiten?", "Welche potenziellen Vorteile, Nachteile, Grenzen oder Kontroversen haben die Ansichten dieses Artikels?"], reset: "Position zurücksetzen", resetTitle: "Fenster unten rechts zurücksetzen", retry: "Erneut zusammenfassen", retryTitle: "Artikel erneut zusammenfassen", copy: "Zusammenfassung kopieren", copyTitle: "Gesamte Unterhaltung kopieren", export: "Exportieren", exportTitle: "Gesamte Unterhaltung exportieren", exportFormat: "Exportformat auswählen", copied: "Kopiert!", copyShort: "Kopieren", exported: "Exportiert", answer: "Antwort wird erstellt...", generating: "Wird erstellt", completed: "Abgeschlossen", chars: "Zeichen", error: "Erstellung fehlgeschlagen", noKey: "API Key nicht konfiguriert", noKeyMessage: "Lege einen API Key für dieses Modell fest, um zu beginnen.", requestFailed: "Anfrage fehlgeschlagen", unexpected: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später erneut.", settingsAction: "API-Profile öffnen", retryAction: "Erneut versuchen", resize: "Zum Ändern der Größe ziehen", pageSummary: "📄 Webseitenzusammenfassung", aiAnswer: "🤖 KI-Antwort" },
    vi: { drag: "Kéo để di chuyển (nhấp đúp để đặt lại vị trí)", settings: "Cài đặt tiện ích", minimize: "Thu nhỏ/khôi phục", maximize: "Phóng to", restore: "Khôi phục kích thước", close: "Đóng (Esc)", profile: "Chuyển nhanh mô hình/hồ sơ AI", ready: "Sẵn sàng...", explore: "💡 Khám phá: ", suggestions: ["🔍 Phân tích sâu", "👶 Giải thích đơn giản", "📋 Các bước hành động", "⚖️ Ưu và nhược điểm"], suggestionQueries: ["Hãy phân tích sâu hơn các lập luận cốt lõi của bài viết và cung cấp bối cảnh liên quan.", "Hãy giải thích các điểm chính của bài viết bằng ngôn ngữ đơn giản nhất và ví dụ dễ hiểu.", "Có thể rút ra những khuyến nghị hoặc bước cụ thể, khả thi nào từ bài viết này?", "Quan điểm trong bài viết có những ưu điểm, nhược điểm, hạn chế hoặc tranh luận tiềm ẩn nào?"], reset: "Đặt lại vị trí", resetTitle: "Đặt lại cửa sổ về góc dưới bên phải", retry: "Tóm tắt lại", retryTitle: "Tóm tắt lại bài viết", copy: "Sao chép tóm tắt", copyTitle: "Sao chép toàn bộ cuộc trò chuyện", export: "Xuất", exportTitle: "Xuất toàn bộ cuộc trò chuyện", exportFormat: "Chọn định dạng xuất", copied: "Đã sao chép!", copyShort: "Sao chép", exported: "Đã xuất", answer: "Đang trả lời...", generating: "Đang tạo", completed: "Đã hoàn tất", chars: "ký tự", error: "Tạo nội dung thất bại", noKey: "Chưa cấu hình API Key", noKeyMessage: "Hãy thiết lập API Key cho mô hình này để bắt đầu.", requestFailed: "Yêu cầu thất bại", unexpected: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.", settingsAction: "Mở hồ sơ API", retryAction: "Thử lại", resize: "Kéo để thay đổi kích thước", pageSummary: "📄 Tóm tắt trang web", aiAnswer: "🤖 Câu trả lời của AI" },
    th: { drag: "ลากเพื่อย้าย (ดับเบิลคลิกเพื่อรีเซ็ตตำแหน่ง)", settings: "การตั้งค่าส่วนขยาย", minimize: "ย่อ/คืนค่า", maximize: "ขยายเต็ม", restore: "คืนค่าขนาดหน้าต่าง", close: "ปิด (Esc)", profile: "สลับโมเดล/โปรไฟล์ AI อย่างรวดเร็ว", ready: "พร้อม...", explore: "💡 สำรวจเพิ่มเติม: ", suggestions: ["🔍 วิเคราะห์เชิงลึก", "👶 อธิบายแบบง่าย", "📋 ขั้นตอนดำเนินการ", "⚖️ ข้อดีและข้อเสีย"], suggestionQueries: ["วิเคราะห์ข้อโต้แย้งหลักของบทความนี้ให้ลึกยิ่งขึ้นและให้ข้อมูลเบื้องหลังที่เกี่ยวข้อง", "อธิบายประเด็นสำคัญของบทความนี้ด้วยภาษาที่ง่ายที่สุดและตัวอย่างที่เข้าใจง่าย", "บทความนี้สามารถสรุปเป็นคำแนะนำหรือขั้นตอนที่เป็นรูปธรรมและนำไปใช้ได้จริงอะไรบ้าง", "มุมมองในบทความนี้อาจมีข้อดี ข้อเสีย ข้อจำกัด หรือข้อโต้แย้งใดบ้าง"], reset: "รีเซ็ตตำแหน่ง", resetTitle: "รีเซ็ตหน้าต่างไปที่มุมขวาล่าง", retry: "สรุปอีกครั้ง", retryTitle: "สรุปบทความอีกครั้ง", copy: "คัดลอกบทสรุป", copyTitle: "คัดลอกการสนทนาทั้งหมด", export: "ส่งออก", exportTitle: "ส่งออกการสนทนาทั้งหมด", exportFormat: "เลือกรูปแบบการส่งออก", copied: "คัดลอกแล้ว!", copyShort: "คัดลอก", exported: "ส่งออกแล้ว", answer: "กำลังตอบ...", generating: "กำลังสร้าง", completed: "เสร็จแล้ว", chars: "อักขระ", error: "สร้างไม่สำเร็จ", noKey: "ยังไม่ได้ตั้งค่า API Key", noKeyMessage: "ตั้งค่า API Key สำหรับโมเดลนี้เพื่อเริ่มใช้งาน", requestFailed: "คำขอล้มเหลว", unexpected: "เกิดข้อผิดพลาดที่ไม่คาดคิด โปรดลองอีกครั้งภายหลัง", settingsAction: "เปิดโปรไฟล์ API", retryAction: "ลองอีกครั้ง", resize: "ลากเพื่อปรับขนาด", pageSummary: "📄 สรุปหน้าเว็บ", aiAnswer: "🤖 คำตอบจาก AI" },
    id: { drag: "Seret untuk memindahkan (klik dua kali untuk mengatur ulang posisi)", settings: "Pengaturan ekstensi", minimize: "Minimalkan/pulihkan", maximize: "Maksimalkan", restore: "Pulihkan ukuran jendela", close: "Tutup (Esc)", profile: "Beralih model/profil AI dengan cepat", ready: "Siap...", explore: "💡 Jelajahi: ", suggestions: ["🔍 Analisis mendalam", "👶 Jelaskan sederhana", "📋 Langkah tindakan", "⚖️ Kelebihan & kekurangan"], suggestionQueries: ["Analisis argumen utama artikel ini secara lebih mendalam dan berikan konteks yang relevan.", "Jelaskan poin-poin penting artikel ini dengan bahasa sesederhana mungkin dan contoh yang mudah.", "Rekomendasi atau langkah konkret dan dapat ditindaklanjuti apa yang dapat diambil dari artikel ini?", "Apa potensi kelebihan, kekurangan, keterbatasan, atau kontroversi dari pandangan dalam artikel ini?"], reset: "Atur ulang posisi", resetTitle: "Atur ulang jendela ke sudut kanan bawah", retry: "Ringkas lagi", retryTitle: "Ringkas artikel lagi", copy: "Salin ringkasan", copyTitle: "Salin seluruh percakapan", export: "Ekspor", exportTitle: "Ekspor seluruh percakapan", exportFormat: "Pilih format ekspor", copied: "Tersalin!", copyShort: "Salin", exported: "Diekspor", answer: "Sedang menjawab...", generating: "Membuat", completed: "Selesai", chars: "karakter", error: "Pembuatan gagal", noKey: "API Key belum dikonfigurasi", noKeyMessage: "Atur API Key untuk model ini untuk memulai.", requestFailed: "Permintaan gagal", unexpected: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi nanti.", settingsAction: "Buka profil API", retryAction: "Coba lagi", resize: "Seret untuk mengubah ukuran", pageSummary: "📄 Ringkasan halaman web", aiAnswer: "🤖 Jawaban AI" },
    ja: {
      drag: "ドラッグして移動（ダブルクリックで位置をリセット）", settings: "拡張機能の設定", minimize: "最小化/復元", maximize: "最大化", restore: "ウィンドウサイズを復元", close: "閉じる（Esc）", profile: "AIモデル/プロファイルを切り替え", ready: "準備完了...", explore: "💡 追加：", suggestions: ["🔍 詳細分析", "👶 やさしく説明", "📋 実行手順", "⚖️ 長所と短所"], suggestionQueries: ["この記事の中心的な議論をさらに詳しく分析し、関連する背景を説明してください。", "この記事の要点を、簡単な例を使って最も分かりやすく説明してください。", "この記事から導ける具体的で実行可能な提案や手順は何ですか？", "この記事の主張にはどのような長所、短所、限界、論争がありますか？"], reset: "位置をリセット", resetTitle: "ウィンドウを右下に戻す", retry: "再要約", retryTitle: "記事を再度要約", copy: "要約をコピー", copyTitle: "会話全体をコピー", export: "エクスポート", exportTitle: "会話全体をエクスポート", exportFormat: "形式を選択", copied: "コピーしました！", copyShort: "コピー", exported: "エクスポート済み", answer: "回答中...", generating: "生成中", completed: "完了", chars: "文字", error: "生成に失敗しました", noKey: "APIキー未設定", noKeyMessage: "このモデルのAPIキーを設定してください。", requestFailed: "リクエストに失敗しました", unexpected: "予期しないエラーが発生しました。後でもう一度お試しください。", settingsAction: "APIプロファイルを開く", retryAction: "再試行", resize: "ドラッグしてサイズ変更", pageSummary: "📄 ウェブページの要約", aiAnswer: "🤖 AIの回答" },
    ko: {
      drag: "드래그하여 이동 (두 번 클릭하면 위치 초기화)", settings: "확장 프로그램 설정", minimize: "최소화/복원", maximize: "최대화", restore: "창 크기 복원", close: "닫기 (Esc)", profile: "AI 모델/프로필 빠른 전환", ready: "준비 완료...", explore: "💡 추가 탐색: ", suggestions: ["🔍 심층 분석", "👶 쉽게 설명", "📋 실행 단계", "⚖️ 장단점 평가"], suggestionQueries: ["이 글의 핵심 주장을 더 깊이 분석하고 관련 배경을 설명하세요.", "이 글의 핵심을 쉬운 예시와 함께 가장 이해하기 쉬운 말로 설명하세요.", "이 글에서 도출할 수 있는 구체적이고 실행 가능한 권장 사항이나 단계는 무엇인가요?", "이 글의 관점에는 어떤 장점, 단점, 한계 또는 논쟁이 있을 수 있나요?"], reset: "위치 초기화", resetTitle: "창을 오른쪽 아래로 초기화", retry: "다시 요약", retryTitle: "페이지 다시 요약", copy: "요약 복사", copyTitle: "전체 대화 복사", export: "내보내기", exportTitle: "전체 대화 내보내기", exportFormat: "내보내기 형식 선택", copied: "복사됨!", copyShort: "복사", exported: "내보냄", answer: "답변 중...", generating: "생성 중", completed: "완료", chars: "자", error: "생성 실패", noKey: "API 키가 설정되지 않음", noKeyMessage: "이 모델의 API 키를 설정하면 시작할 수 있습니다.", requestFailed: "요청 실패", unexpected: "예기치 않은 오류가 발생했습니다. 나중에 다시 시도하세요.", settingsAction: "API 프로필 열기", retryAction: "다시 시도", resize: "드래그하여 크기 조정", pageSummary: "📄 웹페이지 요약", aiAnswer: "🤖 AI 답변" }
  };
  const fl = () => FLOATING_LABELS[currentLocale] || FLOATING_LABELS["zh-TW"];
  let floatingStatus = { kind: "ready", count: 0, profile: "" };
  function getFloatingStatusText() {
    const l = fl();
    if (floatingStatus.kind === "answer") return `[${floatingStatus.profile}] ${l.answer}`;
    if (floatingStatus.kind === "generating") return `${l.generating} (${floatingStatus.count} ${l.chars})...`;
    if (floatingStatus.kind === "completed") return `${l.completed} (${floatingStatus.count} ${l.chars})`;
    if (floatingStatus.kind === "error") return l.error;
    if (floatingStatus.kind === "connecting") return ft().connecting;
    return l.ready;
  }
  function setFloatingStatus(kind, details = {}) {
    floatingStatus = { kind, count: details.count || 0, profile: details.profile || "" };
    const status = shadowRoot?.getElementById("ws-stats-text");
    if (status) status.textContent = getFloatingStatusText();
  }
  function refreshFloatingLocale() {
    if (!shadowRoot) return;
    const t = ft();
    const l = fl();
    const title = shadowRoot.getElementById("ws-header-title");
    if (title && !selectionActionContext) title.textContent = t.title;
    const loading = shadowRoot.getElementById("ws-loading-text");
    if (loading) loading.textContent = t.loading;
    const input = shadowRoot.getElementById("ws-chat-input");
    if (input && !pendingCustomSelection) input.placeholder = t.input;
    const send = shadowRoot.getElementById("ws-btn-send");
    if (send) send.title = isGenerating ? t.stop : t.send;
    shadowRoot.querySelectorAll(".ws-selection-action").forEach((button, index) => button.textContent = t.actions[index]);
    const setAttr = (id, attr, value) => { const el = shadowRoot.getElementById(id); if (el) el.setAttribute(attr, value); };
    setAttr("ws-drag-handle", "title", l.drag);
    setAttr("ws-footer-drag", "title", l.drag);
    setAttr("ws-btn-settings", "title", l.settings);
    setAttr("ws-btn-minimize", "title", l.minimize);
    setAttr("ws-btn-close", "title", l.close);
    setAttr("ws-btn-close", "aria-label", l.close);
    setAttr("ws-profile-selector", "aria-label", l.profile);
    setAttr("ws-btn-reset-pos", "title", l.resetTitle);
    setAttr("ws-btn-retry", "title", l.retryTitle);
    setAttr("ws-btn-copy-all", "title", l.copyTitle);
    setAttr("ws-export-format", "title", l.exportFormat);
    setAttr("ws-btn-export", "title", l.exportTitle);
    setAttr("ws-resize-handle", "title", l.resize);
    setAttr("ws-resize-handle", "aria-label", l.resize);
    const maximize = shadowRoot.getElementById("ws-btn-maximize");
    if (maximize) { const label = maximize.closest(".ws-card")?.classList.contains("ws-maximized") ? l.restore : l.maximize; maximize.title = label; maximize.setAttribute("aria-label", label); }
    const suggestionLabel = shadowRoot.querySelector(".ws-sug-label");
    if (suggestionLabel) suggestionLabel.textContent = l.explore;
    shadowRoot.querySelectorAll(".ws-chip").forEach((chip, index) => { chip.textContent = l.suggestions[index]; chip.setAttribute("data-query", l.suggestionQueries[index]); });
    const setText = (id, value) => { const el = shadowRoot.getElementById(id); if (el) el.textContent = value; };
    setText("ws-stats-text", getFloatingStatusText());
    setText("ws-reset-btn-text", l.reset);
    setText("ws-retry-btn-text", l.retry);
    setText("ws-copy-btn-text", l.copy);
    setText("ws-export-btn-text", l.export);
  }
  function loadFloatingLocale() {
    chrome.storage.sync.get(["uiLocale"], (items) => {
      currentLocale = globalThis.WebSummarizerI18n?.normalizeLocale(items.uiLocale) || "zh-TW";
      refreshFloatingLocale();
    });
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync" || !changes.uiLocale) return;
    currentLocale = globalThis.WebSummarizerI18n?.normalizeLocale(changes.uiLocale.newValue) || "zh-TW";
    refreshFloatingLocale();
  });

  // Listen for trigger messages from background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "TRIGGER_SUMMARY") {
      initiateSummary(request.isSelection, request.selectionText);
      sendResponse({ status: "started" });
    } else if (request.action === "TRIGGER_SELECTION_ACTIONS") {
      openSelectionActions(request.selectionText, request.title, request.url);
      sendResponse({ status: "ready" });
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
      loadFloatingLocale();

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

    // Keep a small gutter around the maximized card so the edge of its
    // scrollable body remains visually discoverable at the viewport boundary.
    hostElement.style.boxSizing = "border-box";
    hostElement.style.padding = "8px";
    if (card.style.width !== "100%") card.style.width = "100%";
    if (card.style.height !== "100%") card.style.height = "100%";
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

      <!-- Selected-text actions -->
      <div class="ws-selection-actions" id="ws-selection-actions" style="display: none;">
        <div class="ws-selection-preview" id="ws-selection-preview"></div>
        <div class="ws-selection-action-buttons">
          <button type="button" class="ws-selection-action" data-selection-operation="summarize">總結</button>
          <button type="button" class="ws-selection-action" data-selection-operation="translate">翻譯</button>
          <button type="button" class="ws-selection-action" data-selection-operation="explain">解釋</button>
          <button type="button" class="ws-selection-action" data-selection-operation="rewrite">改寫</button>
          <button type="button" class="ws-selection-action" data-selection-operation="grammar">修正文法</button>
          <button type="button" class="ws-selection-action" data-selection-operation="custom">自訂</button>
        </div>
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
            <span id="ws-reset-btn-text">重設位置</span>
          </button>
          <button class="ws-btn-action" id="ws-btn-retry" title="重新總結文章">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            <span id="ws-retry-btn-text">重新總結</span>
          </button>
          <button class="ws-btn-action ws-btn-primary" id="ws-btn-copy-all" title="複製完整對話記錄">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          <span id="ws-copy-btn-text">複製重點</span>
          </button>
          <select class="ws-export-format" id="ws-export-format" title="選擇匯出格式">
            <option value="markdown">MD</option>
            <option value="text">TXT</option>
          </select>
          <button class="ws-btn-action" id="ws-btn-export" title="匯出完整對話記錄">
            <span id="ws-export-btn-text">匯出</span>
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
        box-sizing: border-box;
        display: block;
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
        width: 100% !important;
        height: 100% !important;
        min-width: 0 !important;
        max-width: none !important;
        min-height: 0 !important;
        max-height: none !important;
        border-radius: 8px;
        box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.16);
      }

      .ws-card.ws-minimized .ws-body,
      .ws-card.ws-minimized .ws-suggestions-bar,
      .ws-card.ws-minimized .ws-selection-actions,
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
        min-height: 0;
        overflow-y: auto;
        scrollbar-gutter: stable;
        padding: 12px 14px;
        background: #f8fafc;
        position: relative;
      }

      .ws-card.ws-maximized .ws-body {
        overflow-y: scroll;
      }

      .ws-body::-webkit-scrollbar { width: 10px; }
      .ws-body::-webkit-scrollbar-track { background: transparent; }
      .ws-body::-webkit-scrollbar-thumb { background: #94a3b8; border: 2px solid #f8fafc; border-radius: 6px; }
      .ws-body::-webkit-scrollbar-thumb:hover { background: #64748b; }

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

      .ws-markdown-content li > ul,
      .ws-markdown-content li > ol {
        margin-top: 2px;
        margin-bottom: 0;
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
        white-space: pre;
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

      /* Selected-text action toolbar */
      .ws-selection-actions {
        background: #eef2ff;
        border-top: 1px solid #c7d2fe;
        padding: 6px 10px;
      }

      .ws-selection-preview {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #4338ca;
        font-size: 11px;
        margin-bottom: 5px;
      }

      .ws-selection-context {
        background: #f8fafc;
        border-left: 3px solid #818cf8;
        border-radius: 4px;
        color: #475569;
        font-size: 12px;
        line-height: 1.5;
        max-height: 110px;
        overflow: auto;
        padding: 8px 10px;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .ws-selection-action-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .ws-selection-action {
        border: 1px solid #c7d2fe;
        border-radius: 10px;
        background: #ffffff;
        color: #4338ca;
        cursor: pointer;
        font-size: 11px;
        padding: 3px 8px;
      }

      .ws-selection-action:hover {
        background: #4f46e5;
        border-color: #4f46e5;
        color: #ffffff;
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

      .ws-export-format {
        height: 24px;
        border: 1px solid #cbd5e1;
        border-radius: 5px;
        background: #ffffff;
        color: #475569;
        cursor: pointer;
        font-size: 10px;
      }

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
    const btnExport = shadowRoot.getElementById("ws-btn-export");
    const exportFormat = shadowRoot.getElementById("ws-export-format");
    const btnRetry = shadowRoot.getElementById("ws-btn-retry");
    const btnResetPos = shadowRoot.getElementById("ws-btn-reset-pos");
    const chatInput = shadowRoot.getElementById("ws-chat-input");
    const btnSend = shadowRoot.getElementById("ws-btn-send");
    const profileSelector = shadowRoot.getElementById("ws-profile-selector");
    const isolatedKeyboardEvents = ["keydown", "keypress", "keyup"];

    // Keep keyboard events from leaking through the Shadow DOM to host-page shortcuts.
    // We handle Enter/Escape here because stopping propagation during window capture
    // prevents the event from reaching the input/document listeners below it.
    function stopHostKeyboardShortcuts(e) {
      const eventPath = typeof e.composedPath === "function" ? e.composedPath() : [];
      // Compare DOM identifiers instead of object identity because content scripts
      // and the host page can expose different wrappers for the same DOM node.
      const isChatInputEvent = eventPath.some((node) => node?.id === chatInput.id);
      if (!isChatInputEvent && e.target?.id !== chatInput.id) return;

      e.stopPropagation();

      if (e.type !== "keydown") return;

      if (e.key === "Escape" && hostElement) {
        btnClose.click();
        return;
      }

      if (e.isComposing || e.keyCode === 229) return;

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendUserFollowUp();
      }
    }

    isolatedKeyboardEvents.forEach((eventName) => {
      window.addEventListener(eventName, stopHostKeyboardShortcuts, true);
    });
    // Close
    btnClose.addEventListener("click", () => {
      stopCurrentGeneration();
      stopResize();
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      window.removeEventListener("resize", syncViewportLayout);
      isolatedKeyboardEvents.forEach((eventName) => {
        window.removeEventListener(eventName, stopHostKeyboardShortcuts, true);
      });
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
        copyTextEl.textContent = fl().copied;
        setTimeout(() => {
          if (copyTextEl) copyTextEl.textContent = orig;
        }, 1800);
      });
    });

    btnExport.addEventListener("click", () => {
      exportConversation(exportFormat.value);
    });

    shadowRoot.querySelectorAll("[data-selection-operation]").forEach((button) => {
      button.addEventListener("click", () => {
        handleSelectionOperation(button.getAttribute("data-selection-operation"));
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
      const label = isMaximized ? fl().restore : fl().maximize;

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
      hostElement.style.removeProperty("padding");
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

        if (card.classList.contains("ws-maximized") && el !== dragHandleTop) return;

        if (card.classList.contains("ws-maximized")) {
          // Dragging a maximized title bar follows the familiar desktop
          // window behavior: restore first, then continue the same drag.
          restoreWindowFromMaximized();
          card.classList.remove("ws-minimized");

          const restoredWidth = card.offsetWidth || 480;
          const restoredHeight = card.offsetHeight || 620;
          const maxLeft = Math.max(10, window.innerWidth - restoredWidth - 10);
          const maxTop = Math.max(10, window.innerHeight - restoredHeight - VIEWPORT_MARGIN);
          currentLeft = Math.min(Math.max(10, e.clientX - restoredWidth / 2), maxLeft);
          currentTop = Math.min(Math.max(10, e.clientY - 25), maxTop);
          hostElement.style.left = `${currentLeft}px`;
          hostElement.style.top = `${currentTop}px`;
        }

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = currentLeft;
        initialTop = currentTop;

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
    const btnExport = shadowRoot.getElementById("ws-btn-export");

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
      btnSend.title = ft().send;
      btnRetry.disabled = false;
      btnCopyAll.disabled = false;
      btnExport.disabled = false;
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
      btnSend.title = ft().stop;
      btnRetry.disabled = true;
      btnCopyAll.disabled = true;
      btnExport.disabled = true;
    }
  }

  const SELECTION_OPERATION_PROMPTS = Object.freeze({
    "zh-TW": { summarize: "請整理以下選取文字的核心重點，使用清楚的條列式說明。", translate: "請將以下選取文字翻譯成繁體中文，保留專有名詞、程式碼與原本格式。", explain: "請用白話、容易理解的方式解釋以下選取文字，必要時補充簡單例子。", rewrite: "請在不改變原意的前提下，將以下選取文字改寫得更清楚、自然且專業。", grammar: "請檢查並修正以下選取文字的拼字、文法與用詞，並提供修正後版本。" },
    en: { summarize: "Summarize the key points in the selected text using clear bullet points.", translate: "Translate the selected text into English, preserving proper nouns, code, and formatting.", explain: "Explain the selected text in plain, easy-to-understand language and add simple examples when helpful.", rewrite: "Rewrite the selected text to be clearer, more natural, and professional without changing its meaning.", grammar: "Check and correct the spelling, grammar, and wording in the selected text, then provide the corrected version." },
    "zh-CN": { summarize: "请整理以下选中文字的核心要点，使用清晰的条列说明。", translate: "请将以下选中文字翻译成简体中文，保留专有名词、代码和原有格式。", explain: "请用通俗易懂的方式解释以下选中文字，必要时补充简单例子。", rewrite: "在不改变原意的前提下，将以下选中文字改写得更清晰、自然且专业。", grammar: "请检查并修正以下选中文字的拼写、语法和用词，并提供修正后的版本。" },
    fr: { summarize: "Résumez les points essentiels du texte sélectionné sous forme de liste claire.", translate: "Traduisez le texte sélectionné en français en conservant les noms propres, le code et la mise en forme.", explain: "Expliquez le texte sélectionné dans un langage simple et facile à comprendre, avec des exemples si nécessaire.", rewrite: "Réécrivez le texte sélectionné de façon plus claire, naturelle et professionnelle sans en changer le sens.", grammar: "Vérifiez et corrigez l’orthographe, la grammaire et les formulations du texte sélectionné, puis fournissez la version corrigée." },
    es: { summarize: "Resume los puntos clave del texto seleccionado usando una lista clara.", translate: "Traduce el texto seleccionado al español conservando los nombres propios, el código y el formato.", explain: "Explica el texto seleccionado con un lenguaje sencillo y fácil de entender; añade ejemplos cuando sea útil.", rewrite: "Reescribe el texto seleccionado de forma más clara, natural y profesional sin cambiar su significado.", grammar: "Revisa y corrige la ortografía, la gramática y la redacción del texto seleccionado y proporciona la versión corregida." },
    de: { summarize: "Fasse die wichtigsten Punkte des ausgewählten Textes in einer übersichtlichen Liste zusammen.", translate: "Übersetze den ausgewählten Text ins Deutsche und bewahre Eigennamen, Code und Formatierung.", explain: "Erkläre den ausgewählten Text in einfacher, leicht verständlicher Sprache und ergänze bei Bedarf Beispiele.", rewrite: "Schreibe den ausgewählten Text klarer, natürlicher und professioneller um, ohne seine Bedeutung zu verändern.", grammar: "Prüfe und korrigiere Rechtschreibung, Grammatik und Formulierungen des ausgewählten Textes und gib die korrigierte Fassung aus." },
    vi: { summarize: "Hãy tóm tắt các ý chính của văn bản đã chọn bằng danh sách rõ ràng.", translate: "Hãy dịch văn bản đã chọn sang tiếng Việt, giữ nguyên tên riêng, mã và định dạng.", explain: "Hãy giải thích văn bản đã chọn bằng ngôn ngữ đơn giản, dễ hiểu và bổ sung ví dụ khi cần.", rewrite: "Hãy viết lại văn bản đã chọn rõ ràng, tự nhiên và chuyên nghiệp hơn mà không thay đổi ý nghĩa.", grammar: "Hãy kiểm tra, sửa lỗi chính tả, ngữ pháp và cách dùng từ trong văn bản đã chọn, sau đó đưa ra bản đã sửa." },
    th: { summarize: "สรุปประเด็นสำคัญของข้อความที่เลือกโดยใช้รายการที่ชัดเจน", translate: "แปลข้อความที่เลือกเป็นภาษาไทย โดยคงชื่อเฉพาะ โค้ด และรูปแบบเดิมไว้", explain: "อธิบายข้อความที่เลือกด้วยภาษาที่เข้าใจง่าย และเพิ่มตัวอย่างง่าย ๆ หากจำเป็น", rewrite: "เขียนข้อความที่เลือกใหม่ให้ชัดเจน เป็นธรรมชาติ และเป็นมืออาชีพมากขึ้นโดยไม่เปลี่ยนความหมาย", grammar: "ตรวจสอบและแก้ไขการสะกด ไวยากรณ์ และการใช้คำในข้อความที่เลือก พร้อมแสดงฉบับแก้ไข" },
    id: { summarize: "Ringkas poin-poin utama dalam teks yang dipilih menggunakan daftar yang jelas.", translate: "Terjemahkan teks yang dipilih ke bahasa Indonesia dengan mempertahankan nama khusus, kode, dan format.", explain: "Jelaskan teks yang dipilih dengan bahasa sederhana dan mudah dipahami, serta tambahkan contoh jika diperlukan.", rewrite: "Tulis ulang teks yang dipilih agar lebih jelas, alami, dan profesional tanpa mengubah maknanya.", grammar: "Periksa dan perbaiki ejaan, tata bahasa, dan pilihan kata dalam teks yang dipilih, lalu berikan versi yang telah diperbaiki." },
    ja: { summarize: "選択テキストの要点を明確な箇条書きで整理してください。", translate: "選択テキストを日本語に翻訳し、固有名詞、コード、書式を保持してください。", explain: "選択テキストを平易で分かりやすく説明し、必要に応じて簡単な例を加えてください。", rewrite: "意味を変えずに、選択テキストをより明確で自然かつ専門的に書き換えてください。", grammar: "選択テキストのスペル、文法、表現を確認・修正し、修正版を提示してください。" },
    ko: { summarize: "선택한 텍스트의 핵심 내용을 명확한 글머리 기호로 정리하세요.", translate: "선택한 텍스트를 한국어로 번역하고 고유명사, 코드, 서식을 유지하세요.", explain: "선택한 텍스트를 쉽고 이해하기 쉬운 말로 설명하고 필요하면 간단한 예를 추가하세요.", rewrite: "의미를 바꾸지 않고 선택한 텍스트를 더 명확하고 자연스럽고 전문적으로 다시 작성하세요.", grammar: "선택한 텍스트의 철자, 문법, 표현을 점검하고 수정된 버전을 제공하세요." }
  });
  const selectionOperationPrompt = (operation) => (SELECTION_OPERATION_PROMPTS[currentLocale] || SELECTION_OPERATION_PROMPTS["zh-TW"])[operation];
  const PROMPT_LABELS = {
    "zh-TW": { selectionSummary: "請總結以下使用者在網頁", selectedContent: "【選取內容】", pageSummary: "請總結以下網頁的完整內容重點：", pageTitle: "【網頁標題】", pageUrl: "【網頁網址】", pageBody: "【網頁正文內容】", source: "【來源頁面】", selected: "【選取文字】", custom: "請根據以下選取文字，執行使用者指定的操作：", instruction: "【使用者指令】" },
    en: { selectionSummary: "Summarize the following key text selected by the user on the webpage", selectedContent: "[Selected content]", pageSummary: "Summarize the key points of the following webpage content:", pageTitle: "[Page title]", pageUrl: "[Page URL]", pageBody: "[Webpage content]", source: "[Source page]", selected: "[Selected text]", custom: "Perform the user's requested operation on the following selected text:", instruction: "[User instruction]" },
    "zh-CN": { selectionSummary: "请总结用户在网页中选取的以下重点文字", selectedContent: "[选中内容]", pageSummary: "请总结以下网页的完整内容重点：", pageTitle: "[网页标题]", pageUrl: "[网页网址]", pageBody: "[网页正文内容]", source: "[来源页面]", selected: "[选中文字]", custom: "请根据以下选中文字，执行用户指定的操作：", instruction: "[用户指令]" },
    fr: { selectionSummary: "Résumez le texte important suivant sélectionné par l’utilisateur sur la page web", selectedContent: "[Contenu sélectionné]", pageSummary: "Résumez les points essentiels du contenu de la page web suivante :", pageTitle: "[Titre de la page]", pageUrl: "[URL de la page]", pageBody: "[Contenu de la page web]", source: "[Page source]", selected: "[Texte sélectionné]", custom: "Effectuez l’opération demandée par l’utilisateur sur le texte sélectionné suivant :", instruction: "[Instruction de l’utilisateur]" },
    es: { selectionSummary: "Resume el siguiente texto importante seleccionado por el usuario en la página web", selectedContent: "[Contenido seleccionado]", pageSummary: "Resume los puntos clave del siguiente contenido de la página web:", pageTitle: "[Título de la página]", pageUrl: "[URL de la página]", pageBody: "[Contenido de la página web]", source: "[Página de origen]", selected: "[Texto seleccionado]", custom: "Realiza la operación solicitada por el usuario sobre el siguiente texto seleccionado:", instruction: "[Instrucción del usuario]" },
    de: { selectionSummary: "Fasse den folgenden vom Nutzer auf der Webseite ausgewählten wichtigen Text zusammen", selectedContent: "[Ausgewählter Inhalt]", pageSummary: "Fasse die wichtigsten Punkte des folgenden Webseiteninhalts zusammen:", pageTitle: "[Seitentitel]", pageUrl: "[Seiten-URL]", pageBody: "[Webseiteninhalt]", source: "[Quellseite]", selected: "[Ausgewählter Text]", custom: "Führe die vom Nutzer gewünschte Aktion für den folgenden ausgewählten Text aus:", instruction: "[Anweisung des Nutzers]" },
    vi: { selectionSummary: "Hãy tóm tắt phần văn bản quan trọng sau đây do người dùng chọn trên trang web", selectedContent: "[Nội dung đã chọn]", pageSummary: "Hãy tóm tắt những điểm chính của nội dung trang web sau:", pageTitle: "[Tiêu đề trang]", pageUrl: "[URL trang]", pageBody: "[Nội dung trang web]", source: "[Trang nguồn]", selected: "[Văn bản đã chọn]", custom: "Hãy thực hiện thao tác người dùng yêu cầu đối với văn bản đã chọn sau:", instruction: "[Chỉ dẫn của người dùng]" },
    th: { selectionSummary: "สรุปข้อความสำคัญต่อไปนี้ที่ผู้ใช้เลือกจากหน้าเว็บ", selectedContent: "[เนื้อหาที่เลือก]", pageSummary: "สรุปประเด็นสำคัญของเนื้อหาหน้าเว็บต่อไปนี้:", pageTitle: "[ชื่อหน้าเว็บ]", pageUrl: "[URL หน้าเว็บ]", pageBody: "[เนื้อหาหน้าเว็บ]", source: "[หน้าแหล่งที่มา]", selected: "[ข้อความที่เลือก]", custom: "ดำเนินการตามที่ผู้ใช้ระบุกับข้อความที่เลือกต่อไปนี้:", instruction: "[คำสั่งของผู้ใช้]" },
    id: { selectionSummary: "Ringkas teks penting berikut yang dipilih pengguna di halaman web", selectedContent: "[Konten yang dipilih]", pageSummary: "Ringkas poin-poin utama dari konten halaman web berikut:", pageTitle: "[Judul halaman]", pageUrl: "[URL halaman]", pageBody: "[Konten halaman web]", source: "[Halaman sumber]", selected: "[Teks yang dipilih]", custom: "Jalankan operasi yang diminta pengguna pada teks yang dipilih berikut:", instruction: "[Instruksi pengguna]" },
    ja: { selectionSummary: "ユーザーがウェブページで選択した以下の重要なテキストを要約してください", selectedContent: "【選択内容】", pageSummary: "以下のウェブページの内容の要点を要約してください：", pageTitle: "【ページタイトル】", pageUrl: "【ページURL】", pageBody: "【ウェブページ本文】", source: "【出典ページ】", selected: "【選択テキスト】", custom: "以下の選択テキストに対して、ユーザーが指定した操作を実行してください：", instruction: "【ユーザーの指示】" },
    ko: { selectionSummary: "사용자가 웹페이지에서 선택한 다음 핵심 텍스트를 요약하세요", selectedContent: "[선택한 내용]", pageSummary: "다음 웹페이지 내용의 핵심을 요약하세요:", pageTitle: "[페이지 제목]", pageUrl: "[페이지 URL]", pageBody: "[웹페이지 본문]", source: "[출처 페이지]", selected: "[선택한 텍스트]", custom: "다음 선택한 텍스트에 사용자가 지정한 작업을 수행하세요:", instruction: "[사용자 지시]" }
  };
  const pl = () => PROMPT_LABELS[currentLocale] || PROMPT_LABELS["zh-TW"];

  function openSelectionActions(selectionText, title, url) {
    const text = (selectionText || "").trim();
    if (!text) return;

    ensureUI();
    const card = shadowRoot.getElementById("ws-main-card");
    const titleEl = shadowRoot.getElementById("ws-header-title");
    const chatFeed = shadowRoot.getElementById("ws-chat-feed");
    const loadingState = shadowRoot.getElementById("ws-loading-state");
    const errorBox = shadowRoot.getElementById("ws-error-box");
    const suggestionsBar = shadowRoot.getElementById("ws-suggestions-bar");
    const actionsBar = shadowRoot.getElementById("ws-selection-actions");
    const preview = shadowRoot.getElementById("ws-selection-preview");
    const chatInput = shadowRoot.getElementById("ws-chat-input");

    selectionActionContext = { text, title: title || document.title || "選取文字", url: url || window.location.href };
    pendingCustomSelection = false;
    conversationHistory = [];
    lastExtractionContext = { ...selectionActionContext, isSelection: true };
    card.classList.remove("ws-minimized");
    titleEl.textContent = ft().selected;
    preview.textContent = `${ft().selectedPrefix}${text.replace(/\s+/g, " ")}`;
    actionsBar.style.display = "block";
    loadingState.style.display = "none";
    errorBox.style.display = "none";
    suggestionsBar.style.display = "none";
    chatFeed.style.display = "flex";
    chatFeed.innerHTML = `<div class="ws-selection-context">${escapeHtml(text)}</div>`;
    chatInput.placeholder = ft().selection;
    updateInputState(true);
  }

  function handleSelectionOperation(operation) {
    if (!selectionActionContext) return;

    const chatInput = shadowRoot.getElementById("ws-chat-input");
    if (operation === "custom") {
      pendingCustomSelection = true;
      chatInput.placeholder = ft().custom;
      chatInput.focus();
      return;
    }

    const operationPrompt = selectionOperationPrompt(operation);
    if (!operationPrompt) return;
    pendingCustomSelection = false;
    chatInput.placeholder = ft().input;
    startSelectionOperation(operationPrompt);
  }

  function startSelectionOperation(operationPrompt) {
    const context = selectionActionContext;
    if (!context) return;

    stopCurrentGeneration();
    conversationHistory = [{
      role: "user",
      content: `${operationPrompt}\n\n${pl().source}${context.title}\n${pl().selected}\n${context.text}`
    }];

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
    setFloatingStatus("connecting");
    executeStreamRequest();
  }

  // Start initial summary workflow
  function initiateSummary(isSelection, selectionText) {
    ensureUI();
    selectionActionContext = null;
    pendingCustomSelection = false;
    shadowRoot.getElementById("ws-selection-actions").style.display = "none";
    shadowRoot.getElementById("ws-chat-input").placeholder = ft().input;
    const card = shadowRoot.getElementById("ws-main-card");
    card.classList.remove("ws-minimized");

    const extraction = extractPageContent(isSelection, selectionText);
    lastExtractionContext = extraction;

    const titleEl = shadowRoot.getElementById("ws-header-title");
    titleEl.textContent = extraction.isSelection ? ft().selectedSummary : ft().title;

    clampPositionToBounds();
    startInitialSummary(extraction);
  }

  // Execute initial summary
  function startInitialSummary(extraction) {
    stopCurrentGeneration();
    conversationHistory = [];

    const labels = pl();
    const promptContent = extraction.isSelection
      ? `${labels.selectionSummary}【${extraction.title || "Untitled webpage"}】:\n\n${labels.selectedContent}\n${extraction.text}`
      : `${labels.pageSummary}\n\n${labels.pageTitle}${extraction.title || "Untitled webpage"}\n${labels.pageUrl}${extraction.url || "N/A"}\n\n${labels.pageBody}\n${extraction.text}`;

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
    setFloatingStatus("connecting");
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

    const requestText = pendingCustomSelection && selectionActionContext
      ? `${pl().custom}\n\n${pl().instruction}\n${userText}\n\n${pl().selected}\n${selectionActionContext.text}`
      : userText;
    pendingCustomSelection = false;
    conversationHistory.push({ role: "user", content: requestText });
    appendUserBubble(userText);
    executeStreamRequest();
  }

  function exportConversation(format) {
    const title = lastExtractionContext?.title || document.title || "AI 網頁摘要";
    const url = lastExtractionContext?.url || window.location.href;
    const visibleMessages = conversationHistory.filter((message, index) => (
      message.role === "assistant" || (message.role === "user" && index > 0)
    ));

    if (visibleMessages.length === 0) return;

    const exportedAt = new Date().toLocaleString();
    const activeProfile = availableProfiles.find((profile) => profile.id === currentActiveProfileId);
    const model = activeProfile ? `${activeProfile.name} (${activeProfile.model})` : "未指定";
    const isMarkdown = format !== "text";
    const lines = isMarkdown
      ? [`# ${title}`, "", `- 網址：${url}`, `- 模型：${model}`, `- 匯出時間：${exportedAt}`, ""]
      : [title, `網址：${url}`, `模型：${model}`, `匯出時間：${exportedAt}`, ""];

    visibleMessages.forEach((message) => {
      const label = message.role === "assistant" ? "AI 回覆" : "使用者提問";
      lines.push(isMarkdown ? `## ${label}` : `【${label}】`, "", message.content.trim(), "");
    });

    const safeName = title
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80) || "ai-summary";
    const extension = isMarkdown ? "md" : "txt";
    const blob = new Blob([lines.join("\n")], {
      type: isMarkdown ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8"
    });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `${safeName}.${extension}`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

    const exportText = shadowRoot?.getElementById("ws-export-btn-text");
    if (exportText) {
      const originalText = exportText.textContent;
      exportText.textContent = fl().exported;
      setTimeout(() => {
        if (exportText) exportText.textContent = originalText;
      }, 1800);
    }
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
          setFloatingStatus("answer", { profile: msg.profileName || msg.model });
          renderStreamingBubble(assistantBubbleContent, currentStreamingText);
        } else if (msg.type === "CHUNK") {
          currentStreamingText += msg.text;
          renderStreamingBubble(assistantBubbleContent, currentStreamingText);
          setFloatingStatus("generating", { count: currentStreamingText.length });
        } else if (msg.type === "DONE") {
          isGenerating = false;
          finalizeAssistantStreaming(assistantBubbleContent);
          setFloatingStatus("completed", { count: currentStreamingText.length });
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
    scrollToBottom(true);
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
      <span>${isFirstTurn ? fl().pageSummary : fl().aiAnswer}</span>
      <button type="button" class="ws-btn-bubble-copy" title="${fl().copyShort}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <span>${fl().copyShort}</span>
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
        span.textContent = fl().copied;
        setTimeout(() => { span.textContent = fl().copyShort; }, 1600);
      });
    });

    scrollToBottom(true);
    return contentDiv;
  }

  // Render assistant streaming markdown
  function renderStreamingBubble(contentEl, text) {
    if (!contentEl) return;
    const shouldFollow = shouldAutoScroll();
    contentEl.innerHTML = parseMarkdown(text) + '<span class="ws-cursor-pulse"></span>';
    scrollToBottom(shouldFollow);
  }

  // Finalize assistant streaming
  function finalizeAssistantStreaming(contentEl) {
    const shouldFollow = shouldAutoScroll();
    if (contentEl && currentStreamingText) {
      contentEl.innerHTML = parseMarkdown(currentStreamingText);
      conversationHistory.push({ role: "assistant", content: currentStreamingText });
    }
    scrollToBottom(shouldFollow);
  }

  function shouldAutoScroll() {
    const body = shadowRoot.getElementById("ws-body-content");
    return body ? isNearBottom(body) : false;
  }

  function isNearBottom(body) {
    return body.scrollHeight - body.scrollTop - body.clientHeight <= AUTO_SCROLL_THRESHOLD;
  }

  function scrollToBottom(shouldFollow = null) {
    const body = shadowRoot.getElementById("ws-body-content");
    if (!body) return;

    if (shouldFollow === null) {
      shouldFollow = isNearBottom(body);
    }

    if (shouldFollow) {
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
    setFloatingStatus("error");

    if (code === "NO_API_KEY") {
      errorTitle.textContent = fl().noKey;
      errorMsg.textContent = message || fl().noKeyMessage;
      errorActions.innerHTML = `
        <button class="ws-btn-error-action" id="ws-btn-go-settings">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          ${fl().settingsAction}
        </button>
      `;
      shadowRoot.getElementById("ws-btn-go-settings").addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "OPEN_OPTIONS" });
      });
    } else {
      errorTitle.textContent = fl().requestFailed;
      errorMsg.textContent = message || fl().unexpected;
      errorActions.innerHTML = `
        <button class="ws-btn-error-action" id="ws-btn-err-retry">${fl().retryAction}</button>
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
      .replace(/\r\n?/g, "\n")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Protect complete code blocks while the lightweight Markdown parser handles other lines.
    const codeBlocks = [];
    escaped = escaped.replace(/```[^\n]*\n([\s\S]*?)```/g, (match, code) => {
      const codeIndex = codeBlocks.push(code.replace(/^\n/, "").replace(/\n$/, "")) - 1;
      return `\n@@WS_CODE_BLOCK_${codeIndex}@@\n`;
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
    const result = [];
    const listStack = [];
    let listIndentLevels = [];

    function closeLists(targetDepth = 0) {
      while (listStack.length > targetDepth) {
        const list = listStack.pop();
        if (list.itemOpen) result.push("</li>");
        result.push(`</${list.type}>`);
      }
    }

    function getListLevel(indentLength) {
      if (listStack.length === 0) {
        listIndentLevels = [indentLength];
        return 0;
      }
      const exactLevel = listIndentLevels.lastIndexOf(indentLength);
      if (exactLevel >= 0) return exactLevel;
      if (indentLength > listIndentLevels[listIndentLevels.length - 1]) {
        listIndentLevels.push(indentLength);
        return listIndentLevels.length - 1;
      }
      let level = 0;
      listIndentLevels.forEach((knownIndent, index) => {
        if (knownIndent <= indentLength) level = index;
      });
      return level;
    }

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      if (trimmed === "") continue;

      const codeBlockMatch = trimmed.match(/^@@WS_CODE_BLOCK_(\d+)@@$/);
      if (codeBlockMatch) {
        closeLists();
        listIndentLevels = [];
        result.push(`<pre><code>${codeBlocks[Number(codeBlockMatch[1])]}</code></pre>`);
        continue;
      }

      const listMatch = rawLine.match(/^(\s*)([\*\-\+]|\d+[\.\)])\s+(.*)$/);
      if (listMatch) {
        const indentLength = listMatch[1].replace(/\t/g, "    ").length;
        const level = getListLevel(indentLength);
        const type = /^\d/.test(listMatch[2]) ? "ol" : "ul";

        closeLists(level + 1);
        while (listStack.length <= level) {
          result.push(`<${type}>`);
          listStack.push({ type, itemOpen: false });
        }

        let currentList = listStack[level];
        if (currentList.type !== type) {
          if (currentList.itemOpen) result.push("</li>");
          result.push(`</${currentList.type}>`);
          listStack.pop();
          result.push(`<${type}>`);
          listStack.push({ type, itemOpen: false });
          currentList = listStack[level];
        } else if (currentList.itemOpen) {
          result.push("</li>");
        }

        result.push(`<li>${listMatch[3]}`);
        currentList.itemOpen = true;
        continue;
      }

      closeLists();
      listIndentLevels = [];

      if (trimmed.startsWith("<h") || trimmed.startsWith("<blockquote") || trimmed.startsWith("<pre") || trimmed.startsWith("</pre>")) {
        result.push(trimmed);
      } else {
        result.push(`<p>${trimmed}</p>`);
      }
    }

    closeLists();

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
