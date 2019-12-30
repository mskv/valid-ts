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
export const isOk = <R extends AnyResult>(result: R): result is FilterOk<R> => result.kind === ResultKind.Ok;
export function assertOk<R extends AnyResult>(result: R): asserts result is FilterOk<R> {
  if (!isOk(result)) { throw new Error("Expected Ok"); }
}

export const err = <T>(value: T): Err<T> => ({ kind: ResultKind.Err, value });
export const isErr = <R extends AnyResult>(result: R): result is FilterErr<R> => result.kind === ResultKind.Err;
export function assertErr<R extends AnyResult>(result: R): asserts result is FilterErr<R> {
  if (!isErr(result)) { throw new Error("Expected Err"); }
}
