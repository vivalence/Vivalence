import { Select } from "@cliffy/prompt";

export default class Renderer {
  constructor() {
    this.promptModule = { Select };
  }

  async render(result, currentPath) {
    console.log("\nAvailable paths:");

    const paths = result.paths.map((path, index) => ({
      name: `${index + 1}. ${path}`,
      value: path,
    }));

    if (currentPath !== "/") {
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf("/")) || "/";
      paths.unshift({
        name: "0. .. (Go up)",
        value: parentPath,
      });
    }

    paths.push({
      name: "x. Exit",
      value: "exit",
    });

    const signal = await this.promptModule.Select.prompt({
      message: "Select path to navigate:",
      options: paths,
    });

    return signal;
  }
}
