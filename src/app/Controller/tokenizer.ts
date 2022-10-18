
const Spec: any= [
    // Numbers:
    [/^\d+/, "NUMBER"],

    // Registers
    [/^H/,     "REGISTER"],
    [/^MAR/,   "REGISTER"],
    [/^MDR/,   "REGISTER"],
    [/^SP/,    "REGISTER"],
    [/^LV/,    "REGISTER"],
    [/^CPP/,   "REGISTER"],
    [/^TOS/,   "REGISTER"],
    [/^OPC/,   "REGISTER"],
    [/^PC/,    "REGISTER"],


    // Math operators: +/-, AND, OR, >>
    [/^[+\-]/, "ADDITIVE_OPERATOR"],
    [/^AND/, "LOGICAL_OPERATOR"],
    [/^OR/, "LOGICAL_OPERATOR"],
    [/^<</, "BITWISE_OPERATOR"],
    [/^>>/, "BITWISE_OPERATOR"],

    // Assignment operator: =
    [/^=/, "ASSIGNMENT_OPERATOR"],

    // Memory operations: rd, wr, fetch
    [/^rd/, "MEMORY_INSTRUCTION"],
    [/^wr/, "MEMORY_INSTRUCTION"],
    [/^fetch/, "MEMORY_INSTRUCTION"],

    // if else
    [/^if(N)/ , "JUMP"],
    [/^if(Z)/ , "JUMP"],
    [/^else/ , "JUMP"],


    // New Label: e.g Label1:
    [/^\w*:/ , "NEW_LABEL"],
    
    // Divider: ;
    [/^;/, "DIVIDER"],

    // Whitespace
    [/^\s+/,    null],

    // Comment
    [/^\/\/.*/, null],

    // Goto
    [/^goto/, "GOTO"],

    // Jump Label
    [/^\w*/, "LABEL"]
]

export interface Token{
    type: string;
    value: string;
}


export class Tokenizer{

    private string: string = "";
    private curser: number = 0; 

    init(string:string): void{
        this.string = string
        this.curser = 0;
    }

    private hasMoreTokens(): Boolean {
        return this.curser < this.string.length;
    }

    private match(regexp: RegExp, string: string){
        const matched = regexp.exec(string);
        if (matched == null){
            return null
        }
        this.curser += matched[0].length;
        return matched[0];
    }
   
    getNextToken():Token{
        if (!this.hasMoreTokens()){
            return null;
        }

        
        const string = this.string.slice(this.curser);

        for (const [regexp, tokenType] of Spec){
            const tokenValue = this.match(regexp, string);

            // could not match this rule, try the other ones
            if (tokenValue == null) {
                continue;
            }
            
            // Skip null Token, e.g whitespace and comment
            if (tokenType == null) {
                return this.getNextToken();
            }

            return{
                type: tokenType,
                value: tokenValue,
            }
        }

        throw new SyntaxError(`Unexpected token: "${string[0]}"`); 
    }

    getAllTokens():Token[]{
        let tokens: Token[] = [];
        while(true){
            let token = this.getNextToken();
            if(token == null){
                break;
            }
            tokens.push(token);
        }
        return tokens;
    }
}
