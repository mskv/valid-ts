import { incl } from "../incl";

describe("incl - default validator", () => {
  const validator = incl(["1", 2]);

  it("incl - checking valid value", () => {
    expect(validator("1").unwrap()).toEqual({ kind: "Ok", value: "1" });
  });

  it("incl - checking invalid value", () => {
    expect(validator("2").unwrap()).toEqual(
      { kind: "Err", value: { kind: "not_includes", meta: { expected: ["1", 2], actual: "2" } } },
    );
  });
});

describe("incl - custom validator", () => {
  // tslint:disable-next-line:triple-equals
  const validator = incl(["1", 2], (input, value) => input == value);

  it("incl - checking valid value", () => {
    expect(validator("1").unwrap()).toEqual({ kind: "Ok", value: "1" });
  });

  it("incl - checking value that is valid due to switching to custom validator", () => {
    expect(validator("2").unwrap()).toEqual({ kind: "Ok", value: "2" });
  });
});
