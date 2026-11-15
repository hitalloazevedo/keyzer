import type { KeyzerErrorCode } from "../../src/core/index.js";

export type Lang = "en" | "pt";

interface Strings {
  tagline: string;
  online: string;
  offline: string;
  keyLabel: string;
  placeholder: string;
  show: string;
  hide: string;
  clearAll: string;
  hint: string;
  detectedHex: string;
  detectedWif: string;
  advanced: string;
  advancedNote: string;
  mainnet: string;
  testnet: string;
  compressed: string;
  compressedHelp: string;
  networkLabel: string;
  resultWif: string;
  resultHex: string;
  copy: string;
  copied: string;
  copyFailed: string;
  clearClipboard: string;
  clipboardNote: string;
  clipboardCleared: string;
  detailNetwork: string;
  detailFormat: string;
  detailHex: string;
  detailAddressLegacy: string;
  detailAddressSegwit: string;
  addressHint: string;
  formatCompressed: string;
  formatUncompressed: string;
  padded: (n: number) => string;
  idleCleared: string;
  safeTitle: string;
  safeBody: string[];
  tips: string;
  source: string;
  errors: Record<KeyzerErrorCode, string>;
}

export const STRINGS: Record<Lang, Strings> = {
  en: {
    tagline: "Convert a Bitcoin private key between hex and WIF, right here, offline.",
    online: "Online: for maximum safety, disconnect from the internet before pasting your key.",
    offline: "Offline: safest way to use Keyzer.",
    keyLabel: "Your private key (hex or WIF)",
    placeholder: "Paste it here",
    show: "Show",
    hide: "Hide",
    clearAll: "Clear everything",
    hint: "Paste a hex key (64 characters) or a WIF. We detect which one it is.",
    detectedHex: "Hex private key detected. Here is the WIF:",
    detectedWif: "Valid WIF (checksum OK). Here is the hex key:",
    advanced: "Advanced options",
    advancedNote: "These only apply when converting hex to WIF.",
    mainnet: "Mainnet (real Bitcoin)",
    testnet: "Testnet (test coins)",
    compressed: "Compressed public key",
    compressedHelp: "Recommended. Turn off only for very old wallets (WIF starting with 5).",
    networkLabel: "Network",
    resultWif: "WIF",
    resultHex: "Hex private key",
    copy: "Copy",
    copied: "Copied!",
    copyFailed: "Could not copy. Select the text and copy it manually.",
    clearClipboard: "Clear clipboard",
    clipboardNote: "The key is now in your clipboard. Clear it when you're done.",
    clipboardCleared: "Clipboard cleared.",
    detailNetwork: "Network",
    detailFormat: "Public key",
    detailHex: "Hex (64 characters)",
    detailAddressLegacy: "Address (legacy)",
    detailAddressSegwit: "Address (SegWit)",
    addressHint: "Compare one of these addresses with your wallet to confirm this is the right key.",
    formatCompressed: "Compressed",
    formatUncompressed: "Uncompressed",
    padded: (n) =>
      `Your key had ${64 - n} characters. We added ${n} leading zero${n > 1 ? "s" : ""} to reach 64. Make sure you pasted the whole key.`,
    idleCleared: "Cleared automatically after 2 minutes of inactivity.",
    safeTitle: "Why is this page safe?",
    safeBody: [
      "This is a single file. It has no network access: its Content-Security-Policy tells your browser to block every connection, so your key cannot be sent anywhere.",
      "You can check it yourself: turn off your Wi-Fi and it keeps working. The full source code is open on GitHub.",
      "It cannot protect you from malware on your computer or from someone watching your screen. For large amounts, use a clean device.",
    ],
    tips: "Never paste a private key you still use into a website, chat or AI assistant.",
    source: "Source code",
    errors: {
      EMPTY: "Paste your key above.",
      INVALID_HEX: "This isn't a valid hex key: only the characters 0-9 and a-f are allowed. If it's a WIF, check for typos.",
      TOO_LONG: "This is too long for a private key (64 hex characters at most).",
      OUT_OF_RANGE: "This value isn't a valid Bitcoin private key.",
      INVALID_WIF: "This WIF is not valid. The checksum failed, which usually means a typo or a missing character.",
    },
  },
  pt: {
    tagline: "Converta uma chave privada Bitcoin entre hex e WIF, aqui mesmo, offline.",
    online: "Online: para mais segurança, desconecte a internet antes de colar sua chave.",
    offline: "Offline: a forma mais segura de usar o Keyzer.",
    keyLabel: "Sua chave privada (hex ou WIF)",
    placeholder: "Cole aqui",
    show: "Mostrar",
    hide: "Ocultar",
    clearAll: "Limpar tudo",
    hint: "Cole uma chave hex (64 caracteres) ou um WIF. Detectamos qual é.",
    detectedHex: "Chave privada hex detectada. Aqui está o WIF:",
    detectedWif: "WIF válido (checksum OK). Aqui está a chave hex:",
    advanced: "Opções avançadas",
    advancedNote: "Valem só ao converter de hex para WIF.",
    mainnet: "Mainnet (Bitcoin real)",
    testnet: "Testnet (moedas de teste)",
    compressed: "Chave pública comprimida",
    compressedHelp: "Recomendado. Desative só para carteiras muito antigas (WIF começando com 5).",
    networkLabel: "Rede",
    resultWif: "WIF",
    resultHex: "Chave privada hex",
    copy: "Copiar",
    copied: "Copiado!",
    copyFailed: "Não foi possível copiar. Selecione o texto e copie manualmente.",
    clearClipboard: "Limpar área de transferência",
    clipboardNote: "A chave está na sua área de transferência. Limpe quando terminar.",
    clipboardCleared: "Área de transferência limpa.",
    detailNetwork: "Rede",
    detailFormat: "Chave pública",
    detailHex: "Hex (64 caracteres)",
    detailAddressLegacy: "Endereço (legado)",
    detailAddressSegwit: "Endereço (SegWit)",
    addressHint: "Compare um destes endereços com a sua carteira para confirmar que esta é a chave certa.",
    formatCompressed: "Comprimida",
    formatUncompressed: "Não comprimida",
    padded: (n) =>
      `Sua chave tinha ${64 - n} caracteres. Adicionamos ${n} zero${n > 1 ? "s" : ""} à esquerda para chegar a 64. Confira se você colou a chave inteira.`,
    idleCleared: "Limpo automaticamente após 2 minutos de inatividade.",
    safeTitle: "Por que esta página é segura?",
    safeBody: [
      "É um arquivo único e sem acesso à rede: a Content-Security-Policy dele manda o navegador bloquear qualquer conexão, então sua chave não tem como ser enviada a lugar nenhum.",
      "Você mesmo pode conferir: desligue o Wi-Fi e ela continua funcionando. O código-fonte completo é aberto, no GitHub.",
      "Ela não protege contra malware no seu computador nem contra alguém olhando sua tela. Para valores altos, use um dispositivo limpo.",
    ],
    tips: "Nunca cole em um site, chat ou assistente de IA uma chave privada que você ainda usa.",
    source: "Código-fonte",
    errors: {
      EMPTY: "Cole sua chave acima.",
      INVALID_HEX: "Isto não é uma chave hex válida: só os caracteres 0-9 e a-f são aceitos. Se for um WIF, procure erros de digitação.",
      TOO_LONG: "Isto é longo demais para uma chave privada (no máximo 64 caracteres hex).",
      OUT_OF_RANGE: "Este valor não é uma chave privada Bitcoin válida.",
      INVALID_WIF: "Este WIF não é válido. O checksum falhou, o que normalmente indica erro de digitação ou caractere faltando.",
    },
  },
};

export function detectLang(): Lang {
  return navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en";
}
