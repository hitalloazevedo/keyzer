import { KeyzerError } from "./errors.js";

/** Order of the secp256k1 curve. A valid private key is in [1, n - 1]. */
export const CURVE_ORDER =
  0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;

/** Removes whitespace and a leading `0x`, without validating anything. */
export function stripHexDecorations(input: string): string {
  return input.replace(/\s+/g, "").replace(/^0x/i, "");
}

/**
 * Cleans up and validates a hex private key, returning exactly 64 lowercase
 * hex characters.
 *
 * Accepted: optional `0x` prefix, surrounding/inner whitespace, upper or lower
 * case, and keys shorter than 64 characters (missing leading zeros are added,
 * since many tools drop them).
 */
export function normalizeHexKey(input: string): string {
  const hex = stripHexDecorations(input);

  if (hex === "") {
    throw new KeyzerError("EMPTY", "No key was provided.");
  }
  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    throw new KeyzerError(
      "INVALID_HEX",
      "A hex key may only contain the characters 0-9 and a-f.",
    );
  }
  if (hex.length > 64) {
    throw new KeyzerError(
      "TOO_LONG",
      `A private key has at most 64 hex characters, but ${hex.length} were given.`,
    );
  }

  const normalized = hex.padStart(64, "0").toLowerCase();
  const value = BigInt(`0x${normalized}`);
  if (value === 0n || value >= CURVE_ORDER) {
    throw new KeyzerError(
      "OUT_OF_RANGE",
      "This value is not a valid Bitcoin private key (it must be between 1 and the secp256k1 curve order).",
    );
  }
  return normalized;
}
