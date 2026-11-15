import { sha256 } from "@noble/hashes/sha2.js";
import { createBase58check, hex as hexCodec } from "@scure/base";
import { KeyzerError } from "./errors.js";
import { normalizeHexKey } from "./hex.js";

const base58check = createBase58check(sha256);

export type Network = "mainnet" | "testnet";

/** First byte of the WIF payload, per network. */
const VERSION_BYTE: Record<Network, number> = { mainnet: 0x80, testnet: 0xef };

export interface WifOptions {
  /** Whether the key is for a compressed public key (WIF starts with K/L or c). Default: true. */
  compressed?: boolean;
  /** Default: "mainnet". */
  network?: Network;
}

export interface DecodedWif {
  /** 64 lowercase hex characters. */
  hex: string;
  compressed: boolean;
  network: Network;
}

/** Converts a hex private key to WIF (Wallet Import Format). */
export function hexToWif(
  hexKey: string,
  { compressed = true, network = "mainnet" }: WifOptions = {},
): string {
  const key = hexCodec.decode(normalizeHexKey(hexKey));

  const payload = new Uint8Array(compressed ? 34 : 33);
  payload[0] = VERSION_BYTE[network];
  payload.set(key, 1);
  if (compressed) payload[33] = 0x01;

  return base58check.encode(payload);
}

/** Converts a WIF back to a hex private key, validating checksum and format. */
export function wifToHex(wif: string): DecodedWif {
  const text = wif.trim();
  if (text === "") {
    throw new KeyzerError("EMPTY", "No key was provided.");
  }

  let payload: Uint8Array;
  try {
    payload = base58check.decode(text);
  } catch {
    throw new KeyzerError(
      "INVALID_WIF",
      "Invalid WIF: it has invalid characters or a wrong checksum (a typo, most likely).",
    );
  }

  const network = (Object.keys(VERSION_BYTE) as Network[]).find(
    (n) => VERSION_BYTE[n] === payload[0],
  );
  const compressed = payload.length === 34 && payload[33] === 0x01;
  const validLength = payload.length === 33 || compressed;
  if (!network || !validLength) {
    throw new KeyzerError("INVALID_WIF", "This is not a Bitcoin private key in WIF format.");
  }

  // Reuse the hex validation so a WIF holding an out-of-range key is rejected too.
  const hex = normalizeHexKey(hexCodec.encode(payload.slice(1, 33)));
  return { hex, compressed, network };
}

/** True if `text` is a structurally valid WIF (correct checksum, prefix and length). */
export function isWif(text: string): boolean {
  try {
    wifToHex(text);
    return true;
  } catch {
    return false;
  }
}
