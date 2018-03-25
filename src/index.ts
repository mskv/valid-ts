type Result<T> = Ok<T> | Err;
type Ok<T> = { result: "ok", value: T };
type Err = { result: "error", messages: ErrMessage[] };
type ErrMessage = ScalarErrMessage | ObjErrMessage;
type ScalarErrMessage = string;
type ObjErrMessage = { [key: string]: ErrMessage[] };

type Validator<I, O> = {
  __i: I,
  __o: O,
  (input: I): Result<O>,
};

type AnyValidator = Validator<any, any>;

const validator = <I, O>(fn: (input: I) => Result<O>) => fn as Validator<I, O>;

const number = validator<any, number>((input) =>
  typeof input === "number"
    ? { result: "ok", value: input }
    : { result: "error", messages: ["not_number"] },
);

const nullable = validator<any, null>((input) =>
  input === null
    ? { result: "ok", value: input }
    : { result: "error", messages: ["not_null"] },
);

const optional = validator<any, undefined>((input) =>
  input === undefined
    ? { result: "ok", value: input }
    : { result: "error", messages: ["not_undefined"] },
);

const string = validator<any, string>((input) =>
  typeof input === "string"
    ? { result: "ok", value: input }
    : { result: "error", messages: ["not_string"] },
);

const gt1 = validator<number, number>((input) =>
  input > 1
    ? { result: "ok", value: input }
    : { result: "error", messages: ["not_gt1"] },
);

type Schema = { [field: string]: AnyValidator };
type GetObjectOutput<S extends Schema> = {
  [K in keyof S]: S[K]["__o"]
};

const object = <S extends Schema>(schema: S) => validator<any, GetObjectOutput<S>>((input) => {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { result: "error", messages: ["not_object"] };
  }

  const schemaKeys = Object.keys(schema);
  const inputKeys = Object.keys(input);

  if (inputKeys.some((inputKey) => !schemaKeys.some((schemaKey) => schemaKey === inputKey))) {
    return { result: "error", messages: ["contains_excessive_keys"] };
  }

  const [hasFailure, objErrMessage]: [boolean, ObjErrMessage] =
    schemaKeys.reduce<[boolean, ObjErrMessage]>((acc, schemaKey) => {
      const validator = schema[schemaKey];
      const inputValue = input[schemaKey];

      const validation = validator(inputValue);

      if (validation.result === "error") {
        const objErrMessage = acc[1];
        objErrMessage[schemaKey] = validation.messages;
        return [true, objErrMessage];
      } else {
        return acc;
      }
    }, [false, {}]);

  if (hasFailure) {
    return { result: "error", messages: [objErrMessage] };
  } else {
    return { result: "ok", value: input as any };
  }
});

const array = <I, O>(inner: Validator<I, O>) => validator<I[], O[]>((input) => {
  if (!Array.isArray(input)) { return { result: "error", messages: ["not_array"] }; }

  const validations = input.map(inner);

  const [hasFailure, objErrMessage]: [boolean, ObjErrMessage] =
    validations.reduce<[boolean, ObjErrMessage]>((acc, validation, index) => {
      if (validation.result === "error") {
        const objErrMessage = acc[1];
        objErrMessage[index] = validation.messages;
        return [true, objErrMessage];
      } else {
        return acc;
      }
    }, [false, {}]);

  if (hasFailure) {
    return { result: "error", messages: [objErrMessage] };
  } else {
    return { result: "ok", value: input as any };
  }
});

const or = <I, O1, O2>(v1: Validator<I, O1>, v2: Validator<I, O2>) => validator<I, O1 | O2>((input) => {
  const val1 = v1(input);
  if (val1.result === "ok") { return val1; }

  const val2 = v2(input);
  if (val2.result === "ok") { return val2; }

  return { result: "error", messages: val1.messages.concat(val2.messages) };
});

const and = <I, O1, O2 extends O1>(v1: Validator<I, O1>, v2: Validator<I, O2>) => validator<I, O1 & O2>((input) => {
  const val1 = v1(input);
  if (val1.result === "error") { return val1; }

  const val2 = v2(input);
  if (val2.result === "error") { return val2; }

  return { result: "ok", value: input as any };
});
