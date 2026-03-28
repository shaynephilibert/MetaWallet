# Changelog

All notable changes to PromptVault will be documented here.

## [0.1.0] — 2026-03-27

### Added
- Initial build of PromptVault Chrome extension (Manifest V3)
- AES-encrypted local storage via `crypto-js` — no server, no account
- Password creation and unlock flow (`SetPasswordScreen`, `UnlockScreen`)
- Main popup UI with prompt list, search, and category filter tabs
- Add prompt modal with title, body, and category fields
- Copy and inject buttons on each prompt card
- One-click injection into ChatGPT (free tier); Claude, Gemini, Grok (paid tier)
- Freemium gating: 15-prompt and 3-category limits on free plan
- Upgrade modal wired to ExtensionPay ($6/mo)
- Background service worker for ExtensionPay event handling
- Content scripts for ChatGPT, Claude, Gemini, and Grok
- Prompt variable support via `{{variable}}` syntax (paid tier)
- SVG icon generation script (`scripts/generate-icons.mjs`)
- Vite + React + TypeScript + Tailwind CSS build pipeline
