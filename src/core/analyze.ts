import { deriveAddresses, type Addresses } from "./address.js";
import { KeyzerError, type KeyzerErrorCode } from "./errors.js";
import { normalizeHexKey, stripHexDecorations } from "./hex.js";
import { hexToWif, isWif, wifToHex, type Network, type WifOptions } from "./wif.js";

export type Analysis =
  | { kind: "empty" }
  | { kind: "error"; code: KeyzerErrorCode; message: string }
  | { kind: "wif"; hex: string; compressed: boolean; network: Network; addresses: Addresses }
  | {
      kind: "hex";
      hex: string;
      padded: number;
      wif: string;
      compressed: boolean;
      network: Network;
      addresses: Addresses;
    };

/** Shape of a WIF: starts with 5/K/L (mainnet) or 9/c (testnet), 51-52 Base58 characters. */
const LOOKS_LIKE_WIF = /^[5KLc9][1-9A-HJ-NP-Za-km-z]{50,51}$/;

/**
 * Detects what `input` is (hex private key or WIF) and converts it to the other
 * format. Never throws: problems come back as `{ kind: "error" }`, which is
 * what a UI wants while the user is still typing.
 *
 * `options` only affect hex -> WIF (a WIF already carries its own network and
 * compression).
 */
export function analyzeKey(input: string, options: WifOptions = {}): Analysis {
  const { compressed = true, network = "mainnet" } = options;
  const text = input.trim();
  if (text === "") return { kind: "empty" };

  try {
    if (isWif(text)) {
      const decoded = wifToHex(text);
      return { kind: "wif", ...decoded, addresses: deriveAddresses(decoded.hex, decoded) };
    }

    // Not a valid WIF. If it still looks like one (e.g. a typo broke the checksum),
    // report the WIF problem instead of a confusing "not hexadecimal" message.
    if (LOOKS_LIKE_WIF.test(text) && !/^[0-9a-fA-F]+$/.test(text)) wifToHex(text);

    const hex = normalizeHexKey(text);
    const padded = hex.length - stripHexDecorations(text).length;
    const wif = hexToWif(hex, { compressed, network });
    const addresses = deriveAddresses(hex, { compressed, network });
    return { kind: "hex", hex, padded, wif, compressed, network, addresses };
  } catch (error) {
    if (!(error instanceof KeyzerError)) throw error;
    if (error.code === "EMPTY") return { kind: "empty" };
    return { kind: "error", code: error.code, message: error.message };
  }
}
