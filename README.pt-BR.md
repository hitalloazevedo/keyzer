<div align="center">

# 🔑 Keyzer

**Converta uma chave privada Bitcoin entre hex e WIF, 100% offline.**

Sua carteira te deu 64 caracteres hexadecimais e a outra pede um WIF (ou o contrário).
O Keyzer converte no seu próprio computador, então a chave nunca passa por um site.
Use como uma **página web única e offline** ou como **ferramenta de terminal**.

[![CI](https://github.com/hitalloazevedo/keyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/hitalloazevedo/keyzer/actions/workflows/ci.yml)
[![License: ISC](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
![Node](https://img.shields.io/badge/node-%E2%89%A524-brightgreen)

[English](README.md) · Português

</div>

```text
$ npm start

  _  __
 | |/ /___ _   _ _______ _ __
 | ' // _ \ | | |_  / _ \ '__|
 | . \  __/ |_| |/ /  __/ |
 |_|\_\___|\__, /___\___|_|
           |___/  v1.1.0
============================================================
Offline: nothing is sent anywhere. Leave the key empty to quit.

Paste your private key (hex or WIF): ················  (oculta enquanto você digita)
Detected: hex private key
  Hex     : 0c28fca386c7a227600b2fe50b7cae11ec86d3bf1fbe471be89827e19d72aa1d
  Network : mainnet
  Public key format: compressed
  WIF     : KwdMAjGmerYanjeui5SHS7JkmpZvVipYvB2LJGU1ZxJwYvP98617
  Address : 1LoVGDgRs9hTfTNJNuXKSpywcbdvwRXpmK  (legacy)
  SegWit  : bc1qmy63mjadtw8nhzl69ukdepwzsyvv4yex5qlmkd  (native SegWit)
  Compare an address with your wallet to confirm this is the right key.
```

> A chave acima é um vetor de teste público da [wiki do Bitcoin](https://en.bitcoin.it/wiki/Wallet_import_format). **Nunca use para fundos reais.**

## Por que o Keyzer

Colar uma chave privada em um "conversor online grátis" é confiar seu dinheiro ao servidor de um desconhecido. O Keyzer existe para que você não precise:

- **Offline por design.** O código não faz nenhuma requisição de rede, e a página web vem com uma Content-Security-Policy que faz o navegador bloquear qualquer conexão. Desligue o Wi-Fi e ela continua funcionando.
- **Pequeno o bastante para auditar.** Algumas centenas de linhas de TypeScript e apenas três dependências, todas auditadas e amplamente usadas: [`@scure/base`](https://github.com/paulmillr/scure-base), [`@noble/hashes`](https://github.com/paulmillr/noble-hashes) e [`@noble/curves`](https://github.com/paulmillr/noble-curves).
- **Cuidado com o seu segredo.** A chave é pedida de forma interativa e fica oculta enquanto você digita, então não vai para o histórico do terminal nem aparece na tela.
- **Validação rigorosa.** O checksum é verificado, erros de digitação são rejeitados e chaves fora do intervalo válido da secp256k1 são recusadas em vez de convertidas em silêncio.
- **Testado.** Coberto por testes com vetores de referência, conferidos contra uma implementação independente.

## O que ele converte

| De | Para | Observações |
| --- | --- | --- |
| Chave privada hex (64 caracteres) | WIF | Aceita prefixo `0x`, maiúsculas/minúsculas e chaves sem os zeros à esquerda |
| WIF | Chave privada hex | Também informa a rede e se é comprimida |

| WIF começa com | Rede | Chave pública |
| --- | --- | --- |
| `K` ou `L` | Mainnet | Comprimida (o padrão hoje) |
| `5` | Mainnet | Não comprimida (legado) |
| `c` | Testnet | Comprimida |
| `9` | Testnet | Não comprimida |

## Começando

### Opção A: a página web (sem programar, um arquivo só)

1. **[Baixe o `keyzer.html`](https://github.com/hitalloazevedo/keyzer/releases/latest/download/keyzer.html)** (cerca de 70 KB) na [última release](https://github.com/hitalloazevedo/keyzer/releases/latest).
2. **Desligue o Wi-Fi.**
3. Dê dois cliques no arquivo. Ele abre no navegador. Cole sua chave e copie o resultado.

Nada é instalado e nada é enviado. A página detecta sozinha se é hex ou WIF, oculta a chave enquanto você digita, avisa se precisou completar zeros e limpa tudo após 2 minutos de inatividade. Fala português e inglês.

#### Verifique seu download

Como você vai confiar uma chave privada a este arquivo, confirme que ele é o original. Baixe também o `SHA256SUMS` da mesma release e compare:

| Sistema | Comando |
| --- | --- |
| macOS / Linux | `shasum -a 256 keyzer.html` |
| Windows (PowerShell) | `Get-FileHash keyzer.html -Algorithm SHA256` |

O código exibido deve ser idêntico ao que está no `SHA256SUMS`. Se tiver o [GitHub CLI](https://cli.github.com), também dá para checar a attestation de proveniência assinada, que prova que o arquivo foi gerado a partir deste repositório pelo GitHub Actions:

```bash
gh attestation verify keyzer.html --repo hitalloazevedo/keyzer
```

<details>
<summary>Prefere gerar você mesmo?</summary>

1. Instale o [Node.js](https://nodejs.org) 24 ou mais novo.
2. Baixe este projeto (**Code → Download ZIP** e descompacte), abra um terminal nessa pasta e rode:
   ```bash
   npm ci
   npm run build:web
   ```
3. Seu arquivo é `dist-web/keyzer.html`. O build é reproduzível: com a mesma versão do código e do `package-lock.json`, você deve obter o mesmo SHA-256 publicado na release.

</details>

### Opção B: o terminal

Com [Node.js](https://nodejs.org) 24 ou mais novo, rode direto do npm, sem clonar nada:

```bash
npx @hitalloazevedo/keyzer
```

Ou a partir de um clone deste repositório:

```bash
npm install
npm start
```

Cole sua chave (hex ou WIF) e aperte Enter. As opções vão depois do comando (depois de `--` com `npm start`), por exemplo `npx @hitalloazevedo/keyzer --testnet`:

```text
--uncompressed   Hex -> WIF para chave pública não comprimida (WIF começa com 5 / 9)
--testnet        Hex -> WIF para a testnet do Bitcoin
--show-input     Mostra a chave enquanto digita, em vez de ocultá-la
-h, --help       Mostra a ajuda
-v, --version    Mostra a versão
```

## Perguntas frequentes

**O que é WIF?**
Wallet Import Format é uma forma de escrever uma chave privada que as carteiras sabem importar. É a mesma chave de 32 bytes mais um marcador de rede/compressão e um checksum, em Base58. Por isso um erro de digitação é detectado em vez de gerar a chave errada sem aviso.

**Por que ele adiciona zeros à minha chave?**
Algumas ferramentas cortam os zeros à esquerda de uma chave hex. Uma chave privada sempre tem 64 caracteres hex, então o Keyzer completa e informa quantos zeros adicionou. Confira esse número: se você colou uma chave truncada, ele vai aparecer.

**Funciona para Ethereum, Litecoin etc.?**
Não. O Keyzer suporta apenas Bitcoin (mainnet e testnet).

**Ele mostra o endereço da minha chave?**
Sim. Ele mostra o endereço legado (começa com `1`) e, para chaves comprimidas, o SegWit nativo (começa com `bc1q`). Compare um deles com a sua carteira para confirmar que é a chave certa. Endereços SegWit embrulhado (`3…`) e Taproot (`bc1p…`) não são exibidos.

**É seguro para valores altos?**
O Keyzer não protege contra malware no seu computador, programas que trocam o conteúdo da área de transferência ou alguém olhando sua tela. Para valores relevantes, use numa máquina limpa e offline e limpe o terminal depois. Veja o [SECURITY.md](SECURITY.md).

## Para desenvolvedores

```bash
npm install
npm test            # compila, checa os tipos do app web e roda os testes
npm run build       # compila a CLI para dist/
npm run dev:web     # app web com live reload
npm run build:web   # gera dist-web/keyzer.html (arquivo único, com CSP)
```

```text
src/
├── core/            Lógica de conversão pura, sem I/O. Reutilizável na CLI, na GUI ou em outros projetos
│   ├── hex.ts       Normaliza e valida chaves privadas hex
│   ├── wif.ts       hexToWif / wifToHex / isWif
│   └── analyze.ts   analyzeKey: detecta hex/WIF e converte (usado pela CLI e pela web)
└── cli/             Interface interativa de terminal
web/                 O app web em arquivo único (Vite + TypeScript, sem framework)
scripts/             finalize-web.mjs: confere que não há código de rede e injeta a CSP
```

O núcleo não depende de nada específico do Node, então também roda no navegador:

```ts
import { hexToWif, wifToHex } from "./src/core/index.js";

hexToWif("0c28…aa1d");                          // "KwdMAj…8617"
hexToWif("0c28…aa1d", { compressed: false });   // "5HueCG…yTJ"
hexToWif("0c28…aa1d", { network: "testnet" });  // "cMzLdeG…"
wifToHex("KwdMAj…8617");                        // { hex, compressed: true, network: "mainnet" }
```

Os erros são lançados como `KeyzerError`, com um `code` estável (`INVALID_HEX`, `TOO_LONG`, `OUT_OF_RANGE`, `INVALID_WIF`, `EMPTY`).

## Segurança

Encontrou uma vulnerabilidade? Leia o [SECURITY.md](SECURITY.md) e reporte em privado, sem abrir uma issue pública.

## Licença

[ISC](LICENSE) © hitallo azevedo
