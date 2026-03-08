import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { Toolbar } from "..";

describe("Toolbar.Link", () => {
  test("renders an anchor and keeps toolbar orientation data attribute", () => {
    const rendered = render(() => (
      <Toolbar.Root orientation="vertical">
        <Toolbar.Link data-testid="link" href="https://base-ui.com">
          Link
        </Toolbar.Link>
      </Toolbar.Root>
    ));

    const link = rendered.getByTestId("link");

    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toContain("https://base-ui.com");
    expect(link.getAttribute("data-orientation")).toBe("vertical");
  });
});
