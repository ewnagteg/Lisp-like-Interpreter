# Simple Lisp Interpreter

A minimal Lisp interpreter written in TypeScript/JavaScript.  
Supports basic arithmetic, lambdas, conditionals, and extensible builtins.

## Features

- Basic Lisp syntax: `(+ 1 2)`, `(if (> x 0) (x) (0))`, `(lambda (x) (* x x))`, `(print x) (begin (print x) (print y))`
- Customizable builtins
- Extensible with new types and forms
- Runs in browser and Node.js

## Getting Started

### Install dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

### Run tests

```bash
npm test
```

### Start development server (browser demo)

```bash
npm start
```


Then open [http://localhost:3000](http://localhost:8000) in your browser.

## Usage

- Edit code in `src/`
- Run tests in `test/`
- View browser demo in `views/index.html`

## Todo

- Add exception handling stack trace
- Add support for more types (lists, strings)
- Add `setf`, `sort`
- Add comments support

## License

MIT
