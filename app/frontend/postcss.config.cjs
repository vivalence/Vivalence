const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");

const config = {
    plugins: [
        tailwindcss(), //But others, like autoprefixer, need to run after,
        autoprefixer
    ]
};

module.exports = config;
