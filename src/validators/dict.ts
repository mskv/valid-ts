import { Err, err, FilterErr, FilterOk, Ok, ok, ResultKind, UnwrapErr, UnwrapOk } from "../result";
import { AnyValidator, ExtractValidatorO, Validator } from "./validator";

type DictOutput<V extends AnyValidator> = DictOutputOk<V> | DictOutputErr<V>;
type DictOutputOk<V extends AnyValidator> = Ok<{
  [key: string]: UnwrapOk<FilterOk<ExtractValidatorO<V>>>,
}>;
type DictOutputErr<V extends AnyValidator> = Err<
  "not_object"
  | {
    kind: "invalid_values",
    value: Array<{
      key: string,
      error: UnwrapErr<FilterErr<ExtractValidatorO<V>>>,
    }>,
  }
>;

export const dict = <V extends AnyValidator>(inner: V): Validator<any, DictOutput<V>> =>
  (input) => {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return err("not_object");
    }

    const dictKeys = Object.keys(input);

    const [errors, sanitizedValue] = dictKeys.reduce(
      (acc, dictKey) => {
        const value = input[dictKey];
        const validation = inner(value);

        if (validation.kind === ResultKind.Err) {
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
      ? err({ kind: "invalid_values", value: errors })
      : ok(sanitizedValue) as any;
  };
