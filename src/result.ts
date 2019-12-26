export enum ResultKind { Ok, Err }
export type Ok<T> = { kind: ResultKind.Ok; value: T };
export type AnyOk = Ok<any>;
export type UnwrapOk<O extends AnyOk> = O["value"];
export type Err<T> = { kind: ResultKind.Err; value: T };
export type AnyErr = Err<any>;
export type UnwrapErr<E extends AnyErr> = E["value"];
export type Result<O, E> = Ok<O> | Err<E>;
export type AnyResult = AnyOk | AnyErr;
export type FilterOk<T extends AnyResult> = Extract<T, { kind: ResultKind.Ok }>;
export type FilterErr<T extends AnyResult> = Extract<T, { kind: ResultKind.Err }>;

export const ok = <T>(value: T): Ok<T> => ({ kind: ResultKind.Ok, value });
export const isOk = <O, E>(result: Result<O, E>): result is Ok<O> => result.kind === ResultKind.Ok;
export function assertOk<O, E>(result: Result<O, E>): asserts result is Ok<O> {
  if (!isOk(result)) { throw new Error("Expected Ok"); }
}

export const err = <T>(value: T): Err<T> => ({ kind: ResultKind.Err, value });
export const isErr = <O, E>(result: Result<O, E>): result is Err<E> => result.kind === ResultKind.Err;
export function assertErr<O, E>(result: Result<O, E>): asserts result is Err<E> {
  if (!isErr(result)) { throw new Error("Expected Err"); }
}
