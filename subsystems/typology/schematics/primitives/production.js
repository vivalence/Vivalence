export const ProductionSignal = Type.Union(
  [
    Type.Literal("FULFILLED"),
    Type.Literal("EXHAUSTED"),
    Type.Literal("INSUFFICIENT"),
    Type.Literal("DEGRADED"),
    Type.Literal("COMPLETED"),
    Type.Literal("ERROR"),
  ],
  {
    description:
      "machine-readable signal codes for coordination of production processes",
  },
);

export const ProductionRequestSeek = Type.Object(
  {
    // literal,literals,
    // symbol, symbols,
  },
  {},
);
export const ProductionRequest = Type.Object(
  {
    // batch: Int,
    // stock: Int,
    // seek: optional(Seek)
    // scope: optional(Scope)
    // backlist: optional(Blacklist),
  },
  {
    description: `base request sent to a productive trait aperture. may be extended by the specific mode.`,
  },
);

export const ProductionResponse = Type.Object(
  {
    // status: SUCCESS | ERROR | ACTIVE
    // products: Product[],
  },
  {
    description: `response from productive trait.`,
  },
);
