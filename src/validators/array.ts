import { Err, err, FilterErr, FilterOk, isErr, Ok, ok, UnwrapErr, UnwrapOk } from "../result";

import { InvalidArrayError, invalidArrayError, NotArrayError, notArrayError } from "./error";
import { AnyValidator, ExtractValidatorO, Validator } from "./validator";

type ArrayOutput<V extends AnyValidator> = ArrayOutputOk<V> | ArrayOutputErr<V>;
type ArrayOutputOk<V extends AnyValidator> =
  Ok<Array<UnwrapOk<FilterOk<ExtractValidatorO<V>>>>>;
type ArrayOutputErr<V extends AnyValidator> =
  Err<
    NotArrayError
    | {
      kind: InvalidArrayError["kind"],
      errors: Array<{
        index: number,
        error: UnwrapErr<FilterErr<ExtractValidatorO<V>>>,
      }>,
    }
  >;

export const array = <V extends AnyValidator>(inner: V): Validator<any, ArrayOutput<V>> =>
  (input) => {
    if (!Array.isArray(input)) { return err(notArrayError); }

    const validations = input.map(inner);

    const [errors, sanitizedValue] = validations.reduce(
      (acc, validation, index) => {
        if (isErr(validation)) {
          const error = { index, error: validation.value };
          const errors = acc[0];
          errors.push(error);
          return [errors, acc[1]];
        } else {
          const sanitizedValue = acc[1];
          sanitizedValue[index] = validation.value;
          return [acc[0], sanitizedValue];
        }
      },
      [[] as any[], [] as any[]],
    );

    return errors.length
      ? err(invalidArrayError(errors))
      : ok(sanitizedValue) as any;
  };
