import { ok } from "../result";

import { AnyValidator, ExtractValidatorI, ExtractValidatorO } from "./validator";

export const nullable = <V extends AnyValidator>(inner: V) =>
  (input: ExtractValidatorI<V> | null) =>
    input === null ? ok(null) : inner(input) as ExtractValidatorO<V>;
