export enum Tokens {
    LEFT_PAREN, //0
    RIGHT_PAREN, // 1
    WORD, // 2
    NUMBER, // 3
    OPERATOR, // 4
    EOF // 5
}

export interface Token {
    type: Tokens;
    value: string | number | null;
}

export enum TokenizerState {
    default,
    eof
}

export class Tokenizer {
    input: string;
    _pos: number = 0;
    _currentChar: string | null = null;
    _state: TokenizerState = TokenizerState.default;
    tokens: Token[] = [];
    lineMap: Map<number, string>;
    constructor() {
        this.input = '';
        this._resetState();
    }

    _resetState() {
        this.tokens = [];
        this._pos = 0;
        this._currentChar = this.input.charAt(this._pos);
        this.lineMap = new Map<number, string>();
    }

    parseTokens(text: string) {
        this.input = text;
        this._resetState();
        while (true) {
            this.skipWhitespace();
            const token = this.nextToken();
            this.tokens.push(token);
            if (token.type === Tokens.EOF) break;
        }
        this.tokens.push({ type: Tokens.EOF, value: null });
    }

    advance() {
        this._pos++;
        if (this._pos > this.input.length - 1) {
            this._currentChar = null;
        } else {
            this._currentChar = this.input.charAt(this._pos);
        }
    }

    skipWhitespace() {
        while (this._currentChar !== null && /\s/.test(this._currentChar)) {
            this.advance();
        }
    }

    parseNumber(): Token {
        let numStr = '';

        while (this._currentChar !== null && /[\d.]/.test(this._currentChar)) {
            numStr += this._currentChar;
            this.advance();
        }

        const numValue = parseFloat(numStr);
        if (isNaN(numValue)) {
            throw new Error(`Invalid number: ${numStr}`);
        }

        return { type: Tokens.NUMBER, value: numValue };
    }

    parseWord(): Token {
        let word = '';
        while (this._currentChar !== null && /[a-zA-Z0-9_]/.test(this._currentChar)) {
            word += this._currentChar;
            this.advance();
        }

        return { type: Tokens.WORD, value: word };
    }

    nextToken(): Token {
        if (this._currentChar === null || this._pos >= this.input.length) {
            return { type: Tokens.EOF, value: null };
        }

        // Handle single character tokens
        if (this._currentChar === '(') {
            this.advance();
            return { type: Tokens.LEFT_PAREN, value: '(' };
        }

        if (this._currentChar === ')') {
            this.advance();
            return { type: Tokens.RIGHT_PAREN, value: ')' };
        }

        // Handle operators
        if (['+', '-', '*', '/', '<', '>', '='].includes(this._currentChar)) {
            let op = this._currentChar;
            if (['>', '<', '='].includes(this._currentChar)) {
                if (this.input[this._pos + 1] && this.input[this._pos + 1] == '=') {
                    this.advance();
                    op += '=';
                }
            }
            this.advance();
            return { type: Tokens.OPERATOR, value: op };
        }

        // Handle numbers
        if (/\d/.test(this._currentChar)) {
            return this.parseNumber();
        }

        // Handle words (identifiers)
        if (/[a-zA-Z_]/.test(this._currentChar)) {
            return this.parseWord();
        }

        throw new Error(`Unexpected character: ${this._currentChar}`);
    }
}