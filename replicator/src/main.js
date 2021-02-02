// import IPFS from "../modules/ipfs-core/index.js"
// import { Application } from "../modules/reflex/src/lib.js"

// const main = async () => {
//   const ipfs = await IPFS.create()
//   console.log(await ipfs.version())
// }

// main()

import { spawn } from "../modules/reflex/src/Application.js"
import * as Main from "./Interactivate/Main.js"

window.main = spawn(Main, window.main || {}, window.document)
