import { err, ok } from "../result";

import { notBooleanError, notNumberError, notStringError } from "./error";

export const any = (input: any) => ok(input);

export const number = (input: any) =>
  typeof input === "number"
    ? ok(input)
    : err(notNumberError);

export const string = (input: any) =>
  typeof input === "string"
    ? ok(input)
    : err(notStringError);

export const boolean = (input: any) =>
  typeof input === "boolean"
    ? ok(input)
    : err(notBooleanError);
