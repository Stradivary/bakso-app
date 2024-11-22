import { MantineProvider } from "@mantine/core";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginView } from "@/views/login/LoginView";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, never>;
  return {
    ...actual,
    useNavigate: vi.fn().mockImplementation((a) => console.log(a)),
  };
});
vi.mock("@/shared/contexts/authProvider", () => ({
  useAuth: vi.fn().mockReturnValue({
    login: vi.fn(),
  }),
}));

vi.mock("@/viewmodels/hooks/useLocation", () => ({
  useLocation: vi.fn(),
}));

vi.mock("@/viewmodels/hooks/useLocationUpdater", () => ({
  useLocationUpdater: vi.fn(),
}));

vi.mock("@/viewmodels/hooks/useRequestLocation", () => ({
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
