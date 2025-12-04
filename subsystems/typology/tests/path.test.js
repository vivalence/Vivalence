import { specimen, is, Path } from "@vivalence/typology";

specimen.describe("Path", () => {
  let path;

  specimen.describe("construction", () => {
    specimen.describe("from string", () => {
      specimen.it("normalizes path", () => {
        path = new Path("/users/profile");
        specimen.expect(path.nature).toBe("/users/profile");
      });

      specimen.it("adds leading slash", () => {
        path = new Path("users/profile");
        specimen.expect(path.nature).toBe("/users/profile");
      });

      specimen.it("collapses multiple slashes", () => {
        path = new Path("//users///profile//");
        specimen.expect(path.nature).toBe("/users/profile");
      });

      specimen.it("handles root", () => {
        path = new Path("/");
        specimen.expect(path.nature).toBe("/");
      });

      specimen.it("handles empty", () => {
        path = new Path("");
        specimen.expect(path.nature).toBe("/");
      });
    });

    specimen.describe("from kindred", () => {
      specimen.it("absorbs path instance", () => {
        const original = new Path("/original");
        path = new Path(original);
        specimen.expect(path.nature).toBe("/original");
      });
    });

    specimen.describe("from object", () => {
      specimen.it("assigns properties", () => {
        path = new Path({ nature: "/from/object" });
        specimen.expect(path.nature).toBe("/from/object");
      });
    });

    specimen.describe("gestalt", () => {
      specimen.it("is path", () => {
        path = new Path("/users/profile");
        specimen.expect(is.path(path)).toBeTruthy();
        specimen.expect(is.signature(path)).toBeTruthy();
      });

      specimen.it("coerces to string", () => {
        path = new Path("/users/profile");
        specimen.expect(String(path)).toBe("/users/profile");
        specimen.expect(is.string(path + "")).toBeTruthy();
      });

      specimen.it("maintains legacy segment getter", () => {
        path = new Path("/users/profile");
        specimen.expect(path.segment).toBe("/users/profile");
      });
    });
  });

  specimen.describe("hierarchy", () => {
    specimen.describe("branching", () => {
      specimen.it("creates child with trace", () => {
        const root = new Path("/users");
        const child = root.branch("/profile");
        specimen.expect(child.trace).toBe(root);
        specimen.expect(root.gauges).toContain(child);
      });

      specimen.it("resolves absolute path", () => {
        const root = new Path("/users");
        const child = root.branch("/profile");
        specimen.expect(child.absolute).toBe("/users/profile");
      });

      specimen.it("chains branches", () => {
        const leaf = new Path("/a").branch("/b").branch("/c");
        specimen.expect(leaf.absolute).toBe("/a/b/c");
      });
    });

    specimen.describe("navigation", () => {
      specimen.it("finds tilde (root)", () => {
        const root = new Path("/root");
        const leaf = root.branch("/a").branch("/b");
        specimen.expect(leaf.tilde).toBe(root);
      });

      specimen.it("finds heir (first child)", () => {
        const root = new Path("/root");
        const child = root.branch("/child");
        specimen.expect(root.heir).toBe(child);
      });

      specimen.it("finds fin (deepest descendant)", () => {
        const root = new Path("/root");
        const leaf = root.branch("/a").branch("/b");
        specimen.expect(root.fin).toBe(leaf);
      });
    });

    specimen.describe("metrics", () => {
      specimen.it("computes index (distance from root)", () => {
        const root = new Path("/root");
        const child = root.branch("/child");
        const grandchild = child.branch("/grandchild");

        specimen.expect(root.index).toBe(0);
        specimen.expect(child.index).toBe(1);
        specimen.expect(grandchild.index).toBe(2);
      });

      specimen.it("computes depth (distance to deepest)", () => {
        const root = new Path("/root");
        const child = root.branch("/child");
        const grandchild = child.branch("/grandchild");

        specimen.expect(grandchild.depth).toBe(0);
        specimen.expect(child.depth).toBe(1);
        specimen.expect(root.depth).toBe(2);
      });
    });
  });

  specimen.describe("array construction", () => {
    specimen.it("builds depth from array", () => {
      const path = new Path([
        { nature: "/a" },
        { nature: "/b" },
        { nature: "/c" },
      ]);

      specimen.expect(path.nature).toBe("/a");
      specimen.expect(path.absolute).toBe("/a/b/c");
      specimen.expect(path.depth).toBe(2);
    });
  });
});
// import { specimen, is, Path } from "@vivalence/typology";

// specimen.describe("Path", () => {
//   let path;

//   specimen.describe("construction", () => {
//     specimen.it("cycles", () => {
//       path = new Path("/users/profile");
//     });

//     specimen.describe("gestalt", () => {
//       specimen.it("is", () => {
//         specimen.expect(is.string(path + "")).toBeTruthy();
//         specimen.expect(is.path(path)).toBeTruthy();
//         specimen.expect(is.signature(path)).toBeTruthy();
//       });

//       specimen.it("maintains path semantics", () => {
//         specimen.expect(String(path)).toBe("/users/profile");
//         specimen.expect(path.absolute).toBe("/users/profile");
//       });

//       specimen.it("maintains legacy", () => {
//         specimen.expect(path.segment).toBe("/users/profile");
//       });
//     });

//     specimen.describe("valences", () => {
//       specimen.it("resolves absolute paths", () => {
//         const nested = new Path("documents").branch("file.txt");
//         specimen.expect(nested.absolute).toBe("/documents/file.txt");
//       });
//     });
//   });
// });
// // // specimen
// // import { assert, assertEquals } from "@std/assert";
// // import { describe, it } from "@std/testing/bdd";

// // import { is, Path, Pattern, Signal } from "@vivalence/typology";

// // describe("Path", () => {
// //   let path;

// //   describe("construction", () => {
// //     it("cycles", () => {
// //       path = new Path("/users/profile");
// //     });

// //     describe("gestalt", () => {
// //       it("is", () => {
// //         assert(is.string(path + ""));
// //         assert(is.path(path));
// //         assert(is.signature(path));
// //       });

// //       it("maintains path semantics", () => {
// //         assertEquals(String(path), "/users/profile");
// //         assertEquals(path.absolute, "/users/profile");
// //       });
// //       it("maintains legacy", () => {
// //         assertEquals(path.segment, "/users/profile");
// //       });
// //     });

// //     describe("valences", () => {
// //       it("resolves absolute paths", () => {
// //         const nested = new Path("documents").branch("file.txt");
// //         assertEquals(nested.absolute, "/documents/file.txt");
// //       });
// //     });
// //   });
// // });
