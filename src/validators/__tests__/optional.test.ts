import { err, ok } from "../../result";

import { notStringError } from "../error";
import { optional } from "../optional";
import { string } from "../primitives";

const validator = optional(string);

it("optional - checking invalid value", () => {
  expect(validator(1)).toEqual(err(notStringError));
});

it("optional - checking valid value", () => {
  expect(validator("1")).toEqual(ok("1"));
});

it("optional - checking undefined", () => {
  expect(validator(undefined)).toEqual(ok(undefined));
});
