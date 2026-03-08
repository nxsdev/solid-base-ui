import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { createRequiredContext } from "./create-required-context";

type TestContextValue = {
  value: string;
};

const [TestContext, useTestContext] = createRequiredContext<TestContextValue>("TestContext");

function TestConsumer() {
  return <span data-testid="value">{useTestContext().value}</span>;
}

describe("createRequiredContext", () => {
  test("throws when Provider is missing", () => {
    expect(() => {
      render(() => <TestConsumer />);
    }).toThrowError("TestContext context is missing a Provider.");
  });

  test("reads value from Provider", () => {
    const rendered = render(() => (
      <TestContext value={{ value: "ok" }}>
        <TestConsumer />
      </TestContext>
    ));

    expect(rendered.getByTestId("value").textContent).toBe("ok");
  });
});
