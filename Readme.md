# Replicator

Replicator is an experiment that attempts to synthesize ideas from [lunet][], [pushpin][], [farm][]. It attempts to build an open-ended, but sandboxed runtime for collaborative programs. It uses [automerge-rs][] to represent
state and enable collaboration.

## General notes

This project uses [performance](https://github.com/automerge/automerge/tree/performance) branch of [automerge][] library, which is backwards incompatible with current version, it uses new [binary data format][] which provides significant improvements and is intended to become `automerge@1.0`.

> At the moment I use my own fork to get a ESM modules as opposed to dealing with bundlers.


This project also uses [automerge-rs][] WASM backend, however it uses `@gozala/automerge-backend-wasm` which is ESM version of the original `automerge-backend-wasm`.



[lunet]:https://gozala.io/work/lunet
[farm]:https://github.com/inkandswitch/farm
[pushpin]:https://automerge.github.io/pushpin/
[automerge]:https://github.com/automerge/
[automerge-rs]:https://github.com/automerge/automerge-rs
[automerge binary data format]:https://github.com/automerge/automerge/blob/performance/BINARY_FORMAT.md
