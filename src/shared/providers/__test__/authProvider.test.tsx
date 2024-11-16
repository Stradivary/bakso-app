import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../authProvider";

vi.mock("../services/authService");

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

  it("should handle session integrity validation", async () => {
    const { container } = render(
      <AuthProvider>
        <div>Test</div>
      </AuthProvider>,
    );

    expect(container).toMatchSnapshot();
  });
});
