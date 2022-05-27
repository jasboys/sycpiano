import bluebird from 'bluebird';
import * as ReactDOM from 'react-dom';

global.Promise = bluebird as any; /* eslint-disable-line @typescript-eslint/no-explicit-any */

import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import store from 'src/store';

import App from 'src/components/App/App';

function main() {
    ReactDOM.render((
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    <Route path="*" element={<App />} />
                </Routes>
            </BrowserRouter>
        </Provider>
    ), document.getElementById('hero-container') as HTMLElement);
}

main();
