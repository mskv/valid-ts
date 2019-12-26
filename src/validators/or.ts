import { Err, err, FilterErr, FilterOk, isOk, UnwrapErr } from "../result";

import { AnyValidator, ExtractValidatorI, ExtractValidatorO } from "./validator";

export const or = <Vs extends AnyValidator[]>(...validators: Vs) => {
  if (validators.length < 2) { throw new Error("Expected at least 2 arguments"); }

  return (input: ExtractValidatorI<Vs[number]>) => validators.reduce((result, validator) => {
    if (isOk(result)) {
      return result;
    } else {
      const validation = validator(input);

      if (isOk(validation)) {
        return validation as any;
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
