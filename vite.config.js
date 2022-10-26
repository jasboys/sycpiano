import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        manifest: true,
        rollupOptions: {
            input: '/web/src/main.tsx',
        }
    }
})