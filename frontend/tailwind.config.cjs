const palette = {
    white: "#F2F4F6",
    black: "#030D0D",
    gray: {
        DEFAULT: "#27292B",
        10: "#EBE9EB",
        20: "#E8E7E9",
        30: "#E5E4E7",
        40: "#E2E1E4",
        50: "#DFDFE2",
        60: "#DCDCDF",
        70: "#D9DADD",
        80: "#D7D8DA",
        90: "#D4D6D8",
        100: "#CACCCF",
        200: "#B4B8BB",
        300: "#9FA3A8",
        400: "#8A8F94",
        500: "#778088",
        600: "#5C636A",
        700: "#42474C",
        800: "#282B2E",
        900: "#0E0F10",
        950: "#010101"
    },

    moroccanBlue: {
        DEFAULT: "#0006EF",
        50: "#e5e6ff",
        100: "#b3b4ff",
        200: "#8083ff",
        300: "#4d51ff",
        400: "#1a1fff",
        500: "#0006e6",
        600: "#0004b3",
        700: "#000380",
        800: "#00024d",
        900: "#00011a"
    },
    cathodeGreen: {
        DEFAULT: "#00FF58",
        50: "#e5ffee",
        100: "#b3ffcd",
        200: "#80ffac",
        300: "#4dff8a",
        400: "#1aff69",
        500: "#00e64f",
        600: "#00b33e",
        700: "#00802c",
        800: "#004d1a",
        900: "#001a09"
    },
    arcticAqua: {
        DEFAULT: "#00FFFA",
        50: "#e5ffff",
        100: "#b3fffe",
        200: "#80fffc",
        300: "#4dfffb",
        400: "#1afffa",
        500: "#00e6e1",
        600: "#00b3af",
        700: "#00807d",
        800: "#004d4b",
        900: "#001a19"
    },
    vividPink: {
        DEFAULT: "#FF00AA",
        50: "#ffe5f6",
        100: "#ffb3e5",
        200: "#ff80d4",
        300: "#ff4dc3",
        400: "#ff1ab2",
        500: "#e60099",
        600: "#b30077",
        700: "#800055",
        800: "#4d0033",
        900: "#1a0011"
    },
    honeyOrange: {
        DEFAULT: "#FF8D00",
        50: "#fff4e5",
        100: "#ffddb3",
        200: "#ffc680",
        300: "#ffaf4d",
        400: "#ff981a",
        500: "#e67f00",
        600: "#b36300",
        700: "#804700",
        800: "#4d2a00",
        900: "#1a0e00"
    },
    cherryRed: {
        DEFAULT: "#F10118",
        50: "#ffe6e8",
        100: "#ffb3ba",
        200: "#fe808c",
        300: "#fe4d5e",
        400: "#fe1a30",
        500: "#e50117",
        600: "#b20112",
        700: "#7f010d",
        800: "#4c0008",
        900: "#190003"
    },

    bananaYellow: {
        DEFAULT: "#FCF4A3",
        50: "#fefce6",
        100: "#fdf6b5",
        200: "#fbf084",
        300: "#f9ea52",
        400: "#f8e421",
        500: "#decb07",
        600: "#ad9e06",
        700: "#7b7104",
        800: "#4a4402",
        900: "#191701"
    }
};

