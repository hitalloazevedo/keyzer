import bs58check from "bs58check";
import figlet from "figlet";
import r from "readline-sync";

const version = "0.0.1";

function hexToWIF(hexKey: string): string {
  // Adiciona o prefixo 0x80 (128 em decimal) no início da chave hexadecimal
  const prefix = Buffer.from("80", "hex");
  const keyBuffer = Buffer.concat([prefix, Buffer.from(hexKey, "hex")]);

  // Adiciona um sufixo de 0x01 se for uma chave comprimida
  const compressed = Buffer.from("01", "hex");
  const keyBufferCompressed = Buffer.concat([keyBuffer, compressed]);

  // Calcula o checksum e concatena com a chave
  const wif = bs58check.encode(keyBufferCompressed);
  return wif.toString();
}

const title = figlet("Keyzer", (err, data) => {
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }
  return data;
});

const fixKeyLength = (hexKey: string) => {
  hexKey = String(hexKey);
  if (hexKey.length < 64) {
    return ("0".repeat(64 - hexKey.length) + hexKey).toString();
  }
  return "";
};

async function main() {
  console.clear();
  console.log((await title) + `${version}v`);
  console.log("=".repeat(60));

  let right = false;
  let hexKey = "";
  while (!right) {
    hexKey = String(
      r.question("Your hex private key (with initial zeros or not): ")
    ).toLowerCase();
    if (Number(hexKey.search("[g-z]")) > -1) {
      console.log("your anwser must be an hexadecimal key");
    } else {
      right = true;
    }
  }
  const fixedKey = fixKeyLength(hexKey.toString());
  console.log(`Is your hex key correct? [${fixedKey}]`);
  let anwser = String(r.question(`[Yes (y) / No (n)]: `))[0].toLowerCase();

  if (anwser === "y") {
    const wifKey = hexToWIF(fixedKey);
    console.log("WIF key: " + wifKey);
  } else {
    main();
  }
}

main();
