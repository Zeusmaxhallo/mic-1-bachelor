ace.define("ace/theme/eclipse.css",["require","exports","module"], function(require, exports, module){module.exports = `
    .ace-eclipse .ace_gutter {
  background: #ebebeb;
  border-right: 1px solid rgb(159, 159, 159);
  color: rgb(136, 136, 136);
}
.ace-eclipse .ace_print-margin {
    width: 1px;
    background: #ebebeb;
  }
  
  .ace-eclipse {
    background-color: #FFFFFF;
    color: black;
  }
  
  .ace-eclipse .ace_fold {
      background-color: rgb(60, 76, 114);
  }
  
  .ace-eclipse .ace_cursor {
    color: black;
  }
  
  .ace-eclipse .ace_storage,
  .ace-eclipse .ace_keyword,
  .ace-eclipse .ace_variable {
    color: rgb(127, 0, 85);
  }
  
  .ace-eclipse .ace_constant.ace_buildin {
    color: rgb(88, 72, 246);
  }
  
  .ace-eclipse .ace_constant.ace_library {
    color: rgb(6, 150, 14);
  }
  
  .ace-eclipse .ace_function {
    color: rgb(60, 76, 114);
  }
  
  .ace-eclipse .ace_string {
    color: rgb(42, 0, 255);
  }
  
  .ace-eclipse .ace_comment {
    color: rgb(113, 150, 130);
  }
  
  .ace-eclipse .ace_comment.ace_doc {
    color: rgb(63, 95, 191);
  }
  
  .ace-eclipse .ace_comment.ace_doc.ace_tag {
    color: rgb(127, 159, 191);
  }
  
  .ace-eclipse .ace_constant.ace_numeric {
    color: darkblue;
  }
  
  .ace-eclipse .ace_tag {
    color: rgb(25, 118, 116);
  }
  
  .ace-eclipse .ace_type {
    color: rgb(127, 0, 127);
  }
  
  .ace-eclipse .ace_xml-pe {
    color: rgb(104, 104, 91);
  }
  
  .ace-eclipse .ace_marker-layer .ace_selection {
    background: rgb(181, 213, 255);
  }

  .ace-eclipse .ace_marker-layer
    .ace_highlight-line {
    background: #c5f768; position: absolute; z-index: 2;
    }

  .ace-eclipse .ace_marker-layer
    .ace_breakpoint-line {
    background: #88fa4b; position: absolute; z-index: 2;
    }
  
  .ace-eclipse .ace_marker-layer .ace_bracket {
    margin: -1px 0 0 -1px;
    border: 1px solid rgb(192, 192, 192);
  }
  
  .ace-eclipse .ace_meta.ace_tag {
    color:rgb(25, 118, 116);
  }
  
  .ace-eclipse .ace_invisible {
    color: #ddd;
  }
  
  .ace-eclipse .ace_entity.ace_other.ace_attribute-name {
    color:rgb(127, 0, 127);
  }
  .ace-eclipse .ace_marker-layer .ace_step {
    background: rgb(255, 255, 0);
  }
  
  .ace-eclipse .ace_active-line {
    background: rgb(232, 242, 254);
  }
  
  .ace-eclipse .ace_gutter-active-line {
    background-color : #DADADA;
  }
  
  .ace-eclipse .ace_marker-layer .ace_selected-word {
    border: 1px solid rgb(181, 213, 255);
  }
  
  .ace-eclipse .ace_indent-guide {
    background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bLly//BwAmVgd1/w11/gAAAABJRU5ErkJggg==") right repeat-y;
  }
  
  .ace-eclipse .ace_indent-guide-active {
    background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAZSURBVHjaYvj///9/hivKyv8BAAAA//8DACLqBhbvk+/eAAAAAElFTkSuQmCC") right repeat-y;
  }

  .ace-eclipse .ace_marker-layer
.ace_error-line {
  background: #ff725c; position: absolute; z-index: 2;
}
`;

});

ace.define("ace/theme/eclipse",["require","exports","module","ace/theme/eclipse.css","ace/lib/dom"], function(require, exports, module){exports.isDark = true;
exports.cssClass = "ace-eclipse";
exports.cssText = require("./eclipse.css");
var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass, false);

});                (function() {
                    ace.require(["ace/theme/eclipse"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            
































