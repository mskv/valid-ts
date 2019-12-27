import { err, ok } from "../../result";

import { and } from "../and";
import { allFailedError, notNumberError, notStringError } from "../error";
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

const stringToInt = (input: string | number) => {
  if (typeof input === "number") {
    return ok(Math.round(input));
  } else {
    const parsed = parseInt(input, 10);
    if (!parsed) { return err({ kind: "cannot_cast_to_int" as const }); }
    return ok(parsed);
  }
};

it("and - next validator/coercer receives value from the previous one", () => {
  const validator = and(or(string, number), stringToInt, greaterThan1);

  expect(validator({})).toEqual(err(allFailedError([notStringError, notNumberError])));

  expect(validator("abc")).toEqual(err({ kind: "cannot_cast_to_int" }));

  expect(validator("1")).toEqual(err({ kind: "not_greater_than_1", actual: 1 }));

  expect(validator("2")).toEqual(ok(2));
});

it("and - checking invalid value - first error short-circuits", () => {
  const validator = and(number, greaterThan3, greaterThan1);

  expect(validator(2)).toEqual(err({ kind: "not_greater_than_3", actual: 2 }));
});
