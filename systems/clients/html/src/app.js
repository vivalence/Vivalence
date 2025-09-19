import { env } from "$env/dynamic/public";
import { atom, computed } from "nanostores";

import client from "./typology/lifecycles/client.js";

export const lighthouses = client.remotes.lighthouse.$entities;
