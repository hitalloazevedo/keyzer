import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CURVE_ORDER, hexToWif, isWif, KeyzerError, normalizeHexKey, wifToHex } from "./index.js";

// Reference vector from the Bitcoin wiki (https://en.bitcoin.it/wiki/Wallet_import_format).
// Testnet and compressed variants were cross-checked with an independent Python implementation.
const KEY = "0c28fca386c7a227600b2fe50b7cae11ec86d3bf1fbe471be89827e19d72aa1d";
const WIF = {
  mainnetUncompressed: "5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ",
  mainnetCompressed: "KwdMAjGmerYanjeui5SHS7JkmpZvVipYvB2LJGU1ZxJwYvP98617",
  testnetCompressed: "cMzLdeGd5vEqxB8B6VFQoRopQ3sLAAvEzDAoQgvX54xwofSWj1fx",
  testnetUncompressed: "91gGn1HgSap6CbU12F6z3pJri26xzp7Ay1VW6NHCoEayNXwRpu2",
};

function assertCode(fn: () => unknown, code: string) {
  assert.throws(fn, (e) => e instanceof KeyzerError && e.code === code);
}

describe("hexToWif", () => {
  it("converts a full 64-character key (regression: the original tool returned garbage)", () => {
    assert.equal(hexToWif(KEY), WIF.mainnetCompressed);
  });

  it("supports every network/compression combination", () => {
    assert.equal(hexToWif(KEY, { compressed: false }), WIF.mainnetUncompressed);
    assert.equal(hexToWif(KEY, { network: "testnet" }), WIF.testnetCompressed);
    assert.equal(hexToWif(KEY, { network: "testnet", compressed: false }), WIF.testnetUncompressed);
  });

  it("adds the missing leading zeros of a short key", () => {
    assert.equal(hexToWif(KEY.slice(1)), WIF.mainnetCompressed);
  });

  it("accepts 0x prefix, uppercase and surrounding whitespace", () => {
    assert.equal(hexToWif(`  0x${KEY.toUpperCase()}\n`), WIF.mainnetCompressed);
  });
});

describe("normalizeHexKey", () => {
  it("rejects characters that are not hexadecimal (regression: 'dead!!' used to be truncated)", () => {
    assertCode(() => normalizeHexKey("dead!!"), "INVALID_HEX");
    assertCode(() => normalizeHexKey("12zz"), "INVALID_HEX");
  });

  it("rejects empty input and keys longer than 64 characters", () => {
    assertCode(() => normalizeHexKey("   "), "EMPTY");
    assertCode(() => normalizeHexKey("0x"), "EMPTY");
    assertCode(() => normalizeHexKey(`1${KEY}`), "TOO_LONG");
  });

  it("rejects values outside the valid private key range [1, n-1]", () => {
    assertCode(() => normalizeHexKey("0"), "OUT_OF_RANGE");
    assertCode(() => normalizeHexKey(CURVE_ORDER.toString(16)), "OUT_OF_RANGE");
    assertCode(() => normalizeHexKey("f".repeat(64)), "OUT_OF_RANGE");
    assert.equal(normalizeHexKey((CURVE_ORDER - 1n).toString(16)).length, 64);
    assert.equal(normalizeHexKey("1"), "0".repeat(63) + "1");
  });
});

describe("wifToHex", () => {
  it("decodes all four WIF flavours back to the same key", () => {
    assert.deepEqual(wifToHex(WIF.mainnetCompressed), { hex: KEY, compressed: true, network: "mainnet" });
    assert.deepEqual(wifToHex(WIF.mainnetUncompressed), { hex: KEY, compressed: false, network: "mainnet" });
    assert.deepEqual(wifToHex(WIF.testnetCompressed), { hex: KEY, compressed: true, network: "testnet" });
    assert.deepEqual(wifToHex(WIF.testnetUncompressed), { hex: KEY, compressed: false, network: "testnet" });
  });

  it("round-trips", () => {
    for (const compressed of [true, false]) {
      for (const network of ["mainnet", "testnet"] as const) {
        const decoded = wifToHex(hexToWif(KEY, { compressed, network }));
        assert.deepEqual(decoded, { hex: KEY, compressed, network });
      }
    }
  });

  it("rejects a WIF with a typo (bad checksum)", () => {
    const typo = WIF.mainnetCompressed.slice(0, -1) + "8";
    assertCode(() => wifToHex(typo), "INVALID_WIF");
  });

  it("rejects things that are not a WIF", () => {
    assertCode(() => wifToHex("not a wif"), "INVALID_WIF");
    assertCode(() => wifToHex(KEY), "INVALID_WIF");
    // A valid base58check string that is a Bitcoin *address*, not a private key.
    assertCode(() => wifToHex("1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2"), "INVALID_WIF");
    assertCode(() => wifToHex(""), "EMPTY");
  });
});

describe("isWif", () => {
  it("tells WIF apart from hex", () => {
    assert.equal(isWif(WIF.mainnetCompressed), true);
    assert.equal(isWif(KEY), false);
  });
});
