import { nullable } from "../nullable";
import { string } from "../primitives";

const validator = nullable(string);

it("nullable - checking invalid value", () => {
  expect(validator(1).unwrap()).toEqual({ kind: "Err", value: "not_string" });
});

it("nullable - checking valid value", () => {
  expect(validator("1").unwrap()).toEqual({ kind: "Ok", value: "1" });
});

it("nullable - checking null", () => {
  expect(validator(null).unwrap()).toEqual({ kind: "Ok", value: null });
});
