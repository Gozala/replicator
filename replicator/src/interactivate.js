// @flow strict

import { spawn } from "../modules/reflex/src/Application.js"
import * as Main from "./Interactivate/Main.js"

window.main = spawn(Main, window.main, window.document)
