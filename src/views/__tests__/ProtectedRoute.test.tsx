import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { PropsWithChildren } from "react";
import { useAuth } from "@/shared/contexts/authProvider";

// Mock the useAuth hook
vi.mock("@/shared/contexts/authProvider");

// Mock Mantine components
vi.mock("@mantine/core", () => ({
  Box: ({ children, ...props }: PropsWithChildren) => (
    <div data-testid="mantine-box" {...props}>
      {children}
    </div>
  ),
  LoadingOverlay: ({ visible, ...props }: { visible: boolean }) => (
    <div
      data-testid="mantine-loading-overlay"
      aria-hidden={!visible}
      {...props}
    />
  ),
}));

describe("ProtectedRoute", () => {
  // Helper function to setup the component with mocked routes
  const renderProtectedRoute = (
    authState: Partial<ReturnType<typeof useAuth>>,
  ) => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      ...authState,
    } as ReturnType<typeof useAuth>);

    return render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading overlay when authentication is being checked", () => {
    renderProtectedRoute({ isLoading: true });

    expect(screen.getByTestId("mantine-box")).toMatchSnapshot();
    // @ts-expect-error extended by testing-library
    expect(screen.getByTestId("mantine-loading-overlay")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
  });

  it("redirects to login when user is not authenticated", () => {
    const { container } = renderProtectedRoute({ isAuthenticated: false });

    expect(container).toMatchSnapshot();
    // The Navigate component will be rendered with 'to="/login"'
    expect(container.innerHTML).toBe("");
  });

  it("renders protected content when user is authenticated", () => {
    renderProtectedRoute({ isAuthenticated: true });

    expect(screen.getByTestId("protected-content")).toMatchSnapshot();
    // @ts-expect-error extended by testing-library
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    // @ts-expect-error extended by testing-library
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
