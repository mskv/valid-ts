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
  expect(validator(1).unwrap()).toEqual({ kind: "Err", value: "not_object" });
});

it("shape - checking invalid value, object with missing fields", () => {
  expect(validator({
    f1: "1",
    f4: { f4f1: "1" },
  }).unwrap()).toEqual({
    kind: "Err",
    value: { kind: "invalid_shape", meta: {
      f3: "not_string",
    } },
  });
});

it("shape - checking invalid value, object with invalid fields", () => {
  expect(validator({
    f1: 1,
    f2: 1,
    f3: null,
    f4: { f4f1: "1" },
  }).unwrap()).toEqual({
    kind: "Err",
    value: { kind: "invalid_shape", meta: {
      f1: "not_string",
      f2: "not_string",
    } },
  });
});

it("shape - checking invalid value, error in nested shape", () => {
  expect(validator({
    f1: "1",
    f3: null,
    f4: { f4f1: 1 },
  }).unwrap()).toEqual({
    kind: "Err",
    value: { kind: "invalid_shape", meta: {
      f4: { kind: "invalid_shape", meta: { f4f1: "not_string" } },
    } },
  });
});

const validResult = {
  kind: "Ok",
  value: {
    f1: "1",
    f3: null,
    f4: { f4f1: "1" },
  },
};

it("shape - checking valid value", () => {
  expect(validator({
    f1: "1",
    f3: null,
    f4: { f4f1: "1" },
  }).unwrap()).toEqual(validResult);
});

it("shape - coercion - checking valid value, pruning fields with undefined values", () => {
  const result = validator({
    f1: "1",
    f2: undefined,
    f3: null,
    f4: { f4f1: "1" },
  }).unwrap() as any;

  expect(result).toEqual(validResult);

  expect(result.value.hasOwnProperty("f2")).toEqual(false);
});

it("shape - coercion - checking valid value, pruning fields with undefined values also in nested shape", () => {
  const result = validator({
    f1: "1",
    f3: null,
    f4: { f4f1: "1", f4f2: undefined },
  }).unwrap() as any;

  expect(result).toEqual(validResult);

  expect(result.value.f4.hasOwnProperty("f4f2")).toEqual(false);
});

it("shape - coercion - checking valid value, pruning additional fields", () => {
  const result = validator({
    f1: "1",
    f3: null,
    f4: { f4f1: "1" },
    f5: "whatever",
  }).unwrap() as any;

  expect(result).toEqual(validResult);

  expect(result.value.hasOwnProperty("f2")).toEqual(false);
  expect(result.value.hasOwnProperty("f5")).toEqual(false);
});

it("shape - coercion - checking valid value, pruning additional fields also in nested shape", () => {
  const result = validator({
    f1: "1",
    f3: null,
    f4: { f4f1: "1", f4f3: "whatever" },
  }).unwrap() as any;

  expect(result).toEqual(validResult);
  expect(result.value.f4.hasOwnProperty("f4f2")).toEqual(false);
  expect(result.value.f4.hasOwnProperty("f4f3")).toEqual(false);
});
