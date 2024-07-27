import { createStore } from 'zustand-x';

import type { ShopStateShape } from 'src/components/Shop/ShopList/types';
import { zustandMiddlewareOptions } from 'src/utils';

const initialState: ShopStateShape = {
    items: undefined,
};

export const shopStore = createStore('shop')(
    initialState,
    zustandMiddlewareOptions,
);
