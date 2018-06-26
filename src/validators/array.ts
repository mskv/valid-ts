import { errWithMeta, ErrWithMeta, Result } from "../result";

import { validator, Validator } from "./validator";

export const array = <I, O, E>(inner: Validator<I, O, E>) =>
  validator<
    I[],
    O[],
    ("not_array" | ErrWithMeta<"invalid_members", { [index: string]: E }>)
  >((input) => {
    if (!Array.isArray(input)) { return Result.err("not_array" as "not_array"); }

    const validations = input.map(inner).map((validation) => validation.unwrap());

    const [hasFailure, invalidMembersMeta, sanitizedValues] =
      validations.reduce<[boolean, { [index: string]: E }, O[]]>((acc, validation, index) => {
        if (validation.kind === "Err") {
          const invalidMembersMeta = acc[1];
          invalidMembersMeta[index] = validation.value;
          return [true, invalidMembersMeta, acc[2]];
        } else {
          const sanitizedValues = acc[2];
          sanitizedValues[index] = validation.value;
          return [acc[0], acc[1], sanitizedValues];
        }
      }, [false, {}, Array(input.length)]);

    return hasFailure ? Result.err(errWithMeta("invalid_members", invalidMembersMeta)) : Result.ok(sanitizedValues);
  });
