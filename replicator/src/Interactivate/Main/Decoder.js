// @flow strict

import * as Decoder from "../../../modules/Decoder.flow/Decoder.js"

export const save = Decoder.ok({
  message: {
    tag: "save",
    value: true,
  },
})
