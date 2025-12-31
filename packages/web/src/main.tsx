import { createRoot } from 'react-dom/client';
import 'vite/modulepreload-polyfill';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHydrateAtoms } from 'jotai/utils';
import { DevTools } from 'jotai-devtools';
import { queryClientAtom } from 'jotai-tanstack-query';
import type { ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from 'src/components/App/App';
import 'jotai-devtools/styles.css'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

// This code is only for TypeScript
declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__:
      import("@tanstack/query-core").QueryClient;
  }
}

// This code is for all users
window.__TANSTACK_QUERY_CLIENT__ = queryClient;

const HydrateAtoms = ({ children }: { children: ReactNode }) => {
    useHydrateAtoms(new Map([[queryClientAtom, queryClient]]));
    return children;
};

function main() {
    const container = document.getElementById('app') as HTMLElement;
    const root = createRoot(container);
    root.render(
        <QueryClientProvider client={queryClient}>
            <DevTools />
            <HydrateAtoms>
                <BrowserRouter>
                    <Routes>
                        <Route path="*" element={<App />} />
                    </Routes>
                </BrowserRouter>
            </HydrateAtoms>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>,
    );
}

main();
