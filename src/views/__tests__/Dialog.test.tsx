import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, Mock } from "vitest";
import { Dialog } from "../components/Dialog";
import { useMediaQuery } from "@mantine/hooks";
import { MantineProvider } from "@mantine/core";

// Mock Mantine hooks
vi.mock("@mantine/hooks", () => ({
  useMediaQuery: vi.fn(),
}));

describe("Dialog", () => {
  const mockClose = vi.fn();

  it("renders modal on desktop", () => {
    (useMediaQuery as Mock).mockReturnValue(false);
    render(
      <MantineProvider>
        <Dialog opened={true} close={mockClose}>
          <div>Test Content</div>
        </Dialog>
      </MantineProvider>,
    );
    expect(screen.getByText("Test Content")).toBeDefined();
  });

  it("renders drawer on mobile", () => {
    (useMediaQuery as Mock).mockReturnValue(true);
    render(
      <MantineProvider>
        <Dialog opened={true} close={mockClose}>
          <div>Test Content</div>
        </Dialog>
      </MantineProvider>,
    );
    expect(screen.getAllByText("Test Content")).toBeDefined();
  });

  it("handles closed state", () => {
    const { container } = render(
      <MantineProvider>
        <Dialog opened={false} close={mockClose}>
          <div>Test Content</div>
        </Dialog>
      </MantineProvider>,
    );

    expect(container).toMatchSnapshot();
  });
});
