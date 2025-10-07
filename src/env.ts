import { FunctionValue, ListNode, SymbolNode, Value } from "./parser.js";
import { Runner } from "./runner.js";

export enum Keywords {
    DEFINE = "define",
    IF = "if",
    LAMBDA = 'lambda',
    BEGIN = 'begin'
}

export class BuiltinFunction {
    call(args: Value[], context: Closure, runner: Runner): Value {
        throw new Error('Not implemented');
    }
}

export class SpecialForm {
    call(node: ListNode, context: Closure, runner: Runner): Value {
        throw new Error('Not implemented');
    }
}

//
// Define Forms (lisp special forms)
// 
class DefineForm extends SpecialForm {
    call(node: ListNode, context: Closure, runner: Runner): Value {
        if (node.children.length < 3)
            throw new Error('Define requires at least 3 nodes');
        const symbol = node.children[1];
        const value = node.children[2];

        context.bind(symbol.name, value.name);
        return value.name;
    }
}

class IfForm extends SpecialForm {
    call(node: ListNode, context: Closure, runner: Runner): Value {
        if (node.children.length < 4)
            throw new Error(`Not enough nodes in list for ${Keywords.IF}`);
        const condition = runner.eval(node.children[1], context);
        if (!(condition === true || condition === false))
            throw new Error('if statement needs boolean to execute');
        if (condition) {
            const childContext = new Closure(context);
            return runner.eval(node.children[2], childContext);
        } else {
            const childContext = new Closure(context);
            return runner.eval(node.children[3], childContext);
        }
    }
}

class LambdaForm extends SpecialForm {
    call(node: ListNode, context: Closure, runner: Runner): Value {
        if (node.children.length < 4) {
            throw new Error("lambda requires a name, a parameter list, and a body");
        }

        const nameNode = node.children[1];
        const paramsNode = node.children[2];
        const bodyNode = node.children[3];

        if (!(nameNode instanceof SymbolNode)) {
            throw new Error("lambda name must be a symbol");
        }
        if (!(paramsNode instanceof ListNode)) {
            throw new Error("lambda parameters must be a list");
        }

        if (!(bodyNode instanceof ListNode)) {
            throw new Error("lambda body must be a list");
        }

        const params = paramsNode.children.map(p => {
            if (!(p instanceof SymbolNode)) {
                throw new Error("lambda parameters must be symbols");
            }
            return p;
        });

        const func = new FunctionValue(nameNode.name, params, bodyNode, context);
        context.bind(nameNode.name, func);
        return func;
    }
}

class BeginForm extends SpecialForm {
    call(node: ListNode, context: Closure, runner: Runner): Value {
        let childContext = new Closure(context);
        let ret: Value = 0;
        for (let i = 1; i < node.children.length; i++) {
            ret = runner.eval(node.children[i], childContext);
        }
        return ret;
    }
}


//
// Define Builtin Functions
// 
class PrintBuiltin extends BuiltinFunction {
    call(args: Value[], context: Closure, runner: Runner): Value {
        console.log(...args.map(arg => arg.toString()));
        return args.length > 0 ? args[args.length - 1] : null;
    }
}

class AddBuiltin extends BuiltinFunction {
    call(args: Value[], context: Closure, runner: Runner): Value {
        let sum = args.reduce((acc, val) => Number(acc) + Number(val), 0);
        return sum;
    }
}

class SubtractBuiltin extends BuiltinFunction {
    call(args: Value[], context: Closure, runner: Runner): Value {
        if (args.length < 2) throw new Error(`Invalid number of args for - ${args.length}`);
        const first = Number(args[0]);
        return args.slice(1).reduce((acc, val) => Number(acc) - Number(val), first);
    }
}

class MultBuiltin extends BuiltinFunction {
    call(args: Value[], context: Closure, runner: Runner): Value {
        let sum = args.reduce((acc, val) => Number(acc) * Number(val), 1);
        return sum;
    }
}

class DivBuiltin extends BuiltinFunction {
    call(args: Value[], context: Closure, runner: Runner): Value {
        let sum = args.reduce((acc, val) => Number(acc) / Number(val), 1);
        return sum;
    }
}

class EqualsBuiltin extends BuiltinFunction {
    call(args: Value[], context: Closure, runner: Runner): Value {
        if (args.length < 2) throw new Error(`Invalid number of args for == ${args.length}`);
        const first = args[0];
        return args.every(val => val === first);
    }
}

class GreaterThenBuiltin extends BuiltinFunction {
    call(args: Value[], context: Closure, runner: Runner): Value {
        if (args.length < 2) throw new Error(`Invalid number of args for > ${args.length}`);
        for (let i = 0; i < args.length - 1; i++) {
            if (!(Number(args[i]) > Number(args[i + 1]))) return false;
        }
        return true;
    }
}

class LessThenBuiltin extends BuiltinFunction {
    call(args: Value[], context: Closure, runner: Runner): Value {
        if (args.length < 2) throw new Error(`Invalid number of args for > ${args.length}`);
        for (let i = 0; i < args.length - 1; i++) {
            if (!(Number(args[i]) < Number(args[i + 1]))) return false;
        }
        return true;
    }
}

class GreaterEqualThenBuiltin extends BuiltinFunction {
    call(args: Value[], context: Closure, runner: Runner): Value {
        if (args.length < 2) throw new Error(`Invalid number of args for > ${args.length}`);
        for (let i = 0; i < args.length - 1; i++) {
            if (!(Number(args[i]) >= Number(args[i + 1]))) return false;
        }
        return true;
    }
}

class LessThenEqualBuiltin extends BuiltinFunction {
    call(args: Value[], context: Closure, runner: Runner): Value {
        if (args.length < 2) throw new Error(`Invalid number of args for > ${args.length}`);
        for (let i = 0; i < args.length - 1; i++) {
            if (!(Number(args[i]) <= Number(args[i + 1]))) return false;
        }
        return true;
    }
}

export function defaultBuiltins() {
    let builtins = new Map<string, BuiltinFunction>();

    builtins.set("print", new PrintBuiltin());
    builtins.set("+", new AddBuiltin());
    builtins.set("-", new SubtractBuiltin());
    builtins.set("*", new MultBuiltin());
    builtins.set("/", new DivBuiltin());
    builtins.set("==", new EqualsBuiltin());
    builtins.set(">", new GreaterThenBuiltin());

    return builtins;
}



export function defaultSpecialForms() {
    let forms = new Map<string, SpecialForm>();
    forms.set(Keywords.DEFINE, new DefineForm());
    forms.set(Keywords.IF, new IfForm());
    forms.set(Keywords.LAMBDA, new LambdaForm());
    forms.set(Keywords.BEGIN, new BeginForm());
    return forms;
}

export class Closure {
    parent: Closure | null;
    variables: Map<string, Value>;
    constructor(parent: Closure | null) {
        this.variables = new Map<string, Value>();
        this.parent = parent;
    }

    bind(name: string, value: Value) {
        this.variables.set(name, value);
    }

    lookup(name: string): Value {
        if (this.variables.has(name)) {
            const value = this.variables.get(name);
            if (value === undefined) {
                throw new Error(`Unbound symbol: ${name}`);
            }
            return value;
        }
        if (this.parent) {
            return this.parent.lookup(name);
        }
        throw new Error(`Unbound symbol: ${name}`);
    }
}