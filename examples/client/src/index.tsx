import { useFormik } from "formik";
import React from "react";
import ReactDOM from "react-dom";

import { and, err, isErr, ok, shape, string, ValidTsError } from "../../../src";

const invalidEmailError = { kind: "InvalidEmailError" as const };
const emailValidator = and(string, ((str) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(str)
    ? ok(str)
    : err(invalidEmailError)
));

const stringEmptyError = { kind: "StringEmptyError" as const };
const nonEmptyStringValidator = and(string, ((str) =>
  str === "" ? err(stringEmptyError) : ok(str)
));

const nameValidator = shape({
  first: nonEmptyStringValidator,
  last: string,
});

type CustomError = typeof invalidEmailError | typeof stringEmptyError;

const buildFormikError = (error: ValidTsError<CustomError>) =>
  error.kind === "InvalidShapeError"
    ? error.errors.reduce((acc, shapeError) => {
      acc[shapeError.field] = buildFormikError(shapeError.error);
      return acc;
    }, {} as any)
    : error.kind;

const exampleValidator = shape({
  email: emailValidator,
  name: nameValidator,
});

const App = () => {
  const formik = useFormik({
    initialValues: { email: "", name: { first: "", last: "" } },
    onSubmit: (values) => {
      // tslint:disable-next-line:no-console
      console.log("Submitting", values);
    },
    validate: (values) => {
      const validation = exampleValidator(values);

      return isErr(validation) ? buildFormikError(validation.value) : {};
    },
  });

  return (
    <div>
      <form style={{ display: "flex", flexDirection: "column", width: "500px" }} onSubmit={formik.handleSubmit}>
        <label>Email</label>
        <input
          name="email"
          onChange={formik.handleChange}
          value={formik.values.email}
        />
        {formik.errors.email ? <div>{formik.errors.email}</div> : null}
        <label style={{ marginTop: "20px" }}>First name</label>
        <input
          name="name.first"
          onChange={formik.handleChange}
          value={formik.values.name.first}
        />
        {formik.errors.name?.first ? <div>{formik.errors.name.first}</div> : null}
        <label style={{ marginTop: "20px" }}>Last name</label>
        <input
          name="name.last"
          onChange={formik.handleChange}
          value={formik.values.name.last}
        />
        {formik.errors.name?.last ? <div>{formik.errors.name.last}</div> : null}
        <button style={{ marginTop: "20px" }} type="submit">Submit</button>
      </form>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
