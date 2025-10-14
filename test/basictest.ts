import { describe, it, expect, beforeAll } from 'vitest';
import { Tokenizer } from '../src/lexer.js';
import { Parser, Value } from '../src/parser.js';
import { Runner } from '../src/runner.js';
import { BuiltinFunction, Closure, defaultBuiltins, defaultSpecialForms } from '../src/env.js';

let tokenizer: Tokenizer;
let parser: Parser;
let runner: Runner;
let testValues: { [name: string]: Value } = {};

class TestBuiltin extends BuiltinFunction {
    call(args: Value[], context: Closure, runner: Runner): Value {
        if (args.length != 2) {
            throw new Error(`Invalid number of arguements for test builtin: ${args.length}`);
        }
        testValues[String(args[0])] = args[1]
        return args[0];
    }
}

beforeAll(() => {
    tokenizer = new Tokenizer();
    parser = new Parser();
    let builtins = defaultBuiltins();
    builtins.set("test", new TestBuiltin());
    runner = new Runner(builtins, defaultSpecialForms());
});

describe('Lisp Interpreter', () => {
    it('adds numbers', () => {
        let test = `
        (define x 2)
        (define y 3)
        (test 1 (+ x y))
        `;
        tokenizer.parseTokens(test);
        let parser = new Parser();
        parser.parseTokens(tokenizer.tokens);

        runner.run(parser.ast);
        console.log(testValues);
        expect(testValues['1']).toBe(5); // Replace with real test
    });
});

describe('Lisp Interpreter', () => {
    it('mult numbers', () => {


        tokenizer = new Tokenizer();

        let test = `
        (define x 3)
        (define y 3)
        (test 2 (+ x y))
        `;
        tokenizer.parseTokens(test);
        parser.parseTokens(tokenizer.tokens);

        runner.run(parser.ast);
        console.log(testValues);
        expect(testValues['2']).toBe(6); // Replace with real test
    });
});

describe('Test logic builtins', () => {
    it('test equality', () => {


        tokenizer = new Tokenizer();

        let test = `
        (define x 3)
        (define y 3)
        (test 3 (== x y))
        `;
        tokenizer.parseTokens(test);
        parser.parseTokens(tokenizer.tokens);

        runner.run(parser.ast);
        expect(testValues['3']).toBe(true);
    });

    it('test greater then', () => {


        tokenizer = new Tokenizer();

        let test = `
        (define x 3)
        (define y 2)
        (test 3 (>= x y))
        `;
        tokenizer.parseTokens(test);
        parser.parseTokens(tokenizer.tokens);

        runner.run(parser.ast);
        expect(testValues['3']).toBe(true);
    });

    it('test less then', () => {

        tokenizer = new Tokenizer();

        let test = `
        (define x 3)
        (define y 2)
        (test 3 (<= x y))
        `;
        tokenizer.parseTokens(test);
        parser.parseTokens(tokenizer.tokens);

        runner.run(parser.ast);
        expect(testValues['3']).toBe(false);
    });

    it('test less then', () => {

        tokenizer = new Tokenizer();

        let test = `
        (define x 3)
        (define y 4)
        (test 3 (<= x y))
        `;
        tokenizer.parseTokens(test);
        parser.parseTokens(tokenizer.tokens);

        runner.run(parser.ast);
        expect(testValues['3']).toBe(true);
    });

    it('test less then', () => {

        tokenizer = new Tokenizer();

        let test = `
        (define x 4)
        (define y 4)
        (test 3 (<= x y))
        `;
        tokenizer.parseTokens(test);
        parser.parseTokens(tokenizer.tokens);

        runner.run(parser.ast);
        expect(testValues['3']).toBe(true);
    });
});

describe('test lambda', () => {
    it('test lambda', () => {
        let test = `
        (lambda fact (n)
            (if (> n 0)
                (begin
                    (* n (fact (- n 1)))
                )
                (1)
            )
        )
        (test 1 (fact 5))
        `;
        tokenizer.parseTokens(test);
        parser.parseTokens(tokenizer.tokens);

        runner.run(parser.ast);
        expect(testValues['1']).toBe(120);
    });

    it('test lambda assigment', () => {
        let test = `
        (lambda fact (n)
            (if (> n 0)
                (begin
                    (* n (fact (- n 1)))
                )
                (1)
            )
        )
        (define x fact)
        (test 1 (x 5))
        `;
        tokenizer.parseTokens(test);
        parser.parseTokens(tokenizer.tokens);

        runner.run(parser.ast);
        expect(testValues['1']).toBe(120);
    });
});

describe('test if', () => {
    it('test if', () => {
        let test = `
        (test 1 (if (> 1 0) (1) (0)))
        `;
        tokenizer.parseTokens(test);
        parser.parseTokens(tokenizer.tokens);

        runner.run(parser.ast);
        expect(testValues['1']).toBe('1');
    });
});

describe('test lists', () => {
    it('test list ', () => {
        let test = `
        (define z 2)
        (define x (list 3 z 3))
        (define y x)
        (test 1 (nth 1 y))
        `;
        tokenizer.parseTokens(test);
        parser.parseTokens(tokenizer.tokens);

        runner.run(parser.ast);
        expect(testValues['1']).toBe('2');
    });
});

