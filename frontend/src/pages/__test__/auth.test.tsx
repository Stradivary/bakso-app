import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../../shared/providers/themeProvider";
import { AuthPage } from "../auth";

// mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
};

// @ts-expect-error navigator is readonly
global.navigator.geolocation = mockGeolocation;

// mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  global.ResizeObserver = ResizeObserver;
});

describe("AuthPage", () => {
  it("should render correctly", () => {
    const { asFragment } = render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthPage />
        </ThemeProvider>
      </MemoryRouter>,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
