import { render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { CompositeList } from "./CompositeList";
import { useCompositeListItem } from "./useCompositeListItem";

describe("CompositeList", () => {
  test("cleans refs on unmount", async () => {
    function Item() {
      const { ref } = useCompositeListItem();
      return <div ref={ref} />;
    }

    const elementsRef = {
      current: [] as Array<HTMLElement | null>,
    };

    const labelsRef = {
      current: [] as Array<string | null>,
    };

    const rendered = render(() => (
      <CompositeList elementsRef={elementsRef} labelsRef={labelsRef}>
        <Item />
        <Item />
        <Item />
      </CompositeList>
    ));

    await waitFor(() => {
      expect(elementsRef.current).toHaveLength(3);
      expect(labelsRef.current).toHaveLength(3);
    });

    rendered.unmount();

    expect(elementsRef.current).toHaveLength(0);
    expect(labelsRef.current).toHaveLength(0);
  });
});
