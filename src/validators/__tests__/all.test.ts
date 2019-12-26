import { err, ok } from "../../result";

import { all } from "../all";
import { number, string } from "../primitives";
import { shape } from "../shape";

const person = shape({ firstName: string, lastName: string });
const user = shape({ id: number });
const validator = all(person, user);

it("all - returns the input unchanged if all checks pass", () => {
  const input = {
    firstName: "John",
    lastName: "Wick",
    id: 1,
    additional: Date.now(),
  };

  expect(validator(input)).toEqual(ok(input));
});

it("all - accumulates failures on invalid input", () => {
  const input = {
    firstName: null,
    lastName: "Wick",
    id: "1",
    additional: Date.now(),
  };

  expect(validator(input)).toEqual(err({
    kind: "some_failed",
    value: [
      {
        kind: "invalid_shape",
        value: [{ field: "firstName", error: "not_string" }],
      },
      {
        kind: "invalid_shape",
        value: [{ field: "id", error: "not_number" }],
      },
    ],
  }));
});
