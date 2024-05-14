import pos from "./pos";

const path = ["annotation"];

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
    children: [pos]
};
