import { Err, err, FilterErr, FilterOk, isOk, UnwrapErr } from "../result";

import { allFailedError, AllFailedError } from "./error";
import { AnyValidator, ExtractValidatorI, ExtractValidatorO, Validator } from "./validator";

type OrInput<Vs extends AnyValidator[]> = ExtractValidatorI<Vs[number]>;
type OrOutput<Vs extends AnyValidator[]> = OrOutputOk<Vs> | OrOutputErr<Vs>;
type OrOutputOk<Vs extends AnyValidator[]> = FilterOk<ExtractValidatorO<Vs[number]>>;
type OrOutputErr<Vs extends AnyValidator[]> =
  Err<
    {
      kind: AllFailedError["kind"],
      errors: Array<UnwrapErr<FilterErr<ExtractValidatorO<Vs[number]>>>>,
    }
  >;

export const or = <Vs extends AnyValidator[]>(...validators: Vs):
  Validator<OrInput<Vs>, OrOutput<Vs>> => {
  if (validators.length < 2) { throw new Error("Expected at least 2 arguments"); }

  return (input) => validators.reduce((result, validator) => {
    if (isOk(result)) {
      return result;
    } else {
      const validation = validator(input);

      if (isOk(validation)) {
        return validation as any;
      } else {
        result.value.errors.push(validation.value);
        return result;
      }
    }
  }, err(allFailedError([])));
};
