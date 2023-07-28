import { createRoot } from 'react-dom/client';
import 'vite/modulepreload-polyfill';
import { AdminPage } from './components/Admin.jsx';

function main() {
    const container = document.getElementById('root') as HTMLElement;
    const root = createRoot(container);
    root.render(
        <AdminPage />
    );
}

main();
