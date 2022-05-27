import { shopReducer } from 'src/components/Shop/ShopList/reducers';
import ShopList from 'src/components/Shop/ShopList/ShopList';

export const Component = ShopList;
export const reducers = {
    shop: shopReducer,
};
