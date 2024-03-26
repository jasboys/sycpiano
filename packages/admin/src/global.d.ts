declare global {
    interface Window {
        csrfToken: string;
    }
}

// biome-ignore lint/style/useExportType: Need to export for global
export {};
