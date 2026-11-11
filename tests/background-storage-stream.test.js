const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectRoot = path.resolve(__dirname, "..");
const events = () => ({ listeners: [], addListener(listener) { this.listeners.push(listener); } });

function createBackground() {
  const state = { sync: {}, local: {} };
  const failures = [];
  const calls = [];
  const runtime = { id: "extension-id", lastError: null };
  let context;
  const storageArea = (area) => ({
    get(keys, callback) {
      setTimeout(() => {
        const result = {};
        for (const key of keys) {
          if (Object.prototype.hasOwnProperty.call(state[area], key)) result[key] = state[area][key];
        }
        callback(toVmValue(context, result));
      }, 2);
    },
    set(values, callback) {
      calls.push(`set:${area}`);
      setTimeout(() => {
        const failureIndex = failures.findIndex((failure) => failure.area === area && failure.operation === "set");
        if (failureIndex >= 0) {
          const failure = failures[failureIndex];
          if (failure.skip > 0) {
            failure.skip--;
            runtime.lastError = null;
          } else {
            failures.splice(failureIndex, 1);
            if (failure.applyBeforeError) {
              Object.assign(state[area], JSON.parse(JSON.stringify(values)));
            }
            runtime.lastError = { message: failure.message || "storage failure" };
          }
        } else {
          Object.assign(state[area], JSON.parse(JSON.stringify(values)));
          runtime.lastError = null;
        }
        callback();
        runtime.lastError = null;
      }, 5);
    },
    remove(keys, callback) {
      calls.push(`remove:${area}`);
      setTimeout(() => {
        const failureIndex = failures.findIndex((failure) => failure.area === area && failure.operation === "remove");
        if (failureIndex >= 0) {
          const [failure] = failures.splice(failureIndex, 1);
          runtime.lastError = { message: failure.message || "storage failure" };
        } else {
          for (const key of Array.isArray(keys) ? keys : [keys]) delete state[area][key];
          runtime.lastError = null;
        }
        callback();
        runtime.lastError = null;
      }, 2);
    }
  });

  const chrome = {
    runtime: Object.assign(runtime, {
      onInstalled: events(),
      onStartup: events(),
      onConnect: events(),
      onMessage: events(),
      getURL: (file) => `chrome-extension://extension-id/${file}`,
      openOptionsPage() {}
    }),
    storage: { sync: storageArea("sync"), local: storageArea("local") },
    contextMenus: { onClicked: events(), update() {}, removeAll(callback) { callback(); }, create() {} },
    commands: { onCommand: events() },
    permissions: { contains(_permissions, callback) { callback(true); } },
    tabs: { sendMessage: async () => {} },
    scripting: { executeScript: async () => {} }
  };
  context = {
    chrome,
    URL,
    AbortController,
    TextDecoder,
    TextEncoder,
    setTimeout,
    clearTimeout,
    console: { error() {}, warn() {} },
    fetch: async () => { throw new Error("Unexpected fetch"); }
  };
  vm.createContext(context);
  context.importScripts = (...files) => {
    for (const file of files) {
      vm.runInContext(fs.readFileSync(path.join(projectRoot, file), "utf8"), context, { filename: file });
    }
  };
  vm.runInContext(fs.readFileSync(path.join(projectRoot, "background.js"), "utf8"), context, {
    filename: "background.js"
  });

  return { context, state, failures, calls, listener: chrome.runtime.onMessage.listeners[0] };
}

function toVmValue(context, value) {
  context.__testPayload = JSON.stringify(value);
  const converted = vm.runInContext("JSON.parse(__testPayload)", context);
  delete context.__testPayload;
  return converted;
}

const optionsSender = {
  id: "extension-id",
  url: "chrome-extension://extension-id/options.html"
};

function profile(model, apiKey = "") {
  return {
    id: "profile_test",
    name: "Test profile",
    profileNameMode: "custom",
    apiFormat: "anthropic",
    apiUrl: "https://api.example.test/v1/messages",
    model,
    apiKey,
    systemPrompt: "Test prompt",
    systemPromptMode: "custom",
    maxTokens: 128,
    temperature: 0.5
  };
}

function sendMessage(background, request) {
  return new Promise((resolve) => {
    const keepChannelOpen = background.listener(toVmValue(background.context, request), optionsSender, resolve);
    assert.strictEqual(keepChannelOpen, true);
  });
}

async function testStorageWritesSerializeAndKeepKeysLocal() {
  const background = createBackground();
  const first = sendMessage(background, {
    action: "SAVE_ALL_PROFILES", profiles: [profile("first", "KEY_ONE")],
    activeProfileId: "profile_test", uiLocale: "en"
  });
  const second = sendMessage(background, {
    action: "SAVE_ALL_PROFILES", profiles: [profile("second", "KEY_TWO")],
    activeProfileId: "profile_test", uiLocale: "en"
  });
  const firstResult = await first; assert.strictEqual(firstResult.success, true, JSON.stringify(firstResult));
  assert.strictEqual((await second).success, true);
  assert.strictEqual(background.state.sync.profiles[0].model, "second");
  assert.strictEqual(background.state.local.profileApiKeys.profile_test, "KEY_TWO");
  assert.strictEqual(JSON.stringify(background.state.sync).includes("KEY_TWO"), false);
  assert.deepStrictEqual(background.calls.slice(0, 6), [
    "set:local", "set:sync", "remove:sync", "set:local", "set:sync", "remove:sync"
  ]);
}

