import { dirname, fromFileUrl, join } from "$std/path/mod.ts";

export default async function (config) {
  const services = {
    ...config.services,
    supabase: "@vivalence/service/supabase",
    db: "@vivalence/service/db",
    identity: "@vivalence/service/identity",
  };

  config.services = services;
  return config;
}
