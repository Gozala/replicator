import Automerge, { setup } from "./package/automerge.js"

const main = async () => {
  document.body.innerHTML += 'Starting'
  await setup()
  const doc = Automerge.from({ notes: [] })
  console.log(doc)
  document.body.innerHTML = 'Ready'
}

main()
