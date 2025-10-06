import { AcchioCancel } from "./types";

export class Cancel implements AcchioCancel {
  public __CANCEL__ = true;

  constructor(public message?: string) {}

  toString(): string {
    return this.message ? `Cancel: ${this.message}` : "Cancel";
  }
}

export function isCancel(value: any): boolean {
  return !!(value && value instanceof Cancel);
}
