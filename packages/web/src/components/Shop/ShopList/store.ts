import axios from 'axios';
import { atomWithQuery } from 'jotai-tanstack-query';
import type { ProductMap } from 'src/components/Shop/ShopList/types';

// const initialState: ShopStateShape = {
//     items: undefined,
// };

export const shopItemsAtom = atomWithQuery<ProductMap>((_get) => ({
    queryKey: ['shop'],
    queryFn: async () => {
        const { data: items } = await axios.get<ProductMap>('/api/shop/items');
        return items;
    },
}));
