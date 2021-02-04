import type { Editor } from "../../modules/codemirror"

export type EventType = "changes" | "cursorActivity"

export type Direction = -1 | 1
export type Unit = "line" | "char"

export type { Editor }
