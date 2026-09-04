// input-behavior.js - Keyboard policy for the floating chat input

(function (root) {
  "use strict";

  function getTextInputAction(event) {
    if (!event || event.type !== "keydown") return "ignore";
    if (event.key === "Escape") return "close";
    if (event.isComposing || event.keyCode === 229) return "ignore";

    // Enter keeps the textarea's native newline behavior. Ctrl+Enter is the
    // explicit submit shortcut; other modifier combinations remain editable.
    if (event.key === "Enter" && event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey) {
      return "send";
    }
    return "allow";
  }

  root.AurofactInputBehavior = Object.freeze({ getTextInputAction });
})(typeof self !== "undefined" ? self : globalThis);
