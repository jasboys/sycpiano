import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { splitVendorChunkPlugin } from 'vite';
import * as path from 'path';
require('dotenv').config({ override: true, path: '../../.env' });

const staticPrefix = '/static';

export default defineConfig({
    root: path.resolve(__dirname, 'src'),
    resolve: {
        alias: {
            src: path.resolve(__dirname, 'src'),
            path: 'path-browserify',
            gsap: 'gsap/dist/gsap'
        },
        dedupe: ['polished']

    },
    define: {
        BINARY_PATH: JSON.stringify(staticPrefix + '/binary'),
        IMAGES_PATH: JSON.stringify(staticPrefix + '/images'),
        MUSIC_PATH: JSON.stringify(staticPrefix + '/music'),
        VIDEOS_PATH: JSON.stringify(staticPrefix + '/videos'),
        GAPI_KEY: JSON.stringify(process.env.GAPI_KEY_APP),
        STRIPE_PUBLIC_KEY: JSON.stringify(process.env.STRIPE_PUBLIC_KEY),
        preventAssignment: true,
    },
    plugins: [
        react({
            jsxImportSource: '@emotion/react',
            babel: {
                plugins: ['@emotion/babel-plugin'],
            },
        }),
        visualizer(),
    ],
    build: {
        target: ['es2015'],
        manifest: true,
        rollupOptions: {
            input: 'src/main.tsx',
            treeshake: 'smallest',
        },
        outDir: path.resolve(__dirname, 'build'),
        assetsDir: 'static/scripts',
        emptyOutDir: true,
    },
})