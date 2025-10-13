import { Closure, Keywords } from "./env.js";
import { Token, Tokens } from "./lexer.js";

export type Value = number | string | boolean | FunctionValue;

export class Node {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}

export class SymbolNode extends Node {

}

export class ValueNode extends Node {
    isNumber: boolean = false;
}

export class KeywordNode extends Node {
}



export class ListNode extends Node {
    children: (SymbolNode | ValueNode | ListNode)[] = []

}

export class AST {
    children: Node[];
    constructor() {
        this.children = [];
    }
}


export class Parser {
    ast: AST;

    constructor() {
        this.ast = new AST();
    }

    parseTokens(tokens: Token[]) {
        let i = 0;
        let current = tokens[i];
        let stack: ListNode[] = [];
        let ast: Node[] = [];
        this.ast = new AST();
        while (current.type !== Tokens.EOF) {
            if (current.type === Tokens.LEFT_PAREN) {
                let listNode = new ListNode('ListNode');
                stack.push(listNode);
            }
            else if (current.type === Tokens.RIGHT_PAREN) {
                let listNode = stack.pop();
                if (!listNode) throw new Error("Unmatched )");
                if (stack.length > 0) {
                    stack[stack.length - 1].children.push(listNode);
                } else {
                    ast.push(listNode);
                }
            }
            else {
                let node: Node;
                if (current.type === Tokens.WORD) {
                    if (isKeyword(String(current.value))) {
                        node = new KeywordNode(String(current.value));
                    } else {
                        node = new SymbolNode(String(current.value));
                    }
                } else if (current.type === Tokens.NUMBER) {
                    node = new ValueNode(String(current.value)); // probably number, not string
                    (<ValueNode> node).isNumber = true;
                } else if (current.type === Tokens.OPERATOR) {
                    node = new SymbolNode(String(current.value));
                } else {
                    throw new Error("Unexpected token " + current.type);
                }

                if (stack.length > 0) {
                    stack[stack.length - 1].children.push(node);
                } else {
                    ast.push(node);
                }
            }
            i++;
            current = tokens[i];
        }

        this.ast.children = ast;
    }
}

export function isKeyword(word: string): boolean {
    return Object.values(Keywords).includes(word as Keywords);
}


export class FunctionValue extends Node {
    context: Closure;
    params: SymbolNode[];
    body: ListNode;
    constructor(name: string, params: SymbolNode[], body: ListNode, context: Closure) {
        super(name);
        this.params = params;
        this.body = body;
        this.context = context;
    }
}