import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
require('dotenv').config({ override: true, path: '../../.env' });

export default defineConfig({
    server: {
        port: 5174,
    },
    resolve: {
        alias: {
            src: path.resolve(__dirname, 'src'),
        },
    },
    root: path.resolve(__dirname, 'src'),
    // define: {
    //     BINARY_PATH: JSON.stringify(staticPrefix + '/binary'),
    //     IMAGES_PATH: JSON.stringify(staticPrefix + '/images'),
    //     MUSIC_PATH: JSON.stringify(staticPrefix + '/music'),
    //     VIDEOS_PATH: JSON.stringify(staticPrefix + '/videos'),
    //     GAPI_KEY: JSON.stringify(process.env.GAPI_KEY_APP),
    //     STRIPE_PUBLIC_KEY: JSON.stringify(process.env.STRIPE_PUBLIC_KEY),
    //     global: 'window',
    //     preventAssignment: true,
    // },
    define: {
        'import.meta.env.PUBLIC_GAPI_KEY': JSON.stringify(
            process.env.GAPI_KEY_APP,
        ),
        'import.meta.env.PUBLIC_HOST': JSON.stringify(
            process.env.CALLBACK_HOST,
        ),
    },
    envDir: '../../',
    plugins: [
        react({
            jsxImportSource: '@emotion/react',
            babel: {
                plugins: ['@emotion/babel-plugin'],
            },
        }),
    ],
    build: {
        manifest: true,
        rollupOptions: {
            input: 'src/main.tsx',
        },
        outDir: path.resolve(__dirname, 'build'),
    },
});
