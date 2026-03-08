import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Progress } from "..";

describe("Progress.Track", () => {
  test("forwards progressing state data attribute", () => {
    const rendered = render(() => (
      <Progress.Root value={40}>
        <Progress.Track data-testid="track">
          <Progress.Indicator />
        </Progress.Track>
      </Progress.Root>
    ));

    expect(rendered.getByTestId("track").getAttribute("data-progressing")).toBe("");
    expect(rendered.getByTestId("track").getAttribute("data-complete")).toBeNull();
  });
});
