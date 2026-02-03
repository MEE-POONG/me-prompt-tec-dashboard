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
                'fadeIn': 'fadeIn 0.3s ease-out',
                'successBounce': 'successBounce 0.5s ease-out',
            },
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                successBounce: {
                    '0%': { transform: 'scale(0)', opacity: '0' },
                    '50%': { transform: 'scale(1.2)' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
