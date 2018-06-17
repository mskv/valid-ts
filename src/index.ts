export class Result<O, E> {
  public static of = Result.ok;

  public static ok<O, E>(ok: O) { return new Result<O, E>({ kind: "Ok", value: ok }); }
  public static err<O, E>(err: E) { return new Result<O, E>({ kind: "Err", value: err }); }

  public map = this.mapOk;
  public chain = this.bind;
  public fmap = this.mapOk;

  private innerResult: InnerResult<O, E>;
  constructor(innerResult: InnerResult<O, E>) { this.innerResult = innerResult; }

  public ap<O2>(result: Result<(ok: O) => O2, E>): Result<O2, E> {
    return this.innerResult.kind === "Err"
      ? this as any
      : result.fmap((fn) => fn((this.innerResult as Ok<O>).value));
  }
  public bind<O2, E2>(fn: (ok: O) => Result<O2, E2>): Result<O2, E | E2> {
    return this.innerResult.kind === "Err" ? this as any : fn(this.innerResult.value);
  }

  public bimap<O2, E2>(okFn: (ok: O) => O2, errFn: (err: E) => E2): Result<O2, E2> {
    return this.innerResult.kind === "Err"
      ? Result.err(errFn(this.innerResult.value))
      : Result.ok(okFn(this.innerResult.value));
  }
  public mapOk<O2>(okFn: (ok: O) => O2): Result<O2, E> { return this.bimap(okFn, id); }
  public mapErr<E2>(errFn: (err: E) => E2): Result<O, E2> { return this.bimap(id, errFn); }

  public either<O2, E2>(okFn: (ok: O) => O2, errFn: (err: E) => E2): O2 | E2 {
    return this.innerResult.kind === "Err" ? errFn(this.innerResult.value) : okFn(this.innerResult.value);
  }
  public match<O2, E2>({ Ok, Err }: { Ok: (ok: O) => O2, Err: (err: E) => E2 }): O2 | E2 {
    return this.either(Ok, Err);
  }
  public unwrap(): InnerResult<O, E> { return this.innerResult; }
}

export type InnerResult<O, E> = Ok<O> | Err<E>;
export type Ok<O> = { kind: "Ok", value: O };
export type Err<E> = { kind: "Err", value: E };

export type ErrWithMeta<E extends string, M> = { kind: E, meta: M };
export const errWithMeta = <E extends string, M>(kind: E, meta: M) => ({ kind, meta });

export type Validator<I, O, E> = {
  __i: I, __o: O, __e: E,

  (input: I): Result<O, E>,
};
export type AnyValidator = Validator<any, any, any>;

export const validator = <I, O, E>(fn: (input: I) => Result<O, E>) => fn as Validator<I, O, E>;

export const id = <T>(value: T) => value;

export const any = validator<any, any, any>((input) => Result.ok(input));

export const number = validator<any, number, "not_number">((input) =>
  typeof input === "number" ? Result.ok(input) : Result.err("not_number" as "not_number"),
);

export const nullable = validator<any, null, "not_null">((input) =>
  input === null ? Result.ok(input) : Result.err("not_null" as "not_null"),
);

export const optional = validator<any, undefined, "not_undefined">((input) =>
  input === undefined ? Result.ok(input) : Result.err("not_undefined" as "not_undefined"),
);

export const string = validator<any, string, "not_string">((input) =>
  typeof input === "string" ? Result.ok(input) : Result.err("not_string" as "not_string"),
);

export type Schema = { [field: string]: AnyValidator };
export type GetShapeOutput<S extends Schema> = { [K in keyof S]: S[K]["__o"] };
export type GetShapeErrMeta<S extends Schema> = { [K in keyof S]?: S[K]["__e"] };

export const shape = <S extends Schema>(schema: S) =>
  validator<
    any,
    GetShapeOutput<S>,
    ("not_object" | ErrWithMeta<"invalid_shape", GetShapeErrMeta<S>>)
  >((input) => {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return Result.err("not_object" as "not_object");
    }

    const schemaKeys = Object.keys(schema);

    const [hasFailure, invalidShapeMeta, sanitizedValue] =
      schemaKeys.reduce<[boolean, GetShapeErrMeta<S>, GetShapeOutput<S>]>((acc, schemaKey) => {
        const fieldValidator = schema[schemaKey];
        const fieldValue = input[schemaKey];

        const validation = fieldValidator(fieldValue).unwrap();

        if (validation.kind === "Err") {
          const invalidShapeMeta = acc[1];
          invalidShapeMeta[schemaKey] = validation.value;
          return [true, invalidShapeMeta, acc[2]];
        } else {
          const sanitizedValue = acc[2];
          if (validation.value !== undefined) { sanitizedValue[schemaKey] = validation.value; }
          return [acc[0], acc[1], sanitizedValue];
        }
      }, [false, ({} as any), ({} as any)]);

    return hasFailure ? Result.err(errWithMeta("invalid_shape", invalidShapeMeta)) : Result.ok(sanitizedValue);
  });

