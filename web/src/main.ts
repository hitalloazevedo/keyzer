import { analyzeKey, type Analysis, type Network } from "../../src/core/index.js";
import { detectLang, STRINGS, type Lang } from "./i18n.js";
import "./style.css";

declare const __VERSION__: string;

const IDLE_MS = 2 * 60 * 1000;

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node as T;
}

const $ = {
  tagline: el("tagline"),
  lang: el<HTMLButtonElement>("lang"),
  badge: el("net-badge"),
  keyLabel: el("key-label"),
  input: el<HTMLInputElement>("key-input"),
  toggle: el<HTMLButtonElement>("toggle"),
  status: el("status"),
  result: el("result"),
  resultLabel: el("result-label"),
  resultValue: el("result-value"),
  copy: el<HTMLButtonElement>("copy"),
  padded: el("padded-warning"),
  clipboardNote: el("clipboard-note"),
  clipboardNoteText: el("clipboard-note-text"),
  clearClipboard: el<HTMLButtonElement>("clear-clipboard"),
  details: el("details"),
  advancedSummary: el("advanced-summary"),
  advancedNote: el("advanced-note"),
  networkLegend: el("network-legend"),
  netMainnet: el("net-mainnet"),
  netTestnet: el("net-testnet"),
  compressed: el<HTMLInputElement>("compressed"),
  compressedLabel: el("compressed-label"),
  compressedHelp: el("compressed-help"),
  clearAll: el<HTMLButtonElement>("clear-all"),
  safeTitle: el("safe-title"),
  safeBody: el("safe-body"),
  tips: el("tips"),
  source: el("source"),
  version: el("version"),
};

let lang: Lang = detectLang();
let copiedSecret = false; // we put a key on the clipboard and haven't cleared it yet
let copyFeedbackTimer: number | undefined;
let idleTimer: number | undefined;
let lastIdleNotice = false;

const t = () => STRINGS[lang];

function selectedNetwork(): Network {
  const checked = document.querySelector<HTMLInputElement>('input[name="network"]:checked');
  return checked?.value === "testnet" ? "testnet" : "mainnet";
}

// ---------- static text ----------

function applyStrings(): void {
  const s = t();
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  $.tagline.textContent = s.tagline;
  $.lang.textContent = lang === "pt" ? "EN" : "PT";
  $.keyLabel.textContent = s.keyLabel;
  $.input.placeholder = s.placeholder;
  $.clearAll.textContent = s.clearAll;
  $.advancedSummary.textContent = s.advanced;
  $.advancedNote.textContent = s.advancedNote;
  $.networkLegend.textContent = s.networkLabel;
  $.netMainnet.textContent = s.mainnet;
  $.netTestnet.textContent = s.testnet;
  $.compressedLabel.textContent = s.compressed;
  $.compressedHelp.textContent = s.compressedHelp;
  $.safeTitle.textContent = s.safeTitle;
  $.safeBody.replaceChildren(
    ...s.safeBody.map((text) => Object.assign(document.createElement("p"), { textContent: text })),
  );
  $.tips.textContent = s.tips;
  $.source.textContent = s.source;
  $.version.textContent = __VERSION__;
  $.clearClipboard.textContent = s.clearClipboard;
  $.clipboardNoteText.textContent = s.clipboardNote;
  $.copy.textContent = s.copy;
  renderToggle();
  renderNetworkBadge();
  render();
}

function renderToggle(): void {
  const hidden = $.input.type === "password";
  $.toggle.textContent = hidden ? t().show : t().hide;
  $.toggle.setAttribute("aria-pressed", String(!hidden));
}

function renderNetworkBadge(): void {
  const online = navigator.onLine;
  $.badge.textContent = (online ? "⚠ " : "✓ ") + (online ? t().online : t().offline);
  $.badge.classList.toggle("online", online);
  $.badge.classList.toggle("offline", !online);
}

// ---------- conversion ----------

function setStatus(kind: "neutral" | "ok" | "error", text: string): void {
  $.status.textContent = text;
  $.status.dataset["kind"] = kind;
}

function addDetail(label: string, value: string, mono = false): void {
  const dt = Object.assign(document.createElement("dt"), { textContent: label });
  const dd = Object.assign(document.createElement("dd"), { textContent: value });
  if (mono) dd.className = "mono";
  $.details.append(dt, dd);
}

