import * as Decoder from "../../../modules/Decoder/Decoder.js"
import { the } from "../../../modules/Data/Basic.js"

export const change = Decoder.form({
  message: Decoder.form({
    tag: Decoder.ok(the("change")),
    value: Decoder.field("detail", Decoder.Text),
  }),
})

const direction = Decoder.or(Decoder.the(-1), Decoder.the(1))
export const escape = Decoder.form({
  message: Decoder.form({
    tag: Decoder.ok(the("leave")),
    value: Decoder.at(["detail", "dir"], direction),
  }),
})

export const focus = Decoder.ok({ message: { tag: the("focus") } })
export const split = Decoder.ok({ message: { tag: the("split") } })

export const remove = Decoder.form({
  message: Decoder.form({
    tag: Decoder.ok(the("remove")),
    value: Decoder.field("detail", direction),
  }),
})
