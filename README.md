# Valid-ts

[npm package](https://www.npmjs.com/package/valid-ts)

It's a very simple validation library without dependencies written in TypeScript. Useful for counstructing validation functions with a declarative interface. They are generally supposed to accept any input, ensure its shape during runtime and return typed values.

## Installation:

`npm install valid-ts`

## API

The API is based on validators. ALL of the exported functions are used to construct validators or are validators themselves. Here's the simplified type definition for reference:

```
type Validator<I, O, M> = (input: I) => Result<O, M>
```

A validator expects an input of some type and returns a `Result<O, M>`. `Result` is just a tagged union of `Ok<O> | Err<M>`. `I` stand for input and `O` for output, `M` for the error message. Error message can contain metadata.

```
type Result<T, M extends AnyErrMessage> = Ok<T> | Err<M>;
type Ok<T> = { result: "ok", value: T };
type Err<M extends AnyErrMessage> = { result: "error", message: M };
type ErrMessage<E extends string, M> = { error: E, meta: M };
```

You can expect both `value: T` and `meta: M` to be inferred from the validator definition.

### Primitives

`number`, `string`, `optional`, `nullable`

```
import { number, string, optional, nullable } from "valid-ts"

const validation1 = number(1)
// => { result: "ok", value: 1 }

const validation2 = string(1)
// => { result: "error", message: { error: "not_string", meta: undefined } }

const validation3 = optional(1)
// => { result: "error", message: { error: "not_undefined", meta: undefined } }

const validation4 = nullable(1)
// => { result: "error", message: { error: "not_null", meta: undefined } }
```

### Array

`array`

```
import { array, number } from "valid-ts"

const validator = array(number)

const validation1 = validator(1)
// => { result: "error", message: { error: "not_array", meta: undefined } }

const validation2 = validator([])
// => { result: "ok", value: [] }

const validation3 = validator([1, "2", 3, "4"])
// => {
//      result: "error",
//      message: {
//        error: "invalid_members",
//        meta: {
//          "1": { error: "not_number", meta: undefined },
//          "3": { error: "not_number", meta: undefined },
//        }
//      }
//    }

const validation4 = validator([1, 2, 3, 4])
// => { result: "ok", value: [1, 2, 3, 4] }] }
```

### Object

`object`

```
import { object, number, string, array } from "valid-ts"

const validator = object({
  f1: number,
  f2: optional,
  f3: array(string),
})

const validation1 = validator([])
// => { result: "error", message: { error: "not_object", meta: undefined } }

const validation2 = validator({})
// => {
//      result: "error",
//      message: {
//        error: "invalid_shape",
//        meta: {
//          "f1": { error: "not_number", meta: undefined },
//          "f3": { error: "not_array", meta: undefined },
//        }
//      }
//    }

const validation3 = validator({ f1: 1, f3: [1, "2"] })
// => {
//      result: "error",
//      message: {
//        error: "invalid_shape",
//        meta: {
//          "f1": { error: "not_number", meta: undefined },
//          "f3": { error: "invalid_members", meta: { "0": { error: "not_string", meta: undefined } } },
//        }
//      }
//    }

const validation4 = validator({ f1: 1, f3: [1, 2] })
// => { result: "ok", value: { f1: 1, f3: [1, 2] } }
```

### Custom validators

`validator`

```
import { validator } from "valid-ts"

const greaterThan1 = validator<number, number, ErrMessage<"not_greater_than_1", { actual: number }>>((input) =>
  input > 1
    ? { result: "ok", value: input }
    : { result: "error", message: { error: "not_greater_than_1", meta: { actual: input } } },
);

const validation1 = greaterThan1(1)
// => { result: "error", message: { error: "not_greater_than_1", meta: { actual: 1 } } }

const validation2 = greaterThan1(2)
// => { result: "ok", value: 2 }

const validation3 = greaterThan1("1")
// => compilation error
```

### Composition

`and`, `or`

```
import { validator, and, or, number, nullable, array }

const greaterThan1 = validator<number, number, ErrMessage<"not_greater_than_1", { actual: number }>>((input) =>
  input > 1
    ? { result: "ok", value: input }
    : { result: "error", message: { error: "not_greater_than_1", meta: { actual: input } } },
);

// OR
const orValidator = or(array(number), nullable)

const orValidation1 = orValidator(null)
// => { result: "ok", value: null }

const orValidation2 = orValidator([1, 2, 3])
// => { result: "ok", value: [1, 2, 3] }

const orValidation3 = orValidator(string)
// => {
//      result: "error",
//      message: {
//        error: "none_passed",
//        meta: [{ error: "not_array", meta: undefined }, { error: "not_null", meta: undefined }]
//      }
//    }

const orValidation4 = orValidator(["1"])
// => {
//      result: "error",
//      message: {
//        error: "none_passed",
//        meta: [
//          { error: "invlid_members", meta: { "0": { error: "not_number", meta: undefined } } },
//          { error: "not_null", meta: undefined }
//        ]
//      }
//    }


// AND
const andValidator = and(number, string)
// => compilation error

const andValidator = and(string, greaterThan1)
// => compilation error

const andValidator = and(number, greaterThan1)

const andValidation1 = andValidator(2)
// => { result: "ok", value: 2 }

const andValidation2 = andValidator(1)
// => { result: "error", message: { error: "not_greated_than_1", meta: { actual: 1 } } }
```

### More examples

```
import { object, string, array, or, and } from "valid-ts"
import { email, tag } from "./my_validators"

const user = object({
  name: string,
  email: or(email, optional),
  address: or(object({
    zip: string,
    city: string,
  }), optional),
  tags: array(and(string, tag)),
})

const input = {
  name: "Johnny",
  tags: []
}

const validation = user(input)
```

### TODO

1. ~~Type errors.~~

2. Add `not`.

3. Add `rules` to `object` - predicates spanning multiple fields.

4. Add documentation.

5. Add specs.

6. Make `or` and `and` variadic.

7. Make the `Result` type composable.

8. Include coercion.
