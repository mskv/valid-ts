import { errWithMeta, ErrWithMeta, Result } from "../result";

import { EqPredicate, equals } from "./eq";
import { validator } from "./validator";

export type OneOfErr<T> = ErrWithMeta<"not_one_of", { expected: T[], actual: any }>;

export const oneOf = <T>(values: T[], predicate: EqPredicate<T> = equals) => validator<any, T, OneOfErr<T>>(
  (input) => values.some((value) => predicate(input, value))
    ? Result.ok(input)
    : Result.err(errWithMeta("not_one_of", { expected: values, actual: input })),
);
