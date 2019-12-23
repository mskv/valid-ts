import { Result } from "../result";

import { validator, Validator } from "./validator";

export const nullable = <I, O, E>(inner: Validator<I, O, E>) =>
  validator<I | null, O | null, E>(input =>
    input === null ? Result.ok(input as null) : inner(input)
  );
