/**
 * setup-vmock-auth.mjs
 *
 * One-time setup script: opens a headed browser, lets you log into VMock
 * manually, then saves the browser session (cookies + localStorage) to
 * vmock-auth.json so VmockRunnerAgent can restore it without prompting.
 *
 * Prerequisites:
 *   npm install playwright
 *   npx playwright install chromium
 *
 * Usage:
 *   node agents/A5-auto-apply/setup-vmock-auth.mjs
 *
 * Output:
 *   agents/A5-auto-apply/vmock-auth.json  (gitignored)
 *
 * Notes:
 *   - Run this once per VMock session expiry (typically 30 days for SSO).
 *   - If VMock uses Full Sail SSO, log in via the SSO button -- the redirect
 *     and resulting session tokens are all captured by storageState.
 *   - vmock-auth.json contains session cookies -- never commit it to git.
 */

import { chromium } from "playwright";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";

/** Absolute path where the session state will be saved. */
const AUTH_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "vmock-auth.json"
);

const VMOCK_URL = "https://www.vmock.com";

const rl = createInterface({ input: process.stdin, output: process.stdout });

/**
 * Prompt the user for input and resolve with their answer.
 *
 * @param {string} question - Text to display before waiting for input
 * @returns {Promise<string>} The user's input string
 */
const prompt = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(VMOCK_URL);

console.log("");
console.log("Browser opened at:", VMOCK_URL);
console.log("Log in using your Full Sail student email.");
console.log("When you are fully logged in and can see the VMock dashboard,");
console.log("come back here and press Enter.");
console.log("");

await prompt("Press Enter when logged in: ");

await context.storageState({ path: AUTH_PATH });

console.log("");
console.log("Auth state saved to:", AUTH_PATH);
console.log("VmockRunnerAgent will use this file automatically.");
console.log("Do not commit vmock-auth.json -- it is gitignored.");

await browser.close();
rl.close();
