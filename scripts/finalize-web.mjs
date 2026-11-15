// Turns the Vite output (dist-web/index.html) into the final, distributable keyzer.html:
//   1. checks the file really is self-contained and has no network code,
//   2. injects a Content-Security-Policy that pins the exact inline script/style by hash
//      and forbids every network connection,
//   3. renames it to keyzer.html and prints its SHA-256.
import { createHash } from "node:crypto";
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL("../dist-web/", import.meta.url));
let html = readFileSync(`${dir}index.html`, "utf8");

const fail = (message) => {
  console.error(`✗ finalize-web: ${message}`);
  process.exit(1);
};

// --- 1. self-containment / no-network checks ---------------------------------
if (/<script\b[^>]*\bsrc\s*=/i.test(html)) fail("found a <script src=...>; the page must be a single file.");
if (/<link\b[^>]*rel=["']?(stylesheet|modulepreload|preload|prefetch)/i.test(html)) {
  fail("found an external <link>; the page must be a single file.");
}
if (/@import|url\(\s*["']?https?:/i.test(html)) fail("found a CSS @import or remote url().");
const networkApis = /\b(fetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|importScripts)\b/;
const hit = html.match(networkApis);
if (hit) fail(`found a network API in the bundle: ${hit[0]}`);

// --- 2. Content-Security-Policy ------------------------------------------------
const sha256 = (text) => `'sha256-${createHash("sha256").update(text, "utf8").digest("base64")}'`;
const inline = (tag) =>
  [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "gi"))].map((m) => sha256(m[1]));

const scripts = inline("script");
const styles = inline("style");
if (scripts.length === 0) fail("no inline <script> found.");

const csp = [
  "default-src 'none'", // blocks fetch/XHR/WebSocket/frames/fonts/... everything not listed below
  `script-src ${scripts.join(" ")}`,
  `style-src ${styles.length ? styles.join(" ") : "'none'"}`,
  "img-src data:", // the favicon
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

const placeholder = 'http-equiv="Content-Security-Policy" content="__CSP__"';
if (!html.includes(placeholder)) fail("CSP <meta> placeholder not found in index.html.");
html = html.replace(placeholder, `http-equiv="Content-Security-Policy" content="${csp}"`);
if (html.includes("__CSP__")) fail("a CSP placeholder is still left in the output.");

// --- 3. write the final file ---------------------------------------------------
writeFileSync(`${dir}index.html`, html);
renameSync(`${dir}index.html`, `${dir}keyzer.html`);
const digest = createHash("sha256").update(readFileSync(`${dir}keyzer.html`)).digest("hex");
console.log(`✓ dist-web/keyzer.html  ${(html.length / 1024).toFixed(1)} KiB`);
console.log(`  sha256 ${digest}`);
console.log(`  CSP    ${csp.replace(/'sha256-[^']+'/g, "'sha256-…'")}`);
