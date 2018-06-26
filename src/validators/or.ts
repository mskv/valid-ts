import { ErrWithMeta, errWithMeta, Result } from "../result";

import { AnyValidator, validator, Validator } from "./validator";

// tslint:disable:max-line-length
export function or<I, O1, E1, O2, E2>(v1: Validator<I, O1, E1>, v2: Validator<I, O2, E2>): Validator<I, (O1 | O2), ErrWithMeta<"none_passed", Array<E1 | E2>>>;
export function or<I, O1, E1, O2, E2, O3, E3>(v1: Validator<I, O1, E1>, v2: Validator<I, O2, E2>, v3: Validator<I, O3, E3>): Validator<I, (O1 | O2 | O3), ErrWithMeta<"none_passed", Array<E1 | E2 | E3>>>;
export function or<I, O1, E1, O2, E2, O3, E3, O4, E4>(v1: Validator<I, O1, E1>, v2: Validator<I, O2, E2>, v3: Validator<I, O3, E3>, v4: Validator<I, O4, E4>): Validator<I, (O1 | O2 | O3 | O4), ErrWithMeta<"none_passed", Array<E1 | E2 | E3 | E4>>>;
export function or<I, O1, E1, O2, E2, O3, E3, O4, E4, O5, E5>(v1: Validator<I, O1, E1>, v2: Validator<I, O2, E2>, v3: Validator<I, O3, E3>, v4: Validator<I, O4, E4>, v5: Validator<I, O5, E5>): Validator<I, (O1 | O2 | O3 | O4 | O5), ErrWithMeta<"none_passed", Array<E1 | E2 | E3 | E4 | E5>>>;
export function or<I, O1, E1, O2, E2, O3, E3, O4, E4, O5, E5, O6, E6>(v1: Validator<I, O1, E1>, v2: Validator<I, O2, E2>, v3: Validator<I, O3, E3>, v4: Validator<I, O4, E4>, v5: Validator<I, O5, E5>, v6: Validator<I, O6, E6>): Validator<I, (O1 | O2 | O3 | O4 | O5 | O6), ErrWithMeta<"none_passed", Array<E1 | E2 | E3 | E4 | E5 | E6>>>;
// tslint:enable:max-line-length
export function or(...vs: AnyValidator[]): AnyValidator {
  if (vs.length < 2) { throw new Error("Expected at least 2 arguments"); }

  return validator((input) =>
    vs.reduce((result, v) =>
      result.either(
        (Result.ok as ((ok: any) => Result<any, ErrWithMeta<"none_passed", any[]>>)),
        (resultErr) => v(input).either(
          (Result.ok as ((ok: any) => Result<any, ErrWithMeta<"none_passed", any[]>>)),
          (vErr) => { resultErr.meta.push(vErr); return Result.err(resultErr); },
        ),
      )
    , Result.err(errWithMeta("none_passed", [] as any[]))),
  );
}
