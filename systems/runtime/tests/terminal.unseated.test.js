import { specimen } from "@vivalence/typology"
import { datamap } from "@vivalence/runtime/scenarios"
import { TerminalEntity, ThreadEntity } from "@vivalence/runtime"

specimen.describe("a thread's delete unseats every terminal holding it", () => {
  specimen.it("the terminal rows read null and the twitch broadcasts /after/terminal/update", async () => {
    const { em, twitch, fixtures, repos } = await datamap.seed()
    const thread = em.create(ThreadEntity, { user: fixtures.user.id, mode: fixtures.mode.id, traits: [] })
    await em.flush()
    const seated = em.create(TerminalEntity, { user: fixtures.user.id, thread: thread.id, index: 1 })
    const free = em.create(TerminalEntity, { user: fixtures.user.id, index: 2 })
    await em.flush()
    const updated = []
    twitch.open("/after/terminal/update", (ctx) => { updated.push(ctx.input.entity.id) })
    await repos.thread.removeOne({ id: thread.id })
    em.clear()
    const rows = await em.getRepository(TerminalEntity).find({ index: { $in: [1, 2] } }, { orderBy: { index: "ASC" } })
    specimen.expect(rows.map((row) => row.thread)).toEqual([null, null])
    specimen.expect(updated).toEqual([seated.id])
    specimen.expect(free.id).not.toBe(seated.id)
  })
})

const framed = async () => {
  const { em, twitch, fixtures, repos } = await datamap.seed()
  const thread = em.create(ThreadEntity, { user: fixtures.user.id, mode: fixtures.mode.id, traits: [] })
  const other = em.create(ThreadEntity, { user: fixtures.user.id, mode: fixtures.mode.id, traits: [] })
  await em.flush()
  const buffer = await repos.buffer.create({ thread: thread.id, mode: fixtures.mode.id, data: {} })
  const sibling = await repos.buffer.create({ thread: thread.id, mode: fixtures.mode.id, data: {} })
  await em.flush()
  const terminal = em.create(TerminalEntity, { user: fixtures.user.id, thread: thread.id, buffer: buffer.id, index: 1 })
  await em.flush()
  const read = async () => {
    em.clear()
    const held = await em.getRepository(TerminalEntity).findOneOrFail({ id: terminal.id })
    return { thread: held.thread === null ? null : held.thread.id, buffer: held.buffer === null ? null : held.buffer.id }
  }
  const updated = []
  twitch.open("/after/terminal/update", (ctx) => { updated.push(ctx.input.entity.id) })
  em.clear()
  return { em, repos, thread, other, buffer, sibling, terminal, read, updated }
}

specimen.describe("a terminal's buffer is a buffer of its thread, or null", () => {
  specimen.it("the buffer persists on the terminal and reads back", async () => {
    const world = await framed()
    specimen.expect(await world.read()).toEqual({ thread: world.thread.id, buffer: world.buffer.id })
  })

  specimen.it("a buffer's delete clears the frame of the terminal holding it", async () => {
    const world = await framed()
    await world.repos.buffer.removeOne({ id: world.buffer.id })
    specimen.expect(await world.read()).toEqual({ thread: world.thread.id, buffer: null })
    specimen.expect(world.updated).toEqual([world.terminal.id])
  })

  specimen.it("a thread's delete clears the thread and the frame", async () => {
    const world = await framed()
    await world.repos.thread.removeOne({ id: world.thread.id })
    specimen.expect(await world.read()).toEqual({ thread: null, buffer: null })
    specimen.expect(world.updated).toEqual([world.terminal.id])
  })

  specimen.it("a move to another buffer of the same thread keeps the frame", async () => {
    const world = await framed()
    await world.repos.terminal.updateOne({ id: world.terminal.id }, { buffer: world.sibling.id })
    specimen.expect(await world.read()).toEqual({ thread: world.thread.id, buffer: world.sibling.id })
  })

  specimen.it("a move to another thread drops the old thread's buffer", async () => {
    const world = await framed()
    await world.repos.terminal.updateOne({ id: world.terminal.id }, { thread: world.other.id })
    specimen.expect(await world.read()).toEqual({ thread: world.other.id, buffer: null })
  })
})
