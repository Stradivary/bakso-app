import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Root } from "../_root";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, never>;
  return {
    ...actual,
    useNavigate: vi.fn().mockImplementation((a) => console.log(a)),
  };
});

// Mock the RouteProvider component
vi.mock("../routeProvider", () => ({
  RouteProvider: () => <div>Mocked RouteProvider</div>,
}));

describe("Root component", () => {
  it("renders correctly", () => {
    const r = render(<Root />);

    expect(r).toMatchSnapshot();
  });
});
