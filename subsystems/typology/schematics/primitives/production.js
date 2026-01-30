const ProductionSignal = Type.Union(
  [
    //
    Type.Literal("BATCH"),
    Type.Literal("COMPLETED"),
  ],
  {
    description:
      "machine-readable signal codes for coordination of production processes",
  },
);

export const ProductionSeekRequest = Type.Object(
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