const tint = {
    moroccanBlue: {
        25: `rgba(0, 115, 217, 0.05)`,
        50: `rgba(0, 115, 217, 0.15)`,
        100: `rgba(0, 115, 217, 0.25)`,
        200: `rgba(0, 115, 217, 0.40)`,
        300: `rgba(0, 115, 217, 0.60)`,
        400: `rgba(0, 115, 217, 0.75)`,
        500: `rgba(0, 115, 217, 0.90)`
    },
    cathodeGreen: {
        25: `rgba(0, 255, 88, 0.05)`,
        50: `rgba(0, 255, 88, 0.15)`,
        100: `rgba(0, 255, 88, 0.25)`,
        200: `rgba(0, 255, 88, 0.40)`,
        300: `rgba(0, 255, 88, 0.60)`,
        400: `rgba(0, 255, 88, 0.75)`,
        500: `rgba(0, 255, 88, 0.90)`
    },
    arcticAqua: {
        25: `rgba(0, 255, 250, 0.05)`,
        50: `rgba(0, 255, 250, 0.15)`,
        100: `rgba(0, 255, 250, 0.25)`,
        200: `rgba(0, 255, 250, 0.40)`,
        300: `rgba(0, 255, 250, 0.60)`,
        400: `rgba(0, 255, 250, 0.75)`,
        500: `rgba(0, 255, 250, 0.90)`
    },
    vividPink: {
        25: `rgba(255, 0, 170, 0.05)`,
        50: `rgba(255, 0, 170, 0.15)`,
        100: `rgba(255, 0, 170, 0.25)`,
        200: `rgba(255, 0, 170, 0.40)`,
        300: `rgba(255, 0, 170, 0.60)`,
        400: `rgba(255, 0, 170, 0.75)`,
        500: `rgba(255, 0, 170, 0.90)`
    },
    honeyOrange: {
        25: `rgba(255, 141, 0, 0.05)`,
        50: `rgba(255, 141, 0, 0.15)`,
        100: `rgba(255, 141, 0, 0.25)`,
        200: `rgba(255, 141, 0, 0.40)`,
        300: `rgba(255, 141, 0, 0.60)`,
        400: `rgba(255, 141, 0, 0.75)`,
        500: `rgba(255, 141, 0, 0.90)`
    },
    cherryRed: {
        25: `rgba(241, 1, 24, 0.05)`,
        50: `rgba(241, 1, 24, 0.15)`,
        100: `rgba(241, 1, 24, 0.25)`,
        200: `rgba(241, 1, 24, 0.40)`,
        300: `rgba(241, 1, 24, 0.60)`,
        400: `rgba(241, 1, 24, 0.75)`,
        500: `rgba(241, 1, 24, 0.90)`
    },
    bananaYellow: {
        25: `rgba(252, 244, 163, 0.05)`,
        50: `rgba(252, 244, 163, 0.15)`,
        100: `rgba(252, 244, 163, 0.25)`,
        200: `rgba(252, 244, 163, 0.40)`,
        300: `rgba(252, 244, 163, 0.60)`,
        400: `rgba(252, 244, 163, 0.75)`,
        500: `rgba(252, 244, 163, 0.90)`
    },
    gray: {
        25: `rgba(119, 128, 136, 0.05)`,
        50: `rgba(119, 128, 136, 0.15)`,
        100: `rgba(119, 128, 136, 0.25)`,
        200: `rgba(119, 128, 136, 0.40)`,
        300: `rgba(119, 128, 136, 0.60)`,
        400: `rgba(119, 128, 136, 0.75)`,
        500: `rgba(119, 128, 136, 0.90)`
    },
    white: {
        25: `rgba(242, 244, 246, 0.05)`,
        50: `rgba(242, 244, 246, 0.15)`,
        100: `rgba(242, 244, 246, 0.25)`,
        200: `rgba(242, 244, 246, 0.40)`,
        300: `rgba(242, 244, 246, 0.60)`,
        400: `rgba(242, 244, 246, 0.75)`,
        500: `rgba(242, 244, 246, 0.90)`
    },
    black: {
        25: `rgba(3, 13, 13, 0.05)`,
        50: `rgba(3, 13, 13, 0.15)`,
        100: `rgba(3, 13, 13, 0.25)`,
        200: `rgba(3, 13, 13, 0.40)`,
        300: `rgba(3, 13, 13, 0.60)`,
        400: `rgba(3, 13, 13, 0.75)`,
        500: `rgba(3, 13, 13, 0.90)`
    }
};

