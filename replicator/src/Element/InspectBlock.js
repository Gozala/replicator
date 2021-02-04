import { Inspector } from "../../modules/observable.js"
import * as Inspect from "./Inspect.js"

/**
 * @template T
 */
export default class InpectBlock extends HTMLElement {
  constructor() {
    super()
    this.root = this.attachShadow({ mode: "open", delegatesFocus: true })
    /** @type {null|{value:T, inspectors:Inspect.Inspectors<T>}} */
    this.state = null
    /** @type {Inspect.Inspectors<T>} */
    this.inspectors = {}
    /** @type {{[key: string]:{node:HTMLElement, inspector:Inspect.Inspection<T>}}} */
    this.inspections = {}
    /** @type {Record<string, HTMLOptionElement>} */
    this.options = {}
    /** @type {null|{node:HTMLElement, inspector:Inspect.Inspection<T>}} */
    this.activeInspector = null
    /** @type {HTMLSelectElement} */
    this.select
    /** @type {null|HTMLElement} */
    this.output = null

    // /** @type {boolean} */
    // this.isConnected
  }
  async connectedCallback() {
    const document = this.ownerDocument
    // const style = document.createElement("style")
    // style.textContent = Style
    const style = document.createElement("link")
    style.setAttribute("rel", "stylesheet")
    style.setAttribute(
      "href",
      new URL("./InspectBlock.css", import.meta.url).toString()
    )

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
   * @param {{value:T, inspectors:Inspect.Inspectors<T>}} newState
   */
  update(newState) {
    const { select, state, inspectors, inspections, options } = this
    this.state = newState
    if (state == null) {
      const document = this.ownerDocument
      for (const [name, newInspector] of Object.entries(newState.inspectors)) {
        const option = select.appendChild(document.createElement("option"))
        option.value = name
        option.textContent = name
        inspectors[name] = newInspector
        options[name] = option
      }

      this.updateValue(newState.value)
    } else {
      const { inspectors: oldInspectors, value: oldValue } = state
      const { inspectors: newInspectors, value: newValue } = newState
      if (oldInspectors != newInspectors) {
        for (const [name, newInspector] of Object.entries(newInspectors)) {
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

const inspectors = Symbol.for("inspectors")

/**
 * @template T
 * @param {T} value
 * @returns {Inspect.Inspectors<T>}
 */
const inspectorsFor = (value) => {
  /** @type {Inspect.Inspectors<T>|undefined} */
  const ownInspectors = value && Object(value)[inspectors]
  if (ownInspectors && typeof ownInspectors === "object") {
    return { ...ownInspectors, ...baseInspectors }
  } else {
    return baseInspectors
  }
}

/**
 * @template T
 * @extends {Inspector<T>}
 */
class ValueInspection extends Inspector {
  /**
   * @template T
   * @param {T} value
   * @param {Document} document
   * @returns {ValueInspection<T>}
   */
  static spawn(value, document) {
    const inspection = new ValueInspection(document.createElement("output"))
    inspection.send(value)
    return inspection
  }
  /**
   * @param {HTMLElement} node
   */
  constructor(node) {
    super(node)
    this.node = node
  }

  /**
   * @param {T} value
   */
  send(value) {
    if (value instanceof Error) {
      this.rejected(value)
    } else {
      this.fulfilled(value)
    }
  }

  /**
   * @returns {HTMLElement}
   */
  render() {
    return this.node
  }
}

/** @type {Inspect.Inspectors<any>} */
const baseInspectors = { Inspector: ValueInspection }

/**
 *
 * @param {string} formattedValue
 * @param {string} type
 * @returns {HTMLElement}
 */
export const plain = (formattedValue, type) => {
  const code = document.createElement("code")
  code.className = `${type}`
  code.textContent = formattedValue
  return code
}
