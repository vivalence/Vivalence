import { specimen, is, fromm, Pattern, Signal } from "@vivalence/typology";

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

      specimen.it("parses slash paths", () => {
        specimen.expect(signal.nature).toBe("users");
        specimen.expect(signal.gauges.length).toBe(1);
        specimen.expect(signal.absolute).toEqual(["users", "123", "profile"]);
      });

      specimen.it("parses space-separated input", () => {
        const spaced = new Signal("lighthouse connect status");
        specimen.expect(spaced.nature).toBe("lighthouse");
        specimen.expect(spaced.absolute).toEqual(["lighthouse", "connect", "status"]);
      });

      specimen.it("parses mixed slash and space", () => {
        const mixed = new Signal("lighthouse/connect status");
        specimen.expect(mixed.absolute).toEqual(["lighthouse", "connect", "status"]);
      });

      specimen.it("parses flags", () => {
        const parameterized = new Signal("lighthouse connect --url http://localhost:3000 --verbose");
        specimen.expect(parameterized.absolute).toEqual(["lighthouse", "connect"]);
        specimen.expect(parameterized.fin.flags).toEqual({
          url: "http://localhost:3000",
          verbose: true,
        });
      });

      specimen.it("parses key=value flags", () => {
        const equals = new Signal("deploy --env=production --port=8080");
        specimen.expect(equals.nature).toBe("deploy");
        specimen.expect(equals.flags).toEqual({
          env: "production",
          port: "8080",
        });
      });

      specimen.it("parses quoted values", () => {
        const quoted = new Signal('emit --message "hello world" --target users');
        specimen.expect(quoted.nature).toBe("emit");
        specimen.expect(quoted.flags).toEqual({
          message: "hello world",
          target: "users",
        });
      });

      specimen.it("parses flags-only signals", () => {
        const bare = new Signal("--verbose --dry-run");
        specimen.expect(bare.nature).toBe(null);
        specimen.expect(bare.flags).toEqual({
          verbose: true,
          "dry-run": true,
        });
      });

      specimen.it("parses short boolean flags", () => {
        const short = new Signal("deploy -v");
        specimen.expect(short.nature).toBe("deploy");
        specimen.expect(short.flags).toEqual({ v: true });
      });

      specimen.it("parses short flags with values", () => {
        const short = new Signal("deploy -p 8080 -e production");
        specimen.expect(short.nature).toBe("deploy");
        specimen.expect(short.flags).toEqual({ p: "8080", e: "production" });
      });

      specimen.it("parses grouped short flags", () => {
        const grouped = new Signal("deploy -vfs");
        specimen.expect(grouped.nature).toBe("deploy");
        specimen.expect(grouped.flags).toEqual({ v: true, f: true, s: true });
      });

      specimen.it("parses short flags with equals", () => {
        const short = new Signal("deploy -p=8080");
        specimen.expect(short.nature).toBe("deploy");
        specimen.expect(short.flags).toEqual({ p: "8080" });
      });

      specimen.it("terminates flags on bare --", () => {
        const terminated = new Signal("run --verbose -- --not-a-flag positional");
        specimen.expect(terminated.absolute).toEqual(["run", "--not-a-flag", "positional"]);
        specimen.expect(terminated.fin.flags).toEqual({ verbose: true });
      });

      specimen.it("treats bare - as positional", () => {
        const dash = new Signal("cat -");
        specimen.expect(dash.absolute).toEqual(["cat", "-"]);
      });

      specimen.it("mixes short and long flags", () => {
        const mixed = new Signal("deploy -v --port 8080 -e=production --dry-run");
        specimen.expect(mixed.nature).toBe("deploy");
        specimen.expect(mixed.flags).toEqual({
          v: true,
          port: "8080",
          e: "production",
          "dry-run": true,
        });
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

      specimen.it("preserves pathname for slash signals", () => {
        const slashed = new Signal("users/123/profile");
        specimen.expect(slashed.pathname).toBe("/users/123/profile");
      });

      specimen.it("produces pathname from spaced signals", () => {
        const spaced = new Signal("lighthouse connect --url http://localhost:3000");
        specimen.expect(spaced.pathname).toBe("/lighthouse/connect");
      });
    });
  });
});

specimen.describe("Signal + Pattern", () => {
  specimen.it("matches literal signals against patterns", () => {
    const pattern = new Pattern("users");
    const signal = new Signal("users");
    const result = pattern.apply(signal);

    specimen.expect(result).toBeTruthy();
    specimen.expect(result.nature).toBe("users");
  });

  specimen.it("rejects mismatched patterns", () => {
    const pattern = new Pattern("users");
    const signal = new Signal("posts");
    const result = pattern.apply(signal);

    specimen.expect(result).toBe(null);
  });

  specimen.it("matches spaced signals against patterns", () => {
    const pattern = new Pattern("/lighthouse/connect");
    const signal = new Signal("lighthouse connect");

    const first = pattern.apply(signal);
    const second = pattern.gauges[0].apply(signal.gauges[0]);

    specimen.expect(first).toBeTruthy();
    specimen.expect(second).toBeTruthy();
  });

  specimen.it("carries flags through pattern matching", () => {
    const pattern = new Pattern("/lighthouse/connect");
    const signal = new Signal("lighthouse connect --url http://localhost:3000");

    const connectSignal = signal.gauges[0];
    specimen.expect(connectSignal.flags).toEqual({ url: "http://localhost:3000" });

    const match = pattern.gauges[0].apply(connectSignal);
    specimen.expect(match).toBeTruthy();
  });
});

specimen.describe("fromm.signal", () => {
  specimen.it("extracts flags from single-segment signal", () => {
    const signal = new Signal("deploy --env production --verbose");
    specimen.expect(fromm.signal(signal).flags).toEqual({
      env: "production",
      verbose: true,
    });
  });

  specimen.it("extracts flags from multi-segment signal", () => {
    const signal = new Signal("lighthouse connect --url http://localhost:3000");
    specimen.expect(fromm.signal(signal).flags).toEqual({
      url: "http://localhost:3000",
    });
  });

  specimen.it("returns empty object when no flags", () => {
    const signal = new Signal("users/123/profile");
    specimen.expect(fromm.signal(signal).flags).toEqual({});
  });

  specimen.it("extracts flags from flags-only signal", () => {
    const signal = new Signal("--verbose --dry-run");
    specimen.expect(fromm.signal(signal).flags).toEqual({
      verbose: true,
      "dry-run": true,
    });
  });
});
