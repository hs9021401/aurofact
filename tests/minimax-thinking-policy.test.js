const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectRoot = path.resolve(__dirname, "..");
const policyPath = path.join(projectRoot, "model-request-policy.js");
assert.ok(fs.existsSync(policyPath), "model request policy module must exist");

const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(policyPath, "utf8"), context);

const policy = context.AurofactModelRequestPolicy;
assert.ok(policy, "model request policy must be exposed to the service worker");

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(policy.getAnthropicRequestOptions("MiniMax-M3.1-Flash", 2048))),
  {
    max_tokens: 4096,
    output_config: { effort: "low" }
  }
);
assert.strictEqual(policy.getMinimumMaxTokens("MiniMax-M3.1-Flash", "anthropic"), 4096);
assert.strictEqual(policy.getMinimumMaxTokens("MiniMax-M3.1-Flash", "openai"), 512);
assert.strictEqual(policy.getMinimumMaxTokens("MiniMax-M3", "anthropic"), 512);

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(policy.getAnthropicRequestOptions("  minimax-m3.1-flash  ", 8192))),
  {
    max_tokens: 8192,
    output_config: { effort: "low" }
  }
);

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(policy.getAnthropicRequestOptions("MiniMax-M3", 2048))),
  { max_tokens: 2048 }
);
assert.deepStrictEqual(
  JSON.parse(JSON.stringify(policy.getAnthropicRequestOptions("claude-sonnet-5", 3072))),
  { max_tokens: 3072 }
);

const backgroundSource = fs.readFileSync(path.join(projectRoot, "background.js"), "utf8");
assert.match(backgroundSource, /model-request-policy\.js/);
assert.match(backgroundSource, /getAnthropicRequestOptions\(modelName, maxTokens\)/);

const optionsSource = fs.readFileSync(path.join(projectRoot, "options.js"), "utf8");
assert.match(optionsSource, /getMinimumMaxTokens/);

const optionsHtml = fs.readFileSync(path.join(projectRoot, "options.html"), "utf8");
assert.match(optionsHtml, /model-request-policy\.js/);
assert.ok(
  optionsHtml.indexOf("model-request-policy.js") < optionsHtml.indexOf("options.js"),
  "options page must load the policy before options.js"
);

const packageSource = fs.readFileSync(path.join(projectRoot, "build_package.py"), "utf8");
assert.match(packageSource, /"model-request-policy\.js"/);

console.log("MiniMax M3.1 Flash request policy checks passed.");
