import { specimen, is, Pattern, Signal, v } from "@vivalence/typology";

specimen.describe("Signature", () => {
  specimen.it("a route grows and knows itself", () => {
    const route = new Pattern("/users/have/:many");
    specimen.expect(is.pattern(route)).toBeTruthy();
    specimen.expect(is.signature(route)).toBeTruthy();
    specimen.expect(route.nature).toBe("users");
    specimen.expect(route.type).toBe("literal");
    specimen.expect(is.fn(route.filter)).toBeTruthy();
    specimen.expect(is.string(route.hash)).toBeTruthy();

    const id = route.fin.branch(":id");
    const profile = id.branch("profile");
    specimen.expect(profile.trace).toBe(id);
    specimen.expect(profile.root).toBe(route);
    specimen.expect(route.fin).toBe(profile);
    specimen.expect(route.array.length).toBe(5);
    specimen.expect(route.array.every(is.signature)).toBeTruthy();

    specimen.expect(route.index).toBe(0);
    specimen.expect(profile.index).toBe(4);
    specimen.expect(route.depth).toBe(4);
    specimen.expect(profile.depth).toBe(0);

    specimen.expect(new Pattern("/users/:id/*").json).toEqual({
      pattern: "/users/:id/*",
      parts: ["users", ":id", "*"],
      types: ["literal", "parameter", "wildcard"],
    });
  });

  specimen.it("a route matches a request", () => {
    const route = new Pattern("/users/:id/profile");
    const request = new Signal("/users/123/profile");

    const [users, id, profile] = [route, route.gauges[0], route.gauges[0].gauges[0]];
    const [uSignal, iSignal, pSignal] = [request, request.gauges[0], request.gauges[0].gauges[0]];

    specimen.expect(users.apply(uSignal)?.nature).toBe("users");
    specimen.expect(id.apply(iSignal)?.parameters?.id).toBe("123");
    specimen.expect(profile.apply(pSignal)).toBeTruthy();

    specimen.expect(new Pattern("*").apply(new Signal("anything"))?.nature).toBe("anything");
    specimen.expect(new Pattern("users").apply(new Signal("posts"))).toBe(null);
  });

  specimen.it("a descriptor authors a route", () => {
    const input = v.object({ limit: v.number(), recall: v.string() });
    const authored = new Pattern({ nature: "/users/:id", input, valence: "fetch user" });
    specimen.expect(authored.nature).toBe("users");
    specimen.expect(authored.fin.nature).toBe(":id");
    specimen.expect(authored.fin.input).toBe(input);
    specimen.expect(authored.fin.valence).toBe("fetch user");
    specimen.expect(authored.apply(new Signal("users"))?.nature).toBe("users");

    let received;
    const functional = new Pattern((s) => {
      received = s;
      return { nature: "/emit/literal", input, valence: "fetch items" };
    });
    specimen.expect(received).toBe(Pattern);
    specimen.expect(functional.nature).toBe("emit");
    specimen.expect(functional.fin.nature).toBe("literal");
    specimen.expect(functional.fin.input).toBe(input);

    const single = new Pattern({ nature: "/feed", input });
    specimen.expect(single.nature).toBe("feed");
    specimen.expect(single.input).toBe(input);
  });
});
