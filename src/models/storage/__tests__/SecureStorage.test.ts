import { describe, it, expect, beforeEach, vi } from "vitest";
import { SecureStorage } from "../SecureStorage";
import CryptoJS from "crypto-js"; // Import CryptoJS

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

describe("SecureStorage", () => {
  const testKey = "testKey";
  const testData = { foo: "bar" };
  const encryptedData = SecureStorage.encrypt(testData);

  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("should encrypt data correctly", () => {
    const result = SecureStorage.encrypt(testData);
    expect(result).toBeTypeOf("string");
    expect(result).not.toBe("");
  });

  it("should decrypt data correctly", () => {
    const result = SecureStorage.decrypt(encryptedData);
    expect(result).toEqual(testData);
  });

  it("should return null for invalid decryption", () => {
    const result = SecureStorage.decrypt("invalid-data");
    expect(result).toBeNull();
  });

  it("should set item in sessionStorage", () => {
    SecureStorage.setItem(testKey, testData);
    const storedData = sessionStorage.getItem(testKey);
    expect(storedData).toBeTruthy();
    const decryptedData = SecureStorage.decrypt(storedData as string);
    expect(decryptedData).toEqual(testData);
  });

  it("should get item from sessionStorage", () => {
    sessionStorage.setItem(testKey, encryptedData);
    const result = SecureStorage.getItem(testKey);
    expect(result).toEqual(testData);
  });

  it("should return null for non-existent key", () => {
    const result = SecureStorage.getItem("nonExistentKey");
    expect(result).toBeNull();
  });

  it("should remove item from sessionStorage", () => {
    sessionStorage.setItem(testKey, encryptedData);
    SecureStorage.removeItem(testKey);
    const result = sessionStorage.getItem(testKey);
    expect(result).toBeNull();
  });

  it("should clear all sessionStorage", () => {
    sessionStorage.setItem(testKey, encryptedData);
    SecureStorage.clear();
    expect(sessionStorage.length).toBe(0);
  });

  it("should handle encryption errors gracefully", () => {
    vi.spyOn(CryptoJS.AES, "encrypt").mockImplementation(() => {
      throw new Error("Encryption error");
    });
    const result = SecureStorage.encrypt(testData);
    expect(result).toBe("");
  });

  it("should handle decryption errors gracefully", () => {
    vi.spyOn(CryptoJS.AES, "decrypt").mockImplementation(() => {
      throw new Error("Decryption error");
    });
    const result = SecureStorage.decrypt(encryptedData);
    expect(result).toBeNull();
  });

  it("should handle setItem errors gracefully", () => {
    vi.spyOn(sessionStorage, "setItem").mockImplementation(() => {
      throw new Error("Storage error");
    });
    expect(() => SecureStorage.setItem(testKey, testData)).not.toThrow();
  });

  it("should handle getItem errors gracefully", () => {
    vi.spyOn(sessionStorage, "getItem").mockImplementation(() => {
      throw new Error("Storage error");
    });
    expect(() => SecureStorage.getItem(testKey)).not.toThrow();
  });
});
