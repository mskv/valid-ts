import { Err, err, Ok, ok } from "../result";

import { EqPredicate, equals } from "./eq";
import { inclusionError, InclusionError } from "./error";
import { Validator } from "./validator";

type InclOutput<T> = Ok<T> | Err<InclusionError>;

export const incl = <T>(values: T[], predicate: EqPredicate<T> = equals): Validator<any, InclOutput<T>> =>
  (input) => values.some((value) => predicate(input, value))
    ? ok(input)
    : err(inclusionError);
