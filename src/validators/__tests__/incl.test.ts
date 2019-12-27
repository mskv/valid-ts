import { err, ok } from "../../result";
import { inclusionError } from "../error";
import { incl } from "../incl";

describe("incl - default validator", () => {
  const validator = incl(["1", 2]);

  it("incl - checking valid value", () => {
    expect(validator("1")).toEqual(ok("1"));
  });

  it("incl - checking invalid value", () => {
    expect(validator("2")).toEqual(err(inclusionError));
  });
});

describe("incl - custom validator", () => {
  // tslint:disable-next-line:triple-equals
  const validator = incl(["1", 2], (input, value) => input == value);

  it("incl - checking valid value", () => {
    expect(validator("1")).toEqual(ok("1"));
  });

  it("incl - checking value that is valid due to switching to custom validator", () => {
    expect(validator("2")).toEqual(ok("2"));
  });
});
