import { errWithMeta, ErrWithMeta, Result } from "../result";

import { AnyValidator, validator } from "./validator";

export type Schema = { [field: string]: AnyValidator };
export type GetShapeOutput<S extends Schema> = { [K in keyof S]: S[K]["__o"] };
export type GetShapeErrMeta<S extends Schema> = { [K in keyof S]?: S[K]["__e"] };

export const shape = <S extends Schema>(schema: S) =>
  validator<
    any,
    GetShapeOutput<S>,
    ("not_object" | ErrWithMeta<"invalid_shape", GetShapeErrMeta<S>>)
  >((input) => {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return Result.err("not_object" as "not_object");
    }

    const schemaKeys = Object.keys(schema);

    const [hasFailure, invalidShapeMeta, sanitizedValue] =
      schemaKeys.reduce<[boolean, GetShapeErrMeta<S>, GetShapeOutput<S>]>((acc, schemaKey) => {
        const fieldValidator = schema[schemaKey];
        const fieldValue = input[schemaKey];

        const validation = fieldValidator(fieldValue).unwrap();

        if (validation.kind === "Err") {
          const invalidShapeMeta = acc[1];
          invalidShapeMeta[schemaKey] = validation.value;
          return [true, invalidShapeMeta, acc[2]];
        } else {
          const sanitizedValue = acc[2];
          if (validation.value !== undefined) { sanitizedValue[schemaKey] = validation.value; }
          return [acc[0], acc[1], sanitizedValue];
        }
      }, [false, ({} as any), ({} as any)]);

    return hasFailure ? Result.err(errWithMeta("invalid_shape", invalidShapeMeta)) : Result.ok(sanitizedValue);
  });
