import * as path from 'node:path';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';

dotenv.config({ override: true, path: '../../.env' });

export default defineConfig({
    server: {
        port: 5174,
    },
    resolve: {
        alias: {
            src: path.resolve(import.meta.dirname, 'src'),
        },
    },
    root: path.resolve(import.meta.dirname, 'src'),
    define: {
        'import.meta.env.PUBLIC_GAPI_KEY': JSON.stringify(
            process.env.GAPI_KEY_APP,
        ),
        'import.meta.env.PUBLIC_HOST': JSON.stringify(process.env.PUBLIC_HOST),
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
        rolldownOptions: {
            input: 'src/admin.html',
        },
        outDir: path.resolve(import.meta.dirname, 'build'),
        assetsDir: 'static/scripts/admin',
        emptyOutDir: true,
    },
});
