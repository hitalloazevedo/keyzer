#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { analyzeKey, type Network } from "../core/index.js";
import { ask } from "./prompt.js";

const { version } = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
) as { version: string };

const useColor = process.stdout.isTTY && !process.env["NO_COLOR"];
const paint = (code: number) => (text: string) =>
  useColor ? `\x1b[${code}m${text}\x1b[0m` : text;
const bold = paint(1);
const dim = paint(2);
const red = paint(31);
const green = paint(32);
const yellow = paint(33);

const BANNER = String.raw`
  _  __
 | |/ /___ _   _ _______ _ __
 | ' // _ \ | | |_  / _ \ '__|
 | . \  __/ |_| |/ /  __/ |
 |_|\_\___|\__, /___\___|_|
           |___/`;

const HELP = `Keyzer ${version} - convert a Bitcoin private key between hex and WIF, offline.

Usage: keyzer [options]

You'll be asked to paste a key (hidden while you type). Hex -> WIF and
WIF -> hex are detected automatically.

Options:
  --uncompressed   Hex -> WIF for an uncompressed public key (WIF starts with 5 / 9)
  --testnet        Hex -> WIF for Bitcoin testnet (WIF starts with c / 9)
  --show-input     Show the key while typing instead of hiding it
  -h, --help       Show this help
  -v, --version    Show the version`;

function parseOptions() {
  try {
    return parseArgs({
      options: {
        uncompressed: { type: "boolean" },
        testnet: { type: "boolean" },
        "show-input": { type: "boolean" },
        help: { type: "boolean", short: "h" },
        version: { type: "boolean", short: "v" },
      },
      allowPositionals: false,
    }).values;
  } catch (error) {
    console.error(red((error as Error).message));
    console.error(`Run ${bold("keyzer --help")} for usage.`);
    process.exit(2);
  }
}

function convert(input: string, opts: { compressed: boolean; network: Network }): boolean {
  const result = analyzeKey(input, opts);
  const format = (compressed: boolean) => (compressed ? "compressed" : "uncompressed");

  switch (result.kind) {
    case "empty":
      return false;
    case "error":
      console.log(red(`✗ ${result.message}`) + " Try again.\n");
      return false;
    case "wif":
      console.log(green("Detected: WIF private key"));
      console.log(`  Hex     : ${bold(result.hex)}`);
      console.log(`  Network : ${result.network}`);
      console.log(`  Public key format: ${format(result.compressed)}`);
      return true;
    case "hex":
      console.log(green("Detected: hex private key"));
      if (result.padded > 0) {
        const n = result.padded;
        console.log(yellow(`  Note: ${n} leading zero${n > 1 ? "s were" : " was"} added to reach 64 characters.`));
      }
      console.log(`  Hex     : ${result.hex}`);
      console.log(`  Network : ${result.network}`);
      console.log(`  Public key format: ${format(result.compressed)}`);
      console.log(`  WIF     : ${bold(result.wif)}`);
      return true;
  }
}

async function main(): Promise<void> {
  const flags = parseOptions();
  if (flags.help) return void console.log(HELP);
  if (flags.version) return void console.log(version);

  if (!process.stdin.isTTY) {
    console.error(red("Keyzer needs an interactive terminal (it asks for the key so it never lands in your shell history)."));
    process.exit(1);
  }

  const options = {
    compressed: !flags.uncompressed,
    network: (flags.testnet ? "testnet" : "mainnet") as Network,
  };

  console.log(bold(BANNER) + `  v${version}`);
  console.log("=".repeat(60));
  console.log(dim("Offline: nothing is sent anywhere. Leave the key empty to quit.\n"));

  for (;;) {
    const answer = await ask("Paste your private key (hex or WIF): ", {
      hidden: !flags["show-input"],
    });
    if (answer === null || answer.trim() === "") return;

    if (convert(answer, options)) {
      console.log(dim("\nTip: clear your terminal when you're done (Ctrl+L / `clear`)."));
      return;
    }
  }
}

main().catch((error: unknown) => {
  console.error(red("Unexpected error:"), error instanceof Error ? error.message : error);
  process.exit(1);
});
