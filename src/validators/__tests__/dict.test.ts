import { err, ok } from "../../result";

import { dict } from "../dict";
import { nullable } from "../nullable";
import { string } from "../primitives";

const validator = dict(nullable(string));

it("dict - checking invalid value", () => {
  expect(validator({ f1: null, f2: undefined, f3: "1", f4: 1 })).toEqual(err({
    kind: "invalid_values",
    value: [
      { key: "f2", error: "not_string" },
      { key: "f4", error: "not_string" },
    ],
  }));
});

it("dict - checking valid value", () => {
  expect(validator({ f1: null, f2: "undefined", f3: "1", f4: "2" })).toEqual(ok(
    { f1: null, f2: "undefined", f3: "1", f4: "2" },
  ));
});
