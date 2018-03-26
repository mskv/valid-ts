# Valid-ts

[npm package](https://www.npmjs.com/package/valid-ts)

It's a very simple validation library without dependencies written in TypeScript. Useful for counstructing validation functions with a declarative interface. They are generally supposed to accept any input, ensure its shape during runtime and return typed values.

## Installation:

`npm install valid-ts`

## API

The API is based on validators. ALL of the exported functions are used to construct validators or are validators themselves. Here's the simplified type definition for reference:

```
type Validator<I, O> = (input: I) => Result<O>
```

A validator expects an input of some type and returns a `Result<O>`. `Result` does not actually implement the monadic `bind` yet (let me know if it should!), but is just a tagged union of `Ok<O> | Err`. `I` stand for input and `O` for output.

```
type Result<T> = Ok<T> | Err;
type Ok<T> = { result: "ok", value: T };
type Err = { result: "error", messages: ErrMessage[] };
```

You can expect `value: T` to be inferred from the validator definition.

### Primitives

`number`, `string`, `optional`, `nullable`

```
import { number, string, optional, nullable } from "valid-ts"

const validation1 = number(1)
// => { result: "ok", value: 1 }

const validation2 = string(1)
// => { result: "error", messages: ["not_string"] }

const validation3 = optional(1)
// => { result: "error", messages: ["not_undefined"] }

const validation4 = nullable(1)
// => { result: "error", messages: ["not_null"] }
```

### Array

`array`

```
import { array, number } from "valid-ts"

const validator = array(number)

const validation1 = validator(1)
// => { result: "error", messages: ["not_array"] }

const validation2 = validator([])
// => { result: "ok", value: [] }

const validation3 = validator([1, "2", 3, "4"])
// => { result: "error", messages: [{ "1": ["not_number"], "3": ["not_number"] }] }

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
// => { result: "error", messages: ["not_object"] }

const validation2 = validator({})
// => { result: "error", messages: [{ "f1": ["not_number"], "f3": ["not_array"] }] }

const validation3 = validator({ f1: 1, f3: [1, "2"] })
// => { result: "error", messages: [{ "f1": ["not_number"], "f3": [{ "0": ["not_number"] }] }] }

const validation4 = validator({ f1: 1, f3: [1, 2] })
// => { result: "ok", value: { f1: 1, f3: [1, 2] } }
```

### Custom validators

`validator`

```
import { validator } from "valid-ts"

const greaterThan1 = validator<number, number>((input) =>
  input > 1
    ? { result: "ok", value: input }
    : { result: "error", messages: ["not_greater_than_1"] },
);

const validation1 = greaterThan1(1)
// => { result: "error", messages: ["not_greater_than_1"] }

const validation2 = greaterThan1(2)
// => { result: "ok", value: 2 }

const validation3 = greaterThan1("1")
// => compilation error
```

### Composition

`and`, `or`

```
import { validator, and, or, number, nullable, array }

const greaterThan1 = validator<number, number>((input) =>
  input > 1
    ? { result: "ok", value: input }
    : { result: "error", messages: ["not_greater_than_1"] },
);

// OR
const orValidator = or(array(number), nullable)

const orValidation1 = orValidator(null)
// => { result: "ok", value: null }

const orValidation2 = orValidator([1, 2, 3])
// => { result: "ok", value: [1, 2, 3] }

const orValidation3 = orValidator(string)
// => { result: "error", messages: ["not_array", "not_null"] }

const orValidation4 = orValidator(["1"])
// => { result: "error", messages: [{ "0": ["not_number"] }, "not_null"] }


// AND
const andValidator = and(number, string)
// => compilation error

const andValidator = and(string, greaterThan1)
// => compilation error

const andValidator = and(number, greaterThan1)

const andValidation1 = andValidator(2)
// => { result: "ok", value: 2 }

const andValidation2 = andValidator(1)
// => { result: "error", messages: ["not_greated_than_1"] }
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
