define('ace/theme/thecharlie', ['require', 'exports', 'module' ], function(require, exports, module) {

exports.isDark = true;
exports.cssClass = "ace-thecharlie";
exports.cssText = "\
.ace-thecharlie .ace_editor {\
  border: 2px solid rgb(159, 159, 159);\
}\
\
.ace-thecharlie .ace_editor.ace_focus {\
  border: 2px solid #327fbd;\
}\
\
.ace-thecharlie .ace_gutter {\
  background: #000000;\
  color: #ccc;\
  border:0;\
}\
\
.ace-thecharlie .ace_print_margin {\
  width: 1px;\
  background: #e8e8e8;\
}\
\
.ace-thecharlie .ace_scroller {\
  background-color: #000000;\
}\
\
.ace-thecharlie .ace_text-layer {\
  cursor: text;\
  color: #FFFFFF;\
}\
\
.ace-thecharlie .ace_cursor {\
  border-left: 2px solid #91FF00;\
}\
\
.ace-thecharlie .ace_cursor.ace_overwrite {\
  border-left: 0px;\
  border-bottom: 1px solid #91FF00;\
}\
 \
.ace-thecharlie .ace_marker-layer .ace_selection {\
  background: rgba(140, 100, 126, 0.88);\
}\
\
.ace-thecharlie .ace_marker-layer .ace_step {\
  background: rgb(198, 219, 174);\
}\
\
.ace-thecharlie .ace_marker-layer .ace_bracket {\
  margin: -1px 0 0 -1px;\
  border: 1px solid #404040;\
}\
\
.ace-thecharlie .ace_marker-layer .ace_active_line {\
  background: #353637;\
}\
\
.ace-thecharlie .ace_marker-layer .ace_selected_word {\
  border: 1px solid rgba(90, 100, 126, 0.88);\
}\
       \
.ace-thecharlie .ace_invisible {\
  color: #404040;\
}\
\
.ace-thecharlie .ace_keyword {\
  color:#CC7833;\
}\
\
.ace-thecharlie .ace_constant {\
  color:#6C99BB;\
}\
\
.ace-thecharlie .ace_invalid {\
  color:#FFFFFF;\
background-color:#FF0000;\
}\
\
.ace-thecharlie .ace_fold {\
    background-color: #CC7833;\
    border-color: #FFFFFF;\
}\
\
.ace-thecharlie .ace_support.ace_function {\
  color:#B83426;\
}\
\
.ace-thecharlie .ace_string {\
  color:#A5C261;\
}\
\
.ace-thecharlie .ace_string.ace_regexp {\
  color:#CCCC33;\
}\
\
.ace-thecharlie .ace_comment {\
\
color:#bb5544;\
}\
\
.ace-thecharlie .ace_meta.ace_tag {\
  color:#FFE5BB;\
}\
\
.ace-thecharlie .ace_entity.ace_name {\
  color:#FFC66D;\
}\
\
.ace-thecharlie .ace_markup.ace_underline {\
    text-decoration:underline;\
}\
\
.ace-thecharlie .ace_collab.ace_user1 {\
  color:#323232;\
background-color:#FFF980;   \
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
;
            (function() {
                window.require(["ace/ace"], function(a) {
                    if (!window.ace)
                        window.ace = {};
                    for (var key in a) if (a.hasOwnProperty(key))
                        ace[key] = a[key];
                });
            })();
        