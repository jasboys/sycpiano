import { ComponentType } from 'react';
import { registerReducer } from 'src/store';
import { AsyncModule, AsyncStore } from 'src/types';

// Cache of already loaded modules
const modules: {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    [key: string]: ComponentType<any>;
} = {};

// This function checks if module is cached, if is, returns the cached module;
// otherwise, registers the reducer of the (new) module, and caches it.
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const extractModule = (store: AsyncStore) => async <P = Record<string, unknown>>(name: string, moduleProvider: Promise<AsyncModule<P>>): Promise<ComponentType<P>> => {
    if (Object.prototype.hasOwnProperty.call(modules, name)) {
        return Promise.resolve(modules[name]);
    } else {
        const { Component: mod, reducers } = await moduleProvider;
        if (reducers) {
            registerReducer(store, reducers);
        }
        /* eslint-disable-next-line require-atomic-updates */
        modules[name] = mod;
        return mod;
    }
};

export default extractModule;
