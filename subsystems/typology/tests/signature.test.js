import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { is, Path, Pattern, Signal } from "@vivalence/typology";

describe("Signature", () => {
  let signature;

  describe("construction", () => {
    it("cycles", () => {
      signature = new Pattern("users");
    });

    describe("gestalt", () => {
      it("is", () => {
        assert(is.signature(signature));
      });

      it("maintains signature properties", () => {
        assert(is.string(signature.signature));
        assert(is.number(signature.index));
        assert(is.number(signature.depth));
        assert(is.string(signature.hash));
        assert(is.array(signature.gauges));
      });
    });
  });

  describe("valences", () => {
    return;
    it("branches signatures", () => {
      const child = signature.branch("profile");
      assert(is.signature(child));
      assertEquals(child.trace, signature);
    });

    it("iterates hierarchy", () => {
      signature.branch("child").branch("grandchild");
      const array = signature.array;
      assertEquals(array.length, 3);
      assert(array.every(is.signature));
    });

    it("navigates ancestry", () => {
      const child = signature.branch("child");
      const grandchild = child.branch("grandchild");
      assertEquals(grandchild.tilde, signature);
      assertEquals(signature.fin, grandchild);
    });
  });
});

describe("Pattern", () => {
  let pattern;

  describe("construction", () => {
    it("cycles", () => {
      pattern = new Pattern("/users/have/:many");
    });

    describe("gestalt", () => {
      it("is", () => {
        assert(is.pattern(pattern), "is.pattern");
        assert(is.signature(pattern), "is.signature");
      });

      it("hashes correctly", () => {
        const patterns = [
          new Pattern("/users/have"),
          new Pattern("/users/somtimes"),
          new Pattern("/what/have/:many"),
        ].map((pattern) => pattern.hash);
        // console.log(patterns);
      });

      it("parses string patterns", () => {
        assertEquals(pattern.signature, "users");
        assertEquals(pattern.type, "literal");
        assert(is.fn(pattern.filter));
        assertEquals(pattern.gauges.length, 1);
      });

      it("maintains hierarchical positioning", () => {
        const child = pattern.branch(":id");
        const grandchild = child.branch("profile");

        assertEquals(pattern.index, 0);
        assertEquals(child.index, 1);
        assertEquals(grandchild.index, 2);
        assertEquals(pattern.depth, 2);
        assertEquals(child.depth, 1);
        assertEquals(grandchild.depth, 0);
      });
    });

    describe("valences", () => {
      it("applies to signals", () => {
        const literalPattern = new Pattern("users");
        const signal = new Signal("users");
        const result = literalPattern.apply(signal);
        assertEquals(result?.signature, "users");
      });

      it("extracts parameters", () => {
        const paramPattern = new Pattern(":id");
        const signal = new Signal("123");
        const result = paramPattern.apply(signal);
        assertEquals(result?.parameters?.id, "123");
      });

      it("handles wildcards", () => {
        const wildPattern = new Pattern("*");
        const signal = new Signal("anything");
        const result = wildPattern.apply(signal);
        assertEquals(result?.signature, "anything");
      });
    });
  });
});

describe("Signal", () => {
  let signal;

  describe("construction", () => {
    it("cycles", () => {
      signal = new Signal("users/123/profile");
    });

    describe("gestalt", () => {
      it("is", () => {
        assert(is.signal(signal));
        assert(is.signature(signal));
      });

      it("parses signal paths", () => {
        assertEquals(signal.signature, "users");
        assertEquals(signal.gauges.length, 1);
      });
    });

    describe("valences", () => {
      it("branches with context", () => {
        const root = new Signal("users");
        const child = root.branch("123");

        assertEquals(child.trace, root);
        assertEquals(child.index, 1);
        assertEquals(root.gauges.length, 1);
      });
    });
  });
});

describe("Path", () => {
  let path;

  describe("construction", () => {
    it("cycles", () => {
      path = new Path("/users/profile");
    });

    describe("gestalt", () => {
      it("is", () => {
        assert(is.string(path + ""));
        assert(is.path(path));
        assert(is.signature(path));
      });

      it("maintains path semantics", () => {
        assertEquals(String(path), "/users/profile");
        assertEquals(path.absolute, "/users/profile");
      });
      it("maintains legacy", () => {
        assertEquals(path.segment, "/users/profile");
      });
    });

    describe("valences", () => {
      it("resolves absolute paths", () => {
        const nested = new Path("documents").branch("file.txt");
        assertEquals(nested.absolute, "/documents/file.txt");
      });
    });
  });
});

// TODO feature

describe("@typology", () => {
  describe("integration", () => {
    describe("(Path, Signal)", () => {
      // it("converts signals to paths", () => {
      //   console.log(`----------------------------------------------`);
      //   const string = "/home/user";
      //   const signal = new Signal(string);
      //   const path = new Path(signal.array);
      //   // const signal = new Signal(new Path(string));
      //   // console.log({ string, path, signal });
      //   console.log(": signal", signal);
      //   console.log(": path", path.absolute);
      //   // console.log("absolute: path", path.absolute);
      //   // console.log("absolute: signal", signal.absolute);
      //   console.log(`----------------------------------------------`);
      //   // assertEquals(path.absolute, "/home/user/documents");
      //   // assert(is.path(path));
      // });
    });

    return;
    describe("(Pattern, Signal)", () => {
      it("matches literal patterns", () => {
        const pattern = new Pattern("users");
        const signal = new Signal("users");
        const result = pattern.apply(signal);

        assert(result);
        assertEquals(result.signature, "users");
      });

      it("matches parameterized patterns", () => {
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

        assert(userMatch);
        assert(idMatch);
        assert(profileMatch);
        assertEquals(idMatch.parameters?.id, "123");
      });

      it("rejects mismatched patterns", () => {
        const pattern = new Pattern("users");
        const signal = new Signal("posts");
        const result = pattern.apply(signal);

        assertEquals(result, null);
      });
    });
    // describe("hierarchy navigation", () => {
    // it("maintains consistent ancestry across types", () => {
    //   const pathRoot = new Path("/api");
    //   const pathChild = pathRoot.branch("users");
    //   const pathGrand = pathChild.branch("123");
    //   const signalRoot = new Signal("api");
    //   const signalChild = signalRoot.branch("users");
    //   const signalGrand = signalChild.branch("123");
    //   // Both should have same hierarchical structure
    //   assertEquals(pathGrand.tilde, pathRoot);
    //   assertEquals(signalGrand.tilde, signalRoot);
    //   assertEquals(pathRoot.fin, pathGrand);
    //   assertEquals(signalRoot.fin, signalGrand);
    // });
    // });
  });
});
