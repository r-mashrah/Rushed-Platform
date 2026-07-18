// /** @type {import('tailwindcss').Config} */
// export default {
//     content: [
//         "./index.html",
//         "./src/**/*.{js,ts,jsx,tsx}",
//     ],
//     theme: {
//         extend: {
//             fontFamily: {
//                 sans: ['Tajawal', 'Cairo', 'Almarai', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
//             },
//         },
//     },
//     plugins: [],
// }

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f4ff',
                    100: '#e5ebff',
                    200: '#d1dcff',
                    300: '#b4c5ff',
                    400: '#8fa3ff',
                    500: '#6b7fff',
                    600: '#4f5eff',
                    700: '#3d47e8',
                    800: '#333bb5',
                    900: '#323a8f',
                },
                accent: {
                    50: '#fef3f2',
                    100: '#fee4e2',
                    200: '#fececa',
                    300: '#fdaba5',
                    400: '#fa7a70',
                    500: '#f75247',
                    600: '#e43328',
                    700: '#bf281f',
                    800: '#9d261e',
                    900: '#822720',
                },
                success: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
                warning: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                },
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'gradient-accent': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'gradient-success': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'gradient-warning': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                'gradient-card': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'gradient-sidebar': 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                'glow': '0 0 20px rgba(102, 126, 234, 0.3)',
            },
        },
    },
    plugins: [],
}
