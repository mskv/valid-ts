export type Result<T, M extends AnyErrMessage> = Ok<T> | Err<M>;
export type Ok<T> = { result: "ok", value: T };
export type Err<M extends AnyErrMessage> = { result: "error", message: M };
export type ErrMessage<E extends string, M> = { error: E, meta: M };
export type AnyErrMessage = ErrMessage<any, any>;

export type Validator<I, O, M extends AnyErrMessage> = {
  __i: I, __o: O, __m: M,

  (input: I): Result<O, M>,
};

export type AnyValidator = Validator<any, any, any>;

export const validator = <I, O, M extends AnyErrMessage>(fn: (input: I) => Result<O, M>) =>
  fn as Validator<I, O, M>;

export const any = validator<any, any, any>((input) => ({ result: "ok", value: input }));

export const number = validator<any, number, ErrMessage<"not_number", undefined>>((input) =>
  typeof input === "number"
    ? { result: "ok", value: input }
    : { result: "error", message: { error: "not_number" as "not_number", meta: undefined } },
);

export const nullable = validator<any, null, ErrMessage<"not_null", undefined>>((input) =>
  typeof input === null
    ? { result: "ok", value: input }
    : { result: "error", message: { error: "not_null" as "not_null", meta: undefined } },
);

export const optional = validator<any, undefined, ErrMessage<"not_undefined", undefined>>((input) =>
  typeof input === undefined
    ? { result: "ok", value: input }
    : { result: "error", message: { error: "not_undefined" as "not_undefined", meta: undefined } },
);

export const string = validator<any, string, ErrMessage<"not_string", undefined>>((input) =>
  typeof input === "string"
    ? { result: "ok", value: input }
    : { result: "error", message: { error: "not_string" as "not_string", meta: undefined } },
);

export type Schema = { [field: string]: AnyValidator };
export type GetShapeOutput<S extends Schema> = { [K in keyof S]: S[K]["__o"] };
export type GetShapeErrMeta<S extends Schema> = { [K in keyof S]?: S[K]["__m"] };

export const shape = <S extends Schema>(schema: S) =>
  validator<
    any,
    GetShapeOutput<S>,
    (ErrMessage<"not_object", undefined> | ErrMessage<"invalid_shape", GetShapeErrMeta<S>>)
  >((input) => {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return { result: "error", message: { error: "not_object", meta: undefined } };
    }

    const schemaKeys = Object.keys(schema);

    const [hasFailure, invalidShapeMeta, sanitizedValue] =
      schemaKeys.reduce<[boolean, GetShapeErrMeta<S>, GetShapeOutput<S>]>((acc, schemaKey) => {
        const fieldValidator = schema[schemaKey];
        const fieldValue = input[schemaKey];

        const validation = fieldValidator(fieldValue);

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
  });

export const dict = <
  I,
  O,
  M extends AnyErrMessage,
>(inner: Validator<I, O, M>) =>
  validator<
    any,
    { [key: string]: O },
    (ErrMessage<"not_object", undefined> | ErrMessage<"invalid_values", { [key: string]: M }>)
  >((input) => {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return { result: "error", message: { error: "not_object", meta: undefined } };
    }

    const dictKeys = Object.keys(input);

    const [hasFailure, invalidValuesMeta, sanitizedValue] =
      dictKeys.reduce<[boolean, { [key: string]: M }, { [key: string]: O }]>((acc, dictKey) => {
        const dictValue = input[dictKey];

        const validation = inner(dictValue);

        if (validation.result === "error") {
          const invalidValuesMeta = acc[1];
          invalidValuesMeta[dictKey] = validation.message;
          return [true, invalidValuesMeta, acc[2]];
        } else {
          const sanitizedValue = acc[2];
          if (validation.value !== undefined) { sanitizedValue[dictKey] = validation.value; }
          return [acc[0], acc[1], sanitizedValue];
        }
      }, [false, ({} as any), ({} as any)]);

    if (hasFailure) {
      return { result: "error", message: { error: "invalid_values", meta: invalidValuesMeta } };
    } else {
      return { result: "ok", value: sanitizedValue };
    }
  });

export const array = <
  I,
  O,
  M extends AnyErrMessage,
>(inner: Validator<I, O, M>) =>
  validator<
    I[],
    O[],
    (ErrMessage<"not_array", undefined> | ErrMessage<"invalid_members", { [index: string]: M }>)
  >((input) => {
    if (!Array.isArray(input)) {
      return { result: "error", message: { error: "not_array", meta: undefined } };
    }

    const validations = input.map(inner);

    const [hasFailure, invalidMembersMeta, sanitizedValues] =
      validations.reduce<[boolean, { [index: string]: M }, O[]]>((acc, validation, index) => {
        if (validation.result === "error") {
          const invalidMembersMeta = acc[1];
          invalidMembersMeta[index] = validation.message;
          return [true, invalidMembersMeta, acc[2]];
        } else {
          const sanitizedValues = acc[2];
          sanitizedValues[index] = validation.value;
          return [acc[0], acc[1], sanitizedValues];
        }
      }, [false, {}, Array(input.length)]);

    if (hasFailure) {
      return { result: "error", message: { error: "invalid_members", meta: invalidMembersMeta } };
    } else {
      return { result: "ok", value: sanitizedValues };
    }
  });

export const or = <
  I,
  O1,
  M1 extends AnyErrMessage,
  O2,
  M2 extends AnyErrMessage,
>(
  v1: Validator<I, O1, M1>, v2: Validator<I, O2, M2>,
) =>
  validator<
    I,
    (O1 | O2),
    ErrMessage<"none_passed", Array<M1 | M2>>
  >((input) => {
    const val1 = v1(input);
    if (val1.result === "ok") { return val1; }

    const val2 = v2(input);
    if (val2.result === "ok") { return val2; }

    return { result: "error", message: { error: "none_passed", meta: [val1.message, val2.message] } };
  });

export const and = <
  I,
  O1,
  M1 extends AnyErrMessage,
  O2,
  M2 extends AnyErrMessage,
>(
  v1: Validator<I, O1, M1>, v2: Validator<I, O2, M2>,
) =>
  validator<
    I,
    O1 & O2,
    ErrMessage<"some_failed", M1 | M2>
  >((input) => {
    const val1 = v1(input);
    if (val1.result === "error") { return val1; }

    const val2 = v2(input);
    if (val2.result === "error") { return val2; }

    return { result: "ok", value: input as any };
  });
