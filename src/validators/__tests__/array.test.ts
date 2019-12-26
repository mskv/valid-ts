import { err, ok } from "../../result";
import { array } from "../array";
import { nullable } from "../nullable";
import { string } from "../primitives";

const validator = array(nullable(string));

it("array - checking invalid value", () => {
  expect(validator([null, undefined, "1", 1])).toEqual(err({
    kind: "invalid_members",
    value: [
      { index: 1, error: "not_string" },
      { index: 3, error: "not_string" },
    ],
  }));
});

it("array - checking valid value", () => {
  expect(validator([null, "undefined", "1", "2"])).toEqual(ok(
    [null, "undefined", "1", "2"],
  ));
});
