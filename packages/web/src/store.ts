import { mapValuesKey } from 'zustand-x';
import { cartStore } from './components/Cart/store.js';
import { navBarStore } from './components/App/NavBar/store.js';
import { shopStore } from './components/Shop/ShopList/store.js';
import { mediaQueriesStore } from './components/App/store.js';

export const rootStore = {
    cart: cartStore,
    navBar: navBarStore,
    shop: shopStore,
    mediaQueries: mediaQueriesStore,
};

export const useStore = () => mapValuesKey('use', rootStore);

// Global tracked hook selectors
export const useTrackedStore = () => mapValuesKey('useTracked', rootStore);

// Global getter selectors
export const store = mapValuesKey('get', rootStore);

// Global actions
export const actions = mapValuesKey('set', rootStore);
