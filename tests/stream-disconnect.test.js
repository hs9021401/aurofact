const assert = require("assert");
const fs = require("fs");
const path = require("path");

const contentSource = fs.readFileSync(path.join(__dirname, "..", "content.js"), "utf8");

function extractBlockBody(source, startIndex, description) {
  const bodyStart = source.indexOf("{", startIndex);
  assert.notStrictEqual(bodyStart, -1, `${description} should have a body`);
  let depth = 0;
  let bodyEnd = -1;
  for (let index = bodyStart; index < source.length; index++) {
    if (source[index] === "{") depth++;
    if (source[index] === "}" && --depth === 0) {
      bodyEnd = index;
      break;
    }
  }
  assert.notStrictEqual(bodyEnd, -1, `${description} should be balanced`);
  return source.slice(bodyStart + 1, bodyEnd);
}

const disconnectStart = contentSource.indexOf("port.onDisconnect.addListener(() => {");
assert.notStrictEqual(disconnectStart, -1, "stream disconnect handler should exist");
const handlerBody = extractBlockBody(contentSource, disconnectStart, "stream disconnect handler");
const runDisconnectHandler = new Function("scope", `with (scope) { return () => {${handlerBody}\n}; }`);

const executeStart = contentSource.indexOf("function executeStreamRequest()");
const catchStart = contentSource.indexOf("} catch (err) {", executeStart);
assert.notStrictEqual(catchStart, -1, "stream request synchronous catch should exist");
const catchBody = extractBlockBody(contentSource, catchStart, "stream request catch");
const runSynchronousCatch = new Function("scope", "err", `with (scope) { return (() => {${catchBody}\n})(); }`);

function createScenario({ requestId = 1, currentRequestId = 1, activePort = true, generating = true, text = "" } = {}) {
  const effects = [];
  const port = {};
  const scope = {
    requestId,
    currentStreamRequestId: currentRequestId,
    currentPort: activePort ? port : {},
    isGenerating: generating,
    currentStreamingText: text,
    port,
    assistantBubbleContent: {
      closest(selector) {
        effects.push(["closest", selector]);
        return { remove: () => effects.push(["remove"] ) };
      }
    },
    finalizeAssistantStreaming: (...args) => effects.push(["finalize", ...args]),
    showErrorState: (...args) => effects.push(["error", ...args]),
    updateInputState: (...args) => effects.push(["input", ...args])
  };
  return { handler: runDisconnectHandler(scope), scope, effects, port };
}

// Unexpected empty disconnect removes the empty assistant turn and displays the localized request error.
{
  const scenario = createScenario();
  scenario.handler();
  assert.strictEqual(scenario.scope.isGenerating, false);
  assert.strictEqual(scenario.scope.currentPort, null);
  assert.deepStrictEqual(scenario.effects, [
    ["closest", ".ws-msg-row"],
    ["remove"],
    ["error", "CONNECTION_FAILED"],
    ["input", true]
  ]);
}

// Preserve streamed text on an interrupted response without treating the partial text as conversation history.
{
  const scenario = createScenario({ text: "partial response" });
  scenario.handler();
  assert.deepStrictEqual(scenario.effects, [
    ["finalize", scenario.scope.assistantBubbleContent, false],
    ["error", "CONNECTION_FAILED"],
    ["input", true]
  ]);
}

// A user stop or a delayed disconnect from an older port must not affect the active request.
for (const options of [
  { generating: false },
  { requestId: 1, currentRequestId: 2 },
  { activePort: false }
]) {
  const scenario = createScenario(options);
  scenario.handler();
  assert.deepStrictEqual(scenario.effects, []);
  assert.strictEqual(scenario.scope.isGenerating, options.generating ?? true);
}

assert.match(contentSource, /currentStreamRequestId\+\+/);
assert.match(contentSource, /requestId !== currentStreamRequestId \|\| currentPort !== port \|\| !isGenerating/);
assert.match(contentSource, /showErrorState\("CONNECTION_FAILED"\)/);

// Synchronous connect/postMessage failures leave the request idle and remove its empty bubble.
for (const withPort of [false, true]) {
  const effects = [];
  const port = withPort ? { disconnect: () => effects.push(["disconnect"]) } : null;
  const scope = {
    requestId: 7,
    currentStreamRequestId: 7,
    currentPort: port,
    isGenerating: true,
    currentStreamingText: "",
    assistantBubbleContent: {
      closest: (selector) => {
        effects.push(["closest", selector]);
        return { remove: () => effects.push(["remove"]) };
      }
    },
    finalizeAssistantStreaming: (...args) => effects.push(["finalize", ...args]),
    showErrorState: (...args) => effects.push(["error", ...args]),
    updateInputState: (...args) => effects.push(["input", ...args])
  };
  runSynchronousCatch(scope, new Error("port failure"));
  assert.strictEqual(scope.isGenerating, false);
  assert.strictEqual(scope.currentPort, null);
  assert.strictEqual(scope.currentStreamRequestId, 8);
  assert.deepStrictEqual(effects, [
    ...(withPort ? [["disconnect"]] : []),
    ["closest", ".ws-msg-row"],
    ["remove"],
    ["error", "CONNECTION_FAILED", "無法建立通訊: port failure"],
    ["input", true]
  ]);
}

console.log("Stream disconnect regression checks passed.");
