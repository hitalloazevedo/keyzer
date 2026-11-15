import { secp256k1 } from "@noble/curves/secp256k1.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { ripemd160 } from "@noble/hashes/legacy.js";
import { bech32, createBase58check, hex as hexCodec } from "@scure/base";
import { normalizeHexKey } from "./hex.js";
import type { Network, WifOptions } from "./wif.js";

const base58check = createBase58check(sha256);

/** Version byte of a P2PKH address, per network. */
const P2PKH_VERSION: Record<Network, number> = { mainnet: 0x00, testnet: 0x6f };
/** Human-readable part of a native SegWit address, per network. */
const BECH32_HRP: Record<Network, string> = { mainnet: "bc", testnet: "tb" };

export interface Addresses {
  /** Legacy address (starts with 1 on mainnet, m/n on testnet). */
  p2pkh: string;
  /** Native SegWit address (bc1q... / tb1q...). Only exists for compressed public keys. */
  p2wpkh?: string;
}

/**
 * Derives the Bitcoin addresses that belong to a private key, so a user can
 * check it is the key of the wallet they expect.
 *
 * A native SegWit address is only defined for compressed public keys, so
 * `p2wpkh` is omitted when `compressed` is false.
 */
export function deriveAddresses(
  hexKey: string,
  { compressed = true, network = "mainnet" }: WifOptions = {},
): Addresses {
  const privateKey = hexCodec.decode(normalizeHexKey(hexKey));
  const publicKey = secp256k1.getPublicKey(privateKey, compressed);
  const hash160 = ripemd160(sha256(publicKey));

  const payload = new Uint8Array(21);
  payload[0] = P2PKH_VERSION[network];
  payload.set(hash160, 1);
  const addresses: Addresses = { p2pkh: base58check.encode(payload) };

  if (compressed) {
    // Witness version 0 followed by the 20-byte program, encoded as bech32 (BIP 173).
    addresses.p2wpkh = bech32.encode(BECH32_HRP[network], [0, ...bech32.toWords(hash160)]);
  }
  return addresses;
}
