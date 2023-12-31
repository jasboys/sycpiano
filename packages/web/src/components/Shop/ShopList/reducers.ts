import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { ProductMap, ShopStateShape } from 'src/components/Shop/ShopList/types';
import { ThunkAPIType } from 'src/types';

interface FetchReturn {
    items: ProductMap;
}

export const fetchShopItems = createAsyncThunk<
    FetchReturn,
    undefined,
    ThunkAPIType
>(
    'shop/fetchItems',
    async () => {
        const { data: items } = await axios.get<ProductMap>('/api/shop/items');
        return {
            items,
        };
    },
    {
        condition: (_, { getState }) => {
            return !getState().shop.isFetching && !getState().shop.fetchSuccess;
        },
    },
);

const initialState: ShopStateShape = {
    isFetching: false,
    fetchSuccess: false,
};

export const shopSlice = createSlice({
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
            .addDefaultCase((state) => state);
    },
});

export const shopReducer = shopSlice.reducer;
