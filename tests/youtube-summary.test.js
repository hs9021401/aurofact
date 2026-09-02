const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectRoot = path.resolve(__dirname, "..");

class FakeNode {
  constructor({
    innerText = "",
    textContent = "",
    queryMap = {},
    children = []
  } = {}) {
    this.innerText = innerText;
    this.textContent = textContent || innerText;
    this.queryMap = queryMap;
    this.children = children;
  }

  querySelector(selector) {
    if (this.queryMap[selector]) return this.queryMap[selector];

    for (const child of this.children) {
      const match = child.querySelector(selector);
      if (match) return match;
    }

    return null;
  }
}

class FakeDocument {
  constructor(queryAllMap = {}) {
    this.queryAllMap = queryAllMap;
  }

  querySelectorAll(selector) {
    return this.queryAllMap[selector] || [];
  }
}

function loadYouTubeUtils() {
  const context = { URL, console };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(projectRoot, "youtube-utils.js"), "utf8"),
    context
  );
  return context.AurofactYouTube;
}

const youtube = loadYouTubeUtils();

assert.strictEqual(
  youtube.isYouTubeVideoUrl("https://www.youtube.com/watch?v=video-123"),
  true
);
assert.strictEqual(
  youtube.isYouTubeVideoUrl("https://www.youtube.com/shorts/video-123"),
  true
);
assert.strictEqual(
  youtube.isYouTubeVideoUrl("https://www.youtube.com/watch"),
  false
);
assert.strictEqual(
  youtube.isYouTubeVideoUrl("https://example.com/watch?v=video-123"),
  false
);

const firstTimestamp = new FakeNode({ innerText: "0:00" });
const firstText = new FakeNode({ innerText: "  Welcome   to the video. " });
const secondTimestamp = new FakeNode({ innerText: "0:08" });
const secondText = new FakeNode({ innerText: "The second point is here." });
const segmentNodes = [
  new FakeNode({
    queryMap: {
      ".segment-timestamp": firstTimestamp,
      ".segment-text": firstText
    }
  }),
  new FakeNode({
    queryMap: {
      ".segment-timestamp": secondTimestamp,
      ".segment-text": secondText
    }
  }),
  new FakeNode({
    queryMap: {
      ".segment-timestamp": secondTimestamp,
      ".segment-text": secondText
    }
  })
];

const segmentDocument = new FakeDocument({
  "ytd-transcript-segment-renderer": segmentNodes
});
const extractedSegments = youtube.extractTranscript(segmentDocument);
assert.strictEqual(extractedSegments.segmentCount, 3);
assert.strictEqual(
  extractedSegments.text,
  "0:00 Welcome to the video.\n0:08 The second point is here."
);

const currentYoutubeRows = [
  new FakeNode({
    children: [
      new FakeNode({
        queryMap: {
          ".ytwTranscriptSegmentViewModelTimestamp": new FakeNode({
            innerText: "0:00"
          }),
          ".ytAttributedStringHost": new FakeNode({
            innerText: "這幾天的影片呢 比較深難一點 很多人就說 我們輕鬆一下吧"
          })
        }
      })
    ]
  }),
  new FakeNode({
    children: [
      new FakeNode({
        queryMap: {
          ".ytwTranscriptSegmentViewModelTimestamp": new FakeNode({
            innerText: "2:04"
          }),
          ".ytAttributedStringHost": new FakeNode({
            innerText: "他本名叫做袁志揚 這個人以前在抖音上的帳號叫做台灣怪人"
          })
        }
      })
    ]
  })
];

const currentYoutubeDocument = new FakeDocument({
  "macro-markers-panel-item-view-model": currentYoutubeRows
});
const extractedCurrentYoutube = youtube.extractTranscript(currentYoutubeDocument);
assert.strictEqual(extractedCurrentYoutube.segmentCount, 2);
assert.strictEqual(
  extractedCurrentYoutube.text,
  "0:00 這幾天的影片呢 比較深難一點 很多人就說 我們輕鬆一下吧\n" +
    "2:04 他本名叫做袁志揚 這個人以前在抖音上的帳號叫做台灣怪人"
);

const fallbackRoot = new FakeNode({
  innerText: "Transcript\nEnglish\n0:00\nWelcome to the video.\n0:08 The second point is here."
});
const fallbackDocument = new FakeDocument({
  "ytd-transcript-renderer": [fallbackRoot]
});
const extractedFallback = youtube.extractTranscript(fallbackDocument);
assert.strictEqual(
  extractedFallback.text,
  "0:00 Welcome to the video.\n0:08 The second point is here."
);

const emptyDocument = new FakeDocument();
const emptyResult = youtube.extractTranscript(emptyDocument);
assert.strictEqual(emptyResult.text, "");
assert.strictEqual(emptyResult.segmentCount, 0);

const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, "manifest.json"), "utf8"));
assert.deepStrictEqual(manifest.content_scripts[0].js, [
  "i18n.js",
  "youtube-utils.js",
  "content.js"
]);

const contentSource = fs.readFileSync(path.join(projectRoot, "content.js"), "utf8");
assert.match(contentSource, /YOUTUBE_TRANSCRIPT_NOT_FOUND/);
assert.match(contentSource, /youtubeHelper\.extractTranscript/);

const packageSource = fs.readFileSync(path.join(projectRoot, "build_package.py"), "utf8");
assert.match(packageSource, /"youtube-utils\.js"/);

console.log("YouTube transcript summary regression checks passed.");
