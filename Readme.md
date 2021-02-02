# Replicator

Replicator is an experiment that attempts to build an interactive notebook
similar to [observablehq][], where notebooks are distributed as self contained bundle on [IPFS][] network.

### Design Overview

Notebook amis to be web-native, which is why it uses native JS modules instead of bundlers. However there are a lot of JS libraries that make enables building this with much less effort, which is why project root
installs them as node dependencies which are then compiled into ES modules
via [esbuild][] and written into application source tree.

### Known Issues

Turns out [esbuild][] in some edge cases does not handle `browser` substitutions in `package.json`. Following issues & pull requests
were created to get that resoved. In the meantime git URLs are used
to workaround this in the meantime

- [ ] https://github.com/evanw/esbuild/issues/740
- [ ] https://github.com/libp2p/js-libp2p-websockets/pull/120
- [ ] https://github.com/bcoin-org/bcrypto/pull/58
- [ ] https://github.com/es-shims/globalThis/pull/17
- [x] Node globals polyfilled in `./src/node-globals.js`

[observablehq]: https://observablehq.com/
[ipfs]: https://ipfs.io/
[esbuild]: https://esbuild.github.io/
