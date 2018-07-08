import { optional } from "../optional";
import { string } from "../primitives";

const validator = optional(string);

it("optional - checking invalid value", () => {
  expect(validator(1).unwrap()).toEqual({ kind: "Err", value: "not_string" });
});

it("optional - checking valid value", () => {
  expect(validator("1").unwrap()).toEqual({ kind: "Ok", value: "1" });
});

it("optional - checking undefined", () => {
  expect(validator(undefined).unwrap()).toEqual({ kind: "Ok", value: undefined });
});
