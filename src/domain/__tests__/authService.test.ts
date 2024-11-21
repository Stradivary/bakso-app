import { describe, it, expect, vi } from "vitest";
import { supabase } from "../services/supabaseService";
import { signInUser } from "../services/authService";

vi.mock("../services/supabaseService", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  },
}));

describe("signInUser", () => {
  it("should sign in an existing user", async () => {
    // @ts-expect-error  Mock successful sign-in
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        session: { access_token: "token" },
        user: { id: "user1" },
      },
      error: null,
    });

    const result = await signInUser(
      "Existing User",
      "buyer",
      37.7749,
      -122.4194,
    );

    expect(result.error).toBeNull();
    expect(result.user).toHaveProperty("id", "user1");
  });

  it("should sign up and sign in a new user if the user does not exist", async () => {
    // @ts-expect-error  Mock sign-in failure
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: { message: "Invalid login credentials" },
    });

    // @ts-expect-error  Mock successful sign-up
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: "user2" } },
      error: null,
    });

    // @ts-expect-error  Mock successful sign-in after sign-up
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        session: { access_token: "token" },
        user: { id: "user2" },
      },
      error: null,
    });

    const result = await signInUser("New User", "seller", 34.0522, -118.2437);

    expect(result.error).toBeNull();
    expect(result.user).toHaveProperty("id", "user2");
  });

  it("should return an error if authentication fails", async () => {
    // @ts-expect-error Mock sign-in failure with different error
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: "Network error" },
    });

    const result = await signInUser("User", "buyer", 37.7749, -122.4194);

    expect(result.error).toBeDefined();
  });
});
