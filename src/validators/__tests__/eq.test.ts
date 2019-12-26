import { err, ok } from "../../result";

import { eq } from "../eq";

describe("eq - default validator", () => {
  const validator = eq("1");

  it("eq - checking valid value", () => {
    expect(validator("1")).toEqual(ok("1"));
  });

  it("eq - checking invalid value", () => {
    expect(validator(1)).toEqual(err("not_equals"));
  });
});

describe("eq - custom validator", () => {
  // tslint:disable-next-line:triple-equals
  const validator = eq("1", (input, value) => input == value);

  it("eq - checking valid value", () => {
    expect(validator("1")).toEqual(ok("1"));
  });

  it("eq - checking value that is valid due to switching to custom validator", () => {
    expect(validator(1)).toEqual(ok(1));
  });
});
