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
