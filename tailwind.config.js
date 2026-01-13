const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        path.join(process.cwd(), "src/**/*.{js,ts,jsx,tsx,mdx}"),
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
