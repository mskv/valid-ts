import { Result } from "../result";

import { validator, Validator } from "./validator";

export const optional = <I, O, E>(inner: Validator<I, O, E>) =>
  validator<I | undefined, O | undefined, E>(input =>
    input === undefined ? Result.ok(input as undefined) : inner(input)
  );
