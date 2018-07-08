import { array } from "../array";
import { nullable } from "../nullable";
import { string } from "../primitives";

const validator = array(nullable(string));

it("array - checking invalid value", () => {
  expect(validator([null, undefined, "1", 1]).unwrap()).toEqual({
    kind: "Err",
    value: { kind: "invalid_members", meta: { 1: "not_string", 3: "not_string" } },
  });
});

it("array - checking valid value", () => {
  expect(validator([null, "undefined", "1", "2"]).unwrap()).toEqual({
    kind: "Ok",
    value: [null, "undefined", "1", "2"],
  });
});
