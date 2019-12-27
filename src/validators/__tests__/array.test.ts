import { err, ok } from "../../result";
import { array } from "../array";
import { invalidArrayError, notStringError } from "../error";
import { nullable } from "../nullable";
import { string } from "../primitives";

const validator = array(nullable(string));

it("array - checking invalid value", () => {
  expect(validator([null, undefined, "1", 1])).toEqual(err(
    invalidArrayError([
      { index: 1, error: notStringError },
      { index: 3, error: notStringError },
    ]),
  ));
});

it("array - checking valid value", () => {
  expect(validator([null, "undefined", "1", "2"])).toEqual(ok(
    [null, "undefined", "1", "2"],
  ));
});
