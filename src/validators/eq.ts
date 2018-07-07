import { errWithMeta, ErrWithMeta, Result } from "../result";

import { validator } from "./validator";

export type EqErr<T> = ErrWithMeta<"not_eq", { expected: T, actual: any }>;
export type EqPredicate<T> = (input: any, value: T) => boolean;

export const equals: EqPredicate<any> = (input, value) => input === value;

export const eq = <T>(value: T, predicate: EqPredicate<T> = equals) => validator<any, T, EqErr<T>>(
  (input) => predicate(input, value)
    ? Result.ok(input)
    : Result.err(errWithMeta("not_eq", { expected: value, actual: input })),
);
