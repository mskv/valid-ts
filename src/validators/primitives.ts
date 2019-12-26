import { err, ok } from "../result";

export const any = (input: any) => ok(input);

export const number = (input: any) =>
  typeof input === "number"
    ? ok(input)
    : err("not_number" as const);

export const string = (input: any) =>
  typeof input === "string"
    ? ok(input)
    : err("not_string" as const);
