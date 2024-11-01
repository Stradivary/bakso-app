import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LocationMapPage from "../customer";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../../shared/providers/themeProvider";

describe("LocationMapPage", () => {
  it("should match snapshot", () => {
    const { asFragment } = render(
      <MemoryRouter>
        <ThemeProvider>
          <LocationMapPage />
        </ThemeProvider>
      </MemoryRouter>,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
