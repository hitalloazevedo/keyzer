import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeKey } from "./index.js";

const KEY = "0c28fca386c7a227600b2fe50b7cae11ec86d3bf1fbe471be89827e19d72aa1d";
const WIF = "KwdMAjGmerYanjeui5SHS7JkmpZvVipYvB2LJGU1ZxJwYvP98617";

describe("analyzeKey", () => {
  it("treats blank input as empty (not an error)", () => {
    assert.deepEqual(analyzeKey(""), { kind: "empty" });
    assert.deepEqual(analyzeKey("  \n"), { kind: "empty" });
    assert.deepEqual(analyzeKey("0x"), { kind: "empty" });
  });

  it("detects hex and converts it, honouring the options", () => {
    assert.deepEqual(analyzeKey(KEY), {
      kind: "hex", hex: KEY, padded: 0, wif: WIF, compressed: true, network: "mainnet",
    });
    const testnet = analyzeKey(KEY, { network: "testnet", compressed: false });
    assert.equal(testnet.kind === "hex" && testnet.wif, "91gGn1HgSap6CbU12F6z3pJri26xzp7Ay1VW6NHCoEayNXwRpu2");
  });

  it("reports how many zeros were added to a short key", () => {
    const result = analyzeKey(KEY.slice(1)); // KEY starts with a "0" that some tools drop
    assert.equal(result.kind === "hex" && result.padded, 1);
    assert.equal(result.kind === "hex" && result.hex, KEY);

    const tiny = analyzeKey("ff");
    assert.equal(tiny.kind === "hex" && tiny.padded, 62);
  });

  it("detects a WIF and ignores the hex->WIF options", () => {
    assert.deepEqual(analyzeKey(` ${WIF} `, { network: "testnet", compressed: false }), {
      kind: "wif", hex: KEY, compressed: true, network: "mainnet",
    });
  });

  it("blames the checksum, not the alphabet, when a WIF has a typo", () => {
    const typo = WIF.slice(0, -1) + "8";
    const result = analyzeKey(typo);
    assert.equal(result.kind === "error" && result.code, "INVALID_WIF");
  });

  it("returns errors instead of throwing", () => {
    assert.equal(analyzeKey("dead!!").kind === "error" && analyzeKey("dead!!").kind, "error");
    const tooLong = analyzeKey("1" + KEY);
    assert.equal(tooLong.kind === "error" && tooLong.code, "TOO_LONG");
    const zero = analyzeKey("0");
    assert.equal(zero.kind === "error" && zero.code, "OUT_OF_RANGE");
  });
});
