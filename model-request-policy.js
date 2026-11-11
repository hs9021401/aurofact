// Model-specific request settings for providers with nonstandard token accounting.
(() => {
  const MINIMAX_M31_FLASH_MODEL = "minimax-m3.1-flash";
  // M3.1 Flash counts hidden thinking tokens against max_tokens.
  const MINIMAX_M31_FLASH_MIN_MAX_TOKENS = 4096;
  const DEFAULT_MIN_MAX_TOKENS = 512;

  function isMiniMaxM31Flash(modelName) {
    return String(modelName || "").trim().toLowerCase() === MINIMAX_M31_FLASH_MODEL;
  }

  function getMinimumMaxTokens(modelName, apiFormat) {
    return String(apiFormat || "").trim().toLowerCase() === "anthropic" && isMiniMaxM31Flash(modelName)
      ? MINIMAX_M31_FLASH_MIN_MAX_TOKENS
      : DEFAULT_MIN_MAX_TOKENS;
  }

  function getAnthropicRequestOptions(modelName, configuredMaxTokens) {
    const parsedMaxTokens = Number(configuredMaxTokens);
    const maxTokens = Number.isFinite(parsedMaxTokens) && parsedMaxTokens > 0
      ? Math.floor(parsedMaxTokens)
      : 2048;

    if (!isMiniMaxM31Flash(modelName)) {
      return { max_tokens: maxTokens };
    }

    return {
      max_tokens: Math.max(maxTokens, MINIMAX_M31_FLASH_MIN_MAX_TOKENS),
      output_config: { effort: "low" }
    };
  }

  globalThis.AurofactModelRequestPolicy = Object.freeze({
    getAnthropicRequestOptions,
    getMinimumMaxTokens
  });
})();
