// youtube-utils.js - DOM-only YouTube video and transcript helpers

(function (root) {
  "use strict";

  const TRANSCRIPT_SEGMENT_SELECTORS = Object.freeze([
    "macro-markers-panel-item-view-model",
    "transcript-segment-view-model",
    "[class*='MacroMarkersPanelItemViewModel']",
    "[class*='TranscriptSegmentViewModel']",
    "ytd-transcript-segment-renderer",
    "yt-transcript-segment-view-model",
    "ytm-transcript-segment-renderer",
    "[class*='transcript-segment-renderer']",
    "[class*='transcript-segment-view-model']"
  ]);

  const TRANSCRIPT_ROOT_SELECTORS = Object.freeze([
    ".ytSectionListRendererContents",
    "[data-target-id='expanded_transcript_view']",
    "ytd-transcript-renderer",
    "ytd-transcript-segment-list-renderer",
    "yt-transcript-segment-list-view-model",
    "[class*='transcript-panel']"
  ]);

  const TIMESTAMP_SELECTORS = Object.freeze([
    ".ytwTranscriptSegmentViewModelTimestamp",
    ".segment-timestamp",
    "[class*='segment-timestamp']",
    "[class*='timestamp']"
  ]);

  const TEXT_SELECTORS = Object.freeze([
    ".ytAttributedStringHost",
    ".segment-text",
    "[class*='segment-text']",
    "[role='text']"
  ]);

  function readText(node) {
    if (!node) return "";
    const innerText = typeof node.innerText === "string" ? node.innerText : "";
    const textContent = typeof node.textContent === "string" ? node.textContent : "";
    return (innerText || textContent)
      .replace(/\u200b/g, "")
      .replace(/\r\n?/g, "\n")
      .trim();
  }

  function normalizeSegmentText(value) {
    return String(value || "")
      .replace(/[\t ]+/g, " ")
      .replace(/\s*\n\s*/g, " ")
      .trim();
  }

  function queryAll(rootNode, selector) {
    try {
      return Array.from(rootNode?.querySelectorAll?.(selector) || []);
    } catch (error) {
      return [];
    }
  }

  function queryFirst(rootNode, selectors) {
    for (const selector of selectors) {
      try {
        const element = rootNode?.querySelector?.(selector);
        if (element) return element;
      } catch (error) {
        // Ignore an unsupported selector and continue with the remaining candidates.
      }
    }
    return null;
  }

  function isYouTubeVideoUrl(url) {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();

      if (hostname === "youtu.be") {
        return parsed.pathname.length > 1;
      }

      if (hostname !== "youtube.com" && !hostname.endsWith(".youtube.com")) {
        return false;
      }

      if (parsed.pathname === "/watch") {
        return Boolean(parsed.searchParams.get("v"));
      }

      return /^\/(?:shorts|live|embed)\//i.test(parsed.pathname);
    } catch (error) {
      return false;
    }
  }

  function parseTimestampLine(line) {
    const match = String(line || "").trim().match(
      /^((?:\d{1,2}:)?\d{1,2}:\d{2})(?:\s+|$)(.*)$/
    );

    if (!match) return null;

    return {
      timestamp: match[1],
      text: normalizeSegmentText(match[2])
    };
  }

  function extractSegment(node) {
    const timestampElement = queryFirst(node, TIMESTAMP_SELECTORS);
    const textElement = queryFirst(node, TEXT_SELECTORS);
    const rawText = readText(node);
    let timestamp = normalizeSegmentText(readText(timestampElement));
    let text = normalizeSegmentText(readText(textElement));

    if (!text) {
      const lines = rawText.split("\n").map((line) => line.trim()).filter(Boolean);
      const firstLine = parseTimestampLine(lines[0]);

      if (firstLine) {
        timestamp = timestamp || firstLine.timestamp;
        text = firstLine.text || normalizeSegmentText(lines.slice(1).join(" "));
      } else if (timestamp) {
        text = normalizeSegmentText(lines.filter((line) => line !== timestamp).join(" "));
      } else {
        text = normalizeSegmentText(rawText);
      }
    }

    return { timestamp, text };
  }

  function formatSegments(segmentNodes) {
    const lines = [];
    let previousLine = "";

    segmentNodes.forEach((node) => {
      const segment = extractSegment(node);
      if (!segment.text) return;

      const line = segment.timestamp
        ? `${segment.timestamp} ${segment.text}`
        : segment.text;

      // Some YouTube layouts expose the same segment through nested custom elements.
      if (line === previousLine) return;
      previousLine = line;
      lines.push(line);
    });

    return lines.join("\n");
  }

  function isTranscriptControlLine(line) {
    return /^(?:transcript|show transcript|auto-generated|generated automatically|english)$/i.test(line);
  }

  function parseTranscriptRoot(rootNode) {
    const lines = readText(rootNode)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const segments = [];
    let current = null;

    lines.forEach((line) => {
      const timestampLine = parseTimestampLine(line);
      if (timestampLine) {
        if (current && current.text) segments.push(current);
        current = timestampLine;
        return;
      }

      if (!current || isTranscriptControlLine(line)) return;
      const normalizedLine = normalizeSegmentText(line);
      if (normalizedLine) {
        current.text = current.text
          ? `${current.text} ${normalizedLine}`
          : normalizedLine;
      }
    });

    if (current && current.text) segments.push(current);
    return formatSegments(segments.map((segment) => ({
      innerText: segment.timestamp ? `${segment.timestamp}\n${segment.text}` : segment.text,
      textContent: segment.timestamp ? `${segment.timestamp}\n${segment.text}` : segment.text,
      querySelector() { return null; }
    })));
  }

  function extractTranscript(documentRoot) {
    const rootNode = documentRoot || root.document;
    if (!rootNode) return { text: "", segmentCount: 0 };

    let segmentNodes = [];
    for (const selector of TRANSCRIPT_SEGMENT_SELECTORS) {
      segmentNodes = queryAll(rootNode, selector);
      if (segmentNodes.length > 0) break;
    }

    const segmentText = formatSegments(segmentNodes);
    if (segmentText) {
      return {
        text: segmentText,
        segmentCount: segmentNodes.length
      };
    }

    for (const selector of TRANSCRIPT_ROOT_SELECTORS) {
      const transcriptRoots = queryAll(rootNode, selector);
      for (const transcriptRoot of transcriptRoots) {
        const fallbackText = parseTranscriptRoot(transcriptRoot);
        if (fallbackText) {
          return {
            text: fallbackText,
            segmentCount: fallbackText.split("\n").length
          };
        }
      }
    }

    return { text: "", segmentCount: 0 };
  }

  root.AurofactYouTube = Object.freeze({
    isYouTubeVideoUrl,
    extractTranscript
  });
})(typeof self !== "undefined" ? self : globalThis);
