import { specimen, is, Path, Pattern, Signal, v } from "@vivalence/typology";

specimen.describe("Signature", () => {
  let signature;

  specimen.describe("construction", () => {
    specimen.it("cycles", () => {
      signature = new Pattern("users");
    });

    specimen.describe("gestalt", () => {
      specimen.it("is signature", () => {
        specimen.expect(is.signature(signature)).toBeTruthy();
      });

      specimen.it("maintains signature properties", () => {
        specimen.expect(is.string(signature.nature)).toBeTruthy();
        specimen.expect(is.number(signature.index)).toBeTruthy();
        specimen.expect(is.number(signature.depth)).toBeTruthy();
        specimen.expect(is.string(signature.hash)).toBeTruthy();
        specimen.expect(is.array(signature.gauges)).toBeTruthy();
      });
    });
  });

  specimen.describe("valences", () => {
    specimen.it("branches signatures", () => {
      const child = signature.branch("profile");
      specimen.expect(is.signature(child)).toBeTruthy();
      specimen.expect(child.trace).toBe(signature);
    });

    specimen.it("iterates hierarchy", () => {
      signature = new Pattern("users");
      signature.branch("child").branch("grandchild");

      const array = signature.array;
      specimen.expect(array.length).toBe(3);
      specimen.expect(array.every(is.signature)).toBeTruthy();
    });

    specimen.it("navigates ancestry", () => {
      signature = new Pattern("users");
      const child = signature.branch("child");
      const grandchild = child.branch("grandchild");
      specimen.expect(grandchild.tilde).toBe(signature);
      specimen.expect(signature.fin).toBe(grandchild);
    });
  });
});

specimen.describe("Pattern", () => {
  let pattern;

  specimen.describe("construction", () => {
    specimen.it("cycles", () => {
      pattern = new Pattern("/users/have/:many");
    });

    specimen.describe("gestalt", () => {
      specimen.it("is pattern and signature", () => {
        specimen.expect(is.pattern(pattern)).toBeTruthy();
        specimen.expect(is.signature(pattern)).toBeTruthy();
      });

      specimen.it("hashes correctly", () => {
        const patterns = [
          new Pattern("/users/have"),
          new Pattern("/users/somtimes"),
          new Pattern("/what/have/:many"),
        ].map((pattern) => pattern.hash);

        specimen.expect(patterns.length).toBe(3);
        specimen.expect(patterns.every(is.string)).toBeTruthy();
      });

      specimen.it("parses string patterns", () => {
        specimen.expect(pattern.nature).toBe("users");
        specimen.expect(pattern.type).toBe("literal");
        specimen.expect(is.fn(pattern.filter)).toBeTruthy();
        specimen.expect(pattern.gauges.length).toBe(1);
      });

      specimen.it("maintains hierarchical positioning", () => {
        const child = pattern.branch(":id");
        const grandchild = child.branch("profile");

        specimen.expect(pattern.index).toBe(0);
        specimen.expect(child.index).toBe(1);
        specimen.expect(grandchild.index).toBe(2);
        specimen.expect(pattern.depth).toBe(2);
        specimen.expect(child.depth).toBe(1);
        specimen.expect(grandchild.depth).toBe(0);
      });
    });

    specimen.describe("valences", () => {
      specimen.it("applies to signals", () => {
        const literalPattern = new Pattern("users");
        const signal = new Signal("users");
        const result = literalPattern.apply(signal);
        // console.log({ literalPattern, signal, result });
        specimen.expect(result?.nature).toBe("users");
      });

      specimen.it("extracts parameters", () => {
        const paramPattern = new Pattern(":id");
        const signal = new Signal("123");
        const result = paramPattern.apply(signal);
        specimen.expect(result?.parameters?.id).toBe("123");
      });

      specimen.it("handles wildcards", () => {
        const wildPattern = new Pattern("*");
        const signal = new Signal("anything");
        const result = wildPattern.apply(signal);
        specimen.expect(result?.nature).toBe("anything");
      });
    });
  });
});

specimen.describe("Signal", () => {
  let signal;

  specimen.describe("construction", () => {
    specimen.it("cycles", () => {
      signal = new Signal("users/123/profile");
    });

    specimen.describe("gestalt", () => {
      specimen.it("is signal and signature", () => {
        specimen.expect(is.signal(signal)).toBeTruthy();
        specimen.expect(is.signature(signal)).toBeTruthy();
      });

      specimen.it("parses signal paths", () => {
        specimen.expect(signal.nature).toBe("users");
        specimen.expect(signal.gauges.length).toBe(1);
      });
    });

    specimen.describe("valences", () => {
      specimen.it("branches with context", () => {
        const root = new Signal("users");
        const child = root.branch("123");

        specimen.expect(child.trace).toBe(root);
        specimen.expect(child.index).toBe(1);
        specimen.expect(root.gauges.length).toBe(1);
      });
    });
  });
});

