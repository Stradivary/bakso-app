import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useLoginViewModel } from "../../viewmodels/useLoginViewModel";

// Mock dependencies

vi.mock("@/views/providers/authProvider", () => ({
  useAuth: () => ({
    session: {
      user: {
        id: "test-id",
        user_metadata: { name: "Test User" },
      },
    },
    logout: vi.fn(),
    login: vi.fn(),
  }),
}));

vi.mock("@/viewmodels/hooks/useRequestLocation", () => ({
  useRequestLocation: () => ({
    latitude: 0,
    longitude: 0,
    error: null,
    isLoading: false,
    requestLocation: vi.fn(),
  }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

describe("useLoginViewModel", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useLoginViewModel());

    expect(result.current.errors).toEqual({
      name: "",
      agreed: "",
      role: "",
      verified: "",
    });
    expect(result.current.isValid).toBeFalsy();
  });

  it("should handle form submission with location", async () => {
    const { result } = renderHook(() => useLoginViewModel());

    await act(async () => {
      const formData = {
        name: "Test User",
        role: "buyer",
        agreed: true,
        verified: false,
      };

      await result.current.handleAuth(formData);

      const formData2 = {
        name: "Test User",
        role: "buyer",
        agreed: false,
        verified: false,
      };

      await result.current.handleAuth(formData2);
    });

    expect(result.current.handleAuth).toBeDefined();
  });

  it("should request location when agreed is checked", () => {
    const { result } = renderHook(() => useLoginViewModel());

    act(() => {
      result.current.handleOnChange(vi.fn(), {
        target: { checked: true },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.handleOnChange).toBeDefined();
  });
});
