import * as Observable from "../../modules/notebook-inspector/index.js"
// import Style from "./InspectBlock.css.js"

/**
 * @template T
 * @typedef {import('./Inspect').Inspectors<T>} Inspectors
 */

/**
 * @template T
 */
export default class InpectBlock extends HTMLElement {
  /*::
  root:ShadowRoot
  isConnected:boolean
  select:HTMLSelectElement
  state:?{value:a, inspectors:Inspectors<a>}
  output:?HTMLElement
  inspectors:Inspectors<a>
  inspections:{[string]:{node:HTMLElement, inspector:Inspection<a>}}
  options:{[string]:HTMLOptionElement}
  activeInspector:?{node:HTMLElement, inspector:Inspection<a>}
  handleEvent:Event => mixed
  */
  constructor() {
    super()
    this.root = this.attachShadow({ mode: "open", delegatesFocus: true })
    this.state = null
    this.inspectors = {}
    this.inspections = {}
    this.options = {}
    this.activeInspector = null
  }
  async connectedCallback() {
    const document = this.ownerDocument
    // const style = document.createElement("style")
    // style.textContent = Style
    const style = document.createElement('link')
    style.setAttribute('rel', 'stylesheet');
    style.setAttribute('href', new URL("./InspectBlock.css", import.meta.url))

    const select = document.createElement("select")
    this.select = select
    select.className = "selector"
    this.root.appendChild(select)

    this.root.appendChild(style)
    this.root.addEventListener("change", this)
    const { state } = this
    if (state != null) {
      this.state = null
      this.update(state)
    }
  }
  /**
   * @param {Event} event
   */
  handleEvent(event) {
    switch (event.type) {
      case "change": {
        this.onChange()
      }
    }
  }
  onChange() {
    const { state } = this
    if (state) {
      this.updateValue(state.value)
    }
  }

  /**
   * @param {T} value
   */
  set target(value) {
    if (this.isConnected) {
      const { state } = this
      if (!state || state.value !== value) {
        this.update({ value, inspectors: inspectorsFor(value) })
      }
    } else if (value !== undefined) {
      this.state = { value, inspectors: inspectorsFor(value) }
    }
  }
  /**
   *
   * @param {{value:T, inspectors:Inspectors<T>}} newState
   */
  update(newState /*:{value:a, inspectors:Inspectors<a>}*/) {
    const { select, state, inspectors, inspections, options } = this
    this.state = newState
    if (state == null) {
      const document = this.ownerDocument
      const newInspector = newState.inspectors
      for (const name of Object.keys(newInspector)) {
        const option = select.appendChild(document.createElement("option"))
        option.value = name
        option.textContent = name
        inspectors[name] = newInspector[name]
        options[name] = option
      }

      this.updateValue(newState.value)
    } else {
      const { inspectors: oldInspectors, value: oldValue } = state
      const { inspectors: newInspectors, value: newValue } = newState
      if (oldInspectors != newInspectors) {
        for (const name of Object.keys(newInspectors)) {
          const newInspector = newInspectors[name]
          const oldInspector = inspectors[name]
          if (oldInspector == null) {
            const option = select.appendChild(document.createElement("option"))
            option.value = name
            option.textContent = name
            inspectors[name] = newInspector
            options[name] = option
          } else if (oldInspector !== newInspector) {
            const inspection = inspections[name]
            delete inspections[name]
            inspectors[name] = newInspector
            if (inspection) {
              inspection.node.remove()
            }
          }
        }

        for (const name of Object.keys(oldInspectors)) {
          if (newInspectors[name] == null) {
            const inspection = inspections[name]
            const option = options[name]
            delete inspections[name]
            delete inspectors[name]
            delete options[name]
            if (inspection) {
              inspection.node.remove()
            }
            if (option) {
              option.remove()
            }
          }
        }
      }

      if (oldValue !== newValue) {
        this.updateValue(newValue)
      }
    }
  }

  /**
   * @param {T} value
   */
  updateValue(value) {
    const {
      select,
      inspectors,
      inspections,
      activeInspector,
      ownerDocument,
    } = this
    const name = select.value
    const inspector = inspectors[name]
    if (inspector) {
      const inspection = inspections[name]
      if (inspection) {
        this.activeInspector = inspection
        inspection.inspector.send(value)
        inspection.node.classList.add("selected")
      } else {
        const inspection = inspector.spawn(value, ownerDocument)
        const node = ownerDocument.createElement("section")
        node.appendChild(inspection.render())
        node.classList.add("selected")
        const activeInspector = { node, inspector: inspection }
        inspections[name] = activeInspector
        this.root.appendChild(node)
        this.activeInspector = activeInspector
      }

      if (activeInspector && activeInspector !== this.activeInspector) {
        activeInspector.node.classList.remove("selected")
      }
    }
  }
}

/*::

*/

const inspectors = Symbol.for("inspectors")
const inspectorsFor = /*::<a>*/ (value /*:a*/) /*:Inspectors<a>*/ => {
  const $inspectors /*:any*/ = inspectors
  const $value /*:any*/ = value
  const ownInspectors = $value && $value[$inspectors]
  if (ownInspectors && typeof ownInspectors === "object") {
    return { ...ownInspectors, ...baseInspectors }
  } else {
    return baseInspectors
  }
}

class ValueInspection extends Observable.Inspector {
  static spawn(
    value /*:mixed*/,
    document /*:Document*/
  ) /*:Inspection<mixed>*/ {
    const inspection = new ValueInspection(document.createElement("output"))
    inspection.send(value)
    return inspection
  }
  /*::
  node:Element
  */
  constructor(node /*:Element*/) {
    super(node)
    this.node = node
  }
  send(value /*:mixed*/) /*:void*/ {
    if (value instanceof Error) {
      this.rejected(value)
    } else {
      this.fulfilled(value)
    }
  }
  render() /*:Element*/ {
    return this.node
  }
}

/** @type {Inspectors<any>} */
const baseInspectors = { Inspector: ValueInspection }

const plain = (formattedValue, type) => {
  const code = document.createElement("code")
  code.className = `${type}`
  code.textContent = formattedValue
  return code
}
