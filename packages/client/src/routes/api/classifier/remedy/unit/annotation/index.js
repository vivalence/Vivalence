import star from "./*.js";

async function conditional(issue, locals) {
    return { resolved: false };
}

export default {
    handlers: { conditional },
    path: ["annotation"],
    children: [star]
};
