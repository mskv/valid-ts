import { err, FilterOk, ok } from "../../result";

import { invalidShapeError, notObjectError, notStringError } from "../error";
import { nullable } from "../nullable";
import { optional } from "../optional";
import { string } from "../primitives";
import { shape } from "../shape";

const validator = shape({
  f1: string,
  f2: optional(string),
  f3: nullable(string),
  f4: shape({ f4f1: string, f4f2: optional(string) }),
});

it("shape - checking invalid value, non-object", () => {
  expect(validator(1)).toEqual(err(notObjectError));
});

it("shape - checking invalid value, object with missing fields", () => {
  expect(validator({
    f1: "1",
    f4: { f4f1: "1" },
  })).toEqual(err(
    invalidShapeError([{
      field: "f3",
      error: notStringError,
    }]),
  ));
});

it("shape - checking invalid value, object with invalid fields", () => {
  expect(validator({
    f1: 1,
    f2: 1,
    f3: null,
    f4: { f4f1: "1" },
  })).toEqual(err(
    invalidShapeError([
      { field: "f1", error: notStringError },
      { field: "f2", error: notStringError },
    ]),
  ));
});

it("shape - checking invalid value, error in nested shape", () => {
  expect(validator({
    f1: "1",
    f3: null,
    f4: { f4f1: 1 },
  })).toEqual(err(
    invalidShapeError([{
      field: "f4",
      error: invalidShapeError([{ field: "f4f1", error: notStringError }]),
    }]),
  ));
});

const validResult = ok({
  f1: "1",
  f3: null,
  f4: { f4f1: "1" },
});

it("shape - checking valid value", () => {
  expect(validator({
    f1: "1",
    f3: null,
    f4: { f4f1: "1" },
  })).toEqual(validResult);
});

it("shape - coercion - checking valid value, pruning fields with undefined values", () => {
  const result = validator({
    f1: "1",
    f2: undefined,
    f3: null,
    f4: { f4f1: "1" },
  });

  expect(result).toEqual(validResult);

  expect(result.value.hasOwnProperty("f2")).toEqual(false);
});

it("shape - coercion - checking valid value, pruning fields with undefined values also in nested shape", () => {
  const result = validator({
    f1: "1",
    f3: null,
    f4: { f4f1: "1", f4f2: undefined },
  });

  expect(result).toEqual(validResult);

  expect((result as FilterOk<typeof result>).value.f4.hasOwnProperty("f4f2")).toEqual(false);
});

it("shape - coercion - checking valid value, pruning additional fields", () => {
  const result = validator({
    f1: "1",
    f3: null,
    f4: { f4f1: "1" },
    f5: "whatever",
  });

  expect(result).toEqual(validResult);

  expect(result.value.hasOwnProperty("f2")).toEqual(false);
  expect(result.value.hasOwnProperty("f5")).toEqual(false);
});

it("shape - coercion - checking valid value, pruning additional fields also in nested shape", () => {
  const result = validator({
    f1: "1",
    f3: null,
    f4: { f4f1: "1", f4f3: "whatever" },
  });

  expect(result).toEqual(validResult);
  expect((result as FilterOk<typeof result>).value.f4.hasOwnProperty("f4f2")).toEqual(false);
  expect((result as FilterOk<typeof result>).value.f4.hasOwnProperty("f4f3")).toEqual(false);
});
