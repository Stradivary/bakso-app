import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { User } from "../../models/user.types";
import { AuthProvider } from "../authProvider";
import { useContext } from "react";
import { AuthContext } from "@/shared/contexts/useAuth";

describe("AuthProvider", () => {
  it("renders correctly and matches snapshot", () => {
    const { container } = render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>,
    );

    expect(container).toMatchSnapshot();
  });

  it("provides user context correctly", () => {
    const TestComponent = () => {
      const { user, login, logout } = useContext(AuthContext);
      return (
        <div>
          <div data-testid="user">{user ? user.name : "No User"}</div>
          <button onClick={() => login({ name: "John Doe" } as User)}>
            Login
          </button>
          <button onClick={logout}>Logout</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("user").textContent).toBe("No User");

    act(() => {
      screen.getByText("Login").click();
    });

    expect(screen.getByTestId("user").textContent).toBe("John Doe");

    act(() => {
      screen.getByText("Logout").click();
    });

    expect(screen.getByTestId("user").textContent).toBe("No User");
  });
});
