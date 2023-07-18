/*
 * This is the global async redux store.
 *
 * Everytime registerReducer is called, it will replace the global store with
 * a new one that includes the reducer from the new async component.
 *
 * We make sure to namespace the states by their corresponding reducers.
 */

import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';

import { navBarReducer } from 'src/components/App/NavBar/reducers';
import { mediaQueryReducer } from './components/App/reducers';
import { cartReducer } from 'src/components/Cart/reducers';
import { shopReducer } from 'src/components/Shop/ShopList/reducers';

import { AsyncStore, Reducers } from 'src/types';

const staticReducers = {
    navbar: navBarReducer,
    cart: cartReducer,
    shop: shopReducer,
    mediaQuery: mediaQueryReducer,
};

const createReducer = (reducers: Partial<Reducers>) => {
    return combineReducers(
        {
            ...staticReducers,
            ...reducers
        }
    );
};

const store = (() => {
    const store = configureStore({
        reducer: createReducer({}),
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({}).concat(thunk),
    });
    (store as AsyncStore).async = {};
    return store;
})();

export const registerReducer = (store: AsyncStore, reducers: Partial<Reducers>): void => {
    store.async = { ...store.async, ...reducers };
    if (store.async !== undefined) {
        store.replaceReducer(createReducer(store.async));
    }
};

export type AppDispatch = typeof store.dispatch
export type GlobalStateShape = ReturnType<typeof store.getState>
export default store;