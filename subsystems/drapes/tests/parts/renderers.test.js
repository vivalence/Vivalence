import { specimen } from "@vivalence/typology";
import { parts, screen } from "../scenarios/index.js";
import { WORLDS } from "../../design/worlds.js";

specimen.describe("renderers — Image · Html (Markdown · JsonTree live in journal.test.js)", () => {
  specimen.it("Image is an img with src · alt · fit", () => {
    const rig = screen(() => parts.Image({ src: parts.VIKET, alt: "the viket", fit: "cover" }));
    const image = rig.target.querySelector("img.image");
    specimen.expect(image.getAttribute("src")).toBe(parts.VIKET);
    specimen.expect(image.getAttribute("alt")).toBe("the viket");
    specimen.expect(image.getAttribute("data-fit")).toBe("cover");
    rig.close();
  });

  specimen.it("Html is a sandboxed iframe over srcdoc", () => {
    const rig = screen(() => parts.Html({ html: WORLDS.idle.html, title: "fragment" }));
    const frame = rig.target.querySelector("iframe.html");
    specimen.expect(frame.getAttribute("sandbox")).toBe("");
    specimen.expect(frame.getAttribute("srcdoc")).toBe(WORLDS.idle.html);
    specimen.expect(frame.getAttribute("title")).toBe("fragment");
    rig.close();
  });
});
