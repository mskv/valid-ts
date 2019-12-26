import { AnyResult } from "../result";

export type Validator<I, O extends AnyResult> = (input: I) => O;
export type AnyValidator = Validator<any, AnyResult>;
export type ExtractValidatorI<V> = V extends Validator<infer I, any> ? I : never;
export type ExtractValidatorO<V> = V extends Validator<any, infer O> ? O : never;
