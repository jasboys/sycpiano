import type { DefaultError } from '@tanstack/react-query';
import axios from 'axios';
import type { WritableAtom } from 'jotai';
import { type AtomWithQueryResult, atomWithQuery } from 'jotai-tanstack-query';
import type { ProductMap } from 'src/components/Shop/ShopList/types';

// const initialState: ShopStateShape = {
//     items: undefined,
// };

export const shopItemsAtom: WritableAtom<
    AtomWithQueryResult<ProductMap, DefaultError>,
    [],
    void
> = atomWithQuery<ProductMap>((_get) => ({
    queryKey: ['shop'],
    queryFn: async () => {
        const { data: items } = await axios.get<ProductMap>('/api/shop/items');
        return items;
    },
}));
