import { InterceptorManager } from "../../src/utils/interceptors";

describe("InterceptorManager", () => {
  let interceptorManager: InterceptorManager<number>;

  beforeEach(() => {
    interceptorManager = new InterceptorManager<number>();
  });

  describe("use method", () => {
    it("should add interceptor and return id", () => {
      const fulfilled = jest.fn((value: number) => value * 2);
      const rejected = jest.fn();

      const id = interceptorManager.use(fulfilled, rejected);

      expect(id).toBe(0);
    });

    it("should handle multiple interceptors", () => {
      const id1 = interceptorManager.use((value) => value + 1);
      const id2 = interceptorManager.use((value) => value * 2);

      expect(id1).toBe(0);
      expect(id2).toBe(1);
    });
  });

  describe("eject method", () => {
    it("should remove interceptor by id", () => {
      const fulfilled = jest.fn();
      const id = interceptorManager.use(fulfilled);

      interceptorManager.eject(id);

      // O interceptor deve ser removido
      interceptorManager.forEach((interceptor) => {
        expect(interceptor.fulfilled).not.toBe(fulfilled);
      });
    });

    it("should not throw when ejecting non-existent id", () => {
      expect(() => interceptorManager.eject(999)).not.toThrow();
    });
  });

  describe("forEach method", () => {
    it("should iterate over all interceptors", () => {
      const interceptor1 = jest.fn((value: number) => value);
      const interceptor2 = jest.fn((value: number) => value);

      interceptorManager.use(interceptor1);
      interceptorManager.use(interceptor2);

      const mockCallback = jest.fn();
      interceptorManager.forEach(mockCallback);

      expect(mockCallback).toHaveBeenCalledTimes(2);
    });

    it("should not include ejected interceptors", () => {
      const interceptor1 = jest.fn();
      const interceptor2 = jest.fn();

      const id1 = interceptorManager.use(interceptor1);
      interceptorManager.use(interceptor2);

      interceptorManager.eject(id1);

      const mockCallback = jest.fn();
      interceptorManager.forEach(mockCallback);

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("clear method", () => {
    it("should remove all interceptors", () => {
      interceptorManager.use(jest.fn());
      interceptorManager.use(jest.fn());

      interceptorManager.clear();

      const mockCallback = jest.fn();
      interceptorManager.forEach(mockCallback);

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
});
