const bs58check = require('bs58check');
const figlet = require('figlet')
const r = require('readline-sync')

const version = '0.0.1'

// Função para converter chave hexadecimal para WIF
function hexToWIF(hexKey) {
  // Adiciona o prefixo 0x80 (128 em decimal) no início da chave hexadecimal
  const prefix = Buffer.from('80', 'hex');
  const keyBuffer = Buffer.concat([prefix, Buffer.from(hexKey, 'hex')]);

  // Adiciona um sufixo de 0x01 se for uma chave comprimida
  const compressed = Buffer.from('01', 'hex');
  const keyBufferCompressed = Buffer.concat([keyBuffer, compressed]);

  // Calcula o checksum e concatena com a chave
  const wif = bs58check.encode(keyBufferCompressed);
  return wif;
}

const title = figlet('Keyzer', (err, data) => {
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }
  return data;
})

const fixKeyLength = (hexKey) => {
  hexKey = String(hexKey)
  if (hexKey.length < 64) {
    return "0".repeat(64 - hexKey.length) + hexKey
  }
}

async function main() {
  console.clear()
  console.log(await title + `${version}v`)
  console.log('='.repeat(60))

  let right = false;
  let hexKey = ''
  while (!right) {
    hexKey = String(r.question("Your hex private key (with initial zeros or not): ")).toLowerCase()
    if (Number(hexKey.search('[g-z]')) > -1) {
      console.log("your anwser must be an hexadecimal key");
    } else {
      right = true;
    }
  }
  const fixedKey = fixKeyLength(hexKey.toString())
  console.log(hexKey)
  console.log(fixedKey)
}

main()
// string hexadecimal de 32 bytes ou 256 bits que representa sua chave privada
// const hexKey = '3095683406838469680497637469843760948560949458604598609484863095'; 
// const wifKey = hexToWIF(hexKey);

// console.log('Chave WIF:', wifKey);