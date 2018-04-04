export type Result<T, M extends AnyErrMessage> = Ok<T> | Err<M>;
export type Ok<T> = { result: "ok", value: T };
export type Err<M extends AnyErrMessage> = { result: "error", message: M };
export type ErrMessage<E extends string, M = any> = { error: E, meta: M };
export type AnyErrMessage = ErrMessage<any>;

export type Validator<I, O, M extends AnyErrMessage, NM extends AnyErrMessage> = {
  __o: O,
  __m: M,
  standardErrorMessage: M,
  negationErrorMessage: NM,
  (input: I): Result<O, M>,
};

export type AnyValidator = Validator<any, any, any, any>;

export const validator = <
  I,
  O,
  M extends AnyErrMessage,
  NM extends AnyErrMessage
>(fn: (input: I) => Result<O, M>, standardErrorMessage: M, negationErrorMessage: NM) => {
  (fn as Validator<I, O, M, NM>).standardErrorMessage = standardErrorMessage;
  (fn as Validator<I, O, M, NM>).negationErrorMessage = negationErrorMessage;
  return fn as Validator<I, O, M, NM>;
};

export const number = validator<
  any,
  number,
  ErrMessage<"not_number">,
  ErrMessage<"number">
>(((input) =>
  typeof input === "number"
    ? { result: "ok", value: input }
    : { result: "error", message: { error: "not_number", meta: undefined } }
), { error: "not_number", meta: undefined }, { error: "number", meta: undefined });

export const nullable = validator<
  any,
  null,
  ErrMessage<"not_null">,
  ErrMessage<"null">
>(((input) =>
  input === null
    ? { result: "ok", value: input }
    : { result: "error", message: { error: "not_null", meta: undefined } }
), { error: "not_null", meta: undefined }, { error: "null", meta: undefined });

export const optional = validator<
  any,
  undefined,
  ErrMessage<"not_undefined">,
  ErrMessage<"undefined">
>(((input) =>
  input === undefined
    ? { result: "ok", value: input }
    : { result: "error", message: { error: "not_undefined", meta: undefined } }
), { error: "not_undefined", meta: undefined }, { error: "undefined", meta: undefined });

export const string = validator<
  any,
  string,
  ErrMessage<"not_string">,
  ErrMessage<"string">
>(((input) =>
  typeof input === "string"
    ? { result: "ok", value: input }
    : { result: "error", message: { error: "not_string", meta: undefined } }
), { error: "not_string", meta: undefined }, { error: "string", meta: undefined });

type Schema = { [field: string]: AnyValidator };
type GetObjectOutput<S extends Schema> = { [K in keyof S]: S[K]["__o"] };
type GetObjectErrMeta<S extends Schema> = { [K in keyof S]: S[K]["__m"] };

export const object = <S extends Schema>(schema: S) =>
  validator<
    any,
    GetObjectOutput<S>,
    (ErrMessage<"not_object"> | ErrMessage<"invalid_shape", GetObjectErrMeta<S>>),
    ErrMessage<"object">
  >((input) => {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return { result: "error", message: { error: "not_object", meta: undefined } };
    }

    const schemaKeys = Object.keys(schema);

    const [hasFailure, invalidShapeMeta, sanitizedValue]: [boolean, GetObjectErrMeta<S>, GetObjectOutput<S>] =
      schemaKeys.reduce<[boolean, GetObjectErrMeta<S>, GetObjectOutput<S>]>((acc, schemaKey) => {
        const v = schema[schemaKey];
        const inputValue = input[schemaKey];

        const validation = v(inputValue);

        if (validation.result === "error") {
          const invalidShapeMeta = acc[1];
          invalidShapeMeta[schemaKey] = validation.message;
          return [true, invalidShapeMeta, acc[2]];
        } else {
          const sanitizedValue = acc[2];
          if (validation.value !== undefined) { sanitizedValue[schemaKey] = validation.value; }
          return [acc[0], acc[1], sanitizedValue];
        }
      }, [false, ({} as any), ({} as any)]);

    if (hasFailure) {
      return { result: "error", message: { error: "invalid_shape", meta: invalidShapeMeta } };
    } else {
      return { result: "ok", value: sanitizedValue };
    }
  }, { error: "not_object", meta: undefined }, { error: "object", meta: undefined });

export const array = <
  I,
  O,
  M extends AnyErrMessage,
  NM extends AnyErrMessage
>(inner: Validator<I, O, M, NM>) =>
  validator<
    I[],
    O[],
    (ErrMessage<"not_array"> | ErrMessage<"invalid_members", { [index: string]: M }>),
    ErrMessage<"array">
  >((input) => {
    if (!Array.isArray(input)) {
      return { result: "error", message: { error: "not_array", meta: undefined } };
    }

    const validations = input.map(inner);

    const [hasFailure, invalidMembersMeta]: [boolean, { [index: string]: M }] =
      validations.reduce<[boolean, { [index: string]: M }]>((acc, validation, index) => {
        if (validation.result === "error") {
          const invalidMembersMeta = acc[1];
          invalidMembersMeta[index] = validation.message;
          return [true, invalidMembersMeta];
        } else {
          return acc;
        }
      }, [false, {}]);

    if (hasFailure) {
      return { result: "error", message: { error: "invalid_members", meta: invalidMembersMeta } };
    } else {
      return { result: "ok", value: input as any };
    }
  }, { error: "not_array", meta: undefined }, { error: "array", meta: undefined });

export const or = <
  I,
  O1,
  M1 extends AnyErrMessage,
  NM1 extends AnyErrMessage,
  O2,
  M2 extends AnyErrMessage,
  NM2 extends AnyErrMessage
>(
  v1: Validator<I, O1, M1, NM1>, v2: Validator<I, O2, M2, NM2>,
) =>
  validator<
    I,
    (O1 | O2),
    ErrMessage<"none_passed", Array<M1 | M2>>,
    ErrMessage<"some_passed">
  >((input) => {
    const val1 = v1(input);
    if (val1.result === "ok") { return val1; }

    const val2 = v2(input);
    if (val2.result === "ok") { return val2; }

    return { result: "error", message: { error: "none_passed", meta: [val1.message, val2.message] } };
  }, { error: "none_passed", meta: [] }, { error: "some_passed", meta: undefined });

export const and = <
  I,
  O1,
  M1 extends AnyErrMessage,
  NM1 extends AnyErrMessage,
  O2 extends O1,
  M2 extends AnyErrMessage,
  NM2 extends AnyErrMessage
>(
  v1: Validator<I, O1, M1, NM1>, v2: Validator<I, O2, M2, NM2>,
) =>
  validator<
    I,
    O1 & O2,
    ErrMessage<"some_failed", M1 | M2>,
    ErrMessage<"all_passed">
  >((input) => {
    const val1 = v1(input);
    if (val1.result === "error") { return val1; }

    const val2 = v2(input);
    if (val2.result === "error") { return val2; }

    return { result: "ok", value: input as any };
  }, { error: "some_failed", meta: undefined as any }, { error: "all_passed", meta: undefined });

export const not = <
  I,
  O,
  M extends AnyErrMessage,
  NM extends AnyErrMessage
>(v: Validator<I, O, M, NM>) => validator<I, I, NM, M>(((input: I) =>
  v(input).result === "ok"
    ? { result: "error", message: v.negationErrorMessage }
    : { result: "ok", value: input }
), v.negationErrorMessage, v.standardErrorMessage);
