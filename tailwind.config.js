const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        path.join(process.cwd(), "src/**/*.{js,ts,jsx,tsx,mdx}"),
    ],
    theme: {
        extend: {
            animation: {
                'shimmer': 'shimmer 2s infinite linear',
            },
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
            },
        },
    },
    plugins: [],
}
