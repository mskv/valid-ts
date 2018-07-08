import { any, number, string } from "../primitives";

it("any", () => {
  expect(any(1).unwrap()).toEqual({ kind: "Ok", value: 1 });
  expect(any("1").unwrap()).toEqual({ kind: "Ok", value: "1" });
  expect(any(null).unwrap()).toEqual({ kind: "Ok", value: null });
  expect(any(undefined).unwrap()).toEqual({ kind: "Ok", value: undefined });
  expect(any({}).unwrap()).toEqual({ kind: "Ok", value: {} });
  expect(any([]).unwrap()).toEqual({ kind: "Ok", value: [] });
});

it("number", () => {
  expect(number(1).unwrap()).toEqual({ kind: "Ok", value: 1 });
  expect(number("1").unwrap()).toEqual({ kind: "Err", value: "not_number" });
  expect(number(null).unwrap()).toEqual({ kind: "Err", value: "not_number" });
  expect(number(undefined).unwrap()).toEqual({ kind: "Err", value: "not_number" });
  expect(number({}).unwrap()).toEqual({ kind: "Err", value: "not_number" });
  expect(number([]).unwrap()).toEqual({ kind: "Err", value: "not_number" });
});

it("string", () => {
  expect(string(1).unwrap()).toEqual({ kind: "Err", value: "not_string" });
  expect(string("1").unwrap()).toEqual({ kind: "Ok", value: "1" });
  expect(string(null).unwrap()).toEqual({ kind: "Err", value: "not_string" });
  expect(string(undefined).unwrap()).toEqual({ kind: "Err", value: "not_string" });
  expect(string({}).unwrap()).toEqual({ kind: "Err", value: "not_string" });
  expect(string([]).unwrap()).toEqual({ kind: "Err", value: "not_string" });
});
