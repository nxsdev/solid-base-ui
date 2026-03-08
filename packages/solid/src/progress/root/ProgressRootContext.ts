import { createRequiredContext } from "@solid-base-ui/utils";
import type { ProgressStatus } from "./ProgressRoot";

export interface ProgressRootContextValue {
  formattedValue: () => string;
  max: () => number;
  min: () => number;
  status: () => ProgressStatus;
  value: () => number | null;
  setLabelId: (id: string | undefined) => void;
}

export const [ProgressRootContext, useProgressRootContext] =
  createRequiredContext<ProgressRootContextValue>("ProgressRoot");