async function testSyncFailureRestoresExistingLocalMap() {
  const background = createBackground();
  background.state.local.profileApiKeys = { profile_test: "OLD_KEY", orphan: "" };
  background.failures.push({ area: "sync", operation: "set", applyBeforeError: true });
  const result = await sendMessage(background, {
    action: "SAVE_ALL_PROFILES", profiles: [profile("new", "NEW_KEY")],
    activeProfileId: "profile_test", uiLocale: "en"
  });
  assert.deepStrictEqual(JSON.parse(JSON.stringify(background.state.local.profileApiKeys)), {
    profile_test: "OLD_KEY", orphan: ""
  });
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error, "PROFILE_SAVE_PARTIAL");
  assert.strictEqual(result.status, "PARTIAL");
  assert.strictEqual(background.state.sync.profiles[0].model, "new");
  assert.strictEqual(JSON.stringify(result).includes("NEW_KEY"), false);
  assert.strictEqual(JSON.stringify(result).includes("OLD_KEY"), false);
}

async function testFailedRecoveryReportsPartial() {
  const background = createBackground();
  background.state.local.profileApiKeys = { profile_test: "OLD_KEY" };
  background.failures.push(
    { area: "sync", operation: "set" },
    { area: "local", operation: "set", skip: 1 }
  );
  const result = await sendMessage(background, {
    action: "SAVE_ALL_PROFILES", profiles: [profile("new", "NEW_KEY")],
    activeProfileId: "profile_test", uiLocale: "en"
  });
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error, "PROFILE_SAVE_PARTIAL");
  assert.strictEqual(result.status, "PARTIAL");
  assert.strictEqual(background.state.local.profileApiKeys.profile_test, "OLD_KEY");
}

async function testLocalWriteFailureRestoresOrReportsPartial() {
  const background = createBackground();
  background.state.local.profileApiKeys = { profile_test: "OLD_KEY" };
  background.failures.push({ area: "local", operation: "set" });
  const result = await sendMessage(background, {
    action: "SAVE_ALL_PROFILES", profiles: [profile("new", "NEW_KEY")],
    activeProfileId: "profile_test", uiLocale: "en"
  });
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error, "PROFILE_SAVE_FAILED");
  assert.strictEqual(background.state.local.profileApiKeys.profile_test, "OLD_KEY");
  assert.strictEqual(background.state.sync.profiles, undefined);
}

async function testMissingLocalMapIsRestoredAsMissing() {
  const background = createBackground();
  background.failures.push({ area: "sync", operation: "set" });
  const result = await sendMessage(background, {
    action: "SAVE_ALL_PROFILES", profiles: [profile("new", "NEW_KEY")],
    activeProfileId: "profile_test", uiLocale: "en"
  });
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error, "PROFILE_SAVE_PARTIAL");
  assert.strictEqual(result.status, "PARTIAL");
  assert.strictEqual(Object.prototype.hasOwnProperty.call(background.state.local, "profileApiKeys"), false);
}

async function testLegacyRemovalFailureDoesNotFailCommittedSave() {
  const background = createBackground();
  background.state.sync.apiKey = "LEGACY_KEY";
  background.failures.push({ area: "sync", operation: "remove" });
  const result = await sendMessage(background, {
    action: "SAVE_ALL_PROFILES", profiles: [profile("saved", "LOCAL_KEY")],
    activeProfileId: "profile_test", uiLocale: "en"
  });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.warning, "LEGACY_CLEANUP_FAILED");
  assert.strictEqual(background.state.sync.apiKey, "LEGACY_KEY");
  assert.strictEqual(background.state.local.profileApiKeys.profile_test, "LOCAL_KEY");
}

function makeStreamResponse(events, { status = 200, statusText = "OK" } = {}) {
  const bytes = new TextEncoder().encode(events);
  let sent = false;
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    body: {
      getReader() {
        return { async read() {
          if (sent) return { done: true };
          sent = true;
          return { done: false, value: bytes };
        } };
      }
    },
    async text() { return events; },
    async json() { return JSON.parse(events); }
  };
}

async function runStream(background, sse) {
  const streamProfile = toVmValue(background.context, { ...profile("test-model", "TEST_KEY"), maxTokens: 128 });
  background.context.getProfileConfig = async () => ({
    profiles: [streamProfile], activeProfile: streamProfile, uiLocale: "en"
  });
  background.context.fetch = async () => makeStreamResponse(sse);
  const messages = [];
  await background.context.streamChat({ postMessage: (message) => messages.push(message) }, null,
    toVmValue(background.context, [{ role: "user", content: "Hello" }]), "profile_test");
  return messages;
}

