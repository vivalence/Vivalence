import { handleValidationError } from "./registry.js";
import "./install.js";

export default async function remedy(issue, locals) {
    return await handleValidationError(issue, locals);
}
