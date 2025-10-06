import { CancelToken } from "../../src/core/CancelToken";
import { Cancel } from "../../src/core/Cancel";

describe("CancelToken", () => {
  describe("source method", () => {
    it("should create token and cancel function", () => {
      const source = CancelToken.source();

      expect(source.token).toBeInstanceOf(CancelToken);
      expect(typeof source.cancel).toBe("function");
    });

    it("should cancel token with message", () => {
      const source = CancelToken.source();
      const message = "Operation canceled";

      source.cancel(message);

      expect(source.token.reason).toBeInstanceOf(Cancel);
      expect(source.token.reason?.message).toBe(message);
    });
  });

  describe("constructor", () => {
    it("should execute executor function", () => {
      const executor = jest.fn();

      new CancelToken(executor);

      expect(executor).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should throw if executor is not function", () => {
      expect(() => {
        new (CancelToken as any)("not a function");
      }).toThrow("executor must be a function");
    });
  });

  describe("throwIfRequested", () => {
    it("should not throw if not canceled", () => {
      const token = new CancelToken(() => {});

      expect(() => token.throwIfRequested()).not.toThrow();
    });

    it("should throw if canceled", () => {
      const source = CancelToken.source();
      source.cancel("Test cancel");

      expect(() => source.token.throwIfRequested()).toThrow("Test cancel");
    });
  });

  describe("promise", () => {
    it("should resolve with Cancel when canceled", async () => {
      const source = CancelToken.source();

      setTimeout(() => {
        source.cancel("Timeout");
      }, 10);

      const reason = await source.token.promise;

      expect(reason).toBeInstanceOf(Cancel);
      expect(reason.message).toBe("Timeout");
    });
  });
});
