import { json } from "@sveltejs/kit";
// import enforceUnitOntology from "./
// import discoverMissingUnits from "./

export async function POST({ request, locals }) {
    try {
        // const {} = await request.json();

        // await enforceUnitOntology(locals);
        // await discoverMissingUnits(locals);
        return json({ data: {} });
    } catch (err) {
        console.error(`[VALIDATE ONTOLOGY ERROR /api/classifier/validate/units]`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
