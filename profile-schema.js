// profile-schema.js - Shared profile, storage, and request validation helpers

(function (root) {
  "use strict";

  const CURRENT_PROFILE_SCHEMA_VERSION = 2;
  const MAX_PROFILES = 32;
  const MAX_PROFILE_ID_LENGTH = 100;
  const MAX_PROFILE_NAME_LENGTH = 120;
  const MAX_PROFILE_TEMPLATE_LENGTH = 40;
  const MAX_API_URL_LENGTH = 2048;
  const MAX_API_KEY_LENGTH = 4096;
  const MAX_MODEL_LENGTH = 200;
  const MAX_SYSTEM_PROMPT_LENGTH = 20000;
  const MAX_SYNC_PROFILE_PAYLOAD = 7500;
  const MAX_CHAT_MESSAGES = 64;
  const MAX_MESSAGE_CHARS = 20000;
  const MAX_TOTAL_MESSAGE_CHARS = 100000;
  const MAX_STREAM_CHARS = 200000;
  const MAX_SSE_BUFFER_CHARS = 1000000;

  const PROFILE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/;
  const RESERVED_PROFILE_IDS = new Set(["__proto__", "prototype", "constructor"]);

  function isPlainObject(value) {
    if (!value || typeof value !== "object") return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function hasOwn(value, key) {
    return isPlainObject(value) && Object.prototype.hasOwnProperty.call(value, key);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function makeError(code, message) {
    const error = new Error(message || code);
    error.code = code;
    return error;
  }

  function isValidProfileId(value) {
    return typeof value === "string" &&
      value.length > 0 &&
      value.length <= MAX_PROFILE_ID_LENGTH &&
      PROFILE_ID_PATTERN.test(value) &&
      !RESERVED_PROFILE_IDS.has(value);
  }

  function normalizeString(value, maxLength, fallback = "") {
    if (typeof value !== "string") return fallback;
    const normalized = value.trim();
    return normalized.length <= maxLength ? normalized : fallback;
  }

  function normalizeApiKey(value) {
    if (typeof value !== "string") return "";
    const normalized = value.trim();
    return normalized.length <= MAX_API_KEY_LENGTH ? normalized : "";
  }

  function normalizeNumber(value, fallback, minimum, maximum) {
    const number = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(maximum, Math.max(minimum, number));
  }

  function normalizeProfileRecord(rawProfile, fallbackProfile = {}, options = {}) {
    const source = isPlainObject(rawProfile) ? rawProfile : {};
    const fallback = isPlainObject(fallbackProfile) ? fallbackProfile : {};
    const fallbackId = isValidProfileId(fallback.id) ? fallback.id : "profile_recovered";
    const candidateId = typeof source.id === "string" ? source.id.trim() : "";
    const id = isValidProfileId(candidateId) ? candidateId : fallbackId;
    const fallbackName = normalizeString(fallback.name, MAX_PROFILE_NAME_LENGTH);
    const fallbackUrl = normalizeString(fallback.apiUrl, MAX_API_URL_LENGTH);
    const fallbackModel = normalizeString(fallback.model, MAX_MODEL_LENGTH);
    const fallbackPrompt = normalizeString(fallback.systemPrompt, MAX_SYSTEM_PROMPT_LENGTH);
    const profileNameMode = source.profileNameMode === "custom" ? "custom" : "default";
    const hasSystemPromptMode = source.systemPromptMode === "custom" || source.systemPromptMode === "default";
    const systemPromptMode = hasSystemPromptMode ? source.systemPromptMode : "";
    const profileNameTemplate = normalizeString(
      source.profileNameTemplate,
      MAX_PROFILE_TEMPLATE_LENGTH,
      normalizeString(fallback.profileNameTemplate, MAX_PROFILE_TEMPLATE_LENGTH)
    );
    const systemPromptLocale = normalizeString(
      source.systemPromptLocale,
      20,
      normalizeString(fallback.systemPromptLocale, 20)
    );

    const profile = {
      id,
      name: normalizeString(source.name, MAX_PROFILE_NAME_LENGTH, fallbackName),
      profileNameMode,
      apiFormat: source.apiFormat === "anthropic" ? "anthropic" : "openai",
      apiUrl: normalizeString(source.apiUrl, MAX_API_URL_LENGTH, fallbackUrl),
      model: normalizeString(source.model, MAX_MODEL_LENGTH, fallbackModel),
      systemPrompt: normalizeString(source.systemPrompt, MAX_SYSTEM_PROMPT_LENGTH, fallbackPrompt),
      maxTokens: Math.round(normalizeNumber(source.maxTokens, normalizeNumber(fallback.maxTokens, 2048, 1, 8192), 1, 8192)),
      temperature: normalizeNumber(source.temperature, normalizeNumber(fallback.temperature, 0.5, 0, 1), 0, 1)
    };

    if (profileNameTemplate) profile.profileNameTemplate = profileNameTemplate;
    if (hasSystemPromptMode) {
      profile.systemPromptMode = systemPromptMode;
      if (systemPromptLocale && systemPromptMode === "default") profile.systemPromptLocale = systemPromptLocale;
    }
    if (options.includeApiKey) profile.apiKey = normalizeApiKey(source.apiKey);

    return profile;
  }

  function sanitizeProfiles(rawProfiles, defaultProfiles) {
    const defaults = Array.isArray(defaultProfiles) && defaultProfiles.length > 0
      ? defaultProfiles
      : [{ id: "profile_recovered", name: "Recovered profile" }];
    const sourceProfiles = Array.isArray(rawProfiles) && rawProfiles.length > 0
      ? rawProfiles.slice(0, MAX_PROFILES)
      : clone(defaults).slice(0, MAX_PROFILES);
    const usedIds = new Set();
    let changed = !Array.isArray(rawProfiles) || rawProfiles.length === 0 || rawProfiles.length > MAX_PROFILES;

    const profiles = sourceProfiles.map((rawProfile, index) => {
      const fallback = defaults.find((profile) => profile.id === rawProfile?.id) || defaults[index % defaults.length] || defaults[0];
      let profile = normalizeProfileRecord(rawProfile, fallback, { includeApiKey: true });

      if (!isValidProfileId(profile.id) || usedIds.has(profile.id)) {
        let replacement = `profile_recovered_${index + 1}`;
        let suffix = 1;
        while (usedIds.has(replacement) || !isValidProfileId(replacement)) {
          replacement = `profile_recovered_${index + 1}_${suffix++}`;
        }
        profile.id = replacement;
        changed = true;
      }
      usedIds.add(profile.id);

      if (!isPlainObject(rawProfile) || JSON.stringify(rawProfile) !== JSON.stringify(profile)) {
        changed = true;
      }
      return profile;
    });

    return { profiles, changed };
  }

  function stripApiKey(profile) {
    const sanitized = normalizeProfileRecord(profile, profile, { includeApiKey: false });
    return sanitized;
  }

  function validateProfileRecord(rawProfile) {
    if (!isPlainObject(rawProfile)) throw makeError("INVALID_PROFILE_DATA", "Profile must be an object.");

    const stringFields = [
      ["id", MAX_PROFILE_ID_LENGTH],
      ["name", MAX_PROFILE_NAME_LENGTH],
      ["apiUrl", MAX_API_URL_LENGTH],
      ["model", MAX_MODEL_LENGTH],
      ["systemPrompt", MAX_SYSTEM_PROMPT_LENGTH]
    ];
    stringFields.forEach(([field, maxLength]) => {
      if (rawProfile[field] !== undefined &&
          (typeof rawProfile[field] !== "string" || rawProfile[field].trim().length > maxLength)) {
        throw makeError("INVALID_PROFILE_DATA", `Invalid profile field: ${field}`);
      }
    });

    if (!isValidProfileId(typeof rawProfile.id === "string" ? rawProfile.id.trim() : "")) {
      throw makeError("INVALID_PROFILE_DATA", "Invalid profile id.");
    }
    if (rawProfile.apiFormat !== undefined && !["anthropic", "openai"].includes(rawProfile.apiFormat)) {
      throw makeError("INVALID_PROFILE_DATA", "Invalid API format.");
    }
    if (rawProfile.profileNameMode !== undefined && !["default", "custom"].includes(rawProfile.profileNameMode)) {
      throw makeError("INVALID_PROFILE_DATA", "Invalid profile name mode.");
    }
    if (rawProfile.systemPromptMode !== undefined && !["default", "custom"].includes(rawProfile.systemPromptMode)) {
      throw makeError("INVALID_PROFILE_DATA", "Invalid system prompt mode.");
    }
    if (rawProfile.apiKey !== undefined &&
        (typeof rawProfile.apiKey !== "string" || rawProfile.apiKey.trim().length > MAX_API_KEY_LENGTH)) {
      throw makeError("INVALID_PROFILE_DATA", "Invalid API key.");
    }
    if (rawProfile.maxTokens !== undefined &&
        (!Number.isFinite(Number(rawProfile.maxTokens)) || Number(rawProfile.maxTokens) < 1 || Number(rawProfile.maxTokens) > 8192)) {
      throw makeError("INVALID_PROFILE_DATA", "Invalid max tokens value.");
    }
    if (rawProfile.temperature !== undefined &&
        (!Number.isFinite(Number(rawProfile.temperature)) || Number(rawProfile.temperature) < 0 || Number(rawProfile.temperature) > 1)) {
      throw makeError("INVALID_PROFILE_DATA", "Invalid temperature value.");
    }

    return normalizeProfileRecord(rawProfile, rawProfile, { includeApiKey: true });
  }

  function prepareProfilesForSave(rawProfiles, activeProfileId) {
    if (!Array.isArray(rawProfiles) || rawProfiles.length < 1 || rawProfiles.length > MAX_PROFILES) {
      throw makeError("INVALID_PROFILE_DATA", `Profiles must contain 1-${MAX_PROFILES} entries.`);
    }

    const profiles = rawProfiles.map(validateProfileRecord);
    const ids = new Set();
    profiles.forEach((profile) => {
      if (ids.has(profile.id)) throw makeError("INVALID_PROFILE_DATA", "Profile ids must be unique.");
      ids.add(profile.id);
    });

    if (typeof activeProfileId !== "string" || !ids.has(activeProfileId)) {
      throw makeError("INVALID_PROFILE_DATA", "Active profile id is invalid.");
    }

    const syncProfiles = profiles.map(stripApiKey);
    if (JSON.stringify(syncProfiles).length > MAX_SYNC_PROFILE_PAYLOAD) {
      throw makeError("STORAGE_QUOTA_EXCEEDED", "Profile settings exceed the sync storage limit.");
    }

    const apiKeys = {};
    profiles.forEach((profile) => {
      if (profile.apiKey) apiKeys[profile.id] = profile.apiKey;
    });

    return { profiles, syncProfiles, apiKeys, activeProfileId };
  }

  function normalizeKeyMap(rawKeyMap, allowedIds) {
    const allowed = new Set(Array.isArray(allowedIds) ? allowedIds : []);
    const keys = {};
    let changed = !isPlainObject(rawKeyMap);

    if (isPlainObject(rawKeyMap)) {
      Object.keys(rawKeyMap).forEach((id) => {
        const value = rawKeyMap[id];
        if (!allowed.has(id) || typeof value !== "string" || value.trim().length > MAX_API_KEY_LENGTH) {
          changed = true;
          return;
        }
        const normalized = value.trim();
        if (normalized) keys[id] = normalized;
        if (normalized !== value) changed = true;
      });
    }

    if (JSON.stringify(keys) !== JSON.stringify(rawKeyMap || {})) changed = true;
    return { keys, changed };
  }

  function prepareChatMessages(rawMessages) {
    if (!Array.isArray(rawMessages)) throw makeError("INVALID_MESSAGES", "Messages must be an array.");
    if (rawMessages.length > MAX_CHAT_MESSAGES) throw makeError("MESSAGE_LIMIT_EXCEEDED", "Too many messages.");

    const cleanMessages = [];
    let totalChars = 0;
    rawMessages.forEach((message) => {
      if (!isPlainObject(message)) return;
      if (message.role !== "user" && message.role !== "assistant") return;
      if (typeof message.content !== "string") return;

      const content = message.content.trim();
      if (!content) return;
      if (content.length > MAX_MESSAGE_CHARS) throw makeError("MESSAGE_TOO_LARGE", "A message is too large.");
      totalChars += content.length;
      if (totalChars > MAX_TOTAL_MESSAGE_CHARS) throw makeError("MESSAGE_LIMIT_EXCEEDED", "The conversation is too large.");

      const previous = cleanMessages[cleanMessages.length - 1];
      if (previous && previous.role === message.role) {
        const merged = `${previous.content}\n\n${content}`;
        if (merged.length > MAX_MESSAGE_CHARS) throw makeError("MESSAGE_TOO_LARGE", "A merged message is too large.");
        previous.content = merged;
      } else {
        cleanMessages.push({ role: message.role, content });
      }
    });

    if (cleanMessages.length === 0) throw makeError("EMPTY_MESSAGES", "Conversation is empty.");
    return cleanMessages;
  }

  root.AurofactProfileSchema = Object.freeze({
    CURRENT_PROFILE_SCHEMA_VERSION,
    MAX_PROFILES,
    MAX_API_KEY_LENGTH,
    MAX_STREAM_CHARS,
    MAX_SSE_BUFFER_CHARS,
    hasOwn,
    isPlainObject,
    isValidProfileId,
    makeError,
    normalizeApiKey,
    normalizeProfileRecord,
    sanitizeProfiles,
    stripApiKey,
    validateProfileRecord,
    prepareProfilesForSave,
    normalizeKeyMap,
    prepareChatMessages
  });
})(typeof self !== "undefined" ? self : globalThis);
