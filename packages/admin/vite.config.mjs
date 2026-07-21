import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import * as path from 'node:path';
import dotenv from 'dotenv';
dotenv.config({ override: true, path: '../../.env' });

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
        rollupOptions: {
            input: 'src/admin.html',
        },
        outDir: path.resolve(__dirname, 'build'),
        assetsDir: 'static/scripts/admin',
        emptyOutDir: true,
    },
});
