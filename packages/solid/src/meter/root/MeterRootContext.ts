import { createRequiredContext } from "@solid-base-ui/utils";

export interface MeterRootContextValue {
  formattedValue: () => string;
  value: () => number;
  min: () => number;
  max: () => number;
  setLabelId: (id: string | undefined) => void;
}

export const [MeterRootContext, useMeterRootContext] =
  createRequiredContext<MeterRootContextValue>("MeterRoot");
