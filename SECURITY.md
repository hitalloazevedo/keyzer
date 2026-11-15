# Security

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Use GitHub's private reporting instead:
**Security → Report a vulnerability** on this repository.

Include what you found, how to reproduce it, and the impact you see. You'll get a reply as soon as possible.

## What Keyzer does to protect you

- Makes no network requests.
- Asks for the key interactively (hidden by default), so it doesn't land in shell history or on screen.
- Validates checksums and the valid private key range instead of silently converting bad input.
- Keeps dependencies to a minimum: [`@scure/base`](https://github.com/paulmillr/scure-base) and [`@noble/hashes`](https://github.com/paulmillr/noble-hashes).

## What Keyzer cannot protect you from

Keyzer runs on your computer, so it is only as safe as that computer. It cannot defend against:

- **Malware or keyloggers** on the machine.
- **Clipboard hijackers** that replace what you copy or paste.
- **Screen sharing, screenshots or shoulder surfing** while the result is displayed.
- **A tampered copy of Keyzer.** Get it only from this repository, and read the code if you can.

## Good practice for significant funds

1. Use a clean machine, ideally one that stays offline (for example a live USB system such as Tails).
2. Disconnect from the internet before pasting the key.
3. Clear the terminal (`clear`, then close the window) and the clipboard afterwards.
4. Never paste a private key you still use into any website, chat or AI assistant.
5. Test the whole flow first with a throwaway key and a tiny amount.
