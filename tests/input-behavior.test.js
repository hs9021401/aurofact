const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectRoot = path.resolve(__dirname, "..");
const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(projectRoot, "input-behavior.js"), "utf8"), context);

const inputBehavior = context.AurofactInputBehavior;
assert.ok(inputBehavior);

function action(event) {
  return inputBehavior.getTextInputAction({ type: "keydown", ...event });
}

// Enter should keep the textarea's native newline behavior.
assert.strictEqual(action({ key: "Enter" }), "allow");
assert.strictEqual(action({ key: "Enter", shiftKey: true }), "allow");

// Ctrl+Enter is the only Enter shortcut that submits.
assert.strictEqual(action({ key: "Enter", ctrlKey: true }), "send");
assert.strictEqual(action({ key: "Enter", ctrlKey: true, shiftKey: true }), "allow");
assert.strictEqual(action({ key: "Enter", metaKey: true }), "allow");

// IME composition and Escape retain their dedicated behavior.
assert.strictEqual(action({ key: "Enter", ctrlKey: true, isComposing: true }), "ignore");
assert.strictEqual(action({ key: "Escape" }), "close");

console.log("Input behavior regression checks passed.");
