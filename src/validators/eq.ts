import { Err, err, Ok, ok } from "../result";

import { Validator } from "./validator";

type EqOutput<T> = Ok<T> | Err<"not_equals">;

export type EqPredicate<T> = (input: any, value: T) => boolean;

export const equals: EqPredicate<any> = (input, value) => input === value;

export const eq = <T>(value: T, predicate: EqPredicate<T> = equals): Validator<any, EqOutput<T>> =>
  (input) => predicate(input, value) ? ok(input) : err("not_equals");
