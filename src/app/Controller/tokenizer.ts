
const Spec: any= [
    // Numbers:
    [/^\d+/, "NUMBER"],

    // Registers
    [/^H/,      "REGISTER"],
    [/^TOS/,    "REGISTER"],

    // Math operators: +/-, AND, OR, >>
    [/^[+\-]/, "ADDITIVE_OPERATOR"],
    [/^AND/, "LOGICAL_OPERATOR"],
    [/^OR/, "LOGICAL_OPERATOR"],
    [/^<</, "BITWISE_OPERATOR"],

    // Assignment operator: =
    [/^=/, "ASSIGNMENT_OPERATOR"],

    // Memory operations: rd, wr, fetch
    [/^rd/, "MEMORY_INSTRUCTION"],
    [/^wr/, "MEMORY_INSTRUCTION"],
    [/^fetch/, "MEMORY_INSTRUCTION"],

    // New Label: e.g Label1:
    [/^.*:/ , "NEW_LABEL"],
    
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


class Tokenizer{

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
   
    getNextToken():Object{
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
}

const tokenizer = new Tokenizer();

const string = "Label1: H = TOS = 1 + TOS;wr;goto Main1 "
tokenizer.init(string);

console.log(string);
while (true) {
    let token = tokenizer.getNextToken();
    if (token == null){
        break;
    }
    console.log(token);
}
