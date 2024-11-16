import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { AuthProvider } from "@/shared/providers/authProvider";
import { supabase } from "@/shared/services/supabaseService";
import { useAuth } from "../useAuth";
import { signInUser } from "@/shared/services/authService";
import { AuthChangeEvent } from "@supabase/supabase-js";

// Mock the external services
vi.mock("@/shared/services/supabaseService", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
        error: null,
      })),
    },
  },
}));

vi.mock("@/shared/services/authService", () => ({
  signInUser: vi.fn(),
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

// Mock storage event listener
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

// Setup window mocks
Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
});

Object.defineProperty(window, "addEventListener", {
  value: mockAddEventListener,
});

Object.defineProperty(window, "removeEventListener", {
  value: mockRemoveEventListener,
});

describe("useAuth Hook & AuthProvider", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all mocks
    mockSessionStorage.getItem.mockReset();
    mockSessionStorage.setItem.mockReset();
    mockSessionStorage.removeItem.mockReset();
    mockAddEventListener.mockReset();
    mockRemoveEventListener.mockReset();

    // Setup default auth subscription mock
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(() => ({
      data: {
        subscription: {
          id: "",
          callback: vi.fn(),
          unsubscribe: vi.fn(),
        },
      },
      error: null,
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should initialize with null session and loading state", async () => {
    // Mock initial session fetch
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.session).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should handle successful login", async () => {
    const mockSession = {
      access_token: "mock-token",
      refresh_token: "000",
      expires_in: 0,
      token_type: "",
      user: {
        id: "1",
        email: "test@example.com",
        app_metadata: {},
        user_metadata: {},
        aud: "",
        created_at: "",
      },
    };

    vi.mocked(signInUser).mockResolvedValueOnce({
      user: null,
      session: mockSession,
      error: null,
    });

    mockSessionStorage.getItem.mockReturnValue("mock-hash-key");

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("TestUser", "user", 0, 0);
    });

    expect(result.current.session).toEqual(mockSession);
    expect(result.current.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle login failure", async () => {
    const mockError = new Error("Login failed");
    vi.mocked(signInUser).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("TestUser", "user", 0, 0);
    });

    expect(result.current.session).toBeNull();
    expect(result.current.error).toBe("Failed to login");
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle logout successfully", async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.session).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockSessionStorage.removeItem).toHaveBeenCalled();
  });

  it("should handle session integrity validation", async () => {
    const mockSession = {
      access_token: "valid-token",
      refresh_token: "000",
      expires_in: 0,
      token_type: "",
      user: {
        id: "1",
        email: "test@example.com",
        app_metadata: {},
        user_metadata: {},
        aud: "",
        created_at: "",
      },
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    });

    mockSessionStorage.getItem
      .mockReturnValueOnce("hash-key")
      .mockReturnValueOnce(JSON.stringify({ access_token: "valid-token" }));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.session).toEqual(mockSession);
    expect(result.current.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should handle auth state changes", async () => {
    const mockSession = {
      access_token: "new-token",
      refresh_token: "000",
      expires_in: 0,
      token_type: "",
      user: {
        id: "1",
        email: "test@example.com",
        app_metadata: {},
        user_metadata: {},
        aud: "",
        created_at: "",
      },
    };

    let authChangeCallback: (
      event: AuthChangeEvent,
      session: typeof mockSession,
    ) => void;

    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(
      (callback) => {
        authChangeCallback = callback;
        return {
          data: {
            subscription: {
              id: "",
              callback: () => {},
              unsubscribe: vi.fn(),
            },
          },
          error: null,
        };
      },
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Simulate auth state change
    await act(async () => {
      if (authChangeCallback) {
        authChangeCallback("SIGNED_IN", mockSession);
      }
    });

    expect(result.current.session).toEqual(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should handle session tampering", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    mockSessionStorage.getItem
      .mockReturnValueOnce("hash-key")
      .mockReturnValueOnce(JSON.stringify({ access_token: "different-token" }));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should handle missing session key", async () => {
    mockSessionStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.session).toBeNull();
    expect(result.current.error).toBe("Failed to get initial session");
    expect(result.current.isAuthenticated).toBe(false);
  });
});
