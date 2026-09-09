import { specimen } from "@vivalence/typology";
import { guard, isPrivate } from "../guard.js";

// the resolver is injected, so the whole security boundary tests without DNS.
const resolver = (map) => {
  const asked = [];
  const resolve = (host, kind) => {
    asked.push(`${host}/${kind}`);
    const answer = map[`${host}/${kind}`];
    return answer
      ? Promise.resolve(answer)
      : Promise.reject(new Error("NXDOMAIN"));
  };
  return { resolve, asked };
};

const refused = async (url, resolve) => {
  try {
    await guard(url, resolve);
    return null;
  } catch (error) {
    return error.message;
  }
};

specimen.describe("guard — refused before the request leaves", () => {
  specimen.it("P-scheme: only http and https survive", async () => {
    const { resolve } = resolver({});
    specimen.expect(await refused("file:///etc/passwd", resolve)).toContain(
      "not http(s)",
    );
    specimen.expect(await refused("ftp://example.test/x", resolve)).toContain(
      "not http(s)",
    );
    specimen.expect(await refused("data:text/html,hi", resolve)).toContain(
      "not http(s)",
    );
  });

  specimen.it(
    "P-literal: a private address written out is refused with no lookup",
    async () => {
      const { resolve, asked } = resolver({});
      for (
        const host of [
          "127.0.0.1",
          "10.1.2.3",
          "192.168.0.1",
          "172.16.9.9",
          "169.254.169.254",
          "100.64.0.1",
          "0.0.0.0",
          "localhost",
          "printer.local",
          "[::1]",
        ]
      ) {
        specimen.expect(await refused(`http://${host}/`, resolve)).toContain(
          "not a public address",
        );
      }
      // the point of the assertion: nothing was ever asked, so nothing could answer.
      specimen.expect(asked).toEqual([]);
    },
  );

  specimen.it(
    "P-resolved: a public NAME pointing at a private address is refused",
    async () => {
      const { resolve } = resolver({ "evil.test/A": ["10.0.0.5"] });
      specimen.expect(await refused("https://evil.test/", resolve)).toContain(
        "resolves to a private address",
      );
    },
  );

  specimen.it(
    "P-resolved: one private answer among public ones still refuses",
    async () => {
      const { resolve } = resolver({
        "mixed.test/A": ["93.184.216.34"],
        "mixed.test/AAAA": ["::1"],
      });
      specimen.expect(await refused("https://mixed.test/", resolve)).toContain(
        "resolves to a private address",
      );
    },
  );

  specimen.it(
    "P-resolved: a name that answers nothing is refused, not assumed public",
    async () => {
      const { resolve } = resolver({});
      specimen.expect(await refused("https://nowhere.test/", resolve))
        .toContain("does not resolve");
    },
  );

  specimen.it(
    "a public name resolving to public addresses passes, and returns the URL",
    async () => {
      const { resolve, asked } = resolver({
        "example.test/A": ["93.184.216.34"],
      });
      const target = await guard("https://example.test/page?q=1", resolve);
      specimen.expect(target.href).toBe("https://example.test/page?q=1");
      specimen.expect(asked).toEqual(["example.test/A", "example.test/AAAA"]);
    },
  );

  specimen.it("isPrivate reads addresses, and a public one is not one", () => {
    specimen.expect(isPrivate("93.184.216.34")).toBe(false);
    specimen.expect(isPrivate("2606:2800:220:1:248:1893:25c8:1946")).toBe(
      false,
    );
    specimen.expect(isPrivate("fd00::1")).toBe(true);
    specimen.expect(isPrivate("::ffff:127.0.0.1")).toBe(true);
  });
});
