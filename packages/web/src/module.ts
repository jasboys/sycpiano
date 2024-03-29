import type { ComponentType } from 'react';
import { registerReducer } from 'src/store';
import type { AsyncModule, AsyncStore } from 'src/types';

// Cache of already loaded modules
const modules: {
    [key: string]: ComponentType<any>;
} = {};

// This function checks if module is cached, if is, returns the cached module;
// otherwise, registers the reducer of the (new) module, and caches it.
const extractModule =
    (store: AsyncStore) =>
    async <P extends object>(
        name: string,
        moduleProvider: Promise<AsyncModule<P>>,
    ): Promise<ComponentType<P>> => {
        if (Object.prototype.hasOwnProperty.call(modules, name)) {
            return Promise.resolve(modules[name]);
        }
        const { Component: mod, reducers } = await moduleProvider;
        if (reducers) {
            registerReducer(store, reducers);
        }
        /* eslint-disable-next-line require-atomic-updates */
        modules[name] = mod;
        return mod;
    };

export default extractModule;
