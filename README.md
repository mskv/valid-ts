# WIP

Examples:

```
const objValidator = object({
  f1: number,
  f2: or(string, optional),
  f3: or(string, nullable),
  f4: and(number, gt1),
  f5: object({
    f1: or(array(or(string, nullable)), optional),
  }),
});
const objValidation = objValidator({ f5: {}, f1: 1, f2: "1", f3: null, f4: 2 });
if (objValidation.result === "ok") {
  console.log("OBJ ok", objValidation.value);
}
if (objValidation.result === "error") {
  console.log("OBJ error", objValidation.messages);
}

const orValidator = or(array(or(nullable, number)), nullable);
const orValidation = orValidator([1, null, 1, "1", 1]);
if (orValidation.result === "ok") {
  console.log("OR ok", orValidation.value);
}
if (orValidation.result === "error") {
  console.log("OR error", orValidation.messages);
}

const andValidator = array(and(number, gt1));
const andValidation = andValidator([2, 3, 2]);
if (andValidation.result === "ok") {
  console.log("AND ok", andValidation.value);
}
if (andValidation.result === "error") {
  console.log("AND error", andValidation.messages);
}
```
