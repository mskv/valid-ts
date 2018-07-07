import { errWithMeta, ErrWithMeta, Result } from "../result";

import { EqPredicate, equals } from "./eq";
import { validator } from "./validator";

export type InclErr<T> = ErrWithMeta<"not_includes", { expected: T[], actual: any }>;

export const incl = <T>(values: T[], predicate: EqPredicate<T> = equals) => validator<any, T, InclErr<T>>(
  (input) => values.some((value) => predicate(input, value))
    ? Result.ok(input)
    : Result.err(errWithMeta("not_includes", { expected: values, actual: input })),
);
