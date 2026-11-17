// request-limits.js - Keep content-side prompts within profile-schema request limits
(function (root) {
  "use strict";

  const MAX_MESSAGES = 64;
  const MAX_MESSAGE_CHARS = 40000;
  const MAX_TOTAL_MESSAGE_CHARS = 100000;
  const TRUNCATION_NOTICE = "\n[…內容過長，已截取可分析範圍…]";

  function buildBoundedUntrustedPrompt(prefix, value, wrapUntrustedContent, maxChars = MAX_MESSAGE_CHARS) {
    const trustedPrefix = prefix === null || prefix === undefined ? "" : String(prefix);
    const untrusted = value === null || value === undefined ? "" : String(value);
    if (typeof wrapUntrustedContent !== "function") throw new TypeError("An untrusted-content wrapper is required.");

    const build = (text) => `${trustedPrefix}${wrapUntrustedContent(text)}`;
    const complete = build(untrusted);
    if (complete.length <= maxChars) return { content: complete, truncated: false };
    if (trustedPrefix.length + wrapUntrustedContent(TRUNCATION_NOTICE).length > maxChars) return null;

    let low = 0;
    let high = untrusted.length;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (build(`${untrusted.slice(0, middle)}${TRUNCATION_NOTICE}`).length <= maxChars) low = middle;
      else high = middle - 1;
    }
    return { content: build(`${untrusted.slice(0, low)}${TRUNCATION_NOTICE}`), truncated: true };
  }

  function getConversationLimitError(messages) {
    if (!Array.isArray(messages) || messages.length > MAX_MESSAGES) return "MESSAGE_LIMIT_EXCEEDED";
    let total = 0;
    let previousRole = "";
    let previousLength = 0;
    for (const message of messages) {
      if (!message || (message.role !== "user" && message.role !== "assistant") || typeof message.content !== "string") continue;
      const content = message.content.trim();
      if (!content) continue;
      if (content.length > MAX_MESSAGE_CHARS) return "MESSAGE_TOO_LARGE";
      total += content.length;
      if (total > MAX_TOTAL_MESSAGE_CHARS) return "MESSAGE_LIMIT_EXCEEDED";
      if (message.role === previousRole) {
        if (previousLength + 2 + content.length > MAX_MESSAGE_CHARS) return "MESSAGE_TOO_LARGE";
        previousLength += 2 + content.length;
      } else {
        previousRole = message.role;
        previousLength = content.length;
      }
    }
    return "";
  }

  root.AurofactRequestLimits = Object.freeze({
    MAX_MESSAGES,
    MAX_MESSAGE_CHARS,
    MAX_TOTAL_MESSAGE_CHARS,
    TRUNCATION_NOTICE,
    buildBoundedUntrustedPrompt,
    getConversationLimitError
  });
})(typeof self !== "undefined" ? self : globalThis);
