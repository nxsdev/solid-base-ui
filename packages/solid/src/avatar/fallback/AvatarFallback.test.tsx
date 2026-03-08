import { render, waitFor } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Avatar } from "..";
import { useImageLoadingStatus } from "../image/useImageLoadingStatus";

vi.mock("../image/useImageLoadingStatus", () => ({
  useImageLoadingStatus: vi.fn(),
}));

const useImageLoadingStatusMock = vi.mocked(useImageLoadingStatus);

describe("Avatar.Fallback", () => {
  beforeEach(() => {
    useImageLoadingStatusMock.mockReturnValue(() => "loaded");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("does not render when image is loaded", async () => {
    const rendered = render(() => (
      <Avatar.Root>
        <Avatar.Image src="avatar.png" />
        <Avatar.Fallback data-testid="fallback">AC</Avatar.Fallback>
      </Avatar.Root>
    ));

    await waitFor(() => {
      expect(rendered.queryByTestId("fallback")).toBeNull();
    });
  });

  test("renders when image fails to load", async () => {
    useImageLoadingStatusMock.mockReturnValue(() => "error");

    const rendered = render(() => (
      <Avatar.Root>
        <Avatar.Image src="avatar.png" />
        <Avatar.Fallback data-testid="fallback">AC</Avatar.Fallback>
      </Avatar.Root>
    ));

    await waitFor(() => {
      expect(rendered.getByTestId("fallback").textContent).toBe("AC");
    });
  });
});
