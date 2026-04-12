// Obligation records aggregator. Exports the full set of obligation
// records consumed by the bridge filter and obligation list component.

import type { ObligationRecord } from "../obligation-types";
import { SYSTEM_OBLIGATIONS } from "./system-obligations";
import { MODEL_OBLIGATIONS } from "./model-obligations";
import { EXCEPTION_OBLIGATIONS } from "./exception-obligations";

export const ALL_OBLIGATIONS: ObligationRecord[] = [
  ...SYSTEM_OBLIGATIONS,
  ...MODEL_OBLIGATIONS,
  ...EXCEPTION_OBLIGATIONS,
];

export { SYSTEM_OBLIGATIONS, MODEL_OBLIGATIONS, EXCEPTION_OBLIGATIONS };
