import * as path from 'node:path';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import jotaiDebugLabel from 'jotai/babel/plugin-debug-label';
import jotaiReactRefresh from 'jotai/babel/plugin-react-refresh';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

dotenv.config({ override: true, path: '../../.env' });

const staticPrefix = '/static';

export default defineConfig({
    root: path.resolve(__dirname, 'src'),
    resolve: {
        alias: {
            src: path.resolve(__dirname, 'src'),
            path: 'path-browserify',
            gsap: 'gsap/dist/gsap',
        },
        dedupe: ['polished'],
    },
    define: {
        BINARY_PATH: JSON.stringify(`${staticPrefix}/binary`),
        IMAGES_PATH: JSON.stringify(`${staticPrefix}/images`),
        MUSIC_PATH: JSON.stringify(`${staticPrefix}/music`),
        VIDEOS_PATH: JSON.stringify(`${staticPrefix}/videos`),
        GAPI_KEY: JSON.stringify(process.env.GAPI_KEY_APP),
        STRIPE_PUBLIC_KEY: JSON.stringify(process.env.STRIPE_PUBLIC_KEY),
        ENABLE_SHOP: JSON.stringify(process.env.ENABLE_SHOP ?? false),
        preventAssignment: true,
    },
    plugins: [
        react({
            jsxImportSource: '@emotion/react',
            babel: {
                plugins: [
                    '@emotion/babel-plugin',
                    jotaiDebugLabel,
                    jotaiReactRefresh,
                ],
            },
        }),
        visualizer(),
    ],
    build: {
        target: ['es2015'],
        manifest: true,
        outDir: path.resolve(__dirname, 'build'),
        assetsDir: 'static/scripts/web',
        emptyOutDir: true,
    },
});
