import { errWithMeta, ErrWithMeta, Result } from "../result";

import { validator, Validator } from "./validator";

export const dict = <I, O, E>(inner: Validator<I, O, E>) =>
  validator<
    any,
    { [key: string]: O },
    ("not_object" | ErrWithMeta<"invalid_values", { [key: string]: E }>)
  >((input) => {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return Result.err("not_object" as "not_object");
    }

    const dictKeys = Object.keys(input);

    const [hasFailure, invalidValuesMeta, sanitizedValue] =
      dictKeys.reduce<[boolean, { [key: string]: E }, { [key: string]: O }]>((acc, dictKey) => {
        const dictValue = input[dictKey];

        const validation = inner(dictValue).unwrap();

        if (validation.kind === "Err") {
          const invalidValuesMeta = acc[1];
          invalidValuesMeta[dictKey] = validation.value;
          return [true, invalidValuesMeta, acc[2]];
        } else {
          const sanitizedValue = acc[2];
          if (validation.value !== undefined) { sanitizedValue[dictKey] = validation.value; }
          return [acc[0], acc[1], sanitizedValue];
        }
      }, [false, ({} as any), ({} as any)]);

    return hasFailure ? Result.err(errWithMeta("invalid_values", invalidValuesMeta)) : Result.ok(sanitizedValue);
  });
