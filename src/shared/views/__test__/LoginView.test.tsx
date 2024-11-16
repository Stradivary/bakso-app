import { MantineProvider } from "@mantine/core";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginView } from "../LoginView";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, never>;
  return {
    ...actual,
    useNavigate: vi.fn().mockImplementation((a) => console.log(a)),
  };
});
vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn().mockReturnValue({
    login: vi.fn(),
  }),
}));

vi.mock("../../hooks/useLocation", () => ({
  useLocation: vi.fn(),
}));

vi.mock("../../hooks/useLocationUpdater", () => ({
  useLocationUpdater: vi.fn(),
}));

vi.mock("../../hooks/useRequestLocation", () => ({
  useRequestLocation: vi.fn().mockReturnValue({
    latitude: 0,
    longitude: 0,
    error: "",
    isLoading: false,
    requestLocation: vi.fn(),
  }),
}));

describe("LoginView", () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  it("renders login form correctly", () => {
    const { container } = render(
      <MantineProvider>
        <MemoryRouter>
          <LoginView />
        </MemoryRouter>
      </MantineProvider>,
    );

    expect(container).toMatchSnapshot();
  });
});
