import type { PhotoStoreShape } from 'src/components/Media/Photos/types';

import { zustandMiddlewareOptions } from 'src/utils';
import { createStore } from 'zustand-x';

const initialState: PhotoStoreShape = {
    background: 'rgb(248 248 248)',
    currentItem: undefined,
};

export const photoStore = createStore('photos')(
    initialState,
    zustandMiddlewareOptions,
);
