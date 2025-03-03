
ace.define("ace/mode/mic1_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module){
"use strict";
var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var Mic1HighlightRules = function () {
    this.$rules = { start: [
            // keywords:
            { token: 'keyword.control.mic1',
                regex: '\\b(?:BIPUSH|DUP|GOTO|IADD|IAND|IINC|ILOAD|INVOKEVIRTUAL|IOR|IRETURN|ISTORE|ISUB|LDC_W|NOP|POP|SWAP|IF(?:e?q|l?t|(?:_icmpeq)))\\b',
                caseInsensitive: true },
            // variables:
            { token: 'variable.parameter.register.mic1',
                regex: '\\b(?:EAX|RAX|AX|N|Z)\\b',
                caseInsensitive: true },
            // numbers:
            { token: 'constant.character.decimal.mic1',
                regex: '\\b[0-9]+\\b' },
            { token: 'constant.character.hexadecimal.mic1',
                regex: '\\b0x[A-F0-9]+\\b',
                caseInsensitive: true },
            { token: 'constant.character.hexadecimal.mic1',
                regex: '\\b[A-F0-9]+h\\b',
                caseInsensitive: true },
            // strings:
            { token: 'string.mic1', regex: /'([^\\']|\\.)*'/ },
            { token: 'string.mic1', regex: /"([^\\"]|\\.)*"/ },
            // sections:
            { token: 'support.function.directive.mic1',
                regex: '\\b(?:end-var|var|end-string|string|main|end-main|constant|end-constant|method|end-method)\\b',
                caseInsensitive: true },
            // comments
            { token: 'comment.mic1', regex: '//.*$' }]
    };
    this.normalizeRules();
};

oop.inherits(Mic1HighlightRules, TextHighlightRules);
exports.Mic1HighlightRules = Mic1HighlightRules;

});

ace.define("ace/mode/folding/coffee",["require","exports","module","ace/lib/oop","ace/mode/folding/fold_mode","ace/range"], function(require, exports, module){"use strict";
var oop = require("../../lib/oop");
var BaseFoldMode = require("./fold_mode").FoldMode;
var Range = require("../../range").Range;
var FoldMode = exports.FoldMode = function () { };
oop.inherits(FoldMode, BaseFoldMode);
(function () {
    this.getFoldWidgetRange = function (session, foldStyle, row) {
        var range = this.indentationBlock(session, row);
        if (range)
            return range;
        var re = /\S/;
        var line = session.getLine(row);
        var startLevel = line.search(re);
        if (startLevel == -1 || line[startLevel] != "#")
            return;
        var startColumn = line.length;
        var maxRow = session.getLength();
        var startRow = row;
        var endRow = row;
        while (++row < maxRow) {
            line = session.getLine(row);
            var level = line.search(re);
            if (level == -1)
                continue;
            if (line[level] != "#")
                break;
            endRow = row;
        }
        if (endRow > startRow) {
            var endColumn = session.getLine(endRow).length;
            return new Range(startRow, startColumn, endRow, endColumn);
        }
    };
    this.getFoldWidget = function (session, foldStyle, row) {
        var line = session.getLine(row);
        var indent = line.search(/\S/);
        var next = session.getLine(row + 1);
        var prev = session.getLine(row - 1);
        var prevIndent = prev.search(/\S/);
        var nextIndent = next.search(/\S/);
        if (indent == -1) {
            session.foldWidgets[row - 1] = prevIndent != -1 && prevIndent < nextIndent ? "start" : "";
            return "";
        }
        if (prevIndent == -1) {
            if (indent == nextIndent && line[indent] == "#" && next[indent] == "#") {
                session.foldWidgets[row - 1] = "";
                session.foldWidgets[row + 1] = "";
                return "start";
            }
        }
        else if (prevIndent == indent && line[indent] == "#" && prev[indent] == "#") {
            if (session.getLine(row - 2).search(/\S/) == -1) {
                session.foldWidgets[row - 1] = "start";
                session.foldWidgets[row + 1] = "";
                return "";
            }
        }
        if (prevIndent != -1 && prevIndent < indent)
            session.foldWidgets[row - 1] = "start";
        else
            session.foldWidgets[row - 1] = "";
        if (indent < nextIndent)
            return "start";
        else
            return "";
    };
}).call(FoldMode.prototype);

});

ace.define("ace/mode/mic1",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/mic1_highlight_rules","ace/mode/folding/coffee"], function(require, exports, module){
"use strict";
var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Mic1HighlightRules = require("./mic1_highlight_rules").Mic1HighlightRules;
var FoldMode = require("./folding/coffee").FoldMode;
var Mode = function () {
    this.HighlightRules = Mic1HighlightRules;
    this.foldingRules = new FoldMode();
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);
(function () {
    this.lineCommentStart = [";"];
    this.$id = "ace/mode/mic1";
}).call(Mode.prototype);
exports.Mode = Mode;

});                (function() {
                    ace.require(["ace/mode/mic1"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();