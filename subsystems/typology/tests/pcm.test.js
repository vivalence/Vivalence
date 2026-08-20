import { specimen, pcm } from "@vivalence/typology";

specimen.describe("belt.pcm — decode ∘ encode ≈ identity", () => {
  specimen.it("round-trips samples within one quantization step", () => {
    const samples = Float32Array.from([0, 0.5, -0.5, 1, -1, 0.123, -0.987]);
    const out = pcm.decode(pcm.encode(samples));
    specimen.expect(out.length).toBe(samples.length);
    for (let i = 0; i < samples.length; i++) {
      specimen.expect(Math.abs(out[i] - samples[i]) < 1 / 0x7fff).toBe(true);
    }
  });

  specimen.it("clamps beyond full scale", () => {
    const out = pcm.decode(pcm.encode(Float32Array.from([2, -2])));
    specimen.expect(out[0]).toBe(1);
    specimen.expect(out[1]).toBe(-1);
  });

  specimen.it("bytes is identity on bytes and the inverse of base64", () => {
    const raw = Uint8Array.from([1, 2, 255]);
    specimen.expect(pcm.bytes(raw)).toBe(raw);
    specimen.expect([...pcm.bytes(btoa("\x01\x02\xff"))]).toEqual([1, 2, 255]);
  });
});
