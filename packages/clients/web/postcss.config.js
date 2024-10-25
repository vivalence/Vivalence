import autoprefixer from "npm:autoprefixer@10.4.19";
import tailwindcss from "npm:tailwindcss@3.4.7";

const config = {
  plugins: [tailwindcss(), autoprefixer],
};

export default config;
