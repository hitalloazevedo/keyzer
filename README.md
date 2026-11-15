<div align="center">

# 🔑 Keyzer

**Convert a Bitcoin private key between hex and WIF, 100% offline.**

Your wallet gave you 64 hex characters, the other one wants a WIF (or the other way around).
Keyzer converts it on your own machine, so the key never touches a website.
Use it as a **single offline web page** or as a **terminal tool**.

[![CI](https://github.com/hitalloazevedo/keyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/hitalloazevedo/keyzer/actions/workflows/ci.yml)
[![License: ISC](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
![Node](https://img.shields.io/badge/node-%E2%89%A524-brightgreen)

English · [Português](README.pt-BR.md)

</div>

```text
$ npm start

  _  __
 | |/ /___ _   _ _______ _ __
 | ' // _ \ | | |_  / _ \ '__|
 | . \  __/ |_| |/ /  __/ |
 |_|\_\___|\__, /___\___|_|
           |___/  v1.1.0
============================================================
Offline: nothing is sent anywhere. Leave the key empty to quit.

Paste your private key (hex or WIF): ················  (hidden while you type)
Detected: hex private key
  Hex     : 0c28fca386c7a227600b2fe50b7cae11ec86d3bf1fbe471be89827e19d72aa1d
  Network : mainnet
  Public key format: compressed
  WIF     : KwdMAjGmerYanjeui5SHS7JkmpZvVipYvB2LJGU1ZxJwYvP98617
  Address : 1LoVGDgRs9hTfTNJNuXKSpywcbdvwRXpmK  (legacy)
  SegWit  : bc1qmy63mjadtw8nhzl69ukdepwzsyvv4yex5qlmkd  (native SegWit)
  Compare an address with your wallet to confirm this is the right key.
```

> The key above is a public test vector from the [Bitcoin wiki](https://en.bitcoin.it/wiki/Wallet_import_format). **Never use it for real funds.**

## Why Keyzer

Pasting a private key into a "free online converter" means trusting a stranger's server with your money. Keyzer exists so you don't have to:

- **Offline by design.** The code makes no network requests, and the web page ships with a Content-Security-Policy that makes your browser block every connection. Turn your Wi-Fi off and it keeps working.
- **Small enough to audit.** A few hundred lines of TypeScript and just three dependencies, all audited and widely used: [`@scure/base`](https://github.com/paulmillr/scure-base), [`@noble/hashes`](https://github.com/paulmillr/noble-hashes) and [`@noble/curves`](https://github.com/paulmillr/noble-curves).
- **Careful with your secret.** The key is asked for interactively and hidden while you type, so it never ends up in your shell history or on screen.
- **Strict validation.** Checksums are verified, typos are rejected, and keys outside the valid secp256k1 range are refused instead of silently converted.
- **Tested.** Covered by tests against reference vectors, cross-checked with an independent implementation.

## What it converts

| From | To | Notes |
| --- | --- | --- |
| Hex private key (64 chars) | WIF | Accepts `0x` prefix, upper/lower case, and keys missing their leading zeros |
| WIF | Hex private key | Also tells you the network and whether it is compressed |

| WIF starts with | Network | Public key |
| --- | --- | --- |
| `K` or `L` | Mainnet | Compressed (the default today) |
| `5` | Mainnet | Uncompressed (legacy) |
| `c` | Testnet | Compressed |
| `9` | Testnet | Uncompressed |

## Quick start

### Option A: the web page (no coding, one file)

1. **[Download `keyzer.html`](https://github.com/hitalloazevedo/keyzer/releases/latest/download/keyzer.html)** (about 70 KB) from the [latest release](https://github.com/hitalloazevedo/keyzer/releases/latest).
2. **Turn off your Wi-Fi.**
3. Double-click the file. It opens in your browser. Paste your key and copy the result.

Nothing is installed and nothing is uploaded. The page detects hex or WIF by itself, hides your key while you type, warns you if it had to add missing zeros, and clears everything after 2 minutes of inactivity. It speaks English and Portuguese.

#### Verify your download

Since you are trusting this file with a private key, check that it is the genuine one. Download `SHA256SUMS` from the same release and compare:

| System | Command |
| --- | --- |
| macOS / Linux | `shasum -a 256 keyzer.html` |
| Windows (PowerShell) | `Get-FileHash keyzer.html -Algorithm SHA256` |

The code printed must be identical to the one in `SHA256SUMS`. If you have the [GitHub CLI](https://cli.github.com), you can also check the signed build-provenance attestation, which proves the file was built from this repository by GitHub Actions:

```bash
gh attestation verify keyzer.html --repo hitalloazevedo/keyzer
```

<details>
<summary>Prefer to build it yourself?</summary>

1. Install [Node.js](https://nodejs.org) 24 or newer.
2. Download this project (**Code → Download ZIP**, then unzip), open a terminal in that folder and run:
   ```bash
   npm ci
   npm run build:web
   ```
3. Your file is `dist-web/keyzer.html`. The build is reproducible: with the same version of the code and `package-lock.json`, you should get the same SHA-256 as the one published in the release.

</details>

### Option B: the terminal

With [Node.js](https://nodejs.org) 24 or newer, run it straight from npm, nothing to clone:

```bash
npx @hitalloazevedo/keyzer
```

Or from a clone of this repository:

```bash
npm install
npm start
```

Paste your key (hex or WIF) and press Enter. Options go after the command (after `--` with `npm start`), for example `npx @hitalloazevedo/keyzer --testnet`:

```text
--uncompressed   Hex -> WIF for an uncompressed public key (WIF starts with 5 / 9)
--testnet        Hex -> WIF for Bitcoin testnet
--show-input     Show the key while typing instead of hiding it
-h, --help       Show help
-v, --version    Show the version
```

## FAQ

**What is WIF?**
Wallet Import Format is a way to write a private key that wallets can import. It is the same 32-byte key plus a network/compression marker and a checksum, encoded in Base58, which is why a typo is detected instead of silently producing the wrong key.

**Why does it add zeros to my key?**
Some tools drop the leading zeros of a hex key. A private key is always 64 hex characters, so Keyzer pads it back and tells you how many zeros it added. Check that number: if you pasted a truncated key, it will show.

**Does it work for Ethereum, Litecoin, etc.?**
No. Keyzer supports Bitcoin mainnet and testnet only.

**Does it show me the address for my key?**
Yes. It shows the legacy address (starts with `1`) and, for compressed keys, the native SegWit one (starts with `bc1q`). Compare one of them with your wallet to confirm it's the right key. Wrapped SegWit (`3…`) and Taproot (`bc1p…`) addresses are not shown.

**Is this safe for large amounts?**
Keyzer cannot protect you from malware on your computer, clipboard hijackers, or someone looking at your screen. For significant funds, use it on a clean, offline machine and clear your terminal afterwards. See [SECURITY.md](SECURITY.md).

## For developers

```bash
npm install
npm test            # builds, type-checks the web app and runs the test suite
npm run build       # compiles the CLI to dist/
npm run dev:web     # web app with live reload
npm run build:web   # builds dist-web/keyzer.html (single file, with CSP)
```

```text
src/
├── core/            Pure conversion logic, no I/O. Reusable in CLI, GUI or other projects
│   ├── hex.ts       Normalizes and validates hex private keys
│   ├── wif.ts       hexToWif / wifToHex / isWif
│   └── analyze.ts   analyzeKey: detects hex/WIF and converts (shared by CLI and web)
└── cli/             Interactive terminal interface
web/                 The single-file web app (Vite + TypeScript, no framework)
scripts/             finalize-web.mjs: checks there is no network code and injects the CSP
```

The core has no Node-specific dependencies, so it also runs in the browser:

```ts
import { hexToWif, wifToHex } from "./src/core/index.js";

hexToWif("0c28…aa1d");                          // "KwdMAj…8617"
hexToWif("0c28…aa1d", { compressed: false });   // "5HueCG…yTJ"
hexToWif("0c28…aa1d", { network: "testnet" });  // "cMzLdeG…"
wifToHex("KwdMAj…8617");                        // { hex, compressed: true, network: "mainnet" }
```

Errors are thrown as `KeyzerError` with a stable `code` (`INVALID_HEX`, `TOO_LONG`, `OUT_OF_RANGE`, `INVALID_WIF`, `EMPTY`).

## Security

Found a vulnerability? Please read [SECURITY.md](SECURITY.md) and report it privately instead of opening a public issue.

## License

[ISC](LICENSE) © hitallo azevedo
