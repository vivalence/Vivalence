import { Table } from "jsr:@cliffy/table@1.0.0-rc.7";
import { colors } from "jsr:@cliffy/ansi@1.0.0-rc.7/colors";

// Shared utilities
const truncate = (str, length = 15) => {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
};

const formatCommand = (command) => {
  if (!command) return "";
  return command
    .replace(/^"docker-entrypoint\.sh\s/, "")
    .replace(/^"/, "")
    .replace(/"$/, "")
    .replace(/^\/bin\/sh -c /, "");
};

// Docker ps formatting
const getContainerStateColor = (status) => {
  if (status.includes("(healthy)")) return colors.green(status);
  if (status.includes("(unhealthy)")) return colors.red(status);
  if (status.includes("Up")) return colors.blue(status);
  if (status.includes("Restarting")) return colors.yellow(status);
  if (status.includes("Exited")) return colors.red(status);
  return colors.gray(status);
};

const formatPorts = (ports) => {
  if (!ports) return "";
  return ports
    .split(", ")
    .map((port) => {
      if (port.startsWith("0.0.0.0")) return colors.green(port);
      if (port.includes("->")) return colors.blue(port);
      return colors.gray(port);
    })
    .join("\n");
};

// Docker ps table
const dockerPsToTable = (containers) => {
  const table = new Table()
    .header([
      colors.bold("Container ID"),
      colors.bold("Name"),
      colors.bold("Status"),
      colors.bold("Image"),
      colors.bold("Ports"),
      colors.bold("Command"),
    ])
    .border(true)
    .padding(1);

  containers.forEach((container) => {
    table.push([
      colors.dim(truncate(container.id, 12)),
      colors.white(container.name || ""),
      getContainerStateColor(container.status),
      colors.cyan(truncate(container.image, 25)),
      formatPorts(container.ports),
      colors.dim(truncate(container.command, 25)),
    ]);
  });

  return "\n" + table.toString() + "\n";
};

// Docker Compose ps formatting
const getComposeStateColor = (state) => {
  const stateStr = state.toLowerCase();
  if (stateStr.includes("healthy")) return colors.green(state);
  if (stateStr.includes("running")) return colors.green(state);
  if (stateStr.includes("exited")) return colors.red(state);
  if (stateStr.includes("restarting")) return colors.yellow(state);
  if (stateStr.includes("created")) return colors.blue(state);
  return colors.gray(state);
};

const formatComposePorts = (ports) => {
  if (!ports) return "";
  return ports
    .split(", ")
    .map((port) => {
      if (port.includes("published")) return colors.green(port);
      if (port.includes("exposed")) return colors.blue(port);
      return colors.gray(port);
    })
    .join("\n");
};

// Docker Compose ps table
const composePsToTable = (containers) => {
  const table = new Table()
    .header([
      colors.bold("Name (container)"),
      colors.bold("Name (service)"),
      colors.bold("Status"),
      colors.bold("Image"),
      colors.bold("Ports"),
      colors.bold("Command"),
    ])
    .border(true)
    .padding(1);

  containers.forEach((container) => {
    table.push([
      colors.white(container.nameContainer || ""),
      colors.cyan(container.nameService || ""),
      getComposeStateColor(container.status),
      colors.white(container.image || ""),
      formatComposePorts(container.ports),
      colors.dim(truncate(container.command, 25)),
    ]);
  });

  return "\n" + table.toString() + "\n";
};

export { dockerPsToTable, composePsToTable };
