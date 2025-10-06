import { AcchioCancelToken, AcchioCancel } from "./types";
import { Cancel } from "./Cancel";

export class CancelToken implements AcchioCancelToken {
  public promise: Promise<Cancel>;
  public reason?: Cancel;

  private _listeners: Array<(cancel: Cancel) => void> = [];

  constructor(executor: (cancel: (message?: string) => void) => void) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }

    let resolvePromise: (cancel: Cancel) => void;

    this.promise = new Promise<Cancel>((resolve) => {
      resolvePromise = resolve;
    });

    executor((message) => {
      if (this.reason) {
        // Cancellation has already been requested
        return;
      }

      this.reason = new Cancel(message);
      resolvePromise(this.reason);

      this._listeners.forEach((listener) => {
        listener(this.reason!);
      });
      this._listeners = [];
    });
  }

  throwIfRequested(): void {
    if (this.reason) {
      throw this.reason;
    }
  }

  subscribe(listener: (cancel: Cancel) => void): void {
    if (this.reason) {
      listener(this.reason);
      return;
    }

    this._listeners.push(listener);
  }

  unsubscribe(listener: (cancel: Cancel) => void): void {
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }

  static source() {
    let cancel!: (message?: string) => void;
    const token = new CancelToken((c) => {
      cancel = c;
    });
    return {
      token,
      cancel,
    };
  }
}
