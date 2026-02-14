const createColorType = (color) => ({
  surface: color[500],
  contrast: color[200],
  boundary: color[300],
  hover: {
    surface: color[300],
    contrast: color[700],
    boundary: color[900],
  },
});

export default async function (ds) {
  const palette = ds.colors.palette;

  ds.themes.dark = { ...ds.tokens };

  ds.themes.dark.colors = {
    palette: {
      white: palette.white,
      black: palette.black,
      gray: palette.gray,
    },

    theme: {
      primary: createColorType(palette.aqua),
      secondary: createColorType(palette.indigo),
      accent: createColorType(palette.pink),
    },

    system: {
      // different color?
      info: createColorType(palette.indigo),
      success: createColorType(palette.lime),
      warning: createColorType(palette.amber),
      danger: createColorType(palette.red),
      error: createColorType(palette.red),
      // new color?
      disabled: createColorType(palette.gray),
    },

    skeleton: {
      app: {
        surface: palette.gray[900],
        link: palette.aqua[300],
      },
      1: {
        surface: palette.gray[800],
        contrast: palette.gray[200],
        boundary: palette.gray[300],
      },
      2: {
        surface: palette.gray[900],
        contrast: palette.gray[300],
        boundary: palette.gray[300],
      },
      3: {
        surface: palette.gray[400],
        contrast: palette.gray[800],
        boundary: palette.gray[500],
      },
      4: {
        surface: palette.gray[100],
        contrast: palette.gray[500],
        boundary: palette.gray[400],
      },
      // surface: {1: palette.gray[800], 2: palette.gray[900], 3: palette.gray[400], 4: palette.gray[100],}, contrast: {1: palette.gray[200], 2: palette.gray[300], 3: palette.gray[800], 4: palette.gray[500],}, boundary: {1: palette.gray[300], 2: palette.gray[300], 3: palette.gray[500], 4: palette.gray[400],},
    },
  };

  return ds;
}

// export default async function (ds) {
//   const palette = ds.colors.palette;

//   ds.themes.dark = { ...ds.tokens };

//   ds.themes.dark.color = {
//     palette,
//     system: {
//       info: {
//         text: palette.indigo["400"],
//         bg: palette.indigo["300"],
//         border: palette.indigo["50"],
//         hover: {
//           text: palette.indigo["500"],
//           bg: palette.indigo["500"],
//           border: palette.indigo["100"],
//         },

//         // depracated
//         1: palette.indigo["400"],
//         2: palette.indigo["300"],
//         3: palette.indigo["50"],
//       },
//       success: {
//         text: palette.lime["400"],
//         bg: palette.lime["300"],
//         border: palette.lime["50"],
//         hover: {
//           text: palette.lime["500"],
//           bg: palette.lime["500"],
//           border: palette.lime["100"],
//         },

//         // depracated
//         1: palette.lime["400"],
//         2: palette.lime["300"],
//         3: palette.lime["50"],
//       },
//       warning: {
//         text: palette.amber["400"],
//         bg: palette.amber["300"],
//         border: palette.amber["50"],
//         hover: {
//           text: palette.amber["500"],
//           bg: palette.amber["500"],
//           border: palette.amber["100"],
//         },

//         // depracated
//         1: palette.amber["400"],
//         2: palette.amber["300"],
//         3: palette.amber["50"],
//       },
//       danger: {
//         text: palette.red["400"],
//         bg: palette.red["300"],
//         border: palette.red["50"],
//         hover: {
//           text: palette.red["500"],
//           bg: palette.red["500"],
//           border: palette.red["100"],
//         },

//         // depracated
//         1: palette.red["400"],
//         2: palette.red["300"],
//         3: palette.red["50"],
//       },
//       disabled: {
//         1: palette.gray[600],
//         2: palette.gray[300],
//         3: palette.gray[200],

//         // depracated
//         1: palette.gray[600],
//         2: palette.gray[300],
//         3: palette.gray[200],
//       },
//     },
//     interactive: {
//       // not using actively
//       active: {
//         accent: palette.pink[300],
//         primary: palette.gray[10],
//         secondary: palette.gray[800],
//         inverse: palette.gray[10],
//         ui: palette.gray[600],
//         border: palette.indigo[300],
//         field: palette.gray[800],
//       },
//       hover: {
//         accent: palette.pink[700],
//         primary: palette.aqua[100],
//         secondary: palette.gray[500],
//         inverse: palette.gray[0],
//         ui: palette.gray[600],
//         field: palette.gray[600],
//       },
//       focus: {
//         accent: palette.pink[100],
//         secondary: palette.amber[50],
//         danger: palette.red[50],
//       },
//     },
//     skeleton: {
//       // should grow!
//       // bg ui borders
//       1: palette.gray[500],
//       2: palette.gray[300],
//     },
//     theme: {
//       accent: palette.pink[400],
//       // ["accent-contrast"]: palette.pink[100],
//       // ["accent-hover ...?bg?txt?"]: palette.pink[100],

//       primary: palette.aqua[300],
//       secondary: palette.aqua[400],
//       contrast: palette.gray[300],
//       link: palette.indigo.DEFAULT,
//       text: {
//         accent: palette.pink[900],
//         primary: palette.gray[100],
//         secondary: palette.gray[100],
//         placeholder: palette.gray[100],
//         contrast: palette.white,
//         hint: palette.gray[200],
//         disabled: palette.gray[100],
//         success: palette.lime[300],
//         warning: palette.amber[300],
//         danger: palette.red[300],
//         inverse: palette.gray[100],
//         1: palette.gray[100],
//         2: palette.gray[800],
//         3: palette.gray[500],
//         4: palette.black,
//       },
//       icon: {
//         1: palette.gray[10],
//         2: palette.gray[90],
//         3: palette.aqua[200],
//         contrast: palette.white,
//         disabled: palette.gray[200],
//         inverse: palette.gray[900],
//       },
//       ui: {
//         background: palette.gray[900],
//         1: palette.gray[800],
//         2: palette.gray[100],
//         3: palette.gray[500],
//         4: palette.white,
//         // 5: palette.gray[200],
//         // 6: palette.white,
//         overlay: palette.gray[100],
//       },
//       border: {
//         1: palette.gray[600],
//         2: palette.gray[400],
//         3: palette.gray[300],
//         4: palette.gray[30],
//       },
//       field: {
//         1: palette.gray[800],
//         2: palette.gray[600],
//       },
//     },
//   };

//   return ds;
// }
