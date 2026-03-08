import type { BaseUIChangeEventDetails } from "../types";

export type ChangeEventReason = "none";

export type ChangeEventDetails<CustomProperties extends object = {}> = BaseUIChangeEventDetails<
  ChangeEventReason,
  CustomProperties
>;

export function createChangeEventDetails(
  event?: Event,
  trigger?: Element,
): BaseUIChangeEventDetails<"none">;
export function createChangeEventDetails<TReason extends string>(
  event: Event | undefined,
  trigger: Element | undefined,
  reason: TReason,
): BaseUIChangeEventDetails<TReason>;
export function createChangeEventDetails(
  event?: Event,
  trigger?: Element,
  reason: string = "none",
): BaseUIChangeEventDetails<string> {
  let canceled = false;
  let propagationAllowed = false;

  return {
    reason,
    event: event ?? new Event("base-ui"),
    cancel() {
      canceled = true;
    },
    allowPropagation() {
      propagationAllowed = true;
    },
    get isCanceled() {
      return canceled;
    },
    get isPropagationAllowed() {
      return propagationAllowed;
    },
    trigger,
  };
}
