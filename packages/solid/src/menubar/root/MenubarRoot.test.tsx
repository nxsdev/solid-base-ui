import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { CompositeItem } from "../../composite/item/CompositeItem";
import { Menubar } from "..";
import { useMenubarRootContext } from "./MenubarRootContext";

function ContextControls() {
  const context = useMenubarRootContext();
  return (
    <>
      <button data-testid="open-button" onClick={() => context.setHasSubmenuOpen(true)}>
        open
      </button>
      <button
        data-testid="open-touch-button"
        onClick={() => context.setHasSubmenuOpen(true, "touch")}
      >
        open-touch
      </button>
      <button data-testid="close-button" onClick={() => context.setHasSubmenuOpen(false)}>
        close
      </button>
    </>
  );
}

function MenubarItems() {
  return (
    <>
      <CompositeItem render="button" data-testid="item-1">
        item-1
      </CompositeItem>
      <CompositeItem render="button" data-testid="item-2">
        item-2
      </CompositeItem>
    </>
  );
}

describe("Menubar.Root", () => {
  afterEach(() => {
    document.body.style.overflow = "";
  });

  test("has role=menubar and default state attributes", () => {
    const rendered = render(() => <Menubar.Root data-testid="menubar" />);

    const menubar = rendered.getByTestId("menubar");
    expect(menubar.getAttribute("role")).toBe("menubar");
    expect(menubar.getAttribute("aria-orientation")).toBe("horizontal");
    expect(menubar.getAttribute("data-modal")).toBe("");
    expect(menubar.getAttribute("data-orientation")).toBe("horizontal");
    expect(menubar.getAttribute("data-has-submenu-open")).toBe("false");
  });

  test("supports vertical orientation and disabled state", () => {
    const rendered = render(() => (
      <Menubar.Root data-testid="menubar" orientation="vertical" disabled />
    ));

    const menubar = rendered.getByTestId("menubar");
    expect(menubar.getAttribute("aria-orientation")).toBe("vertical");
    expect(menubar.getAttribute("data-orientation")).toBe("vertical");
    expect(menubar.getAttribute("data-disabled")).toBe("");
  });

  test("updates submenu state through context", async () => {
    const rendered = render(() => (
      <Menubar.Root data-testid="menubar">
        <ContextControls />
      </Menubar.Root>
    ));

    const menubar = rendered.getByTestId("menubar");
    expect(menubar.getAttribute("data-has-submenu-open")).toBe("false");

    fireEvent.click(rendered.getByTestId("open-button"));

    await waitFor(() => {
      expect(menubar.getAttribute("data-has-submenu-open")).toBe("true");
    });
  });

  test("supports keyboard navigation with arrow keys", async () => {
    const rendered = render(() => (
      <Menubar.Root>
        <MenubarItems />
      </Menubar.Root>
    ));

    const item1 = rendered.getByTestId("item-1");
    const item2 = rendered.getByTestId("item-2");

    await waitFor(() => {
      expect(item1.getAttribute("tabindex")).toBe("0");
    });

    item1.focus();
    fireEvent.keyDown(item1, { key: "ArrowRight" });

    await waitFor(() => {
      expect(item2.getAttribute("tabindex")).toBe("0");
      expect(document.activeElement).toBe(item2);
    });
  });

  test("does not highlight items on hover when no submenu is open", async () => {
    const rendered = render(() => (
      <Menubar.Root>
        <MenubarItems />
      </Menubar.Root>
    ));

    const item1 = rendered.getByTestId("item-1");
    const item2 = rendered.getByTestId("item-2");

    await waitFor(() => {
      expect(item1.getAttribute("tabindex")).toBe("0");
    });

    item1.focus();
    fireEvent.mouseMove(item2);

    await waitFor(() => {
      expect(document.activeElement).toBe(item1);
    });
  });

  test("highlights items on hover when submenu is open", async () => {
    const rendered = render(() => (
      <Menubar.Root data-testid="menubar">
        <ContextControls />
        <MenubarItems />
      </Menubar.Root>
    ));

    const menubar = rendered.getByTestId("menubar");
    const item1 = rendered.getByTestId("item-1");
    const item2 = rendered.getByTestId("item-2");

    fireEvent.click(rendered.getByTestId("open-button"));

    await waitFor(() => {
      expect(menubar.getAttribute("data-has-submenu-open")).toBe("true");
    });

    item1.focus();
    fireEvent.mouseMove(item2);

    await waitFor(() => {
      expect(document.activeElement).toBe(item2);
    });
  });

  test("locks body scroll when modal menubar has an open submenu", async () => {
    const rendered = render(() => (
      <Menubar.Root>
        <ContextControls />
      </Menubar.Root>
    ));

    expect(document.body.style.overflow).toBe("");

    fireEvent.click(rendered.getByTestId("open-button"));
    await waitFor(() => {
      expect(document.body.style.overflow).toBe("hidden");
    });

    fireEvent.click(rendered.getByTestId("close-button"));
    await waitFor(() => {
      expect(document.body.style.overflow).toBe("");
    });
  });

  test("does not lock body scroll when submenu opens from touch interaction", async () => {
    const rendered = render(() => (
      <Menubar.Root data-testid="menubar">
        <ContextControls />
      </Menubar.Root>
    ));

    const menubar = rendered.getByTestId("menubar");
    fireEvent.click(rendered.getByTestId("open-touch-button"));

    await waitFor(() => {
      expect(menubar.getAttribute("data-has-submenu-open")).toBe("true");
      expect(document.body.style.overflow).toBe("");
    });
  });
});
