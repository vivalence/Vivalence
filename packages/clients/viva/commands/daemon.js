import { Command } from "jsr:@cliffy/command@1.0.0-rc.7";

export default async function loadServices(viva) {
  const Commands = new Command().description("do things with and to the daemon");
  // .command("status", Status);

  return Commands;
}
