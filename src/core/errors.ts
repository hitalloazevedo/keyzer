export type KeyzerErrorCode =
  | "EMPTY"
  | "INVALID_HEX"
  | "TOO_LONG"
  | "OUT_OF_RANGE"
  | "INVALID_WIF";

/** Error with a stable `code`, so any front-end (CLI, GUI) can show its own message. */
export class KeyzerError extends Error {
  constructor(
    readonly code: KeyzerErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "KeyzerError";
  }
}
