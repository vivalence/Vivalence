import paladin from "@vivalence/paladin"

export function buildRuntimeEnv(variantPath) {
  const env = {}

  for (const [key, value] of Object.entries(paladin.env.vars ?? {})) {
    if (value === undefined || value === null) continue
    env[key] = String(value)
  }

  env.VIVA_SYSTEM_ROLE = "RUNTIME"
  env.VIVA_REPOSITORY_MOUNT = paladin.scope.repository?.absolute ?? env.VIVA_REPOSITORY_MOUNT
  env.VIVA_VARIANT_MOUNT = variantPath

  const home = Deno.env.get("HOME")
  const path = Deno.env.get("PATH")
  if (home) env.HOME = home
  if (path) env.PATH = path

  return env
}
