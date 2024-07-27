import type { ComponentType } from 'react';

// Cache of already loaded modules
const modules: {
    [key: string]: ComponentType<any>;
} = {};

// This function checks if module is cached, if is, returns the cached module;
// otherwise, registers the reducer of the (new) module, and caches it.
const extractModule =
    () =>
    async <P extends object>(
        name: string,
        moduleProvider: Promise<{ Component: ComponentType<P> }>,
    ): Promise<ComponentType<P>> => {
        if (Object.prototype.hasOwnProperty.call(modules, name)) {
            return Promise.resolve(modules[name]);
        }
        const { Component: mod } = await moduleProvider;
        /* eslint-disable-next-line require-atomic-updates */
        modules[name] = mod;
        return mod;
    };

export default extractModule;
