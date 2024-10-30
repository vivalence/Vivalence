import { Table } from "jsr:@cliffy/table@1.0.0-rc.7";
import { colors } from "jsr:@cliffy/ansi@1.0.0-rc.7/colors";

const getStatusColor = (status) => {
  if (status.includes("(healthy)")) {
    return colors.green(status);
  }
  if (status.includes("(unhealthy)")) {
    return colors.red(status);
  }
  if (status.includes("Up")) {
    return colors.blue(status);
  }
  if (status.includes("Restarting")) {
    return colors.yellow(status);
  }
  return colors.gray(status);
};

const formatPorts = (ports) => {
  if (!ports) return "";
  return ports
    .split(", ")
    .map((port) => {
      if (port.startsWith("0.0.0.0")) {
        return colors.green(port);
      }
      return colors.gray(port);
    })
    .join("\n");
};

const truncate = (str, length = 15) => {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
};

export const formatDockerPs = (containers) => {
  const table = new Table()
    .header([
      colors.bold("Container ID"),
      colors.bold("Name"),
      colors.bold("Image"),
      colors.bold("Status"),
      colors.bold("Ports"),
    ])
    .border(true)
    .padding(1);

  containers.forEach((container) => {
    table.push([
      colors.dim(truncate(container.id, 12)),
      colors.white(container.name || ""),
      colors.cyan(truncate(container.image, 25)),
      getStatusColor(container.status),
      formatPorts(container.ports),
    ]);
  });

  return table.toString();
};

export default formatDockerPs;
