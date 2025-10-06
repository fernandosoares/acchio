import { Cancel, isCancel } from "../../src/core/Cancel";

describe("Cancel", () => {
  describe("Cancel class", () => {
    it("should create Cancel instance with message", () => {
      const message = "Operation canceled";
      const cancel = new Cancel(message);

      expect(cancel.message).toBe(message);
      expect((cancel as any).__CANCEL__).toBe(true);
    });

    it("should create Cancel instance without message", () => {
      const cancel = new Cancel();

      expect(cancel.message).toBeUndefined();
      expect((cancel as any).__CANCEL__).toBe(true);
    });

    it("should convert to string", () => {
      const cancel = new Cancel("Test message");
      expect(cancel.toString()).toBe("Cancel: Test message");
    });

    it("should convert to string without message", () => {
      const cancel = new Cancel();
      expect(cancel.toString()).toBe("Cancel");
    });
  });

  describe("isCancel function", () => {
    it("should return true for Cancel instances", () => {
      const cancel = new Cancel("test");
      expect(isCancel(cancel)).toBe(true);
    });

    it("should return false for non-Cancel objects", () => {
      expect(isCancel(new Error("test"))).toBe(false);
      expect(isCancel({})).toBe(false);
      expect(isCancel(null)).toBe(false);
      expect(isCancel(undefined)).toBe(false);
      expect(isCancel("string")).toBe(false);
    });

    it("should return false for objects with __CANCEL__ but not Cancel instance", () => {
      const fakeCancel = { __CANCEL__: true };

      // Agora deve retornar false porque não é uma instância de Cancel
      expect(isCancel(fakeCancel)).toBe(false);
    });

    it("should return false for Cancel-like objects without __CANCEL__", () => {
      class FakeCancel {
        message = "fake";
      }
      const fakeCancel = new FakeCancel();

      expect(isCancel(fakeCancel)).toBe(false);
    });
  });
});