async function testEmptyAndNormalStreams() {
  const thinkingOnly = await runStream(createBackground(),
    'data:{"type":"content_block_delta","delta":{"type":"thinking_delta","thinking":"reasoning"}}\n' +
    'data: {"type":"message_delta","delta":{"stop_reason":"max_tokens"}}');
  assert.strictEqual(thinkingOnly.at(-1).type, "ERROR");
  assert.strictEqual(thinkingOnly.at(-1).errorCode, "MAX_TOKENS_NO_CONTENT");
  assert.match(thinkingOnly.at(-1).message, /可能.*token/i);

  const atUiTokenLimit = createBackground();
  atUiTokenLimit.context.getProfileConfig = async () => {
    const tokenLimitProfile = toVmValue(atUiTokenLimit.context, { ...profile("test-model", "TEST_KEY"), maxTokens: 8192 });
    return { profiles: [tokenLimitProfile], activeProfile: tokenLimitProfile, uiLocale: "en" };
  };
  atUiTokenLimit.context.fetch = async () => makeStreamResponse(
    'data: {"type":"message_delta","delta":{"stop_reason":"max_tokens"}}'
  );
  const limitMessages = [];
  await atUiTokenLimit.context.streamChat({ postMessage: (message) => limitMessages.push(message) }, null,
    toVmValue(atUiTokenLimit.context, [{ role: "user", content: "Hello" }]), "profile_test");
  assert.match(limitMessages.at(-1).message, /8192.*縮短輸入或更換模型/);

  const empty = await runStream(createBackground(),
    'data: {"type":"message_delta","delta":{"stop_reason":"end_turn"}}');
  assert.strictEqual(empty.at(-1).type, "ERROR");
  assert.strictEqual(empty.at(-1).errorCode, "EMPTY_RESPONSE");

  const normal = await runStream(createBackground(),
    'data:{"type":"content_block_delta","delta":{"type":"text_delta","text":"Hello"}}');
  assert.deepStrictEqual(normal.filter((message) => message.type === "CHUNK").map((message) => message.text), ["Hello"]);
  assert.strictEqual(normal.at(-1).type, "DONE");
}

async function testStreamLimitErrorEscapesJsonParseCatch() {
  const background = createBackground();
  const largeText = "x".repeat(200001);
  const messages = await runStream(background,
    `data: ${JSON.stringify({ type: "content_block_delta", delta: { type: "text_delta", text: largeText } })}\n`);
  assert.strictEqual(messages.at(-1).type, "ERROR");
  assert.strictEqual(messages.at(-1).errorCode, "STREAM_LIMIT_EXCEEDED");
}

async function testConnectionTestSeparatesConnectionFromBodyText() {
  const background = createBackground();
  background.context.fetch = async () => ({
    ok: true,
    json: async () => ({ model: "thinking-model", content: [{ type: "thinking", thinking: "internal" }] })
  });
  const result = await background.context.testProfileConnection(toVmValue(background.context, profile("thinking-model", "TEST_KEY")), "en");
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.connected, true);
  assert.strictEqual(result.hasResponseText, false);
  assert.strictEqual(result.reply, "");
}

async function testHttpErrorsReadBodyOnlyOnce() {
  for (const invoke of [
    async (background) => {
      background.context.getProfileConfig = async () => ({
        profiles: [profile("test-model", "TEST_KEY")], activeProfile: profile("test-model", "TEST_KEY"), uiLocale: "en"
      });
      let reads = 0;
      background.context.fetch = async () => ({
        ok: false, status: 502, statusText: "Bad Gateway",
        async text() { reads++; return "upstream unavailable"; },
        async json() { throw new Error("body consumed"); }
      });
      const messages = [];
      await background.context.streamChat({ postMessage: (message) => messages.push(message) }, null,
        toVmValue(background.context, [{ role: "user", content: "Hello" }]), "profile_test");
      assert.strictEqual(reads, 1);
      assert.strictEqual(messages.at(-1).errorCode, "API_HTTP_ERROR");
      assert.match(messages.at(-1).message, /upstream unavailable/);
    },
    async (background) => {
      let reads = 0;
      background.context.fetch = async () => ({
        ok: false, status: 502, statusText: "Bad Gateway",
        async text() { reads++; return "upstream unavailable"; },
        async json() { throw new Error("body consumed"); }
      });
      const result = await background.context.testProfileConnection(toVmValue(background.context, profile("test-model", "TEST_KEY")), "en");
      assert.strictEqual(reads, 1);
      assert.strictEqual(result.success, false);
      assert.match(result.error, /upstream unavailable/);
    }
  ]) await invoke(createBackground());
}

(async () => {
  await testStorageWritesSerializeAndKeepKeysLocal();
  await testSyncFailureRestoresExistingLocalMap();
  await testFailedRecoveryReportsPartial();
  await testLocalWriteFailureRestoresOrReportsPartial();
  await testMissingLocalMapIsRestoredAsMissing();
  await testLegacyRemovalFailureDoesNotFailCommittedSave();
  await testEmptyAndNormalStreams();
  await testStreamLimitErrorEscapesJsonParseCatch();
  await testConnectionTestSeparatesConnectionFromBodyText();
  await testHttpErrorsReadBodyOnlyOnce();
  console.log("Background storage and stream behavior checks passed.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
