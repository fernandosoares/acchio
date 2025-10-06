# ⚡ Acchio

An elegant and powerful HTTP client for Node.js and browsers — inspired by Axios, with a touch of magic! ✨

![npm version](https://img.shields.io/npm/v/acchio?style=flat-square)
![npm downloads](https://img.shields.io/npm/dm/acchio?style=flat-square)
![license](https://img.shields.io/npm/l/acchio?style=flat-square)
![types](https://img.shields.io/badge/types-TypeScript-blue?style=flat-square)

---

> **Acchio** is a modern, fully typed, zero-dependency HTTP client with native support for **interceptors**, **request cancellation**, **XML**, and compatibility with both **Node.js and browsers**.
>
> Because HTTP requests should feel _magical_, not complicated! 🎩✨

---

## 📚 Table of Contents

- [🚀 Installation](#-installation)
- [💡 Why Acchio?](#-why-acchio)
- [🎯 Basic Usage](#-basic-usage)
- [📋 Request Configuration](#-request-configuration)
- [🔧 Interceptors](#-interceptors)
- [🚫 Request Cancellation](#-request-cancellation)
- [🌐 XML Support](#-xml-support)
- [🎨 Global Configuration](#-global-configuration)
- [🚦 HTTP Methods](#-http-methods)
- [🎪 TypeScript Support](#-typescript-support)
- [🔄 Environment Examples](#-environment-examples)
- [🚨 Error Handling](#-error-handling)
- [📊 Comparison](#-quick-comparison)
- [📄 License](#-license)

---

## 🚀 Installation

```bash
# npm
npm install acchio

# yarn
yarn add acchio

# pnpm
pnpm add acchio
```

## 💡 Why Acchio?

- ✅ 100% TypeScript-native
- ✅ Works in Node.js and browsers
- ✅ Powerful interceptors
- ✅ Request cancellation
- ✅ Built-in XML support (auto-parse)
- ✅ Zero dependencies
- ✅ Familiar Axios-style API

## 🎯 Basic Usage

```javascript
import acchio from "acchio";

// Simple GET
const response = await acchio.get("https://api.example.com/users");
console.log(response.data);

// POST with payload
await acchio.post("https://api.example.com/users", {
  name: "John",
  email: "john@example.com",
});
```

## 📋 Request Configuration

```javascript
const config = {
  url: "/users",
  method: "GET",
  baseURL: "https://api.example.com",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer token",
  },
  params: { page: 1 },
  timeout: 5000,
  responseType: "json",
};
```

## Supported response types:

- json
- text
- blob
- arraybuffer
- xml

## 🔧 Interceptors

```javascript
// Automatically attach token
acchio.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${getToken()}`;
  return config;
});

// Log requests
acchio.interceptors.request.use((config) => {
  console.log(`🟡 ${config.method?.toUpperCase()} → ${config.url}`);
  return config;
});

// Manipulate responses
acchio.interceptors.response.use((response) => {
  console.log("🟢 Status:", response.status);
  return response;
});
```

## 🚫 Request Cancellation

```javascript
const source = acchio.CancelToken.source();

acchio
  .get("/api/data", { cancelToken: source.token })
  .then((res) => console.log(res.data))
  .catch((err) => {
    if (acchio.isCancel(err)) console.log("Cancelled:", err.message);
  });

// Cancel request
source.cancel("User aborted the request");
```

## 🌐 XML Support

```javascript
// Auto-parsed XML response
const res = await acchio.get("/feed.xml");
console.log(res.data);
```

## 🎨 Global Configuration

```javascript
import acchio from "acchio";

acchio.defaults.baseURL = "https://api.mysite.com";
acchio.defaults.timeout = 5000;
acchio.defaults.headers.common["X-App"] = "Acchio";
```

Create custom instances:

```javascript
const api = acchio.create({
  baseURL: "https://api.company.com",
  headers: { Authorization: "Bearer token" },
});
```

## 🚦 HTTP Methods

```javascript
acchio.get("/users");
acchio.post("/users", { name: "Maria" });
acchio.put("/users/1", { name: "John" });
acchio.patch("/users/1", { email: "a@b.com" });
acchio.delete("/users/1");
```

## 🎪 TypeScript Support

```javascript
interface User { id: number; name: string; email: string; }

const res = await acchio.get<User[]>('/api/users');
const users = res.data; // ✅ Fully typed
```

## 🔄 Environment Examples

**Node.js**

```javascript
const res = await acchio.get("https://api.github.com/users");
```

**React**

```javascript
useEffect(() => {
  const source = acchio.CancelToken.source();
  acchio
    .get("/api/users", { cancelToken: source.token })
    .then((res) => setUsers(res.data))
    .catch(console.error);
  return () => source.cancel();
}, []);
```

## 🚨 Error Handling

```javascript
try {
  await acchio.get("/api/data");
} catch (error) {
  if (acchio.isCancel(error)) console.log("Request cancelled");
  else if (error.response) console.log("Status:", error.response.status);
}
```

## 📊 Quick Comparison

| Feature            | ⚡ Acchio      | 📦 Axios  |
| ------------------ | -------------- | --------- |
| TypeScript Typings | ✅ Native      | ✅        |
| Cancellation       | ✅             | ✅        |
| Interceptors       | ✅             | ✅        |
| Node.js + Browser  | ✅             | ✅        |
| XML Support        | ✅             | ❌        |
| Zero Dependencies  | ✅             | ❌        |
| Size               | 🪶 Lightweight | 📦 Medium |

## 📄 License

**MIT** — Free for everyone! 🎉

## 🎊 Acknowledgments

- ⭐ Star the project on GitHub
- 🐛 Report issues
- 💡 Suggest new features

_"Because HTTP requests should feel magical, not complicated!" 🎩✨_
