const path = ["pos"];

// unit annotation pos required
async function required({ context, locals, path, type }) {
    // 1: get the unit.tag with pos and use that value
    // 2: ask ai for pos. rag all pos tags.
    // 3: return unsolved
}
async function forbidden({ context }) {
    // return
}
async function invalid({ context }) {
    // return
}

export default {
    handlers: {
        required,
        forbidden,
        invalid
    },
    path,
    children: []
};
