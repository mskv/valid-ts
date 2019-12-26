import { Err, err, FilterErr, FilterOk, ResultKind, UnwrapErr } from "../result";

import { AnyValidator, ExtractValidatorI, ExtractValidatorO } from "./validator";

export const or = <Vs extends AnyValidator[]>(...validators: Vs) => {
  if (validators.length < 2) { throw new Error("Expected at least 2 arguments"); }

  return (input: ExtractValidatorI<Vs[number]>) => validators.reduce((result, validator) => {
    if (result.kind === ResultKind.Ok) {
      return result;
    } else {
      const validation = validator(input) as any;

      if (validation.kind === ResultKind.Ok) {
        return validation;
      } else {
        result.value.value.push(validation.value);
        return result;
      }
    }
  }, err({ kind: "none_passed", value: [] }) as
  FilterOk<ExtractValidatorO<Vs[number]>>
  | Err<{
    kind: "none_passed",
    value: Array<UnwrapErr<FilterErr<ExtractValidatorO<Vs[number]>>>>,
  }>);
};
