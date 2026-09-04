const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectRoot = path.resolve(__dirname, "..");
const context = { URL };
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(projectRoot, "profile-view.js"), "utf8"),
  context
);

const profileView = context.AurofactProfileView;
assert.ok(profileView);

assert.strictEqual(profileView.isHttpEndpoint("http://localhost:11434/v1"), true);
assert.strictEqual(profileView.isHttpEndpoint("https://api.example.com/v1"), false);
assert.strictEqual(profileView.isHttpEndpoint("not-a-url"), false);
assert.strictEqual(profileView.isLocalEndpoint("http://localhost:11434/v1"), true);
assert.strictEqual(profileView.isLocalEndpoint("http://127.0.0.1:8000/v1"), true);
assert.strictEqual(profileView.isLocalEndpoint("http://[::1]:8000/v1"), true);
assert.strictEqual(profileView.isLocalEndpoint("https://evil-localhost.example/v1"), false);

const fullProfile = {
  id: "profile-test",
  name: "Office profile",
  model: "example-model",
  apiFormat: "openai",
  apiUrl: "https://api.example.com/v1/chat/completions",
  apiKey: "SECRET_API_KEY",
  systemPrompt: "SECRET_SYSTEM_PROMPT",
  customHeaders: { "X-Internal": "SECRET_HEADER" }
};

const publicProfile = profileView.toPublicProfile(fullProfile);
assert.deepStrictEqual(
  JSON.parse(JSON.stringify(publicProfile)),
  {
    id: "profile-test",
    name: "Office profile",
    model: "example-model",
    apiFormat: "openai",
    hasKey: true,
    isLocal: false
  }
);

const serializedPublicProfile = JSON.stringify(publicProfile);
assert.ok(!serializedPublicProfile.includes("SECRET_API_KEY"));
assert.ok(!serializedPublicProfile.includes("apiUrl"));
assert.ok(!serializedPublicProfile.includes("systemPrompt"));
assert.ok(!serializedPublicProfile.includes("customHeaders"));

const publicPayload = profileView.toPublicProfilePayload({
  profiles: [fullProfile],
  activeProfileId: "profile-test",
  activeProfile: fullProfile
});
assert.strictEqual(publicPayload.profiles[0].hasKey, true);
assert.strictEqual(publicPayload.activeProfile.hasKey, true);
assert.ok(!JSON.stringify(publicPayload).includes("SECRET_API_KEY"));

const backgroundSource = fs.readFileSync(path.join(projectRoot, "background.js"), "utf8");
assert.match(backgroundSource, /GET_PUBLIC_PROFILES/);
assert.match(backgroundSource, /GET_PROFILES_FOR_OPTIONS/);
assert.match(backgroundSource, /PROFILE_VIEW\.toPublicProfilePayload/);
assert.match(backgroundSource, /PROFILE_VIEW\.isLocalProfile/);

const optionsSource = fs.readFileSync(path.join(projectRoot, "options.js"), "utf8");
assert.match(optionsSource, /updateEndpointWarning/);
assert.match(optionsSource, /PROFILE_VIEW\.isHttpEndpoint/);

const optionsHtml = fs.readFileSync(path.join(projectRoot, "options.html"), "utf8");
assert.match(optionsHtml, /id="prof-url-warning"/);
assert.match(optionsHtml, /data-i18n="httpEndpointWarning"/);

const optionsCss = fs.readFileSync(path.join(projectRoot, "options.css"), "utf8");
assert.match(optionsCss, /\.endpoint-warning/);

console.log("Profile data-boundary checks passed.");
