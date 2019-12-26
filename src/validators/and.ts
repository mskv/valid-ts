import { LastTupleElem } from "../utils";

import { AnyResult, FilterErr, FilterOk, ResultKind, UnwrapOk } from "../result";
import { AnyValidator, ExtractValidatorI, ExtractValidatorO, Validator } from "./validator";

interface And {
  // tslint:disable:max-line-length
  <I1, O1 extends AnyResult, I2 extends UnwrapOk<FilterOk<O1>>, O2 extends AnyResult, I3 extends UnwrapOk<FilterOk<O2>>, O3 extends AnyResult, I4 extends UnwrapOk<FilterOk<O3>>, O4 extends AnyResult, I5 extends UnwrapOk<FilterOk<O4>>, O5 extends AnyResult, I6 extends UnwrapOk<FilterOk<O5>>, O6 extends AnyResult, I7 extends UnwrapOk<FilterOk<O6>>, O7 extends AnyResult, I8 extends UnwrapOk<FilterOk<O7>>, O8 extends AnyResult>(v1: Validator<I1, O1>, v2: Validator<I2, O2>, v3: Validator<I3, O3>, v4: Validator<I4, O4>, v5: Validator<I5, O5>, v6: Validator<I6, O6>, v7: Validator<I7, O7>, v8: Validator<I8, O8>): Validator<I1, O8 | FilterErr<O1 | O2 | O3 | O4 | O5 | O6 | O7>>;
  <I1, O1 extends AnyResult, I2 extends UnwrapOk<FilterOk<O1>>, O2 extends AnyResult, I3 extends UnwrapOk<FilterOk<O2>>, O3 extends AnyResult, I4 extends UnwrapOk<FilterOk<O3>>, O4 extends AnyResult, I5 extends UnwrapOk<FilterOk<O4>>, O5 extends AnyResult, I6 extends UnwrapOk<FilterOk<O5>>, O6 extends AnyResult, I7 extends UnwrapOk<FilterOk<O6>>, O7 extends AnyResult>(v1: Validator<I1, O1>, v2: Validator<I2, O2>, v3: Validator<I3, O3>, v4: Validator<I4, O4>, v5: Validator<I5, O5>, v6: Validator<I6, O6>, v7: Validator<I7, O7>): Validator<I1, O7 | FilterErr<O1 | O2 | O3 | O4 | O5 | O6>>;
  <I1, O1 extends AnyResult, I2 extends UnwrapOk<FilterOk<O1>>, O2 extends AnyResult, I3 extends UnwrapOk<FilterOk<O2>>, O3 extends AnyResult, I4 extends UnwrapOk<FilterOk<O3>>, O4 extends AnyResult, I5 extends UnwrapOk<FilterOk<O4>>, O5 extends AnyResult, I6 extends UnwrapOk<FilterOk<O5>>, O6 extends AnyResult>(v1: Validator<I1, O1>, v2: Validator<I2, O2>, v3: Validator<I3, O3>, v4: Validator<I4, O4>, v5: Validator<I5, O5>, v6: Validator<I6, O6>): Validator<I1, O6 | FilterErr<O1 | O2 | O3 | O4 | O5>>;
  <I1, O1 extends AnyResult, I2 extends UnwrapOk<FilterOk<O1>>, O2 extends AnyResult, I3 extends UnwrapOk<FilterOk<O2>>, O3 extends AnyResult, I4 extends UnwrapOk<FilterOk<O3>>, O4 extends AnyResult, I5 extends UnwrapOk<FilterOk<O4>>, O5 extends AnyResult>(v1: Validator<I1, O1>, v2: Validator<I2, O2>, v3: Validator<I3, O3>, v4: Validator<I4, O4>, v5: Validator<I5, O5>): Validator<I1, O5 | FilterErr<O1 | O2 | O3 | O4>>;
  <I1, O1 extends AnyResult, I2 extends UnwrapOk<FilterOk<O1>>, O2 extends AnyResult, I3 extends UnwrapOk<FilterOk<O2>>, O3 extends AnyResult, I4 extends UnwrapOk<FilterOk<O3>>, O4 extends AnyResult>(v1: Validator<I1, O1>, v2: Validator<I2, O2>, v3: Validator<I3, O3>, v4: Validator<I4, O4>): Validator<I1, O4 | FilterErr<O1 | O2 | O3>>;
  <I1, O1 extends AnyResult, I2 extends UnwrapOk<FilterOk<O1>>, O2 extends AnyResult, I3 extends UnwrapOk<FilterOk<O2>>, O3 extends AnyResult>(v1: Validator<I1, O1>, v2: Validator<I2, O2>, v3: Validator<I3, O3>): Validator<I1, O3 | FilterErr<O1 | O2>>;
  <I1, O1 extends AnyResult, I2 extends UnwrapOk<FilterOk<O1>>, O2 extends AnyResult>(v1: Validator<I1, O1>, v2: Validator<I2, O2>): Validator<I1, O2 | FilterErr<O1>>;
  <Vs extends AnyValidator[]>(...validators: Vs): Validator<ExtractValidatorI<Vs[0]>, FilterOk<ExtractValidatorO<LastTupleElem<Vs>>> | FilterErr<ExtractValidatorO<Vs[number]>>>;
  // tslint:enable:max-line-length
}

export const and: And = (...validators: any) => {
  if (validators.length < 2) { throw new Error("Expected at least 2 arguments"); }

  const validatorsFirst = validators[0];
  const validstorsRest = validators.slice(1);

  return (input: any) =>
    validstorsRest.reduce((result: any, validator: any) =>
      result.kind === ResultKind.Err
        ? result
        : validator(result.value)
      , validatorsFirst(input)) as any;
};
