// Welcome, you've found the entry point.
// As a private person, youre allowed to change this file as you see fit, but you /should/ only do this if you know what you're doing and why.

import config from "@vivalence/config";
import registry from "@vivalence/registry";
import { Command, HelpCommand, colors } from "@vivalence/interfaces/cli";

import docker from "./lib/docker/docker.js";
import env from "./lib/env/env.js"; // env file loader / editor. a tool used by the cli to control services.

async function bootstrap(viva) {
  // Windows Service Registration (PowerShell script)
  const registerWindowsService = `
  $serviceName = "MyAppService"
  $exePath = "C:\\Program Files\\MyApp\\service.exe"
  New-Service -Name $serviceName 
              -BinaryPathName $exePath 
              -DisplayName "My App Service" 
              -StartupType Automatic 
              -Description "Runs background processes for MyApp"
  `;
  // macOS Launch Agent (plist)
  const macosLaunchAgent = `<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
  <plist version="1.0">
  <dict>
      <key>Label</key>
      <string>com.myapp.service</string>
      <key>ProgramArguments</key>
      <array>
          <string>/Applications/MyApp.app/Contents/MacOS/service</string>
      </array>
      <key>RunAtLoad</key>
      <true/>
      <key>KeepAlive</key>
      <true/>
      <key>StandardOutPath</key>
      <string>/tmp/myapp.service.log</string>
      <key>StandardErrorPath</key>
      <string>/tmp/myapp.service.error.log</string>
  </dict>
  </plist>`;

  // Linux Systemd Service
  const linuxSystemdService = `[Unit]
  Description=MyApp Background Service
  After=network.target
  [Service]
  Type=simple
  User=myapp
  ExecStart=/usr/local/bin/myapp-service
  Restart=always
  RestartSec=10
  [Install]
  WantedBy=multi-user.target`;
}

async function services(viva) {}

import loadServicesCommands from "./commands/services.js";
import loadSchemaCommands from "./commands/schema.js";
import loadClientCommands from "./commands/client.js";

console.log(`Viva la Vivalence!`);

let viva = {
  input: Deno.args,
  process: null,
  services: null,
  tree: null,
  daemon: null,
  runtimes: null,
};

async function process(viva) {
  // try new process = Deno.run({ cmd: ["deno", "task", ...cmd] });
  //     await process.status();
  function doShutdown(signal) {
    console.log(`Received system hard shutdown. ${signal}, {process.state)`);
    console.log(colors.aqua("viva el fin."));
    Deno.exit(0);
  }
  viva.process = {
    doShutdown: doShutdown,
    runSignal: runListen,
  };

  for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
    Deno.addSignalListener(signal, viva.process.doShutdown);
  }

  return viva;
}

async function tree(viva) {
  console.log("- If the tree dont match it, the daemon catch it.");

  function handleError(err) {
    console.error(err);
    return "Error Handle Return";
  }
  let tree = new Command().name("viva").version("0.0.1");

  tree = tree
    // Viva help should write the helpdocs to the client, and ask the user whats up? and keep the process open for input.
    .command("help", new HelpCommand()) //.global()
    .command("bootstrap", await bootstrap(viva))
    .command("services", await loadServicesCommands(viva))
    .command("schema", await loadSchemaCommands(viva))
    .command("clients", await loadClientCommands(viva))
    .command("run", await runDaemon(viva));

  viva.tree = await tree.error(handleError).parse(viva.input);
  return viva;
}

(async (viva) =>
  await [process, services, tree, (v) => v.process.doShutdown()].reduce(
    (acc, fn) => acc.then(fn),
    Promise.resolve(viva),
  ))(viva);

console.log(`viva el fin.`);

// hell, daemon,
// async function hell(viva) {
//   // if tree.match is UNDER; end viva; // treerootmatch === true
//   // if tree.match is OVER; pass to daemon; // treerootmatch === false
// }
// async function daemon(viva) {
//   console.log("- the daemon catch it.");
//   return viva;
// }
