// @ts-nocheck

import { CodeMirror } from "./codemirror/src/edit/main.js"
import JSMODE from "./codemirror/mode/javascript/javascript.js"
import matchBrackets from "./codemirror/addon/edit/matchbrackets.js"

JSMODE(CodeMirror)
matchBrackets(CodeMirror)
export default CodeMirror
