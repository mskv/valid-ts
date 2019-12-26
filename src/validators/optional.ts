import { ok } from "../result";

import { AnyValidator, ExtractValidatorI, ExtractValidatorO } from "./validator";

export const optional = <V extends AnyValidator>(inner: V) =>
  (input: ExtractValidatorI<V> | undefined) =>
    input === undefined ? ok(undefined) : inner(input) as ExtractValidatorO<V>;
