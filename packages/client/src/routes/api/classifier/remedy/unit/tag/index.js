import branchChild from "./branch";

const path = ["tag"];

// async function required({ context }) {
//     // return
// }
// async function forbidden({ context }) {
//     // return
// }
// async function invalid({ context }) {
//     // return
// }

export default {
    handlers: {},
    path,
    children: [branchChild]
};