export const dict = <I, O, E>(inner: Validator<I, O, E>) =>
  validator<
    any,
    { [key: string]: O },
    ("not_object" | ErrWithMeta<"invalid_values", { [key: string]: E }>)
  >((input) => {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return Result.err("not_object" as "not_object");
    }

    const dictKeys = Object.keys(input);

    const [hasFailure, invalidValuesMeta, sanitizedValue] =
      dictKeys.reduce<[boolean, { [key: string]: E }, { [key: string]: O }]>((acc, dictKey) => {
        const dictValue = input[dictKey];

        const validation = inner(dictValue).unwrap();

        if (validation.kind === "Err") {
          const invalidValuesMeta = acc[1];
          invalidValuesMeta[dictKey] = validation.value;
          return [true, invalidValuesMeta, acc[2]];
        } else {
          const sanitizedValue = acc[2];
          if (validation.value !== undefined) { sanitizedValue[dictKey] = validation.value; }
          return [acc[0], acc[1], sanitizedValue];
        }
      }, [false, ({} as any), ({} as any)]);

    return hasFailure ? Result.err(errWithMeta("invalid_values", invalidValuesMeta)) : Result.ok(sanitizedValue);
  });

export const array = <I, O, E>(inner: Validator<I, O, E>) =>
  validator<
    I[],
    O[],
    ("not_array" | ErrWithMeta<"invalid_members", { [index: string]: E }>)
  >((input) => {
    if (!Array.isArray(input)) { return Result.err("not_array" as "not_array"); }

    const validations = input.map(inner).map((validation) => validation.unwrap());

    const [hasFailure, invalidMembersMeta, sanitizedValues] =
      validations.reduce<[boolean, { [index: string]: E }, O[]]>((acc, validation, index) => {
        if (validation.kind === "Err") {
          const invalidMembersMeta = acc[1];
          invalidMembersMeta[index] = validation.value;
          return [true, invalidMembersMeta, acc[2]];
        } else {
          const sanitizedValues = acc[2];
          sanitizedValues[index] = validation.value;
          return [acc[0], acc[1], sanitizedValues];
        }
      }, [false, {}, Array(input.length)]);

    return hasFailure ? Result.err(errWithMeta("invalid_members", invalidMembersMeta)) : Result.ok(sanitizedValues);
  });

// tslint:disable:max-line-length
export function or<I, O1, E1, O2, E2>(v1: Validator<I, O1, E1>, v2: Validator<I, O2, E2>): Validator<I, (O1 | O2), ErrWithMeta<"none_passed", Array<E1 | E2>>>;
export function or<I, O1, E1, O2, E2, O3, E3>(v1: Validator<I, O1, E1>, v2: Validator<I, O2, E2>, v3: Validator<I, O3, E3>): Validator<I, (O1 | O2 | O3), ErrWithMeta<"none_passed", Array<E1 | E2 | E3>>>;
export function or<I, O1, E1, O2, E2, O3, E3, O4, E4>(v1: Validator<I, O1, E1>, v2: Validator<I, O2, E2>, v3: Validator<I, O3, E3>, v4: Validator<I, O4, E4>): Validator<I, (O1 | O2 | O3 | O4), ErrWithMeta<"none_passed", Array<E1 | E2 | E3 | E4>>>;
export function or<I, O1, E1, O2, E2, O3, E3, O4, E4, O5, E5>(v1: Validator<I, O1, E1>, v2: Validator<I, O2, E2>, v3: Validator<I, O3, E3>, v4: Validator<I, O4, E4>, v5: Validator<I, O5, E5>): Validator<I, (O1 | O2 | O3 | O4 | O5), ErrWithMeta<"none_passed", Array<E1 | E2 | E3 | E4 | E5>>>;
export function or<I, O1, E1, O2, E2, O3, E3, O4, E4, O5, E5, O6, E6>(v1: Validator<I, O1, E1>, v2: Validator<I, O2, E2>, v3: Validator<I, O3, E3>, v4: Validator<I, O4, E4>, v5: Validator<I, O5, E5>, v6: Validator<I, O6, E6>): Validator<I, (O1 | O2 | O3 | O4 | O5 | O6), ErrWithMeta<"none_passed", Array<E1 | E2 | E3 | E4 | E5 | E6>>>;
// tslint:enable:max-line-length
export function or(...vs: AnyValidator[]): AnyValidator {
  if (vs.length < 2) { throw new Error("Expected at least 2 arguments"); }

  const v1 = vs[0];
  const vRest = vs.slice(1);

  return validator((input) =>
    vRest.reduce((result, v) =>
      result.either(
        Result.ok,
        (resultErr) => v(input).either(
          Result.ok,
          (vErr) => { resultErr.meta.push(vErr); return Result.err(resultErr); },
        ),
      )
    , v1(input)),
  );
}

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
