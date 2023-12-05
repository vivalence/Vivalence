const palette = {
    white: "#F2F4F6",
    black: "#030D0D",
    gray: {
        0: "#ffffff",
        10: "#F3F5F7",
        20: "#E8ECF0",
        30: "#DDE3E8",
        40: "#D3DAE1",
        50: "#C8D1D9",
        60: "#BEC8D2",
        70: "#B4BFCA",
        80: "#AAB6C3",
        90: "#A0ADBA",
        100: "#95A3B2",
        200: "#8999A8",
        300: "#7B8C9D",
        400: "#697B8D",
        500: "#4C5E70",
        600: "#354556",
        700: "#202E3B",
        800: "#08131E",
        900: "#020508",
        950: "#000000"
    },
    aqua: {
        50: "#adfffa",
        100: "#80ede6",
        200: "#51d8d0",
        300: "#1ebcb5",
        400: "#00686a",
        500: "#004c4e",
        600: "#004244",
        700: "#00383a",
        800: "#003031",
        900: "#002729",
        DEFAULT: "#00FFFB"
    },
    indigo: {
        50: "#adb4ff",
        100: "#8088ed",
        200: "#515cd8",
        300: "#1e28bc",
        400: "#00006a",
        500: "#01004e",
        600: "#010044",
        700: "#01003a",
        800: "#010031",
        900: "#010029",
        DEFAULT: "#0006EF"
    },
    pink: {
        50: "#ffade8",
        100: "#ed80ce",
        200: "#d851b1",
        300: "#bc1e8c",
        400: "#6a0043",
        500: "#4e0031",
        600: "#44002a",
        700: "#3a0024",
        800: "#31001f",
        900: "#290019",
        DEFAULT: "#FF00AA"
    },
    red: {
        50: "#ffadba",
        100: "#ed8090",
        200: "#d85165",
        300: "#bc1e33",
        400: "#6a0007",
        500: "#4e0004",
        600: "#440004",
        700: "#3a0003",
        800: "#310003",
        900: "#290002",
        DEFAULT: "#F10118"
    },
    amber: {
        50: "#ffd6ad",
        100: "#edb780",
        200: "#d89651",
        300: "#bc701e",
        400: "#6a3e00",
        500: "#4e2e00",
        600: "#442900",
        700: "#3a2300",
        800: "#311e00",
        900: "#291800",
        DEFAULT: "#FF8D00"
    },
    yellow: {
        50: "#fff4ad",
        100: "#eddf80",
        200: "#d8c751",
        300: "#bcaa1e",
        400: "#6a6500",
        500: "#4e4b00",
        600: "#444200",
        700: "#3a3800",
        800: "#313000",
        900: "#292700",
        DEFAULT: "#FCF4A3"
    },
    citron: {
        50: "#f7ffad",
        100: "#e2ed80",
        200: "#cad851",
        300: "#aabc1e",
        400: "#566a00",
        500: "#3f4e00",
        600: "#374400",
        700: "#2f3a00",
        800: "#283100",
        900: "#212900",
        DEFAULT: "#D9FF00"
    },
    lime: {
        50: "#adffc6",
        100: "#80eda1",
        200: "#51d87b",
        300: "#1ebc50",
        400: "#006a29",
        500: "#004e1f",
        600: "#00441b",
        700: "#003a17",
        800: "#003114",
        900: "#002910",
        DEFAULT: "#00FF58"
    }
};

const _tint = {
    ingigo: {
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
        1: palette.indigo["400"],
        2: palette.indigo["300"],
        3: palette.indigo["50"]
    },
    success: {
        1: palette.lime["400"],
        2: palette.lime["300"],
        3: palette.lime["50"]
    },
    warning: {
        1: palette.amber["400"],
        2: palette.amber["300"],
        3: palette.amber["50"]
    },
    danger: {
        1: palette.red["400"],
        2: palette.red["300"],
        3: palette.red["50"],
        hover: palette.red["500"]
    }
};

const interactive = {
    hover: {
        accent: palette.pink[700],
        primary: palette.gray[20],
        secondary: palette.gray[500],
        inverse: palette.gray[0],
        ui: palette.gray[600],
        field: palette.gray[600]
    },
    active: {
        accent: palette.pink[300],
        primary: palette.gray[10],
        secondary: palette.gray[800],
        inverse: palette.gray[10],
        ui: palette.gray[600],
        border: palette.indigo[300],
        field: palette.gray[800]
    },
    focus: {
        accent: palette.indigo[400],
        secondary: palette.amber[50],
        danger: palette.red[50]
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
    accent: palette.pink[400],
    primary: palette.aqua[300],
    secondary: palette.aqua[400],
    contrast: palette.gray[300],
    link: palette.indigo.DEFAULT,
    text: {
        1: palette.gray[10],
        2: palette.gray[60],
        3: palette.gray[400],
        4: palette.gray[600],
        placeholder: palette.gray[100],
        contrast: palette.white,
        hint: palette.gray[200],
        disabled: palette.gray[100],
        error: palette.red[300],
        inverse: palette.gray[900]
    },
    icon: {
        1: palette.gray[10],
        2: palette.gray[90],
        3: palette.aqua[200],
        contrast: palette.white,
        disabled: palette.gray[200],
        inverse: palette.gray[900]
    },
    ui: {
        background: palette.gray[900],
        1: palette.gray[700],
        2: palette.gray[500],
        3: palette.gray[300],
        4: palette.gray[200],
        5: palette.white,
        6: palette.gray[800],
        overlay: palette.gray[100]
    },
    border: {
        1: palette.gray[500],
        2: palette.gray[300],
        3: palette.gray[100],
        4: palette.gray[30]
    },
    field: {
        1: palette.gray[800],
        2: palette.gray[600]
    }
};

const font = {
    "serif-heading": ["Sabon", "serif"],
    "sans-heading": ["K2D", "sans"],
    "serif-text": ["Sabon", "serif"],
    "sans-text": ["Kabel", "sans"],
    code: ["Source Code Pro", "monospace"]
};

const fontSize = {
    xs: ["0.694rem", "0.8"],
    sm: ["0.833rem", "1.0"],
    base: ["1rem", "1.0"],
    lg: ["1.2rem", "1.1"],
    xl: ["1.44rem", "1.1"],
    "2xl": ["1.728rem", "1.1"],
    "3xl": ["2.074rem", "1.2"],
    "4xl": ["2.488rem", "1.25"],
    "5xl": ["2.986rem", "1.3"],
    "6xl": ["3.583rem", "1.35"],
    "7xl": ["4.3rem", "1.4"]
};

const animation = {
    "spin-slow": "spin 9s linear infinite"
};

/** @type {import('tailwindcss').Config}*/
const config = {
    mode: "jit",

    theme: {
        colors: {
            theme,
            system,
            interactive,
            palette
        },
        extend: {
            fontSize,
            fontFamily: font,
            borderWidth: {},
            animation
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
        { pattern: /self-/ },
        { pattern: /bg-palette-/ },
        { pattern: /text-/ },
        { pattern: /border/ },
        { pattern: /rotate/ },
        { pattern: /theme-/ }
    ]
};

module.exports = config;
