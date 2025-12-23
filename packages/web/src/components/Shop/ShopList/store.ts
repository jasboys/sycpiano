import type { DefaultError } from '@tanstack/react-query';
import axios from 'axios';
import { atom, type WritableAtom } from 'jotai';
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

export const shopFlatItemsAtom = atom((get) => {
    const productMap = get(shopItemsAtom).data;
    if (productMap) {
        const flat = Object.values(productMap).reduce((accum, prods) => {
            accum.push(...prods);
            return accum;
        }, []);
        return flat;
    } else {
        return undefined;
    }
});
