export type ValidTsError
  = SomeFailedError
  | AllFailedError
  | NotArrayError
  | NotObjectError
  | NotNumberError
  | NotStringError
  | NotBooleanError
  | EqualityError
  | InclusionError
  | InvalidArrayError
  | InvalidDictionaryError
  | InvalidShapeError;

export type SomeFailedError = { kind: "SomeFailedError", errors: ValidTsError[] };
export const someFailedError = (errors: ValidTsError[]): SomeFailedError =>
  ({ kind: "SomeFailedError", errors });
export type AllFailedError = { kind: "AllFailedError", errors: ValidTsError[] };
export const allFailedError = (errors: ValidTsError[]): AllFailedError =>
  ({ kind: "AllFailedError", errors });

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

export type InvalidArrayError = {
  kind: "InvalidArrayError",
  errors: Array<{ index: number, error: ValidTsError }>,
};
export const invalidArrayError = (errors: Array<{ index: number, error: ValidTsError }>): InvalidArrayError =>
  ({ kind: "InvalidArrayError", errors });
export type InvalidDictionaryError = {
  kind: "InvalidDictionaryError",
  errors: Array<{ key: string, error: ValidTsError }>,
};
export const invalidDictionaryError = (errors: Array<{ key: string, error: ValidTsError }>): InvalidDictionaryError =>
  ({ kind: "InvalidDictionaryError", errors });
export type InvalidShapeError = {
  kind: "InvalidShapeError",
  errors: Array<{ field: string, error: ValidTsError }>,
};
export const invalidShapeError = (errors: Array<{ field: string, error: ValidTsError }>): InvalidShapeError =>
  ({ kind: "InvalidShapeError", errors });
