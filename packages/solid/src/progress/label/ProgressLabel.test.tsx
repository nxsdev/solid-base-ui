import { render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Progress } from "..";

describe("Progress.Label", () => {
  test("sets default presentation role and links root aria-labelledby", async () => {
    const rendered = render(() => (
      <Progress.Root value={40}>
        <Progress.Label data-testid="label">Loading</Progress.Label>
      </Progress.Root>
    ));

    const progressbar = rendered.getByRole("progressbar");
    const label = rendered.getByTestId("label");

    expect(label.getAttribute("role")).toBe("presentation");

    await waitFor(() => {
      expect(progressbar.getAttribute("aria-labelledby")).toBe(label.getAttribute("id"));
    });
  });

  test("forwards complete state data attribute", () => {
    const rendered = render(() => (
      <Progress.Root value={100} max={100}>
        <Progress.Label data-testid="label">Complete</Progress.Label>
      </Progress.Root>
    ));

    expect(rendered.getByTestId("label").getAttribute("data-complete")).toBe("");
    expect(rendered.getByTestId("label").getAttribute("data-progressing")).toBeNull();
  });
});
