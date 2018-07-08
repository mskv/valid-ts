import { eq } from "../eq";

describe("eq - default validator", () => {
  const validator = eq("1");

  it("eq - checking valid value", () => {
    expect(validator("1").unwrap()).toEqual({ kind: "Ok", value: "1" });
  });

  it("eq - checking invalid value", () => {
    expect(validator(1).unwrap()).toEqual(
      { kind: "Err", value: { kind: "not_equals", meta: { expected: "1", actual: 1 } } },
    );
  });
});

describe("eq - custom validator", () => {
  // tslint:disable-next-line:triple-equals
  const validator = eq("1", (input, value) => input == value);

  it("eq - checking valid value", () => {
    expect(validator("1").unwrap()).toEqual({ kind: "Ok", value: "1" });
  });

  it("eq - checking value that is valid due to switching to custom validator", () => {
    expect(validator(1).unwrap()).toEqual({ kind: "Ok", value: 1 });
  });
});
