import { carry } from "./fraught.js";

export const MOUNTED = (mode, host) => carry(mode, host, mode.mountpoint.absolute);
