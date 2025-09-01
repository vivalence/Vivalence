import { Type } from "@sinclair/typebox";

export const FilePath = Type.String({
  description: "File system path to a file",
});

export const DirectoryPath = Type.String({
  description: "File system path to a directory",
});

export const RelativePath = Type.String({
  pattern: "^[^/].*$",
  description: "Relative file system path",
});
