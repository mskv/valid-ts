import { err, ok } from "../../result";

import { dict } from "../dict";
import { invalidDictionaryError, notStringError } from "../error";
import { nullable } from "../nullable";
import { string } from "../primitives";

const validator = dict(nullable(string));

it("dict - checking invalid value", () => {
  expect(validator({ f1: null, f2: undefined, f3: "1", f4: 1 })).toEqual(err(
    invalidDictionaryError([
      { key: "f2", error: notStringError },
      { key: "f4", error: notStringError },
    ]),
  ));
});

it("dict - checking valid value", () => {
  expect(validator({ f1: null, f2: "undefined", f3: "1", f4: "2" })).toEqual(ok(
    { f1: null, f2: "undefined", f3: "1", f4: "2" },
  ));
});
