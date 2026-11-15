## How to use

1. Download **`keyzer.html`** (below, under *Assets*).
2. **Turn off your Wi-Fi / unplug the network cable.**
3. Double-click the file. It opens in your browser. Paste your key and copy the result.

Nothing is installed and nothing is uploaded: the page blocks all network connections.

## Verify your download (recommended)

Download `SHA256SUMS` too, then compare the fingerprint of your file with the one inside it.

- **macOS / Linux:** `shasum -a 256 keyzer.html`
- **Windows (PowerShell):** `Get-FileHash keyzer.html -Algorithm SHA256`

The long code must be identical to the one in `SHA256SUMS`. If it differs, **don't use the file**.

Advanced: this file has a signed build-provenance attestation proving it was built from this repository by GitHub Actions.
With the [GitHub CLI](https://cli.github.com): `gh attestation verify keyzer.html --repo hitalloazevedo/keyzer`

You can also build it yourself from this tag (`npm ci && npm run build:web`) and compare: the build is reproducible.

> ⚠️ Keyzer can't protect you from malware on your computer. For large amounts, use a clean, offline device. See [SECURITY.md](https://github.com/hitalloazevedo/keyzer/blob/main/SECURITY.md).
