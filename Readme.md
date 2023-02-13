# Replicator

Replicator is an experiment that attempts to build an interactive notebook
similar to [observablehq][], where notebooks are distributed as self contained bundle on [IPFS][] network.

## Vision

Back when I started writing JS it was lot of fun, there were no complicated
tools, no configurations no compilation just a little bit of discipline on
sharing the `global` namespace. You could write some code, put it on the
server and everyone could run it given a URL.

With JS [modules][] supported natively in all modern runtimes and [IPFS][] we
don't need to worry about `global` namespace nor a server to host our modules,
we can just type the code in browser, run it, save it on IPFS network and share
CID (hash based content identifier) so anyone could use it! And because [IPFS][]
is content addressable deduplication is free and smarter runtimes could cache
libraries to reduce amount networking needed.

### Design Overview

Notebook amis to be web-native, which is why it uses native JS modules instead of bundlers. However there are a lot of JS libraries that make enables building this with much less effort, which is why project root
installs them as node dependencies which are then compiled into ES modules
via [esbuild][] and written into application source tree.

#### Deployment

It is assumed that you have `ipfs` in your path and initialized repo, in which
case running `yarn release` will produce output like:

```
$ ipfs add --cid-version=1 --quieter --recursive ./replicator
bafybeidrwvc3jhfccu4qup6a6a7hye446tl3csx3wyt2azzmmmmagexti4
```

That is it you can take that CID and access deployed version either over local
IPFS gateway like <http://localhost:8081/ipfs/bafybeidrwvc3jhfccu4qup6a6a7hye446tl3csx3wyt2azzmmmmagexti4>
or one of the public gateways like https://dweb.link/ipfs/bafybeidrwvc3jhfccu4qup6a6a7hye446tl3csx3wyt2azzmmmmagexti4

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
[modules]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
