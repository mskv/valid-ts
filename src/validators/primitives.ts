import { Result } from "../result";

import { validator } from "./validator";

export const any = validator<any, any, any>((input) => Result.ok(input));

export const number = validator<any, number, "not_number">((input) =>
  typeof input === "number" ? Result.ok(input) : Result.err("not_number" as "not_number"),
);

export const string = validator<any, string, "not_string">((input) =>
  typeof input === "string" ? Result.ok(input) : Result.err("not_string" as "not_string"),
);
