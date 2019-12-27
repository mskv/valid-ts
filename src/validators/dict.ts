import { Err, err, FilterErr, FilterOk, isErr, Ok, ok, UnwrapErr, UnwrapOk } from "../result";
import { InvalidDictionaryError, invalidDictionaryError, NotObjectError, notObjectError } from "./error";
import { AnyValidator, ExtractValidatorO, Validator } from "./validator";

type DictOutput<V extends AnyValidator> = DictOutputOk<V> | DictOutputErr<V>;
type DictOutputOk<V extends AnyValidator> = Ok<{
  [key: string]: UnwrapOk<FilterOk<ExtractValidatorO<V>>>,
}>;
type DictOutputErr<V extends AnyValidator> = Err<
  NotObjectError
  | {
    kind: InvalidDictionaryError["kind"],
    errors: Array<{
      key: string,
      error: UnwrapErr<FilterErr<ExtractValidatorO<V>>>,
    }>,
  }
>;

export const dict = <V extends AnyValidator>(inner: V): Validator<any, DictOutput<V>> =>
  (input) => {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return err(notObjectError);
    }

    const dictKeys = Object.keys(input);

    const [errors, sanitizedValue] = dictKeys.reduce(
      (acc, dictKey) => {
        const value = input[dictKey];
        const validation = inner(value);

        if (isErr(validation)) {
          const error = { key: dictKey, error: validation.value };
          const errors = acc[0];
          errors.push(error);
          return [errors, acc[1]];
        } else {
          const sanitizedValue = acc[1];
          if (validation.value !== undefined) {
            sanitizedValue[dictKey] = validation.value;
          }
          return [acc[0], sanitizedValue];
        }
      },
      [[] as any[], {} as any],
    );

    return errors.length
      ? err(invalidDictionaryError(errors))
      : ok(sanitizedValue) as any;
  };
