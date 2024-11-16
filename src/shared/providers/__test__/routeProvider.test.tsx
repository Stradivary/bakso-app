import { render } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { RouteProvider } from "../routeProvider";
import { Contexts } from "../_root";

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

describe("RouteProvider", () => {
  // Mock implementation
  beforeAll(() => {
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
  });

  // Clean up after tests
  afterAll(() => {
    vi.unstubAllGlobals();
  });

  // Optional: Reset mocks between tests
  afterEach(() => {
    vi.clearAllMocks();
  });
  it("renders without crashing", () => {
    const { container } = render(
      <Contexts>
        <RouteProvider />
      </Contexts>,
    );
    expect(container).toMatchSnapshot();
  });
});
