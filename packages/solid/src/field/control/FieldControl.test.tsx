import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { Field } from "..";

describe("Field.Control", () => {
  test("calls onValueChange with next value and reason", async () => {
    const onValueChange = vi.fn();

    const rendered = render(() => (
      <Field.Root>
        <Field.Control data-testid="control" onValueChange={onValueChange} />
      </Field.Root>
    ));

    const control = rendered.getByTestId("control");
    fireEvent.input(control, { target: { value: "hello" } });

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange.mock.calls[0]?.[0]).toBe("hello");
      expect(onValueChange.mock.calls[0]?.[1]?.reason).toBe("none");
    });
  });
});
