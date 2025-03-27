// const menuData = transformRuntimeToMenu(ctx.data.runtimes);

export default () => {
  return {
    title: "Skills",
    icon: { emoji: "⚡" },
    type: "link",
    nodes: [
      // ...runtimes.map((runtime) => {
      //   return {
      //     title: runtime.name,
      //     icon: runtime.icon,
      //     type: "link",
      //     // href: "/runtimes/" + runtime.slug,
      //     nodes: [
      //       {
      //         title: "Levels",
      //         icon: { carbon: "ScisControlTower" },
      //         type: "link",
      //         href: `/runtime/${runtime.slug}/dependencies`,
      //       },

      //       //   {
      //       //     title: "Environment",
      //       //     icon: { carbon: "ZAxis" },
      //       //     type: "node",
      //       //     nodes: [
      //       //       {
      //       //         title: "Ontology",
      //       //         icon: { carbon: "Cognitive" },
      //       //         type: "link",
      //       //         // href: "/runtimes/" + runtime.slug,
      //       //       },
      //       //       {
      //       //         title: "Games",
      //       //         icon: { carbon: "Basketball" },
      //       //         type: "link",
      //       //         // href: "/runtimes/" + runtime.slug,
      //       //       },
      //       //       {
      //       //         title: "Tactics",
      //       //         icon: { carbon: "IbmCloudPakBusinessAutomation" },
      //       //         type: "link",
      //       //         // href: "/tactics",
      //       //       },
      //       //     ],
      //       //   },
      //       //   { type: "divider" },
      //       //   ...runtime.corpora.map((corpus) => ({
      //       //     title: corpus.name,
      //       //     icon: corpus.icon,
      //       //     type: "node",
      //       //     nodes: [{ title: "Curriculum", icon: { carbon: "Cube" }, type: "link", href: `/` }],
      //       //   })),
      //     ],
      //   };
      // }),

      {
        title: "cookie",
        icon: { emoji: "🍪" },
        type: "node",
        onclick: () => {
          const cookie = document.cookie;
          navigator.clipboard.writeText(cookie).then(
            () => console.log("Async: Copying to clipboard was successful!", cookie),
            (err) => console.error("Async: Could not copy text: ", err),
          );
        },
      },
    ],
  };
};
