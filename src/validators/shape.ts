import { Err, err, FilterErr, FilterOk, isErr, Ok, ok, UnwrapErr, UnwrapOk } from "../result";

import { InvalidShapeError, invalidShapeError, NotObjectError, notObjectError } from "./error";
import { AnyValidator, ExtractValidatorO, Validator } from "./validator";

type Schema = { [field: string]: AnyValidator };
type ShapeOutput<S extends Schema> = ShapeOutputOk<S> | ShapeOutputErr<S>;
type ShapeOutputOk<S extends Schema> =
  Ok<{ [K in keyof S]: UnwrapOk<FilterOk<ExtractValidatorO<S[K]>>> }>;
type ShapeOutputErr<S extends Schema> =
  Err<
    NotObjectError
    | {
      kind: InvalidShapeError["kind"],
      errors: Array<{
        [K in keyof S]: {
          field: K,
          error: UnwrapErr<FilterErr<ExtractValidatorO<S[K]>>>,
        }
      }[keyof S]>,
    }
  >;

export const shape = <S extends Schema>(schema: S): Validator<any, ShapeOutput<S>> =>
  (input) => {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return err(notObjectError);
    }

    const schemaKeys = Object.keys(schema) as [keyof S];

    const [errors, sanitizedValue] = schemaKeys.reduce(
      (acc, schemaKey) => {
        const fieldValidator = schema[schemaKey];
        const fieldValue = input[schemaKey];

        const validation = fieldValidator(fieldValue);

        if (isErr(validation)) {
          const error = { field: schemaKey, error: validation.value };
          const errors = acc[0];
          errors.push(error);
          return [errors, acc[1]];
        } else {
          const sanitizedValue = acc[1];
          if (validation.value !== undefined) {
            sanitizedValue[schemaKey] = validation.value;
          }
          return [acc[0], sanitizedValue];
        }
      },
      [[] as any[], {} as any],
    );

    return errors.length
      ? err(invalidShapeError(errors))
      : ok(sanitizedValue) as any;
  };
