import { Contexts } from "@/shared/providers/_root";
import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import { Dialog } from "../Dialog";

test("it renders properly", () => {
  const { container } = render(
    <Contexts>
      <Dialog opened close={() => {}}>
        Hello World
      </Dialog>
    </Contexts>,
  );

  expect(container).toMatchSnapshot();
});
