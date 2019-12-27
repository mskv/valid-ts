import { err, ok } from "../../result";

import { and } from "../and";
import { allFailedError, notStringError } from "../error";
import { or } from "../or";
import { number, string } from "../primitives";

const greaterThan1 =
  (input: number) =>
    input > 1
      ? ok(input)
      : err({ kind: "not_greater_than_1", actual: input });

const greaterThan3 =
  (input: number) =>
    input > 3
      ? ok(input)
      : err({ kind: "not_greater_than_3", actual: input });

it("and - checking invalid value - collects errors", () => {
  const validator = or(string, and(number, greaterThan1), and(number, greaterThan3));

  expect(validator(1)).toEqual(err(
    allFailedError([
      notStringError,
      { kind: "not_greater_than_1", actual: 1 } as any,
      { kind: "not_greater_than_3", actual: 1 } as any,
    ]),
  ));
});

it("or - checking valid value - first success short-circuits", () => {
  const validator = or(string, and(number, greaterThan1), and(number, greaterThan3));

  expect(validator(2)).toEqual(ok(2));
});
