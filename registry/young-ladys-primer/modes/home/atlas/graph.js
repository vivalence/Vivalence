export const STRAND_COLOR = {
  "strand.print-concepts": "#c4708a",
  "strand.phonemic-awareness": "#d19a5a",
  "strand.phonics": "#6a9bd1",
  "strand.word-reading": "#7ab87a",
  "strand.comprehension": "#a678c4",
};

export const prereqsOf = (concept) => concept.trait.REQUIRES.concepts;

export const strandOf = (concept) => {
  const symbol = concept.symbols.find((s) => s.slug.startsWith("strand."));
  return symbol ? symbol.slug : "strand.print-concepts";
};

export const ageOf = (concept) => {
  const symbol = concept.symbols.find((s) => s.slug.startsWith("age."));
  return symbol ? symbol.slug : null;
};

export function closureOf(slug, bySlug, seen = new Set()) {
  const concept = bySlug.get(slug);
  if (!concept) return seen;
  for (const prereq of prereqsOf(concept)) {
    if (!seen.has(prereq)) {
      seen.add(prereq);
      closureOf(prereq, bySlug, seen);
    }
  }
  return seen;
}

export function buildOption(concepts, strands, settings = {}) {
  const hidden = settings.hidden ?? new Set();
  const selectedSlug = settings.selected ?? null;

  const bySlug = new Map(concepts.map((concept) => [concept.slug, concept]));
  const categories = strands.map((strand) => ({
    name: strand.trait.LABELED.name,
    itemStyle: { color: STRAND_COLOR[strand.slug] },
  }));
  const categoryIndex = new Map(strands.map((strand, index) => [strand.slug, index]));

  const visible = concepts.filter((concept) => !hidden.has(strandOf(concept)));
  const visibleSlugs = new Set(visible.map((concept) => concept.slug));

  const focus = selectedSlug ? new Set([selectedSlug, ...closureOf(selectedSlug, bySlug)]) : null;

  const nodes = visible.map((concept) => {
    const strand = strandOf(concept);
    const prereqCount = closureOf(concept.slug, bySlug).size;
    const lit = focus ? focus.has(concept.slug) : true;
    return {
      id: concept.slug,
      name: concept.trait.LABELED.name,
      slug: concept.slug,
      description: concept.trait.LABELED.description,
      strand,
      age: ageOf(concept),
      prereqCount,
      value: prereqCount,
      category: categoryIndex.get(strand) ?? 0,
      symbolSize: 14 + Math.sqrt(prereqCount) * 7,
      itemStyle: {
        color: STRAND_COLOR[strand],
        opacity: lit ? 1 : 0.1,
        shadowBlur: lit ? 16 : 0,
        shadowColor: STRAND_COLOR[strand],
        borderColor: concept.slug === selectedSlug ? "#ffffff" : "transparent",
        borderWidth: concept.slug === selectedSlug ? 2 : 0,
      },
      label: { show: !!focus && focus.has(concept.slug) },
    };
  });

  const edges = [];
  for (const concept of visible) {
    for (const prereq of prereqsOf(concept)) {
      if (!visibleSlugs.has(prereq)) continue;
      const lit = focus && focus.has(concept.slug) && focus.has(prereq);
      edges.push({
        source: concept.slug,
        target: prereq,
        lineStyle: {
          color: lit ? STRAND_COLOR[strandOf(concept)] : "#3a3a4a",
          opacity: focus ? (lit ? 0.85 : 0.03) : 0.22,
          width: lit ? 1.6 : 0.8,
          curveness: 0.12,
        },
      });
    }
  }

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(12,12,20,0.92)",
      borderColor: "#333333",
      textStyle: { color: "#dddddd", fontSize: 11, fontFamily: "monospace" },
      formatter: (params) =>
        params.dataType === "node"
          ? `<b>${params.data.name}</b><br/>${params.data.prereqCount} prerequisites`
          : "",
    },
    animationDurationUpdate: 400,
    series: [
      {
        type: "graph",
        layout: "force",
        roam: true,
        scaleLimit: { min: 0.5, max: 4 },
        draggable: true,
        force: { repulsion: 280, gravity: 0.08, edgeLength: [50, 130], friction: 0.82 },
        label: { color: "#e8e8f0", fontSize: 10, fontFamily: "monospace", position: "right" },
        emphasis: { focus: "adjacency", label: { show: true }, lineStyle: { width: 2 } },
        categories,
        nodes,
        edges,
      },
    ],
  };
}
