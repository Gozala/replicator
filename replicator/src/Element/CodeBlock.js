// @ts-nocheck

import { regex, re } from "../../modules/Data/RegExp.js"
import CodeMirror from "../../modules/codemirror.js"
import { idle } from "../Effect/scheduler.js"
import { unreachable } from "../../modules/reflex/src/Basics.js"

/*::
import type { Editor } from "../codemirror.js"

type EventType =
  | "changes"
  | "cursorActivity"


type Direction = -1 | 1
type Unit = "line" | "char"
*/

// const style = async () => {
//   // const [base, theme] = await Promise.all([
//   //   // fetchStyle("../../modules/codemirror/lib/codemirror.css"),
//   //   // fetchStyle("../../theme.css"),
//   // ])
//   return `
//   :host {
//     outline: none;
//     contain: content;
//   }

//   ${base}

//   ${theme}
//   `
// }

// // We use this hack to avoid layout junk caused by late
// // style application.
// const css = style()

class Options {
  /*::
  value:string
  readOnly:boolean
  tabSize:number
  mode:string
  lineNumbers:boolean
  styleActiveLine:?{nonEmpty:boolean}|boolean
  smartIndent:boolean
  indentWithTabs:boolean
  theme:string
  dragDrop:boolean
  extraKeys:{[string]:string|Function}
  viewportMargin: number
  matchBrackets:boolean
  interactivate:boolean
  */
  constructor() {
    this.value = ""
    this.readOnly = false
    this.tabSize = 2
    this.lineNumbers = false
    this.styleActiveLine = { nonEmpty: true }
    this.smartIndent = true
    this.indentWithTabs = false
    this.theme = "interactivate"
    this.mode = "text/javascript"
    this.dragDrop = false
    this.extraKeys = { "Ctrl-Space": "autocomplete" }
    this.viewportMargin = Infinity
    this.matchBrackets = true
    this.interactivate = true
  }
  get indentWidth() {
    return this.tabSize
  }
  get indentUnit() {
    return this.indentUnit
  }
  set indentUnit(_) {}
}

export default class CodeBlock extends HTMLElement {
  /*::
  options:Options
  navigationKeys:Object
  editor:Editor
  onChanges:() => void
  onCursorActivity:() => void
  root:ShadowRoot
  Pass:mixed
  handleEvent:Event => mixed
  */
  constructor() {
    super()
    this.navigationKeys = this.navigationKeys || {
      Up: () => this.onPreviousLine(),
      Down: () => this.onNextLine(),
      Left: () => this.onPreviousChar(),
      Right: () => this.onNextChar(),
      Enter: () => this.onSplitLine(),
      Backspace: () => this.onDeleteBefore(),
      Delete: () => this.onDeleteAfter(),
      "Alt-Backspace": () => this.onDeleteGroupBefore(),
      "Alt-Delete": () => this.onDeleteGroupAfter(),
      "Ctrl-Alt-Backspace": () => this.onDeleteGroupAfter(),
    }

    this.root = this.attachShadow({ mode: "open", delegatesFocus: true })
    this.insertStyles()

    this.addEventListener("focus", this)
    this.addEventListener("click", this)
    this.options = new Options()
    this.onChanges = idle.debounce(() => void this.receive("changes"))
    this.onCursorActivity = idle.debounce(
      () => void this.receive("cursorActivity")
    )
  }

