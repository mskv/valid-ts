import { number } from "../primitives";

it("test", () => {
  expect(number(1).unwrap()).toEqual({ kind: "Ok", value: 1 });
});
