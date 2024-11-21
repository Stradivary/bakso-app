import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExitConfirmationDialog } from "../../views/map/components/ExitConfirmationDialog";

describe("ExitConfirmationDialog", () => {
  const handleExit = vi.fn();
  const exitModalClose = vi.fn();

  it("renders seller message correctly", () => {
    const { container } = render(
      <MantineProvider>
        <ExitConfirmationDialog
          role="seller"
          handleExit={handleExit}
          exitModalClose={exitModalClose}
        />
      </MantineProvider>,
    );
    expect(
      screen.getByText(/Customer tidak akan bisa melihat lokasi Anda/),
    ).toBeDefined();
    expect(container).toMatchSnapshot();
  });

  it("renders buyer message correctly", () => {
    const { container } = render(
      <MantineProvider>
        <ExitConfirmationDialog
          role="buyer"
          handleExit={handleExit}
          exitModalClose={exitModalClose}
        />
      </MantineProvider>,
    );
    expect(
      screen.getByText(/anda akan keluar dari pantauan Tukang Bakso/),
    ).toBeDefined();
    expect(container).toMatchSnapshot();
  });

  it("calls handleExit when OK button is clicked", () => {
    const { container } = render(
      <MantineProvider>
        <ExitConfirmationDialog
          role="seller"
          handleExit={handleExit}
          exitModalClose={exitModalClose}
        />
      </MantineProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
