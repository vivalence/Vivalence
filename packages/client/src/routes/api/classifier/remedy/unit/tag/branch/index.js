const path = ["branch"];

async function required({ context }) {
    // return
}
async function forbidden({ context }) {
    // return
}
async function invalid({ context }) {
    // return
}

export default {
    handlers: { required, forbidden, invalid },
    path,
    children: []
};
