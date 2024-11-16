import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RouteProvider } from "../routeProvider";
import { Contexts } from "../_root";

describe("RouteProvider", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <Contexts>

        <RouteProvider />
      </Contexts>
    );
    expect(container).toMatchSnapshot();
  });
});
