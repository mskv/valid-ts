import { errWithMeta, ErrWithMeta, Result } from "../../result";
import { and } from "../and";
import { or } from "../or";
import { number, string } from "../primitives";
import { validator } from "../validator";

const greaterThan1 = validator<number, number, ErrWithMeta<"not_greater_than_1", { actual: number }>>((input) =>
  input > 1 ? Result.ok(input) : Result.err(errWithMeta("not_greater_than_1", { actual: input })),
);

const greaterThan3 = validator<number, number, ErrWithMeta<"not_greater_than_3", { actual: number }>>((input) =>
  input > 3 ? Result.ok(input) : Result.err(errWithMeta("not_greater_than_3", { actual: input })),
);

const stringToInt = validator<string | number, number, "cannot_cast_to_int">((input) => {
  if (typeof input === "number") {
    return Result.ok(Math.round(input));
  } else {
    const parsed = parseInt(input, 10);
    if (!parsed) { return Result.err("cannot_cast_to_int" as "cannot_cast_to_int"); }
    return Result.ok(parsed);
  }
});

it("and - next validator/coercer receives value from the previous one", () => {
  const validator = and(or(string, number), stringToInt, greaterThan1);

  expect(validator({}).unwrap()).toEqual({
    kind: "Err",
    value: { kind: "none_passed", meta: ["not_string", "not_number"] },
  });

  expect(validator("abc").unwrap()).toEqual({ kind: "Err", value: "cannot_cast_to_int" });

  expect(validator("1").unwrap()).toEqual({
    kind: "Err",
    value: { kind: "not_greater_than_1", meta: { actual: 1 } },
  });

  expect(validator("2").unwrap()).toEqual({ kind: "Ok", value: 2 });
});

it("and - checking invalid value - first error short-circuits", () => {
  const validator = and(number, greaterThan3, greaterThan1);

  expect(validator(2).unwrap()).toEqual({
    kind: "Err",
    value: { kind: "not_greater_than_3", meta: { actual: 2 } },
  });
});