specimen.describe("Pattern descriptor", () => {
  specimen.describe("object form", () => {
    specimen.it("parses nature and attaches valence", () => {
      const input = v.object({ limit: v.number(), recall: v.string() });
      const pattern = new Pattern({ nature: "/users/:id", input, valence: "fetch user" });

      specimen.expect(pattern.nature).toBe("users");
      specimen.expect(pattern.type).toBe("literal");

      const leaf = pattern.fin;
      specimen.expect(leaf.nature).toBe(":id");
      specimen.expect(leaf.input).toBe(input);
      specimen.expect(leaf.valence).toBe("fetch user");
    });

    specimen.it("works with single-segment nature", () => {
      const input = v.object({ limit: v.integer(), where: v.any() });
      const pattern = new Pattern({ nature: "/feed", input });

      specimen.expect(pattern.nature).toBe("feed");
      specimen.expect(pattern.input).toBe(input);
    });

    specimen.it("preserves routing behavior", () => {
      const pattern = new Pattern({ nature: "/users", valence: "list users" });
      const signal = new Signal("users");
      const result = pattern.apply(signal);

      specimen.expect(result).toBeTruthy();
      specimen.expect(result.nature).toBe("users");
    });
  });

  specimen.describe("function form", () => {
    specimen.it("invokes fn with Pattern constructor", () => {
      let received;
      const pattern = new Pattern((s) => {
        received = s;
        return { nature: "/feed", valence: "fetch items" };
      });

      specimen.expect(received).toBe(Pattern);
      specimen.expect(pattern.nature).toBe("feed");
      specimen.expect(pattern.valence).toBe("fetch items");
    });

    specimen.it("attaches input to leaf on multi-segment", () => {
      const input = v.object({ recall: v.string(), gameplay: v.string() });
      const pattern = new Pattern((s) => ({
        nature: "/emit/literal",
        input,
      }));

      specimen.expect(pattern.nature).toBe("emit");
      const leaf = pattern.fin;
      specimen.expect(leaf.nature).toBe("literal");
      specimen.expect(leaf.input).toBe(input);
    });
  });
});

specimen.describe("@typology integration", () => {
  specimen.describe("Pattern + Signal", () => {
    specimen.it("matches literal patterns", () => {
      const pattern = new Pattern("users");
      const signal = new Signal("users");
      const result = pattern.apply(signal);

      specimen.expect(result).toBeTruthy();
      specimen.expect(result.nature).toBe("users");
    });

    specimen.it("matches parameterized patterns", () => {
      const pattern = new Pattern("/users/:id/profile");
      const signal = new Signal("/users/123/profile");

      const userPattern = pattern;
      const idPattern = userPattern.gauges[0];
      const profilePattern = idPattern.gauges[0];

      const userSignal = signal;
      const idSignal = userSignal.gauges[0];
      const profileSignal = idSignal.gauges[0];

      const userMatch = userPattern.apply(userSignal);
      const idMatch = idPattern.apply(idSignal);
      const profileMatch = profilePattern.apply(profileSignal);

      specimen.expect(userMatch).toBeTruthy();
      specimen.expect(idMatch).toBeTruthy();
      specimen.expect(profileMatch).toBeTruthy();
      specimen.expect(idMatch.parameters?.id).toBe("123");
    });

    specimen.it("rejects mismatched patterns", () => {
      const pattern = new Pattern("users");
      const signal = new Signal("posts");
      const result = pattern.apply(signal);

      specimen.expect(result).toBe(null);
    });
  });
});

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// import { assert, assertEquals } from "@std/assert";
// import { describe, it } from "@std/testing/bdd";

// import { is, Path, Pattern, Signal } from "@vivalence/typology";

// describe("Signature", () => {
//   let signature;

//   describe("construction", () => {
//     it("cycles", () => {
//       signature = new Pattern("users");
//     });

//     describe("gestalt", () => {
//       it("is", () => {
//         assert(is.signature(signature));
//       });

//       it("maintains signature properties", () => {
//         assert(is.string(signature.signature));
//         assert(is.number(signature.index));
//         assert(is.number(signature.depth));
//         assert(is.string(signature.hash));
//         assert(is.array(signature.gauges));
//       });
//     });
//   });

//   describe("valences", () => {
//     it("branches signatures", () => {
//       const child = signature.branch("profile");
//       assert(is.signature(child));
//       assertEquals(child.trace, signature);
//     });

//     it("iterates hierarchy", () => {
//       signature.branch("child").branch("grandchild");
//       const array = signature.array;
//       assertEquals(array.length, 3);
//       assert(array.every(is.signature));
//     });

//     it("navigates ancestry", () => {
//       const child = signature.branch("child");
//       const grandchild = child.branch("grandchild");
//       assertEquals(grandchild.tilde, signature);
//       assertEquals(signature.fin, grandchild);
//     });
//   });
// });

// describe("Pattern", () => {
//   let pattern;

//   describe("construction", () => {
//     it("cycles", () => {
//       pattern = new Pattern("/users/have/:many");
//     });

//     describe("gestalt", () => {
//       it("is", () => {
//         assert(is.pattern(pattern), "is.pattern");
//         assert(is.signature(pattern), "is.signature");
//       });

//       it("hashes correctly", () => {
//         const patterns = [
//           new Pattern("/users/have"),
//           new Pattern("/users/somtimes"),
//           new Pattern("/what/have/:many"),
//         ].map((pattern) => pattern.hash);
//         // console.log(patterns);
//       });