const system = {
    info: {
        1: palette.moroccanBlue["400"],
        2: palette.moroccanBlue["300"],
        3: tint.moroccanBlue["50"]
    },
    success: {
        1: palette.cathodeGreen["400"],
        2: palette.cathodeGreen["300"],
        3: tint.cathodeGreen["50"]
    },
    warning: {
        1: palette.honeyOrange["400"],
        2: palette.honeyOrange["300"],
        3: tint.honeyOrange["50"]
    },
    danger: {
        1: palette.cherryRed["400"],
        2: palette.cherryRed["300"],
        3: tint.cherryRed["50"],
        hover: palette.cherryRed["500"]
    }
};

const interactive = {
    hover: {
        accent: palette.moroccanBlue[600],
        primary: palette.gray[20],
        secondary: palette.gray[500],
        inverse: palette.gray[0],
        ui: palette.gray[600],
        field: palette.gray[600]
    },
    active: {
        accent: palette.moroccanBlue[400],
        primary: palette.gray[10],
        secondary: palette.gray[800],
        inverse: palette.gray[10],
        ui: palette.gray[600],
        border: palette.moroccanBlue[300],
        field: palette.gray[800]
    },
    focus: {
        accent: tint.moroccanBlue[50],
        secondary: tint.white[25],
        danger: tint.cherryRed[50]
    },
    skeleton: {
        1: palette.gray[500],
        2: palette.gray[300]
    },
    disabled: {
        1: palette.gray[600],
        2: palette.gray[300],
        3: palette.gray[200]
    }
};

const theme = {
    accent: palette.honeyOrange[500],
    primary: palette.white,
    secondary: palette.gray[600],
    contrast: palette.gray[800],
    link: palette.moroccanBlue.SOURCE,
    text: {
        1: palette.gray[10],
        2: palette.gray[60],
        placeholder: palette.gray[100],
        contrast: palette.white,
        hint: palette.gray[200],
        disabled: palette.gray[100],
        error: palette.cherryRed[300],
        inverse: palette.gray[900]
    },
    icon: {
        1: palette.gray[10],
        2: palette.gray[60],
        3: palette.moroccanBlue[400],
        contrast: palette.white,
        disabled: palette.gray[200],
        inverse: palette.gray[900]
    },
    ui: {
        background: palette.gray[900],
        1: palette.gray[700],
        2: palette.gray[600],
        3: palette.gray[400],
        4: palette.gray[300],
        5: palette.white,
        6: palette.gray[300],
        overlay: palette.gray[400]
    },
    border: {
        1: palette.gray[600],
        2: palette.gray[400],
        3: palette.gray[300],
        4: palette.gray[30]
    },
    field: {
        1: palette.gray[800],
        2: palette.gray[600]
    }
};
const font = {
    "serif-heading": ["Sabon", "serif"],
    "sans-heading": ["Avant Garde", "sans"],
    "serif-text": ["Sabon", "serif"],
    "sans-text": ["Kabel", "sans"],
    code: ["Source Code Pro", "monospace"]
};

/** @type {import('tailwindcss').Config}*/
const config = {
    mode: "jit",

    theme: {
        colors: {
            theme,
            system,
            interactive,
            palette,
            tint
        },
        extend: {
            fontFamily: font
        }
    },
    content: ["./src/**/*.{html,js,svelte,ts,stories.svelte}"],
    plugins: [],
    safelist: [
        { pattern: /grid-cols-/ },
        { pattern: /grid-rows-/ },
        { pattern: /gap-/ },
        { pattern: /items-/ },
        { pattern: /justify-/ },
        { pattern: /align-/ },
        { pattern: /-span-/ },
        { pattern: /flex-/ },
        { pattern: /basis-/ },
        { pattern: /order-/ },
        { pattern: /self-/ }
        // { pattern: /bg-palette-/ }
    ]
};

module.exports = config;
