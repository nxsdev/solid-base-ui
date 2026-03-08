import { describe, expect, test } from "vitest";
import { render } from "@solidjs/testing-library";
import { Separator } from "./Separator";

describe("Separator", () => {
  test("renders an element with separator role", () => {
    const rendered = render(() => <Separator />);
    expect(rendered.getByRole("separator")).toBeTruthy();
  });

  test("defaults orientation to horizontal", () => {
    const rendered = render(() => <Separator />);
    expect(rendered.getByRole("separator").getAttribute("aria-orientation")).toBe("horizontal");
  });

  test("sets vertical orientation", () => {
    const rendered = render(() => <Separator orientation="vertical" />);
    expect(rendered.getByRole("separator").getAttribute("aria-orientation")).toBe("vertical");
  });
});