//       it("parses string patterns", () => {
//         assertEquals(pattern.signature, "users");
//         assertEquals(pattern.type, "literal");
//         assert(is.fn(pattern.filter));
//         assertEquals(pattern.gauges.length, 1);
//       });

//       it("maintains hierarchical positioning", () => {
//         const child = pattern.branch(":id");
//         const grandchild = child.branch("profile");

//         assertEquals(pattern.index, 0);
//         assertEquals(child.index, 1);
//         assertEquals(grandchild.index, 2);
//         assertEquals(pattern.depth, 2);
//         assertEquals(child.depth, 1);
//         assertEquals(grandchild.depth, 0);
//       });
//     });

//     describe("valences", () => {
//       it("applies to signals", () => {
//         const literalPattern = new Pattern("users");
//         const signal = new Signal("users");
//         const result = literalPattern.apply(signal);
//         assertEquals(result?.signature, "users");
//       });

//       it("extracts parameters", () => {
//         const paramPattern = new Pattern(":id");
//         const signal = new Signal("123");
//         const result = paramPattern.apply(signal);
//         assertEquals(result?.parameters?.id, "123");
//       });

//       it("handles wildcards", () => {
//         const wildPattern = new Pattern("*");
//         const signal = new Signal("anything");
//         const result = wildPattern.apply(signal);
//         assertEquals(result?.signature, "anything");
//       });
//     });
//   });
// });

// describe("Signal", () => {
//   let signal;

//   describe("construction", () => {
//     it("cycles", () => {
//       signal = new Signal("users/123/profile");
//     });

//     describe("gestalt", () => {
//       it("is", () => {
//         assert(is.signal(signal));
//         assert(is.signature(signal));
//       });

//       it("parses signal paths", () => {
//         assertEquals(signal.signature, "users");
//         assertEquals(signal.gauges.length, 1);
//       });
//     });

//     describe("valences", () => {
//       it("branches with context", () => {
//         const root = new Signal("users");
//         const child = root.branch("123");

//         assertEquals(child.trace, root);
//         assertEquals(child.index, 1);
//         assertEquals(root.gauges.length, 1);
//       });
//     });
//   });
// });

// // TODO feature

// describe("@typology", () => {
//   describe("integration", () => {
//     describe("(Path, Signal)", () => {
//       // it("converts signals to paths", () => {
//       //   console.log(`----------------------------------------------`);
//       //   const string = "/home/user";
//       //   const signal = new Signal(string);
//       //   const path = new Path(signal.array);
//       //   // const signal = new Signal(new Path(string));
//       //   // console.log({ string, path, signal });
//       //   console.log(": signal", signal);
//       //   console.log(": path", path.absolute);
//       //   // console.log("absolute: path", path.absolute);
//       //   // console.log("absolute: signal", signal.absolute);
//       //   console.log(`----------------------------------------------`);
//       //   // assertEquals(path.absolute, "/home/user/documents");
//       //   // assert(is.path(path));
//       // });
//     });

//     return;
//     describe("(Pattern, Signal)", () => {
//       it("matches literal patterns", () => {
//         const pattern = new Pattern("users");
//         const signal = new Signal("users");
//         const result = pattern.apply(signal);

//         assert(result);
//         assertEquals(result.signature, "users");
//       });

//       it("matches parameterized patterns", () => {
//         const pattern = new Pattern("/users/:id/profile");
//         const signal = new Signal("/users/123/profile");

//         const userPattern = pattern;
//         const idPattern = userPattern.gauges[0];
//         const profilePattern = idPattern.gauges[0];

//         const userSignal = signal;
//         const idSignal = userSignal.gauges[0];
//         const profileSignal = idSignal.gauges[0];

//         const userMatch = userPattern.apply(userSignal);
//         const idMatch = idPattern.apply(idSignal);
//         const profileMatch = profilePattern.apply(profileSignal);

//         assert(userMatch);
//         assert(idMatch);
//         assert(profileMatch);
//         assertEquals(idMatch.parameters?.id, "123");
//       });

//       it("rejects mismatched patterns", () => {
//         const pattern = new Pattern("users");
//         const signal = new Signal("posts");
//         const result = pattern.apply(signal);

//         assertEquals(result, null);
//       });
//     });
//     // describe("hierarchy navigation", () => {
//     // it("maintains consistent ancestry across types", () => {
//     //   const pathRoot = new Path("/api");
//     //   const pathChild = pathRoot.branch("users");
//     //   const pathGrand = pathChild.branch("123");
//     //   const signalRoot = new Signal("api");
//     //   const signalChild = signalRoot.branch("users");
//     //   const signalGrand = signalChild.branch("123");
//     //   // Both should have same hierarchical structure
//     //   assertEquals(pathGrand.tilde, pathRoot);
//     //   assertEquals(signalGrand.tilde, signalRoot);
//     //   assertEquals(pathRoot.fin, pathGrand);
//     //   assertEquals(signalRoot.fin, signalGrand);
//     // });
//     // });
//   });
// });
