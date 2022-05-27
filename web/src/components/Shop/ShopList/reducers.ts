import { ProductMap, ShopStateShape } from 'src/components/Shop/ShopList/types';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPIType } from 'src/types';
import axios from 'axios';

interface FetchReturn {
    items: ProductMap;
}

export const fetchShopItems = createAsyncThunk<FetchReturn, void, ThunkAPIType>(
    'shop/fetchItems',
    async () => {
        const { data: items } = await axios.get<void, { data: ProductMap }>('/api/shop/items');
        return {
            items
        };
    },
    {
        condition: (_, { getState }) => {
            return !getState().shop.isFetching && !getState().shop.fetchSuccess;
        }
    }
);

const initialState: ShopStateShape = {
    isFetching: false,
    fetchSuccess: false,
};

const shopSlice = createSlice({
    name: 'shop',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchShopItems.pending, (state) => {
                state.isFetching = true;
            })
            .addCase(fetchShopItems.rejected, (state) => {
                state.isFetching = false;
                state.fetchSuccess = false;
            })
            .addCase(fetchShopItems.fulfilled, (state, action) => {
                state.isFetching = false;
                state.fetchSuccess = true;
                state.items = action.payload.items;
            })
            .addDefaultCase(state => state);
    },
});

export const shopReducer = shopSlice.reducer;

// export const shopReducer: Reducer<ShopStateShape, ActionTypes.Types> = (state: ShopStateShape = {
//     isFetching: false,
//     fetchSuccess: false,
//     items: {},
// }, action: ActionTypes.Types) => {
//     switch (action.type) {
//         case STORE_ACTIONS.FETCH_ITEMS_REQUEST:
//             return {
//                 ...state,
//                 isFetching: true,
//             };
//         case STORE_ACTIONS.FETCH_ITEMS_ERROR:
//             return {
//                 ...state,
//                 fetchSuccess: false,
//                 isFetching: false,
//             };
//         case STORE_ACTIONS.FETCH_ITEMS_SUCCESS:
//             return {
//                 ...state,
//                 isFetching: false,
//                 fetchSuccess: true,
//                 items: action.items,
//             };
//         default:
//             return state;
//     }
// };