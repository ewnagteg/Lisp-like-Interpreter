import { BuiltinFunction, Closure, Keywords, SpecialForm } from "./env.js";
import { Node, AST, Value, SymbolNode, ValueNode, ListNode, FunctionValue } from "./parser.js";

export class Runner {
    builtinsMap: Map<string, BuiltinFunction>;
    formsMap: Map<string, SpecialForm>;
    lineMap: Map<number, string>;
    constructor(builtinsMap: Map<string, BuiltinFunction>, formsMap: Map<string, SpecialForm>, lineMap: Map<number, string>) {
        this.builtinsMap = builtinsMap;
        this.formsMap = formsMap;
        this.lineMap = lineMap;
    }

    run(ast: AST) {
        let global = new Closure(null);
        if (ast.children.length == 0)
            return;
        for (let node of ast.children) {
            try {
                this.eval(node, global);
            } catch (e: unknown) {
                if (e instanceof Error) {
                    console.error("Error name:", e.name);
                    console.error("Error message:", e.message);
                    console.error("Error line: " + this.lineMap.get(node.line));
                } else {
                    console.error("An unknown error occurred:", e);
                }
            }
        }
    }

    eval(node: Node, context: Closure): Value {
        if (node instanceof SymbolNode) {
            const value = context.lookup(node.name);
            return value;
        } else if (node instanceof ValueNode) {
            return node.name;
        }

        if (node instanceof ListNode) {
            if (node.children.length == 0)
                throw new Error('Cannot evaluate empty list');

            const first = node.children[0];
            if (this.formsMap.has(first.name)) {
                return this.formsMap.get(first.name).call(node, context, this);
            } else if (this.builtinsMap.has(first.name)) {
                let args = [];
                // each arg needs to evaluate
                // bind args to closure eg args (x y) get bound to (1 2) on function call
                for (let i = 1; i < node.children.length; i++) {
                    args.push(this.eval(node.children[i], context));
                }
                const result = this.builtinsMap.get(first.name)?.call(args, context, this);
                return result;
            }
            let fn = this.eval(first, context);
            if (!(fn instanceof FunctionValue)) {
                return first.name; // assume that we want the value eg doing (1) -> 1 or (1 2) -> 1
            }

            let args = [];
            if (node.children.length - 1 < fn.params.length)
                throw new Error(`Invalid number of parameters for ${fn.name}`);

            for (let i = 1; i < node.children.length; i++) {
                args.push(this.eval(node.children[i], context));
            }

            return this.apply(fn, args, fn.params, fn.context)
        }
        return 1; // shouldnt ever get here?
    }

    apply(fn: FunctionValue, args: Value[], params: SymbolNode[], context: Closure): Value {
        const newScope = new Closure(context);
        args.forEach((param, i) => {
            newScope.bind(params[i].name, args[i]);
        });
        return this.eval(fn.body, newScope);
    }
}