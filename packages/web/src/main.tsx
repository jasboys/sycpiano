import { createRoot } from 'react-dom/client';
import 'vite/modulepreload-polyfill';

import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import store from 'src/store.js';

import App from 'src/components/App/App';

function main() {
    const container = document.getElementById('app') as HTMLElement;
    const root = createRoot(container);
    root.render(
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    <Route path='*' element={<App />} />
                </Routes>
            </BrowserRouter>
        </Provider>,
    );
}

main();
