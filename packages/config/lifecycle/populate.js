import { Env } from "@vivalence/typology/classes";

export async function env(config) {
  config.check.env("VIVA_CONFIG_DIR")?.throw();
  config.env.assign(await config.read.config.env(config.map.env.systems));
}

export async function services(config) {
  config.env.service = new Env(); //
  const service = await config.read.config.env(config.map.env.service);
  config.env.service.assign(service);
}

export async function secrets(config) {
  if (["SUDO", "DAEMON"].includes(config.env.get("VIVA_SYSTEM_ROLE"))) {
    config.env.secrets = new Env(); //
    const secrets = await config.read.config.env(config.map.env.secrets);
    config.env.secrets.assign(secrets);
  }
}
