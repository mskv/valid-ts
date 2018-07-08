import { dict } from "../dict";
import { nullable } from "../nullable";
import { string } from "../primitives";

const validator = dict(nullable(string));

it("dict - checking invalid value", () => {
  expect(validator({ f1: null, f2: undefined, f3: "1", f4: 1 }).unwrap()).toEqual({
    kind: "Err",
    value: { kind: "invalid_values", meta: { f2: "not_string", f4: "not_string" } },
  });
});

it("dict - checking valid value", () => {
  expect(validator({ f1: null, f2: "undefined", f3: "1", f4: "2" }).unwrap()).toEqual({
    kind: "Ok",
    value: { f1: null, f2: "undefined", f3: "1", f4: "2" },
  });
});
