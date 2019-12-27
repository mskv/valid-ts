import { err, ok } from "../../result";

import { notNumberError, notStringError } from "../error";
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
  expect(number("1")).toEqual(err(notNumberError));
  expect(number(null)).toEqual(err(notNumberError));
  expect(number(undefined)).toEqual(err(notNumberError));
  expect(number({})).toEqual(err(notNumberError));
  expect(number([])).toEqual(err(notNumberError));
});

it("string", () => {
  expect(string(1)).toEqual(err(notStringError));
  expect(string("1")).toEqual(ok("1"));
  expect(string(null)).toEqual(err(notStringError));
  expect(string(undefined)).toEqual(err(notStringError));
  expect(string({})).toEqual(err(notStringError));
  expect(string([])).toEqual(err(notStringError));
});
