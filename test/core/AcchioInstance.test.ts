import { AcchioInstanceImpl } from "../../src/core/AcchioInstance";
import { BrowserAdapter } from "../../src/adapters/BrowserAdapter";

// Mock do BrowserAdapter
jest.mock("../../src/adapters/BrowserAdapter");

describe("AcchioInstance", () => {
  let acchio: AcchioInstanceImpl;

  beforeEach(() => {
    // Mock do adapter
    const mockAdapter = {
      request: jest.fn().mockResolvedValue({
        data: { test: "data" },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      }),
    };

    (
      BrowserAdapter as jest.MockedClass<typeof BrowserAdapter>
    ).mockImplementation(() => mockAdapter as any);

    acchio = new AcchioInstanceImpl();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Teste básico para garantir que a suite tem pelo menos um teste
  it("should create instance", () => {
    expect(acchio).toBeInstanceOf(AcchioInstanceImpl);
  });

  it("should have interceptors", () => {
    expect(acchio.interceptors.request).toBeDefined();
    expect(acchio.interceptors.response).toBeDefined();
  });

  it("should make GET request", async () => {
    const response = await acchio.get("/test");
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ test: "data" });
  });
});
