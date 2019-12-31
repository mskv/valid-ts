# Valid-ts

[npm package](https://www.npmjs.com/package/valid-ts)

It's a very simple validation library. No dependencies. Written in TypeScript. Useful for counstructing well-typed validation functions using a declarative interface. The validation functions are generally supposed to accept any input, ensure its shape during runtime and return typed values.

## Installation:

`npm install --save valid-ts`

## Documentation

I want to try out an unusual approach to documentation. I've created a sandbox project in the awesome [codesandbox.io](https://codesandbox.io):

[https://codesandbox.io/s/valid-ts-sandbox-9xxjj](https://codesandbox.io/s/valid-ts-sandbox-9xxjj)

All you need to know to use the library lives in the comments of `src/index.ts` there.

## Example projects

There are two simple example projects to look at. Please check their `README.md`s to build and test them:

- [Server-side validation](https://github.com/mskv/valid-ts/blob/8ef8208/examples/server). This project shows an example of creating a [union type "command" validator](https://github.com/mskv/valid-ts/blob/8ef8208/examples/server/src/index.ts#L17) and using it in an Express endpoint. In README you can find some more use case examples.

- [Client-side validation](https://github.com/mskv/valid-ts/tree/8ef8208/examples/client). This project shows a very simple [ValidTs-Formik integration](https://github.com/mskv/valid-ts/blob/8ef8208dd55b6eb4425141f1d2ca4a252104bf21/examples/client/src/index.tsx#L46) - translating ValidTs errors to a form digestable by Formik.

## Development

`npm install`

`npm test`

## Contributing

You're welcome to open a GitHub issue about any problem/question you have. Even a typo in documentation is a good thing to report!
