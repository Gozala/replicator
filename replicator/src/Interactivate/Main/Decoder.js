import * as Decoder from "../../../modules/Decoder/Decoder.js"
import { the } from "../../../modules/Data/Basic.js"

export const save = Decoder.ok({
  message: {
    tag: the("save"),
    value: the(true),
  },
})
