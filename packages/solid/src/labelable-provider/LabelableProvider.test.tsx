import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import {
  LabelableContext,
  type LabelableContextValue,
  useLabelableContext,
} from "./LabelableContext";
import { LabelableProvider } from "./LabelableProvider";

const CONTROL_SOURCE = Symbol("control-source");

function SnapshotConsumer() {
  const context = useLabelableContext();
  return (
    <span data-testid="snapshot">
      {context.controlId() ?? "none"}|{context.labelId() ?? "none"}|{context.messageIds().length}
    </span>
  );
}

function RegisterConsumer() {
  const context = useLabelableContext();
  return (
    <>
      <button
        data-testid="register"
        onClick={() => context.registerControlId(CONTROL_SOURCE, "control-id")}
      >
        register
      </button>
      <span data-testid="control-id">{context.controlId() ?? "none"}</span>
    </>
  );
}

function DescriptionConsumer() {
  const context = useLabelableContext();
  const describedBy = () => context.getDescriptionProps<HTMLElement>({})["aria-describedby"];

  return (
    <>
      <button data-testid="set-messages" onClick={() => context.setMessageIds(["child-desc"])}>
        set
      </button>
      <span data-testid="described-by">{describedBy() ?? "none"}</span>
    </>
  );
}

describe("LabelableProvider", () => {
  test("returns safe default context values without provider", () => {
    const rendered = render(() => <SnapshotConsumer />);
    expect(rendered.getByTestId("snapshot").textContent).toBe("none|none|0");
  });

  test("registerControlId updates control id", async () => {
    const rendered = render(() => (
      <LabelableProvider>
        <RegisterConsumer />
      </LabelableProvider>
    ));

    fireEvent.click(rendered.getByTestId("register"));

    await waitFor(() => {
      expect(rendered.getByTestId("control-id").textContent).toBe("control-id");
    });
  });

  test("getDescriptionProps merges parent and local message ids", async () => {
    const parentContextValue: LabelableContextValue = {
      controlId: () => undefined,
      registerControlId: () => {},
      labelId: () => undefined,
      setLabelId: () => {},
      messageIds: () => ["parent-desc"],
      setMessageIds: () => {},
      getDescriptionProps: (externalProps) => externalProps,
    };

    const rendered = render(() => (
      <LabelableContext value={parentContextValue}>
        <LabelableProvider>
          <DescriptionConsumer />
        </LabelableProvider>
      </LabelableContext>
    ));

    expect(rendered.getByTestId("described-by").textContent).toBe("parent-desc");

    fireEvent.click(rendered.getByTestId("set-messages"));

    await waitFor(() => {
      expect(rendered.getByTestId("described-by").textContent).toBe("parent-desc child-desc");
    });
  });
});
