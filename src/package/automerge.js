// @ts-ignore
import Automerge from "../../node_modules/automerge/dist/automerge.js"
// @ts-ignore - no types
import * as AutomergeWASMBackend from "../../node_modules/@gozala/automerge-backend-wasm/index.js"
Automerge.setDefaultBackend(AutomergeWASMBackend)

export const setup = AutomergeWASMBackend.setup
export default Automerge
