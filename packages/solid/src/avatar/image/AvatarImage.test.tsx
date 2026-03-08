import { createSignal } from "solid-js";
import { render, waitFor } from "@solidjs/testing-library";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { Avatar } from "..";
import type { ImageLoadingStatus } from "../root/AvatarRoot";
import { useImageLoadingStatus } from "./useImageLoadingStatus";

vi.mock("./useImageLoadingStatus", () => ({
  useImageLoadingStatus: vi.fn(),
}));

const useImageLoadingStatusMock = vi.mocked(useImageLoadingStatus);

describe("Avatar.Image", () => {
  beforeEach(() => {
    useImageLoadingStatusMock.mockReturnValue(() => "loaded");
  });

  test("renders image when loading status is loaded", () => {
    const rendered = render(() => (
      <Avatar.Root>
        <Avatar.Image data-testid="image" src="avatar.png" alt="avatar" />
      </Avatar.Root>
    ));

    const image = rendered.getByTestId("image") as HTMLImageElement;
    expect(image.getAttribute("src")).toBe("avatar.png");
    expect(image.getAttribute("alt")).toBe("avatar");
  });

  test("does not render image when status is error", () => {
    useImageLoadingStatusMock.mockReturnValue(() => "error");

    const rendered = render(() => (
      <Avatar.Root>
        <Avatar.Image data-testid="image" src="avatar.png" />
      </Avatar.Root>
    ));

    expect(rendered.queryByTestId("image")).toBeNull();
  });

  test("calls onLoadingStatusChange and updates fallback visibility", async () => {
    const [status, setStatus] = createSignal<ImageLoadingStatus>("loading");
    const onLoadingStatusChange = vi.fn();
    useImageLoadingStatusMock.mockReturnValue(status);

    const rendered = render(() => (
      <>
        <Avatar.Root>
          <Avatar.Image
            data-testid="image"
            src="avatar.png"
            onLoadingStatusChange={onLoadingStatusChange}
          />
          <Avatar.Fallback data-testid="fallback">AC</Avatar.Fallback>
        </Avatar.Root>
        <button data-testid="set-loaded" onClick={() => setStatus("loaded")}>
          set
        </button>
      </>
    ));

    await waitFor(() => {
      expect(onLoadingStatusChange).toHaveBeenCalledWith("loading");
      expect(rendered.queryByTestId("image")).toBeNull();
      expect(rendered.getByTestId("fallback").textContent).toBe("AC");
    });

    rendered.getByTestId("set-loaded").click();

    await waitFor(() => {
      expect(onLoadingStatusChange).toHaveBeenCalledWith("loaded");
      expect(rendered.getByTestId("image")).not.toBeNull();
      expect(rendered.queryByTestId("fallback")).toBeNull();
    });
  });
});
