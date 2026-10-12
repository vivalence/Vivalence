import { carry } from "./fraught.js";

export const MOUNTED = (mode, context) => carry(mode, context, mode.mountpoint.absolute);
