import * as Decoder from "../../../modules/Decoder.flow/Decoder.js"

const Direction = Decoder.or(Decoder.match(-1), Decoder.match(1))

export const change = Decoder.form({
  message: Decoder.form({
    tag: Decoder.ok("change"),
    value: Decoder.field("detail", Decoder.String),
  }),
})

export const escape = Decoder.form({
  message: Decoder.form({
    tag: Decoder.ok("leave"),
    value: Decoder.at(["detail", "dir"], Direction),
  }),
})

export const focus = Decoder.ok({ message: { tag: "focus" } })
export const split = Decoder.ok({ message: { tag: "split" } })
export const remove = Decoder.form({
  message: Decoder.form({
    tag: Decoder.ok("remove"),
    value: Decoder.field("detail", Direction),
  }),
})
// decoder((event /*:Event*/) => {
//   const detail = readProperty(String, "detail", event)
//   const message = Inbox.change(detail)
//   return { message }
// })
