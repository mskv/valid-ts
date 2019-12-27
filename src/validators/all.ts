import { AnyResult, Err, err, FilterErr, isOk, Ok, ok, UnwrapErr } from "../result";

import { SomeFailedError, someFailedError } from "./error";
import { AnyValidator, ExtractValidatorO } from "./validator";

type AllOutputErr<Vs extends AnyValidator[]> = Err<
  {
    kind: SomeFailedError["kind"],
    errors: Array<UnwrapErr<FilterErr<ExtractValidatorO<Vs[number]>>>>,
  }
>;

export const all = <Vs extends AnyValidator[]>(...validators: Vs) => {
  if (validators.length < 2) { throw new Error("Expected at least 2 arguments"); }

  return <I>(input: I): Ok<I> | AllOutputErr<Vs> => validators.reduce((result, validator) => {
    const validation = validator(input);

    if (isOk(validation)) {
      return result;
    } else if (isOk(result)) {
      return err(someFailedError([validation.value]));
    } else {
      result.value.errors.push(validation.value);
      return result;
    }
  }, ok(input) as AnyResult);
};
