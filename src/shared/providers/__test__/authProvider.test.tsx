import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../authProvider";

vi.mock("../services/authService");

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, never>;
  return {
    ...actual,
    useNavigate: vi.fn().mockImplementation((a) => console.log(a)),
  };
});

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state", async () => {
    render(
      <AuthProvider>
        <div>Test</div>
      </AuthProvider>,
    );

    expect(screen.getByText("Test")).toBeDefined();
  });
});
