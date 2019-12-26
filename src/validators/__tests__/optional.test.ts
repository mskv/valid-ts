import { err, ok } from "../../result";

import { optional } from "../optional";
import { string } from "../primitives";

const validator = optional(string);

it("optional - checking invalid value", () => {
  expect(validator(1)).toEqual(err("not_string"));
});

it("optional - checking valid value", () => {
  expect(validator("1")).toEqual(ok("1"));
});

it("optional - checking undefined", () => {
  expect(validator(undefined)).toEqual(ok(undefined));
});
