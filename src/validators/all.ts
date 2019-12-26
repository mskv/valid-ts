import { Err, err, FilterErr, Ok, ok, ResultKind, UnwrapErr } from "../result";

import { AnyValidator, ExtractValidatorO } from "./validator";

type AllOutputErr<Vs extends AnyValidator[]> = Err<
  {
    kind: "some_failed",
    value: Array<UnwrapErr<FilterErr<ExtractValidatorO<Vs[number]>>>>,
  }
>;

export const all = <Vs extends AnyValidator[]>(...validators: Vs) => {
  if (validators.length < 2) { throw new Error("Expected at least 2 arguments"); }

  return <I>(input: I): Ok<I> | AllOutputErr<Vs> => validators.reduce((result, validator) => {
    const validation = validator(input);

    if (validation.kind === ResultKind.Ok) {
      return result;
    } else if (result.kind === ResultKind.Ok) {
      return err({ kind: "some_failed", value: [validation.value] });
    } else {
      result.value.value.push(validation.value);
      return result;
    }
  }, ok(input) as any);
};