function renderResult(analysis: Analysis): void {
  const s = t();
  $.details.replaceChildren();
  $.padded.hidden = true;

  if (analysis.kind === "empty" || analysis.kind === "error") {
    $.result.hidden = true;
    $.resultValue.textContent = "";
    setStatus(
      analysis.kind === "error" ? "error" : "neutral",
      analysis.kind === "error" ? `✗ ${s.errors[analysis.code]}` : lastIdleNotice ? s.idleCleared : s.hint,
    );
    return;
  }

  const format = analysis.compressed ? s.formatCompressed : s.formatUncompressed;
  const network = analysis.network === "mainnet" ? s.mainnet : s.testnet;

  if (analysis.kind === "hex") {
    setStatus("ok", `✓ ${s.detectedHex}`);
    $.resultLabel.textContent = s.resultWif;
    $.resultValue.textContent = analysis.wif;
    addDetail(s.detailHex, analysis.hex, true);
    if (analysis.padded > 0) {
      $.padded.textContent = `⚠ ${s.padded(analysis.padded)}`;
      $.padded.hidden = false;
    }
  } else {
    setStatus("ok", `✓ ${s.detectedWif}`);
    $.resultLabel.textContent = s.resultHex;
    $.resultValue.textContent = analysis.hex;
  }
  addDetail(s.detailNetwork, network);
  addDetail(s.detailFormat, format);
  $.result.hidden = false;
}

function render(): void {
  renderResult(analyzeKey($.input.value, { network: selectedNetwork(), compressed: $.compressed.checked }));
}

// ---------- clipboard ----------

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers that restrict the async clipboard API on local files.
    const area = document.createElement("textarea");
    area.value = text;
    area.className = "offscreen";
    area.setAttribute("readonly", "");
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

function setCopiedSecret(value: boolean): void {
  copiedSecret = value;
  $.clipboardNote.hidden = !value;
}

async function onCopy(): Promise<void> {
  const ok = await writeClipboard($.resultValue.textContent ?? "");
  window.clearTimeout(copyFeedbackTimer);
  if (ok) {
    $.copy.textContent = t().copied;
    setCopiedSecret(true);
  } else {
    setStatus("error", `✗ ${t().copyFailed}`);
  }
  copyFeedbackTimer = window.setTimeout(() => ($.copy.textContent = t().copy), 2500);
}

async function onClearClipboard(): Promise<void> {
  await writeClipboard("");
  setCopiedSecret(false);
  $.status.textContent = t().clipboardCleared;
  $.status.dataset["kind"] = "neutral";
}

// ---------- wiping ----------

function wipe(): void {
  $.input.value = "";
  $.resultValue.textContent = "";
  $.details.replaceChildren();
  if (copiedSecret) {
    void writeClipboard("");
    setCopiedSecret(false);
  }
  render();
}

function resetIdleTimer(): void {
  window.clearTimeout(idleTimer);
  lastIdleNotice = false;
  idleTimer = window.setTimeout(() => {
    if ($.input.value === "") return;
    lastIdleNotice = true;
    wipe();
  }, IDLE_MS);
}

// ---------- wiring ----------

$.input.addEventListener("input", render);
$.compressed.addEventListener("change", render);
document.querySelectorAll('input[name="network"]').forEach((r) => r.addEventListener("change", render));
$.toggle.addEventListener("click", () => {
  $.input.type = $.input.type === "password" ? "text" : "password";
  renderToggle();
  $.input.focus();
});
$.copy.addEventListener("click", () => void onCopy());
$.clearClipboard.addEventListener("click", () => void onClearClipboard());
$.clearAll.addEventListener("click", () => {
  wipe();
  $.input.focus();
});
$.lang.addEventListener("click", () => {
  lang = lang === "pt" ? "en" : "pt";
  applyStrings();
});
window.addEventListener("online", renderNetworkBadge);
window.addEventListener("offline", renderNetworkBadge);
for (const type of ["input", "click", "keydown", "pointerdown"]) {
  document.addEventListener(type, resetIdleTimer, { passive: true });
}

applyStrings();
$.input.focus();
