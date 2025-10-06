// Configurações globais para os testes
import { TextEncoder, TextDecoder } from "util";

// Polyfills para Node.js (necessários para o jsdom)
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Configurações globais para os testes

// Mock do fetch global para testes do BrowserAdapter
(global as any).fetch = jest.fn();

// Mock do console para testes mais limpos
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

// Polyfills são opcionais - vamos remover por enquanto
// Se precisar depois, adicionamos específicos
