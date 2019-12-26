import { err, ok } from "../../result";

import { any, number, string } from "../primitives";

it("any", () => {
  expect(any(1)).toEqual(ok(1));
  expect(any("1")).toEqual(ok("1"));
  expect(any(null)).toEqual(ok(null));
  expect(any(undefined)).toEqual(ok(undefined));
  expect(any({})).toEqual(ok({}));
  expect(any([])).toEqual(ok([]));
});

it("number", () => {
  expect(number(1)).toEqual(ok(1));
  expect(number("1")).toEqual(err("not_number"));
  expect(number(null)).toEqual(err("not_number"));
  expect(number(undefined)).toEqual(err("not_number"));
  expect(number({})).toEqual(err("not_number"));
  expect(number([])).toEqual(err("not_number"));
});

it("string", () => {
  expect(string(1)).toEqual(err("not_string"));
  expect(string("1")).toEqual(ok("1"));
  expect(string(null)).toEqual(err("not_string"));
  expect(string(undefined)).toEqual(err("not_string"));
  expect(string({})).toEqual(err("not_string"));
  expect(string([])).toEqual(err("not_string"));
});
