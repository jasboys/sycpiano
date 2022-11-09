import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import replace from '@rollup/plugin-replace';
import * as path from 'path';
require('dotenv').config();

const staticPrefix = '/static';

export default defineConfig({
    root: path.resolve(__dirname, 'web/src'),
    resolve: {
        alias: {
            'src': path.resolve(__dirname, 'web/src'),
            'path': 'path-browserify',
        },
    },
    define: {
        BINARY_PATH: JSON.stringify(staticPrefix + '/binary'),
        IMAGES_PATH: JSON.stringify(staticPrefix + '/images'),
        MUSIC_PATH: JSON.stringify(staticPrefix + '/music'),
        VIDEOS_PATH: JSON.stringify(staticPrefix + '/videos'),
        GAPI_KEY: JSON.stringify(process.env.GAPI_KEY_APP),
        STRIPE_PUBLIC_KEY: JSON.stringify(process.env.STRIPE_PUBLIC_KEY),
        global: 'window',
        preventAssignment: true,
    },
    plugins: [
        replace({
        }),
        react({
            jsxImportSource: '@emotion/react',
            babel: {
                plugins: ['@emotion/babel-plugin'],
            },
        }),
        legacy({
            targets: ['es6'],
        }),
    ],
    build: {
        manifest: true,
        rollupOptions: {
            input: '/web/src/main.tsx',
        },
        outDir: path.resolve(__dirname, 'web/build'),
    },
})