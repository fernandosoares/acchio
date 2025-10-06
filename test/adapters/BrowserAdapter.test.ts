import { BrowserAdapter } from "../../src/adapters/BrowserAdapter";

// Mock do fetch global
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

// Helper para criar mock response
function createMockResponse(data: any, contentType = "application/json") {
  const headers = new Map();
  headers.set("content-type", contentType);

  return {
    ok: true,
    status: 200,
    statusText: "OK",
    headers: {
      get: (name: string) => headers.get(name.toLowerCase()),
      forEach: (callback: (value: string, key: string) => void) => {
        headers.forEach((value, key) => callback(value, key));
      },
    },
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  };
}

describe("BrowserAdapter", () => {
  let adapter: BrowserAdapter;

  beforeEach(() => {
    adapter = new BrowserAdapter();
    mockFetch.mockClear();
  });

  describe("request method", () => {
    it("should make successful GET request", async () => {
      const mockData = { data: "test" };
      const mockResponse = createMockResponse(mockData);

      mockFetch.mockResolvedValue(mockResponse as any);

      const response = await adapter.request({
        url: "https://api.example.com/test",
        method: "GET",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          method: "GET",
        })
      );

      expect(response.status).toBe(200);
      expect(response.statusText).toBe("OK");
      expect(response.data).toEqual(mockData); // ✅ Agora deve passar
    });

    it("should handle POST request with data", async () => {
      const mockResponse = createMockResponse({ success: true });
      mockFetch.mockResolvedValue(mockResponse as any);

      const requestData = { name: "John" };
      await adapter.request({
        url: "https://api.example.com/users",
        method: "POST",
        data: requestData,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(requestData),
        })
      );
    });

    it("should handle request errors", async () => {
      const networkError = new Error("Network failure");
      mockFetch.mockRejectedValue(networkError);

      await expect(
        adapter.request({
          url: "https://api.example.com/test",
          method: "GET",
        })
      ).rejects.toThrow("Network failure");
    });

    it("should handle non-JSON responses", async () => {
      const textResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: {
          get: () => "text/plain",
          forEach: () => {},
        },
        text: () => Promise.resolve("plain text response"),
        json: () => Promise.reject(new Error("Not JSON")),
      };

      mockFetch.mockResolvedValue(textResponse as any);

      const response = await adapter.request({
        url: "https://api.example.com/text",
        method: "GET",
      });

      expect(response.data).toBe("plain text response");
    });

    it("should build URL with query params", async () => {
      const mockResponse = createMockResponse({});
      mockFetch.mockResolvedValue(mockResponse as any);

      await adapter.request({
        url: "https://api.example.com/users",
        method: "GET",
        params: {
          page: 1,
          limit: 10,
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/users?page=1&limit=10",
        expect.any(Object)
      );
    });

    it("should build URL with baseURL", async () => {
      const mockResponse = createMockResponse({});
      mockFetch.mockResolvedValue(mockResponse as any);

      await adapter.request({
        baseURL: "https://api.example.com",
        url: "/users",
        method: "GET",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.any(Object)
      );
    });
  });

  describe("responseType handling", () => {
    it("should handle text responseType", async () => {
      const textResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: {
          get: () => "text/plain",
          forEach: () => {},
        },
        text: () => Promise.resolve("text content"),
        json: () => Promise.reject(new Error("Not JSON")),
      };

      mockFetch.mockResolvedValue(textResponse as any);

      const response = await adapter.request({
        url: "https://api.example.com/text",
        method: "GET",
        responseType: "text",
      });

      expect(response.data).toBe("text content");
    });

    it("should parse JSON when content-type is application/json", async () => {
      const jsonData = { message: "hello" };
      const mockResponse = createMockResponse(jsonData);
      mockFetch.mockResolvedValue(mockResponse as any);

      const response = await adapter.request({
        url: "https://api.example.com/json",
        method: "GET",
      });

      expect(response.data).toEqual(jsonData);
    });
  });
});
