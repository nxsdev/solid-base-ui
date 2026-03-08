import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { createDialogContextValue, DialogContext, useDialogContext } from "./create-dialog-context";

function DialogConsumer() {
  const dialog = useDialogContext();

  return (
    <button data-testid="toggle" onClick={() => dialog.setOpen(!dialog.open())}>
      {dialog.open() ? "open" : "closed"}
    </button>
  );
}

describe("createDialogContext", () => {
  test("throws when Provider is missing", () => {
    expect(() => {
      render(() => <DialogConsumer />);
    }).toThrowError("Dialog context is missing a Provider.");
  });

  test("toggles open state", async () => {
    const context = createDialogContextValue(false);
    const rendered = render(() => (
      <DialogContext value={context}>
        <DialogConsumer />
      </DialogContext>
    ));

    const toggle = rendered.getByTestId("toggle");
    expect(toggle.textContent).toBe("closed");

    fireEvent.click(toggle);
    await waitFor(() => {
      expect(toggle.textContent).toBe("open");
    });
  });
});
