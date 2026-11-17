const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectRoot = path.resolve(__dirname, "..");
const helperPath = path.join(projectRoot, "standalone-context.js");
const contentSource = fs.readFileSync(path.join(projectRoot, "content.js"), "utf8");
const backgroundSource = fs.readFileSync(path.join(projectRoot, "background.js"), "utf8");
const popupSource = fs.readFileSync(path.join(projectRoot, "popup.js"), "utf8");
const buildSource = fs.readFileSync(path.join(projectRoot, "build_package.py"), "utf8");

assert.ok(fs.existsSync(helperPath), "standalone-context.js should provide the tested prompt seam");

const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(helperPath, "utf8"), context);

const standaloneContext = context.AurofactStandaloneContext;
assert.ok(standaloneContext, "standalone context helper should be exported");

assert.strictEqual(
  standaloneContext.shouldUseCurrentPageContext("分析此頁面的內容"),
  true,
  "an explicit current-page analysis request should load page context"
);
assert.strictEqual(
  standaloneContext.shouldUseCurrentPageContext("請分析這個關於 Python 內容的頁面"),
  true,
  "a descriptive current-page request should load page context"
);
assert.strictEqual(
  standaloneContext.shouldUseCurrentPageContext("請解釋 Python 的 list comprehension"),
  false,
  "a general question should remain a blank conversation"
);

const extraction = {
  title: "Python 教學",
  url: "https://example.test/python",
  text: "這是 Python 頁面的正文。"
};
const prompt = standaloneContext.buildPageAwarePrompt(
  "分析此頁面的內容",
  extraction,
  { pageBody: "【網頁正文內容】" },
  (value) => `[UNTRUSTED]\n${value}\n[/UNTRUSTED]`
);

assert.match(prompt, /分析此頁面的內容/);
assert.match(prompt, /Python 教學/);
assert.match(prompt, /這是 Python 頁面的正文。/);
assert.match(prompt, /\[UNTRUSTED\]/);

const boundedPrompt = standaloneContext.buildPageAwarePrompt(
  "分析此頁面的內容",
  { ...extraction, text: "正文".repeat(12000) },
  { pageBody: "【網頁正文內容】" },
  (value) => `[UNTRUSTED]\n${value}\n[/UNTRUSTED]`,
  (prefix, data) => ({ content: `${prefix}[UNTRUSTED]${data.slice(0, 100)}[TRUNCATED][/UNTRUSTED]` })
);
assert.match(boundedPrompt, /TRUNCATED/);

assert.match(contentSource, /STANDALONE_CONTEXT\.shouldUseCurrentPageContext/);
assert.match(contentSource, /extractPageContent\(false, null\)/);
assert.match(contentSource, /const isPageSummary = isFirstTurn && lastExtractionContext/);
assert.match(backgroundSource, /["']standalone-context\.js["']/);
const popupInjection = popupSource.match(/files:\s*\[([^\]]+)\]/)?.[1] || "";
for (const dependency of ["i18n.js", "youtube-utils.js", "prompt-safety.js", "request-limits.js", "input-behavior.js", "standalone-context.js", "content.js"]) {
  assert.ok(popupInjection.includes(`"${dependency}"`), `popup injection should include ${dependency}`);
}
assert.ok(popupInjection.indexOf("request-limits.js") < popupInjection.indexOf("content.js"), "request limits must load before content.js");
assert.ok(popupInjection.indexOf("standalone-context.js") < popupInjection.indexOf("content.js"), "standalone context must load before content.js");
assert.match(buildSource, /["']standalone-context\.js["']/);

console.log("Standalone page-context regression checks passed.");
