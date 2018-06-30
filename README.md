# Valid-ts

[npm package](https://www.npmjs.com/package/valid-ts)

It's a very simple validation library without dependencies written in TypeScript. Useful for counstructing validation functions with a declarative interface. They are generally supposed to accept any input, ensure its shape during runtime and return typed values.

## Installation:

`npm install valid-ts`

## Quick example

```
import * as express from "express";
import { shape, array, string, optional, or } from "valid-ts";

const app = express()

const person = shape({
  firstName: string,
  lastName: string,
  address: or(optional, shape({ zip: string, address: string }))
})
const postBody = shape({ people: array(person) });

app.post("/people", (req, res) =>
  postBody(req.body).either(
    ({ people }) => persistPeopleToDb(people)
      .then((persistedPeople) => res.status(200).json({ result: persistedPeople }))
      .catch((error) => res.status(400).json({ error })),
    (error) => res.status(400).json({ error })
  )
);
```

Alternatively...

```
app.post("/people", (req, res) => {
  const validation = postBody(req.body)

  if (validation.isErr) { return res.status(400).json({ error: validation.err }) }

  return persistPeopleToDb(validation.ok.people)
    .then((persistedPeople) => res.status(200).json({ result: persistedPeople }))
    .catch((error) => res.status(400).json({ error })),
});
```

## API

The API is based on validators. ALL of the exported functions are used to construct validators or are validators themselves. Here's the simplified type definition for reference:

```
type Validator<I, O, E> = (input: I) => Result<O, E>
```

A validator expects an input of some type and returns a `Result<O, E>`. `Result` is a monad that represents either a success with its value or an error with its value. Error value does not have to be a string, it can be any data structure.

You can expect both the success type and error type to be inferred from the validator definition.

### Result

All validations return a Result. You cannot access the success value or the error value without using Result's API. It implements the [Fantasy Land Monad](https://github.com/fantasyland/fantasy-land#monad). Apart from that, it has the following API:

`bimap(okFn, errFn)`
Mapping both the success and error at the same time.

`mapOk(okFn)`
Mapping just the success, doing nothing in case of an error (equivalent to `fmap`).

`mapErr(errFn)`
Mapping just the error, doing nothing in case of success.

`either(okFn, errFn)`
Unwraps the success and error from the Result using the given functions.

`match({ Ok, Err })`
Same as `either`, but with different syntax.

`unwrap()`
Returns an internal representation of the result - a structure containing `kind` and `value`, where `kind` is one of `Ok` or `Err`.

`isOk` and `isErr`
Inform about the result's state.

`ok` and `err`
Getters returning the value cast to Ok or Err, throwing a runtime error when called inappropriately.

It's easiest to examine the API by looking at the TypeScript definitions.

### Primitives

`number`, `string`, `optional`, `nullable`

```
import { number, string, optional, nullable } from "valid-ts"

const validation1 = number(1).unwrap()
// => { kind: "Ok", value: 1 }

const validation2 = string(1).unwrap()
// => { kind: "Err", value: "not_string" }

const validation3 = optional(1).unwrap()
// => { kind: "Err", value: "not_undefined" }

const validation4 = nullable(1).unwrap()
// => { kind: "Err", value: "not_null" }
```

### Array

`array`

```
import { array, number } from "valid-ts"

const validator = array(number)

const validation1 = validator(1).unwrap()
// => { kind: "Err", value: "not_array" }

const validation2 = validator([]).unwrap()
// => { kind: "Ok", value: [] }

const validation3 = validator([1, "2", 3, "4"]).unwrap()
// => {
//      kind: "Err",
//      value: {
//        kind: "invalid_members",
//        meta: {
//          "1": "not_number",
//          "3": "not_number",
//        }
//      }
//    }

const validation4 = validator([1, 2, 3, 4]).unwrap()
// => { kind: "Ok", value: [1, 2, 3, 4] }] }
```

### Shape

`shape`

```
import { shape, number, string, array, optional } from "valid-ts"

const validator = shape({
  f1: number,
  f2: optional,
  f3: array(string),
})

const validation1 = validator([]).unwrap()
// => { kind: "Err", value: "not_object" }

const validation2 = validator({}).unwrap()
// => {
//      kind: "Err",
//      value: {
//        kind: "invalid_shape",
//        meta: {
//          "f1": "not_number",
//          "f3": "not_array",
//        }
//      }
//    }

const validation3 = validator({ f1: "1", f3: [1, "2"] }).unwrap()
// => {
//      kind: "Err",
//      value: {
//        kind: "invalid_shape",
//        meta: {
//          "f1": "not_number",
//          "f3": { kind: "invalid_members", meta: { "0": "not_string" } },
//        }
//      }
//    }

const validation4 = validator({ f1: 1, f3: ["1", "2"] }).unwrap()
// => { kind: "Ok", value: { f1: 1, f3: ["1", "2"] } }
```

### Dict

`dict`

```
import { dict, number } from "valid-ts"

const validator = dict(number)

const validation1 = validator(1).unwrap()
// => { kind: "Err", value: "not_object" }

const validation2 = validator({}).unwrap()
// => { kind: "Ok", value: {} }

const validation3 = validator({ f1: 1, f2: "2", f3: 3, f4: "4" }).unwrap()
// => {
//      kind: "Err",
//      value: {
//        kind: "invalid_values",
//        meta: {
//          "f2": "not_number",
//          "f4": "not_number",
//        }
//      }
//    }

const validation4 = validator({ f1: 1, f2: 2, f3: 3, f4: 4 }).unwrap()
// => { kind: "Ok", value: { f1: 1, f2: 2, f3: 3, f4: 4 } }] }
```

### Any

`any`

```
import { array, any } from "valid-ts"

const validator = array(any)

const validation1 = validator(1).unwrap()
// => { kind: "Err", value: "not_array" }

const validation2 = validator([]).unwrap()
// => { kind: "Ok", value: [] }

const validation3 = validator([1, "2", 3, "4"]).unwrap()
// => { kind: "Ok", value: [1, "2", 3, "4"] }] }
```

### Custom validators

`validator`

```
import { validator, Result, ErrWithMeta, errWithMeta } from "valid-ts"

const greaterThan1 = validator<number, number, ErrWithMeta<"not_greater_than_1", { actual: number }>>((input) =>
  input > 1 ? Result.ok(input) : Result.err(errWithMeta("not_greater_than_1", { actual: input })),
);

const validation1 = greaterThan1(1).unwrap()
// => { kind: "Err", value: { kind: "not_greater_than_1", meta: { actual: 1 } } }

const validation2 = greaterThan1(2).unwrap()
// => { kind: "Ok", value: 2 }

const validation3 = greaterThan1("1").unwrap()
// => compilation error
```

### Composition

`and`, `or`

```
import { validator, and, or, number, nullable, array, string, Result, ErrWithMeta, errWithMeta } from "valid-ts"

const greaterThan1 = validator<number, number, ErrWithMeta<"not_greater_than_1", { actual: number }>>((input) =>
  input > 1 ? Result.ok(input) : Result.err(errWithMeta("not_greater_than_1", { actual: input })),
);

// OR
const orValidator = or(array(number), nullable)

const orValidation1 = orValidator(null).unwrap()
// => { kind: "Ok", value: null }

const orValidation2 = orValidator([1, 2, 3]).unwrap()
// => { kind: "Ok", value: [1, 2, 3] }

const orValidation3 = orValidator(string).unwrap()
// => {
//      kind: "Err",
//      value: {
//        kind: "none_passed",
//        meta: ["not_array", "not_null"]
//      }
//    }

const orValidation4 = orValidator(["1"]).unwrap()
// => {
//      kind: "Err",
//      value: {
//        kind: "none_passed",
//        meta: [
//          { kind: "invlid_members", meta: { "0": "not_number" } },
//          "not_null"
//        ]
//      }
//    }


// AND
const andValidator = and(number, string).unwrap()
// => compilation error

const andValidator = and(string, greaterThan1).unwrap()
// => compilation error

const andValidator = and(number, greaterThan1)

const andValidation1 = andValidator(2).unwrap()
// => { kind: "Ok", value: 2 }

const andValidation2 = andValidator(1).unwrap()
// => { kind: "Err", value: { kind: "not_greated_than_1", meta: { actual: 1 } } }
```

### More examples

```
import { shape, string, array, or, and } from "valid-ts"
import { email, tag } from "./my_validators"

const user = shape({
  name: string,
  email: or(email, optional),
  address: or(shape({
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

3. Add `rules` to `shape` - predicates spanning multiple fields.

4. Add documentation.

5. Add specs.

6. ~~Make `or` and `and` variadic.~~

7. ~~Make the `Result` type composable.~~

8. Include coercion.

9. ~~Add `dict`.~~

10. ~~Add `any`.~~

11. Add `oneOf(v)`.
