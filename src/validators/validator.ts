import { Result } from "../result";

export type Validator<I, O, E> = {
  __i: I, __o: O, __e: E,

  (input: I): Result<O, E>,
};
export type AnyValidator = Validator<any, any, any>;

export const validator = <I, O, E>(fn: (input: I) => Result<O, E>) => fn as Validator<I, O, E>;
