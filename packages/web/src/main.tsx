import { createRoot } from 'react-dom/client';
import 'vite/modulepreload-polyfill';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import App from 'src/components/App/App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function main() {
    const container = document.getElementById('app') as HTMLElement;
    const root = createRoot(container);
    root.render(
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="*" element={<App />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>,
    );
}

main();
