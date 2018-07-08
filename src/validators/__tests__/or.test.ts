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

it("and - checking invalid value - collects errors", () => {
  const validator = or(string, and(number, greaterThan1), and(number, greaterThan3));

  expect(validator(1).unwrap()).toEqual({
    kind: "Err",
    value: { kind: "none_passed", meta: [
      "not_string",
      { kind: "not_greater_than_1", meta: { actual: 1 } },
      { kind: "not_greater_than_3", meta: { actual: 1 } },
    ] },
  });
});

it("or - checking valid value - first success short-circuits", () => {
  const validator = or(string, and(number, greaterThan1), and(number, greaterThan3));

  expect(validator(2).unwrap()).toEqual({ kind: "Ok", value: 2 });
});
