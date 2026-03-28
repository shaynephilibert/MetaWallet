PromptVault — Chrome Extension Build Plan
Privacy-first prompt manager for AI power users. Everything encrypted locally. Nothing
ever leaves the browser.
What You’re Building
A Chrome extension that lets users save, organize, and inject prompts into ChatGPT,
Claude, Gemini, and Grok with one click. All data is encrypted locally using a user-set
password — no server, no account, no data collection. Monetized via freemium using
ExtensionPay.
Positioning: “Like Easy Folders, but actually free to start — and your data never leaves your
browser.”
Tech Stack
Layer Choice Reason
Framework React + Vite Fast builds, Claude codes it well
Extension API Chrome Manifest V3 Required by Chrome
Encryption crypto-js (AES) Simple, well-documented, no backend needed
Payments ExtensionPay Handles Stripe subscriptions without a backend
Storage chrome.storage.local Sandboxed per-extension, never synced to Google
Styling Tailwind CSS Fast to vibe code, consistent UI
Project Structure
promptvault/
├── manifest.json
├── vite.config.ts
├── package.json
├── src/
│ ├── popup/
│ │ ├── index.html
│ │ ├── Popup.tsx # Main popup UI
│ │ ├── components/
│ │ │ ├── PromptList.tsx
│ │ │ ├── PromptCard.tsx
│ │ │ ├── CategoryFilter.tsx
│ │ │ ├── AddPromptModal.tsx
│ │ │ └── UnlockModal.tsx
│ │ └── main.tsx
│ ├── content/
│ │ ├── chatgpt.ts # Injection script for chatgpt.com
│ │ ├── claude.ts # Injection script for claude.ai
│ │ ├── gemini.ts # Injection script for gemini.google.com
│ │ └── grok.ts # Injection script for grok.com
│ ├── background/
│ │ └── service-worker.ts # Handles ExtensionPay events
│ └── lib/
│ ├── storage.ts # Encrypted read/write wrapper
│ ├── encryption.ts # crypto-js AES helpers
│ └── extensionpay.ts # Payment status helpers
manifest.json
{
"manifest_version": 3,
"name": "PromptVault — Private AI Prompt Manager",
"version": "1.0.0",
"description": "Save, organize, and inject prompts into any AI. Encrypted locally. Never le
"permissions": [
"storage",
"activeTab",
"scripting"
],
"host_permissions": [
"https://chatgpt.com/*",
"https://claude.ai/*",
"https://gemini.google.com/*",
"https://grok.com/*"
],
"action": {
"default_popup": "popup/index.html",
"default_icon": {
"16": "icons/icon16.png",
"48": "icons/icon48.png",
"128": "icons/icon128.png"
}
},
"background": {
"service_worker": "background/service-worker.js"
},
"content_scripts": [
{
"matches": ["https://chatgpt.com/*"],
"js": ["content/chatgpt.js"]
},
{
"matches": ["https://claude.ai/*"],
"js": ["content/claude.js"]
},
{
"matches": ["https://gemini.google.com/*"],
"js": ["content/gemini.js"]
},
{
"matches": ["https://grok.com/*"],
"js": ["content/grok.js"]
}
],
"icons": {
"16": "icons/icon16.png",
"48": "icons/icon48.png",
"128": "icons/icon128.png"
}
}
Encryption Layer (src/lib/encryption.ts)
import CryptoJS from 'crypto-js';
// Encrypt data with user password
export function encrypt(data: string, password: string): string {
return CryptoJS.AES.encrypt(data, password).toString();
}
// Decrypt data with user password — returns null if wrong password
export function decrypt(ciphertext: string, password: string): string | null {
try {
const bytes = CryptoJS.AES.decrypt(ciphertext, password);
const result = bytes.toString(CryptoJS.enc.Utf8);
if (!result) return null;
return result;
} catch {
return null;
}
}
Storage Layer (src/lib/storage.ts)
import { encrypt, decrypt } from './encryption';
export interface Prompt {
id: string;
title: string;
body: string;
category: string;
createdAt: number;
}
export interface VaultData {
prompts: Prompt[];
categories: string[];
}
const STORAGE_KEY = 'promptvault_data';
const PASSWORD_HASH_KEY = 'promptvault_pw_hash';
// Save entire vault (encrypted)
export async function saveVault(data: VaultData, password: string): Promise<void> {
const encrypted = encrypt(JSON.stringify(data), password);
await chrome.storage.local.set({ [STORAGE_KEY]: encrypted });
}
// Load vault (decrypt). Returns null if wrong password or no data.
export async function loadVault(password: string): Promise<VaultData | null> {
const result = await chrome.storage.local.get(STORAGE_KEY);
if (!result[STORAGE_KEY]) {
return { prompts: [], categories: ['General', 'Writing', 'Coding', 'Research'] };
}
const decrypted = decrypt(result[STORAGE_KEY], password);
if (!decrypted) return null;
return JSON.parse(decrypted) as VaultData;
}
// Check if vault has been initialized
export async function vaultExists(): Promise<boolean> {
const result = await chrome.storage.local.get(STORAGE_KEY);
return !!result[STORAGE_KEY];
}
Free vs Paid Feature Split
Free Tier
Up to 15 prompts
Up to 3 categories
Prompt injection on ChatGPT only
Encrypted local storage
Password protection
Paid Tier ($6/month via ExtensionPay)
Unlimited prompts
Unlimited categories
Injection on ChatGPT, Claude, Gemini, Grok
Prompt variables (e.g. {{topic}} )
Priority support
Enforcement logic (in Popup.tsx)
const isPaid = await extpay.getUser().then(u => u.paid);
const FREE_PROMPT_LIMIT = 15;
const FREE_CATEGORY_LIMIT = 3;
const canAddPrompt = isPaid || prompts.length < FREE_PROMPT_LIMIT;
const canAddCategory = isPaid || categories.length < FREE_CATEGORY_LIMIT;
Content Script Pattern (same for all 4 platforms)
Each content script does two things:
1. Listens for a message from the popup with a prompt string
2. Finds the chat input element and injects the text
// src/content/chatgpt.ts
chrome.runtime.onMessage.addListener((message) => {
if (message.type === 'INJECT_PROMPT') {
const input = document.querySelector('#prompt-textarea') as HTMLTextAreaElement;
if (input) {
const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
window.HTMLTextAreaElement.prototype, 'value'
)?.set;
nativeInputValueSetter?.call(input, message.prompt);
input.dispatchEvent(new Event('input', { bubbles: true }));
input.focus();
}
}
});
Selector reference for each platform:
Platform Input selector
ChatGPT #prompt-textarea
Claude [contenteditable="true"].ProseMirror
Gemini rich-textarea .ql-editor
Grok textarea[placeholder]
These selectors can change when platforms update their UI. If injection breaks,
inspect the input element and update the selector.
Popup UI Flow
App loads
└── vaultExists()?
├── NO → SetPasswordScreen (create password, initialize empty vault)
└── YES → UnlockScreen (enter password to decrypt)
└── correct password?
├── NO → show error, retry
└── YES → MainScreen
├── PromptList (filterable by category)
├── AddPromptButton
├── CategoryFilter tabs
└── Each PromptCard has:
├── Title
├── Preview (first 80 chars)
├── Category badge
├── Copy button
└── Inject button (sends message to content scrip
ExtensionPay Setup
1. Create account at https://extensionpay.com
2. Create a new extension, set price to $6/month
3. Add the ExtensionPay script to your extension
4. Use this in your background service worker:
// src/background/service-worker.ts
import ExtPay from 'extpay';
const extpay = ExtPay('your-extension-id-here');
extpay.startBackground();
5. Check payment status in popup:
const extpay = ExtPay('your-extension-id-here');
const user = await extpay.getUser();
const isPaid = user.paid;
Saturday Build Order
Morning (scaffold + storage)
1. npm create vite@latest promptvault -- --template react-ts
2. Install deps: npm i crypto-js tailwindcss extpay
3. Configure vite.config.ts for multi-entry extension build
4. Build encryption.ts and storage.ts
5. Build SetPasswordScreen and UnlockScreen components
6. Verify encrypt/decrypt round-trip works in browser console
Afternoon (prompt UI + ChatGPT injection)
1. Build MainScreen with PromptList and PromptCard
2. Build AddPromptModal
3. Build CategoryFilter
4. Write chatgpt.ts content script
5. Test end-to-end: add prompt → click inject → appears in ChatGPT input
Sunday Build Order
Morning (remaining platforms + paid gating)
1. Write claude.ts , gemini.ts , grok.ts content scripts
2. Test injection on each platform
3. Add ExtensionPay, wire up paid/free gating
4. Build UpgradeModal shown when free limits hit
Afternoon (polish + submit)
1. 2. 3. Design icons (use Figma or ask Claude to generate SVG icons)
Write Chrome Web Store listing copy (see below)
Take screenshots for the store listing
4. Submit for review
Chrome Web Store Listing Copy
Name: PromptVault — Private AI Prompt Manager
Short description (132 chars max): Save & inject prompts into ChatGPT, Claude, Gemini &
Grok. Encrypted locally. No account. No server. Your data never leaves your browser.
Category: Productivity
Key selling points for description:
Military-grade AES encryption — only you hold the key
One-click injection into any AI platform
Organize prompts by category
No account required, no server, no data collection
Free to start — upgrade for unlimited prompts and all platforms
Launch Checklist
Extension loads without errors
Password creation and unlock flow works
Add / edit / delete prompt works
Category filter works
Inject button works on ChatGPT (free tier)
Inject button works on Claude, Gemini, Grok (paid tier)
Free limits enforced (15 prompts, 3 categories)
Upgrade modal appears at limit
ExtensionPay checkout opens correctly
Icons created (16x16, 48x48, 128x128)
Store screenshots taken (1280x800 or 640x400)
Submitted to Chrome Web Store
After Launch (Week 1)
Post in these places the day your extension goes live:
1. r/ChatGPT — “I built a free prompt manager that never phones home”
2. r/ClaudeAI — same post
3. Indie Hackers — short launch post
4. Product Hunt — schedule a launch
The privacy angle is your hook. Lead with it every time.