  insertStyles() {
    // const editorStyle = this.ownerDocument.createElement("link")
    // editorStyle.setAttribute('rel', 'stylesheet');
    // editorStyle.setAttribute('href', new URL("../../modules/codemirror/lib/codemirror.css", import.meta.url));

    const style = this.ownerDocument.createElement("link")
    style.setAttribute("rel", "stylesheet")
    style.setAttribute("href", new URL("./CodeBlock.css", import.meta.url))
    style.onload = () => this.editor.refresh()

    this.root.appendChild(style)
  }
  async connectedCallback() {
    this.editor = CodeMirror(this.root, this.options)
    this.Pass = CodeMirror.Pass
    this.editor.setOption("extraKeys", this.navigationKeys)
    this.editor.on("changes", this.onChanges)
    this.editor.on("cursorActivity", this.onCursorActivity)
  }
  setSelection(dir /*:-1|1*/) {
    if (this.editor) {
      const doc = this.editor.getDoc()
      const line = dir > 0 ? doc.firstLine() : doc.lastLine()
      const ch = dir > 0 ? 0 : doc.getLine(line).length
      const position = { line, ch }
      doc.setSelection(position, position)
    }
  }
  onPreviousLine() {
    return this.maybeEscape("line", -1)
  }
  onNextLine() {
    return this.maybeEscape("line", 1)
  }
  onPreviousChar() {
    return this.maybeEscape("char", -1)
  }
  onNextChar() {
    return this.maybeEscape("char", 1)
  }
  onSplitLine() {
    const doc = this.editor.getDoc()
    const { line } = doc.getCursor()
    const lastLine = doc.lastLine()
    if (line === doc.lastLine()) {
      const content = doc.getLine(line)
      if (CELL_PATTERN.test(content)) {
        this.blur()
        this.send("split")
        return Abort
      }
    }
    return this.Pass
  }
  isEmpty() {
    const doc = this.editor.getDoc()
    const count = doc.lineCount()
    return count === 1 && doc.getLine(0) === ""
  }
  onDeleteBefore() {
    if (this.isEmpty()) {
      this.send("delete", -1)
    }
    return this.Pass
  }
  onDeleteAfter() {
    if (this.isEmpty()) {
      this.send("delete", 1)
    }
    return this.Pass
  }
  onDeleteGroupBefore() {
    if (this.isEmpty()) {
      this.send("delete", -1)
    }
    return this.Pass
  }
  onDeleteGroupAfter() {
    if (this.isEmpty()) {
      this.send("delete", 1)
    }
    return this.Pass
  }

  handleEvent(event /*:FocusEvent|MouseEvent*/) {
    switch (event.type) {
      case "click":
      case "focus": {
        if (this.editor) {
          this.editor.refresh()
          return this.editor.focus()
        }
        break
      }
      case "blur": {
        break
      }
    }
  }
  send(type /*:string*/, detail /*:any*/) {
    this.dispatchEvent(new CustomEvent(type, { detail }))
  }
  receive(eventType /*:EventType*/) {
    switch (eventType) {
      case "changes": {
        this.syncValue()
        return this.send("change", this.options.value)
      }
      case "cursorActivity": {
        return this.send("settled", null)
      }
      default: {
        return unreachable(eventType)
      }
    }
  }
  maybeEscape(unit /*: Unit*/, dir /*: Direction*/) {
    const doc = this.editor.getDoc()
    let pos = doc.getCursor()
    if (
      doc.somethingSelected() ||
      pos.line != (dir < 0 ? doc.firstLine() : doc.lastLine()) ||
      (unit == "char" && pos.ch != (dir < 0 ? 0 : doc.getLine(pos.line).length))
    ) {
      return this.Pass
    } else {
      this.blur()
      this.send("escape", { unit, dir })
    }
  }
  blur() {
    this.editor.state.focused = false
    this.editor.refresh()
    console.log(this.editor.state.focused)
    // this.root.querySelector('textarea').blur()
    // this.root.focu()
    // this.root.activeElement.blur()
  }
  syncValue() {
    const { options, editor } = this
    if (editor) {
      options.value = editor.getValue()
    }
  }
  setOption(name /*:string*/, value /*:mixed*/) {
    const { editor } = this
    if (editor) {
      editor.setOption(name, value)
    }
  }
  get source() {
    return this.options.value
  }
  set source(value /*:string*/) {
    if (value != null && value !== this.options.value) {
      this.options.value = value
      const { editor } = this
      if (editor) {
        const doc = editor.getDoc()
        const { left, top } = editor.getScrollInfo()
        const position = editor.getDoc().getCursor()
        editor.setValue(value)
        doc.setCursor(position)
        editor.scrollTo(left, top)
      }
    }
  }
  get readOnly() {
    return this.options.readOnly
  }
  set readOnly(value /*:boolean*/) {
    const { options } = this
    const readOnly = value == null ? false : true
    if (readOnly !== options.readOnly) {
      options.readOnly = readOnly
      this.setOption("readOnly", readOnly)
    }
  }
  get tabSize() {
    return this.options.tabSize
  }
  set tabSize(value /*:number*/) {
    const { options } = this
    const int = parseInt(value)
    const tabSize = Number.isNaN(int) ? 2 : int
    options.tabSize = tabSize
    this.setOption("indentWidth", tabSize)
    this.setOption("tabSize", tabSize)
    this.setOption("indentUnit", tabSize)
  }
}

const LabelHead = re`[A-Za-z_]`
const LabelTail = re`\w*`
const Spaces = re`\s*`
const Colon = re`\:`
const Rest = re`.*`
const CELL_PATTERN = regex`^(${LabelHead}${LabelTail}${Spaces}${Colon}${Rest})$``gm`

// const CELL_PATTERN = /(^[A-Za-z_]\w*\s*\:.*$)/gm
const Abort = undefined
