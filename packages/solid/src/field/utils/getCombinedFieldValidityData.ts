import type { FieldValidityData } from "../root/FieldRoot";

/**
 * Merges internal validity state with external invalid override.
 */
export function getCombinedFieldValidityData(
  validityData: FieldValidityData,
  invalid: boolean,
): FieldValidityData {
  return {
    ...validityData,
    state: {
      ...validityData.state,
      valid: !invalid && validityData.state.valid,
    },
  };
}
