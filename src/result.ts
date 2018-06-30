import { id } from "./utils";

export class Result<O, E> {
  public static of = Result.ok;

  public static ok<O, E>(ok: O) { return new Result<O, E>({ kind: "Ok", value: ok }); }
  public static err<O, E>(err: E) { return new Result<O, E>({ kind: "Err", value: err }); }

  public map = this.mapOk;
  public chain = this.bind;
  public fmap = this.mapOk;

  private innerResult: InnerResult<O, E>;
  constructor(innerResult: InnerResult<O, E>) { this.innerResult = innerResult; }

  public get isOk(): boolean { return this.innerResult.kind === "Ok"; }
  public get isErr(): boolean { return this.innerResult.kind === "Err"; }
  public get ok(): O {
    if (this.innerResult.kind === "Ok") {
      return this.innerResult.value;
    } else {
      throw new Error("Calling `.ok` on an Err Result");
    }
  }
  public get err(): E {
    if (this.innerResult.kind === "Err") {
      return this.innerResult.value;
    } else {
      throw new Error("Calling `.err` on an Ok Result");
    }
  }

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
