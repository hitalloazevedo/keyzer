import readline from "node:readline";
import { Writable } from "node:stream";

/**
 * Asks one question in the terminal. With `hidden`, what the user types is not
 * echoed (so a private key doesn't stay on screen). Resolves to `null` on EOF.
 */
export function ask(question: string, { hidden = false } = {}): Promise<string | null> {
  let muted = false;
  const output = new Writable({
    write(chunk, encoding, callback) {
      if (!muted) process.stdout.write(chunk, encoding);
      callback();
    },
  });
  const rl = readline.createInterface({ input: process.stdin, output, terminal: true });

  return new Promise((resolve) => {
    let answered = false;
    rl.on("SIGINT", () => {
      rl.close();
      process.stdout.write("\n");
      process.exit(130);
    });
    rl.on("close", () => {
      if (!answered) resolve(null);
    });
    rl.question(question, (answer) => {
      answered = true;
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
    muted = hidden; // mute only after the question itself was written
  });
}
