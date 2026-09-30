# AUROFACT Privacy Policy

Effective date: 2026-09-30

This Privacy Policy explains how the AUROFACT browser extension ("AUROFACT", "the extension", "we", or "us") handles information when you use it in Brave, Google Chrome, Microsoft Edge, or another compatible Chromium browser.

## 1. What AUROFACT does

AUROFACT is a user-controlled browser assistant for summarizing webpages, processing selected text, answering questions about page content, and sending requests to an LLM provider selected and configured by the user.

The extension does not automatically scan or summarize webpages in the background. Page content is read after a user action, such as starting a page summary, processing selected text, using the keyboard shortcut, or explicitly asking a blank conversation to analyze the current page.

## 2. Information processed

Depending on the features you use, AUROFACT may process:

- Webpage title, URL, and visible text that you explicitly ask it to analyze.
- Text that you explicitly select and send for processing.
- A YouTube transcript that is already displayed on the page when you request a transcript summary.
- Questions, follow-up messages, and conversation responses entered in the floating panel.
- LLM profile settings, including the endpoint URL, model name, protocol, generation limits, and custom system prompt.
- API keys required by the LLM provider you configure.

## 3. Where information is sent

When you start an AI request, the relevant question and content are sent directly from the browser to the LLM API endpoint selected in your active profile. AUROFACT does not operate an intermediary server for these requests and does not receive a copy of the request through a central backend.

The selected LLM provider or self-hosted server may log, retain, or otherwise process requests according to its own terms and privacy policy. You are responsible for reviewing that provider's policies and configuration before sending confidential information.

If you configure a remote HTTP endpoint instead of HTTPS, the request may travel without transport encryption. HTTPS is strongly recommended for remote endpoints. HTTP should be limited to a local or trusted network service where you understand the risk.

## 4. API keys and local settings

- API keys are stored in the browser's local extension storage (`chrome.storage.local`) and are not placed in synchronized profile metadata.
- Non-secret profile metadata and interface preferences may be stored in `chrome.storage.sync` and may synchronize through the browser account according to the browser's settings.
- API keys are used to authenticate requests to the endpoint configured for the corresponding profile. AUROFACT does not sell, rent, or use API keys for advertising.
- Active conversation content is held in the extension's runtime memory for the current panel session. AUROFACT does not intentionally persist webpage content or conversation transcripts as a separate history database.

## 5. Browser permissions

AUROFACT uses the following browser capabilities to provide its user-facing features:

- `activeTab` and `scripting`: read the current page and inject the floating panel after a user action.
- `contextMenus`: provide page, selection, and open-panel actions in the browser context menu.
- `storage`: save profile settings and local API keys.
- Provider host permissions: connect to built-in providers and to a custom endpoint that you explicitly configure and authorize.

The extension does not use webpage content for advertising, behavioral profiling, or sale to data brokers.

## 6. Security and prompt injection

Webpage text, selected text, transcripts, titles, URLs, and previous assistant messages are treated as untrusted data. AUROFACT adds a prompt-injection warning boundary before sending content to the configured provider, but no prompt-injection defense can guarantee that an LLM will always behave safely. Do not place passwords, API keys, tokens, or other secrets in webpage text or selected text.

## 7. Third-party services

The extension can connect to third-party or self-hosted LLM services, including services configured by the user. Those services operate independently of AUROFACT. Their data handling, retention, security, and regional processing are governed by their own policies and your account or server configuration.

## 8. Data retention and deletion

You can remove API profiles and API keys from the extension settings. You can also clear the extension's browser storage through the browser's extension settings or uninstall the extension. Data already sent to an LLM provider must be deleted according to that provider's retention and deletion controls.

## 9. Changes to this policy

We may update this Privacy Policy when the extension's data handling changes. The effective date at the top of this page will be updated when a new version is published.

## 10. Contact

For questions or privacy concerns, open an issue in the [AUROFACT GitHub repository](https://github.com/hs9021401/aurofact/issues).
