import { Env, Path } from "@vivalence/typology";
//+ await import("@vivalence/vip");

export async function env(config) {
  // read env
  const dotenv = await import("@std/dotenv");
  if (Deno.env.has("VIVA_ENV_FILE")) {
    const envPath = Deno.env.get("VIVA_ENV_FILE");
    config.env.assign(await dotenv.load({ envPath }));
  }

  // fallback to repo .env
  const checked = config.check.env([
    "VIVA_REPOSITORY_MOUNT",
    "VIVA_TILDE_MOUNT",
    "VIVA_VIP_MOUNT",
  ]);
  if (checked?.length > 0) {
    const ROOT_OFFSET = "../../../.env";
    const envPath = new URL(ROOT_OFFSET, import.meta.url).pathname;
    const env = await dotenv.load({ envPath });
    config.env.assign(env);
  }

  // read os/global env
  for (const [key, value] of Object.entries(Deno.env.toObject())) {
    if (key.startsWith("VIVA_")) {
      config.env.set(key, value);
    }
  }
}

export async function environment(config) {
  config.check.env("VIVA_TILDE_MOUNT")?.throw();

  const apply = (env) => async (path) =>
    env.assign(await config.read.json(path));

  const allJsonFiles = await config.find.json(config.join.variant.env());

  await Promise.all([
    apply(config.secret)(
      allJsonFiles.find((file) => file.absolute.includes("secrets.json")),
    ),
    ...allJsonFiles
      .filter((file) => !file.absolute.includes("secrets.json"))
      .map(apply(config.env)),
  ]);

  return config;
}

// export async function repository(config) {
//   config.repository = {
//     mount: new Path(config.env.get("VIVA_REPOSITORY_MOUNT")),
//   };

//   //   const rootDir = config.env.get("VIVA_REPOSITORY_MOUNT");
//   //   const importmap = JSON.parse(await Deno.readTextFile(rootDir + "/import_map.json"),);
//   //   config.repository. importmap= importmap
// }

export async function repository(config) {
  config.repository = {
    mount: new Path(config.env.get("VIVA_REPOSITORY_MOUNT")),
    importmap: await config.read.json(
      config.join.repository("import_map.json"),
    ),
  };
}

export async function registry(config) {
  const { Vip } = await import("@vivalence/vip");
  config.vip = new Vip(config);
  (async () =>
    await config.vip.mount(new Path(config.env.get("VIVA_VIP_MOUNT"))))();
}

export async function modeselector(config) {
  let { VIVA_SYSTEM_MODE, VIVA_SYSTEM_ROLE } = config.env.vars;

  config.mode = VIVA_SYSTEM_MODE;
  config.role = VIVA_SYSTEM_ROLE;

  config.is = {
    build: VIVA_SYSTEM_MODE === "BUILD",
    dev: VIVA_SYSTEM_MODE === "DEVELOPMENT",
    prod: VIVA_SYSTEM_MODE === "PRODUCTION",
  };
}

export async function statements(config) {
  const directories = [
    config.env.get("VIVA_REPOSITORY_MOUNT"),
    config.env.get("VIVA_TILDE_MOUNT"),
    config.env.get("VIVA_VIP_MOUNT"),
  ];

  for (const dir of directories) {
    console.log("!state", dir);
    // await config.state.path(dir);
  }
}

export async function questions(config) {
  config.check
    .path([
      config.env.get("VIVA_REPOSITORY_MOUNT"),
      config.env.get("VIVA_TILDE_MOUNT"),
      config.env.get("VIVA_VIP_MOUNT"),
    ])
    ?.throw();
}
