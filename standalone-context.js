// standalone-context.js - Lazy current-page context for blank conversations

(function (root) {
  "use strict";

  const PAGE_REFERENCE_PATTERNS = Object.freeze([
    /(?:此|這個|這一|目前|當前|該|本)[\s\S]{0,40}(?:網頁|頁面|文章|本文)/u,
    /(?:網頁|頁面|文章|本文)[\s\S]{0,40}(?:分析|總結|摘要|解釋|內容)/u,
    /\b(?:this|current|the)\b[\s\S]{0,40}\b(?:page|web\s*page|webpage|article|document)\b/i,
    /\b(?:page|web\s*page|webpage|article|document)\b[\s\S]{0,60}\b(?:analy[sz]e|summari[sz]e|explain|review)\b/i,
    /(?:この|現在の)[\s\S]{0,40}(?:ページ|記事)/i,
    /(?:페이지|웹페이지|문서)[\s\S]{0,40}(?:분석|요약|설명)/i
  ]);

  function shouldUseCurrentPageContext(value) {
    const text = value === null || value === undefined ? "" : String(value).trim();
    return Boolean(text) && PAGE_REFERENCE_PATTERNS.some((pattern) => pattern.test(text));
  }

  function buildPageAwarePrompt(userRequest, extraction, labels, wrapUntrustedContent) {
    const request = userRequest === null || userRequest === undefined
      ? ""
      : String(userRequest).trim();
    const source = extraction || {};
    const promptLabels = labels || {};
    const pageData = [
      `${promptLabels.pageTitle || "【Page title】"}${source.title || "Untitled webpage"}`,
      `${promptLabels.pageUrl || "【Page URL】"}${source.url || "N/A"}`,
      "",
      `${promptLabels.pageBody || "【Webpage body】"}`,
      source.text || ""
    ].join("\n");
    const wrappedPageData = typeof wrapUntrustedContent === "function"
      ? wrapUntrustedContent(pageData)
      : pageData;

    return `${request}\n\n${wrappedPageData}`.trim();
  }

  root.AurofactStandaloneContext = Object.freeze({
    shouldUseCurrentPageContext,
    buildPageAwarePrompt
  });
})(typeof self !== "undefined" ? self : globalThis);
