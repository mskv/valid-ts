export type ValidTsError<Custom = never>
  = SomeFailedError<Custom>
  | AllFailedError<Custom>
  | InvalidArrayError<Custom>
  | InvalidDictionaryError<Custom>
  | InvalidShapeError<Custom>
  | NotArrayError
  | NotObjectError
  | NotNumberError
  | NotStringError
  | NotBooleanError
  | EqualityError
  | InclusionError
  | Custom;

export type SomeFailedError<Custom = never> = { kind: "SomeFailedError", errors: Array<ValidTsError<Custom>> };
export const someFailedError = <Custom>(errors: Array<ValidTsError<Custom>>): SomeFailedError<Custom> =>
  ({ kind: "SomeFailedError", errors });

export type AllFailedError<Custom = never> = { kind: "AllFailedError", errors: Array<ValidTsError<Custom>> };
export const allFailedError = <Custom>(errors: Array<ValidTsError<Custom>>): AllFailedError<Custom> =>
  ({ kind: "AllFailedError", errors });

export type InvalidArrayError<Custom = never> = {
  kind: "InvalidArrayError",
  errors: Array<{ index: number, error: ValidTsError<Custom> }>,
};
export const invalidArrayError =
  <Custom = never>(errors: Array<{ index: number, error: ValidTsError<Custom> }>): InvalidArrayError<Custom> =>
    ({ kind: "InvalidArrayError", errors });

export type InvalidDictionaryError<Custom = never> = {
  kind: "InvalidDictionaryError",
  errors: Array<{ key: string, error: ValidTsError<Custom> }>,
};
export const invalidDictionaryError =
  <Custom = never>(errors: Array<{ key: string, error: ValidTsError<Custom> }>): InvalidDictionaryError<Custom> =>
    ({ kind: "InvalidDictionaryError", errors });

export type InvalidShapeError<Custom = never> = {
  kind: "InvalidShapeError",
  errors: Array<{ field: string, error: ValidTsError<Custom> }>,
};
export const invalidShapeError =
  <Custom = never>(errors: Array<{ field: string, error: ValidTsError<Custom> }>): InvalidShapeError<Custom> =>
    ({ kind: "InvalidShapeError", errors });

export type NotArrayError = { kind: "NotArrayError" };
export const notArrayError: NotArrayError = { kind: "NotArrayError" };
export type NotObjectError = { kind: "NotObjectError" };
export const notObjectError: NotObjectError = { kind: "NotObjectError" };
export type NotNumberError = { kind: "NotNumberError" };
export const notNumberError: NotNumberError = { kind: "NotNumberError" };
export type NotStringError = { kind: "NotStringError" };
export const notStringError: NotStringError = { kind: "NotStringError" };
export type NotBooleanError = { kind: "NotBooleanError" };
export const notBooleanError: NotBooleanError = { kind: "NotBooleanError" };

export type EqualityError = { kind: "EqualityError" };
export const equalityError: EqualityError = { kind: "EqualityError" };
export type InclusionError = { kind: "InclusionError" };
export const inclusionError: InclusionError = { kind: "InclusionError" };
