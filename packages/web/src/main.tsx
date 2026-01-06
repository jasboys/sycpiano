import { createRoot } from 'react-dom/client';
import 'vite/modulepreload-polyfill';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHydrateAtoms } from 'jotai/utils';
import { queryClientAtom } from 'jotai-tanstack-query';
import type { ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from 'src/components/App/App';

const queryClient = new QueryClient();

const HydrateAtoms = ({ children }: { children: ReactNode }) => {
    useHydrateAtoms(new Map([[queryClientAtom, queryClient]]));
    return children;
};

function main() {
    const container = document.getElementById('app') as HTMLElement;
    const root = createRoot(container);
    root.render(
        <QueryClientProvider client={queryClient}>
            <HydrateAtoms>
                <BrowserRouter>
                    <Routes>
                        <Route path="*" element={<App />} />
                    </Routes>
                </BrowserRouter>
            </HydrateAtoms>
        </QueryClientProvider>,
    );
}

main();
