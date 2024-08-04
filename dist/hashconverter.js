"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bs58check_1 = __importDefault(require("bs58check"));
const figlet_1 = __importDefault(require("figlet"));
const readline_sync_1 = __importDefault(require("readline-sync"));
const version = "0.0.1";
// Função para converter chave hexadecimal para WIF
function hexToWIF(hexKey) {
    // Adiciona o prefixo 0x80 (128 em decimal) no início da chave hexadecimal
    const prefix = Buffer.from("80", "hex");
    const keyBuffer = Buffer.concat([prefix, Buffer.from(hexKey, "hex")]);
    // Adiciona um sufixo de 0x01 se for uma chave comprimida
    const compressed = Buffer.from("01", "hex");
    const keyBufferCompressed = Buffer.concat([keyBuffer, compressed]);
    // Calcula o checksum e concatena com a chave
    const wif = bs58check_1.default.encode(keyBufferCompressed);
    return wif.toString();
}
const title = (0, figlet_1.default)("Keyzer", (err, data) => {
    if (err) {
        console.log("Something went wrong...");
        console.dir(err);
        return;
    }
    return data;
});
const fixKeyLength = (hexKey) => {
    hexKey = String(hexKey);
    if (hexKey.length < 64) {
        return ("0".repeat(64 - hexKey.length) + hexKey).toString();
    }
    return "";
};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.clear();
        console.log((yield title) + `${version}v`);
        console.log("=".repeat(60));
        let right = false;
        let hexKey = "";
        while (!right) {
            hexKey = String(readline_sync_1.default.question("Your hex private key (with initial zeros or not): ")).toLowerCase();
            if (Number(hexKey.search("[g-z]")) > -1) {
                console.log("your anwser must be an hexadecimal key");
            }
            else {
                right = true;
            }
        }
        const fixedKey = fixKeyLength(hexKey.toString());
        console.log(`Is your hex key correct? [${fixedKey}]`);
        let anwser = String(readline_sync_1.default.question(`[Yes (y) / No (n)]: `))[0].toLowerCase();
        if (anwser === "y") {
            const wifKey = hexToWIF(fixedKey);
            console.log("WIF key: " + wifKey);
        }
        else {
            main();
        }
    });
}
main();
