import { join } from "@std/path";
import config from "@vivalence/config";

const ROOT_DIR = config.env.get("VIVA_SCHEMA_ROOT_DIR");
await Deno.mkdir(join(ROOT_DIR, "./dist"), { recursive: true });

export const prismaPath = join(ROOT_DIR, "./dist/schema.prisma");
export const prismaRootDir = join(ROOT_DIR, "./src/schema");
