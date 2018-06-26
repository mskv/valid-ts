import { AnyValidator, validator, Validator } from "./validator";

// tslint:disable:max-line-length
export function and<I1, O1 extends I2, E1, I2, O2 extends O1, E2>(v1: Validator<I1, O1, E1>, v2: Validator<I2, O2, E2>): Validator<I1, O2, E1 | E2>;
export function and<I1, O1 extends I2, E1, I2, O2 extends I3, E2, I3, O3 extends O1 & O2, E3>(v1: Validator<I1, O1, E1>, v2: Validator<I2, O2, E2>, v3: Validator<I3, O3, E3>): Validator<I1, O3, E1 | E2 | E3>;
export function and<I1, O1 extends I2, E1, I2, O2 extends I3, E2, I3, O3 extends I4, E3, I4, O4 extends O1 & O2 & O3, E4>(v1: Validator<I1, O1, E1>, v2: Validator<I2, O2, E2>, v3: Validator<I3, O3, E3>, v4: Validator<I4, O4, E4>): Validator<I1, O3, E1 | E2 | E3 | E4>;
export function and<I1, O1 extends I2, E1, I2, O2 extends I3, E2, I3, O3 extends I4, E3, I4, O4 extends I5, E4, I5, O5 extends O1 & O2 & O3 & O4, E5>(v1: Validator<I1, O1, E1>, v2: Validator<I2, O2, E2>, v3: Validator<I3, O3, E3>, v4: Validator<I4, O4, E4>, v5: Validator<I5, O5, E5>): Validator<I1, O3, E1 | E2 | E3 | E4 | E5>;
export function and<I1, O1 extends I2, E1, I2, O2 extends I3, E2, I3, O3 extends I4, E3, I4, O4 extends I5, E4, I5, O5 extends I6, E5, I6, O6 extends O1 & O2 & O3 & O4 & O5, E6>(v1: Validator<I1, O1, E1>, v2: Validator<I2, O2, E2>, v3: Validator<I3, O3, E3>, v4: Validator<I4, O4, E4>, v5: Validator<I5, O5, E5>, v6: Validator<I6, O6, E6>): Validator<I1, O3, E1 | E2 | E3 | E4 | E5 | E6>;
// tslint:enable:max-line-length
export function and(...vs: AnyValidator[]): AnyValidator {
  if (vs.length < 2) { throw new Error("Expected at least 2 arguments"); }

  const v1 = vs[0];
  const vRest = vs.slice(1);

  return validator((input) => vRest.reduce((result, v) => result.bind(v), v1(input)));
}
