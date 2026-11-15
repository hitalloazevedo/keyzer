import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeKey, deriveAddresses, KeyzerError } from "./index.js";

// Expected values come from an independent implementation (secp256k1, RIPEMD-160,
// Base58Check and bech32 written from the specs), not from the libraries used here.
// Key 1 also matches the well-known public vectors (e.g. BIP 173's bc1qw508d6...).
const ONE = "1";
const WIKI = "0c28fca386c7a227600b2fe50b7cae11ec86d3bf1fbe471be89827e19d72aa1d";

const VECTORS = [
  { key: ONE, compressed: true, network: "mainnet", p2pkh: "1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH", p2wpkh: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4" },
  { key: ONE, compressed: true, network: "testnet", p2pkh: "mrCDrCybB6J1vRfbwM5hemdJz73FwDBC8r", p2wpkh: "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx" },
  { key: ONE, compressed: false, network: "mainnet", p2pkh: "1EHNa6Q4Jz2uvNExL497mE43ikXhwF6kZm" },
  { key: ONE, compressed: false, network: "testnet", p2pkh: "mtoKs9V381UAhUia3d7Vb9GNak8Qvmcsme" },
  { key: WIKI, compressed: true, network: "mainnet", p2pkh: "1LoVGDgRs9hTfTNJNuXKSpywcbdvwRXpmK", p2wpkh: "bc1qmy63mjadtw8nhzl69ukdepwzsyvv4yex5qlmkd" },
  { key: WIKI, compressed: true, network: "testnet", p2pkh: "n1KSZGmQgB8iSZqv6UVhGkCGUbEdw8Lm3Q", p2wpkh: "tb1qmy63mjadtw8nhzl69ukdepwzsyvv4yex7xygd7" },
  { key: WIKI, compressed: false, network: "mainnet", p2pkh: "1GAehh7TsJAHuUAeKZcXf5CnwuGuGgyX2S" },
  { key: WIKI, compressed: false, network: "testnet", p2pkh: "mvgbzkCSgKbYgaeG38auUzR7otscEGi8U7" },
] as const;

describe("deriveAddresses", () => {
  for (const v of VECTORS) {
    it(`key ...${v.key.slice(-6)} ${v.compressed ? "compressed" : "uncompressed"} ${v.network}`, () => {
      const result = deriveAddresses(v.key, { compressed: v.compressed, network: v.network });
      assert.equal(result.p2pkh, v.p2pkh);
      assert.equal(result.p2wpkh, "p2wpkh" in v ? v.p2wpkh : undefined);
    });
  }

  it("defaults to a compressed mainnet key", () => {
    assert.deepEqual(deriveAddresses(ONE), {
      p2pkh: "1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH",
      p2wpkh: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
    });
  });

  it("rejects invalid private keys", () => {
    assert.throws(() => deriveAddresses("0"), (e) => e instanceof KeyzerError && e.code === "OUT_OF_RANGE");
    assert.throws(() => deriveAddresses("zz"), (e) => e instanceof KeyzerError && e.code === "INVALID_HEX");
  });
});

describe("analyzeKey addresses", () => {
  it("includes the addresses for a hex key, following the options", () => {
    const r = analyzeKey(WIKI, { compressed: false, network: "testnet" });
    assert.equal(r.kind === "hex" && r.addresses.p2pkh, "mvgbzkCSgKbYgaeG38auUzR7otscEGi8U7");
    assert.equal(r.kind === "hex" && r.addresses.p2wpkh, undefined);
  });

  it("derives addresses from a WIF using the format stored in the WIF itself", () => {
    const uncompressedWif = "5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ";
    const w = analyzeKey(uncompressedWif, { compressed: true, network: "testnet" }); // options must be ignored
    assert.equal(w.kind === "wif" && w.addresses.p2pkh, "1GAehh7TsJAHuUAeKZcXf5CnwuGuGgyX2S");
    assert.equal(w.kind === "wif" && w.addresses.p2wpkh, undefined);
  });
});
