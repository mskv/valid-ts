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
  address: optional(shape({ zip: string, address: string }))
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

const validation3 = optional(string)(undefined).unwrap()
// => { kind: "Ok", value: undefined }

const validation4 = nullable(string)(null).unwrap()
// => { kind: "Ok", value: null }
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
import { shape, number, string, array, optional, any } from "valid-ts"

const validator = shape({
  f1: number,
  f2: optional(any),
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
import { validator, and, or, number, eq, array, Result, ErrWithMeta, errWithMeta } from "valid-ts"

const greaterThan1 = validator<number, number, ErrWithMeta<"not_greater_than_1", { actual: number }>>((input) =>
  input > 1 ? Result.ok(input) : Result.err(errWithMeta("not_greater_than_1", { actual: input })),
);

// OR
const orValidator = or(array(number), eq(null))

const orValidation1 = orValidator(null).unwrap()
// => { kind: "Ok", value: null }

const orValidation2 = orValidator([1, 2, 3]).unwrap()
// => { kind: "Ok", value: [1, 2, 3] }

const orValidation3 = orValidator("string").unwrap()
// => {
//      kind: "Err",
//      value: {
//        kind: "none_passed",
//        meta: [
//          "not_array",
//          { kind: "not_equals", meta: { expected: null, actual: "string" } }
//        ]
//      }
//    }

const orValidation4 = orValidator(["1"]).unwrap()
// => {
//      kind: "Err",
//      value: {
//        kind: "none_passed",
//        meta: [
//          { kind: "invalid_members", meta: { "0": "not_number" } },
//          { kind: "not_equals", meta: { expected: null, actual: ["1"] } }
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

### Equality and inclusion

`eq`

Tests equality, useful for custructing tagged unions as they can be nicely refined in TypeScript by conditional expressions like `switch-case`. Can provide a custom predicate for comparison, by default just uses `===`. Note that introducing any kind of coercion in the custom predicate is dangerous as it makes the inferred types potentially untrue. It's better to coerce the values first before using the `eq` validator.

```
import bodyParser from "body-parser";
import express from "express";
import { eq, or, shape, string } from "valid-ts";

const app = express();

const customEqualityPredicate = (val1: any, val2: any) => val1 == val2

const reservationCommandValidator = or(
  shape({
    kind: eq("RequestTicketReservation" as "RequestTicketReservation"),
    ticketId: string,
  }),
  shape({
    kind: eq("RevokeTicketReservation" as "RevokeTicketReservation"),
    reservationId: string,
  }),
  shape({
    kind: eq("ArchiveTicketReservation" as "ArchiveTicketReservation", customEqualityPredicate),
    reservationId: string,
  }),
);

app.post("/reservation", bodyParser.json(), async (req, res) => {
  const commandValidation = reservationCommandValidator(req.body);
  if (commandValidation.isErr) { return res.status(400).json({ result: commandValidation.err }); }

  const command = commandValidation.ok;

  switch (command.kind) {
    case "RequestTicketReservation": {
      const ticketId = command.ticketId;

      return res.status(200).json({ result: (...) });
    }
    case "RevokeTicketReservation": {
      const reservationId = command.reservationId;

      return res.status(200).json({ result: (...) });
    }
    case "ArchiveTicketReservation": {
      const reservationId = command.reservationId;

      return res.status(200).json({ result: (...) });
    }
});
```

`incl`

Just as `eq`, allows to pass a custom comparison predicate. Note the cast `"abc" as "abc"` so that the inferred type is more specific than just `string`.

```
import { incl } from "./validators";

const validator = incl(["abc" as "abc", "def" as "def"]);

const validation1 = validator("abc").unwrap();
// => { kind: "Ok", value: "abc" }

const validation2 = validator(1).unwrap();
// => { kind: "Err", value: { kind: "not_includes", meta: { expected: ["abc", "def"], actual: 1 } } }
```

### TODO

1. ~~Type errors.~~

2. ~~Add `not`.~~ - not doing that

3. Add `rules` to `shape` - predicates spanning multiple fields.

4. Add documentation.

5. ~~Add specs.~~

6. ~~Make `or` and `and` variadic.~~

7. ~~Make the `Result` type composable.~~

8. Include coercion.

9. ~~Add `dict`.~~

10. ~~Add `any`.~~

11. ~~Add `oneOf(v)`.~~

12. ~~Consider changing `or(optional, string)` into `optional(string)` (same for `nullable`).~~

13. Reserach the possibility of testing type inference.

14. Consider adding examples to show actual use cases, eg. a working Express endpoint (note the need for the CI to ensure they are runnable).

### Development

`npm install`

`npm test`
