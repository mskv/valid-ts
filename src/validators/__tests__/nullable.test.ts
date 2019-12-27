import { err, ok } from "../../result";

import { notStringError } from "../error";
import { nullable } from "../nullable";
import { string } from "../primitives";

const validator = nullable(string);

it("nullable - checking invalid value", () => {
  expect(validator(1)).toEqual(err(notStringError));
});

it("nullable - checking valid value", () => {
  expect(validator("1")).toEqual(ok("1"));
});

it("nullable - checking null", () => {
  expect(validator(null)).toEqual(ok(null));
});
