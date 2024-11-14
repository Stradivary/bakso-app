import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RouteProvider } from "../routeProvider";

describe("RouteProvider", () => {
  it("renders without crashing", () => {
    const { container } = render(<RouteProvider />);
    expect(container).toMatchSnapshot();
  });
});
