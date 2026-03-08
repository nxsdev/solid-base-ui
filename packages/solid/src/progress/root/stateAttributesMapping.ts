import { ProgressRootDataAttributes } from "./ProgressRootDataAttributes";
import type { ProgressStatus } from "./ProgressRoot";

export interface ProgressStatusDataAttributes {
  "data-progressing"?: "" | undefined;
  "data-complete"?: "" | undefined;
  "data-indeterminate"?: "" | undefined;
}

export function getProgressStatusDataAttributes(
  status: ProgressStatus,
): ProgressStatusDataAttributes {
  return {
    [ProgressRootDataAttributes.progressing]: status === "progressing" ? "" : undefined,
    [ProgressRootDataAttributes.complete]: status === "complete" ? "" : undefined,
    [ProgressRootDataAttributes.indeterminate]: status === "indeterminate" ? "" : undefined,
  };
}
