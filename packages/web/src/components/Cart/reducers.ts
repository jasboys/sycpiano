import {
    createAction,
    createAsyncThunk,
    createSlice,
    type UnknownAction,
} from '@reduxjs/toolkit';
import { loadStripe } from '@stripe/stripe-js';
import axios, { type AxiosError, type AxiosResponse } from 'axios';
import type { ThunkAction } from 'redux-thunk';

import type {
    CartStateShape,
    CheckoutErrorObject,
} from 'src/components/Cart/types';
import { storageAvailable } from 'src/localStorage';
import type { GlobalStateShape } from 'src/store';
import type { ThunkAPIType } from 'src/types';

const LOCAL_STORAGE_KEY = 'seanchenpiano_cart';
const apiKey = STRIPE_PUBLIC_KEY;
const stripe = loadStripe(apiKey);

export const toggleCartList = createAction<boolean | undefined>(
    'cart/toggleCartList',
);
const addItemToCart = createAction<string>('cart/addItemToCart');
export const removeItemFromCart = createAction<string>(
    'cart/removeItemFromCart',
);
export const clearCart = createAction<undefined>('cart/clearCart');
export const clearErrors = createAction<undefined>('cart/clearErrors');

export const addToCartAction = createAsyncThunk<void, string, ThunkAPIType>(
    'cart/addItemWithCheck',
    (skuId, thunkAPI) => {
        thunkAPI.dispatch(addItemToCart(skuId));
    },
    {
        condition: (_, { getState }) => {
            return !getState().cart.isCheckingOut;
        },
    },
);

export const initCartAction = createAsyncThunk<
    { items: string[]; email: string },
    undefined,
    ThunkAPIType
>(
    'cart/initCart',
    async (_, _thunkAPI) => {
        if (storageAvailable()) {
            const cart: string[] = JSON.parse(
                window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? '[]',
            );
            const email: string = JSON.parse(
                window.localStorage.getItem('customer_email') ?? '[]',
            );
            if (cart.length !== 0) {
                // await dispatch(fetchItemsAction());
            }
            return {
                items: cart,
                email,
            };
        }
        return Promise.resolve({
            items: [],
            email: '',
        });
    },
    {
        condition: (_, { getState }) => {
            return !getState().cart.isInit;
        },
    },
);

export const syncLocalStorage =
    (): ThunkAction<void, GlobalStateShape, void, UnknownAction> =>
    (_, getState) => {
        if (storageAvailable()) {
            window.localStorage.setItem(
                LOCAL_STORAGE_KEY,
                JSON.stringify(getState().cart.items),
            );
        }
    };

export const checkoutAction = createAsyncThunk<
    void,
    string,
    ThunkAPIType & { rejectValue: CheckoutErrorObject }
>(
    'cart/checkout',
    async (email, thunkAPI) => {
        try {
            if (storageAvailable()) {
                window.localStorage.setItem(
                    'customer_email',
                    JSON.stringify(email),
                );
            }
            const response = await axios.post<
                { email: string; productIds: string[] },
                AxiosResponse<{ sessionId: string }>
            >(
                '/api/shop/checkout',
                {
                    email,
                    productIds: thunkAPI.getState().cart.items,
                },
                {
                    headers: {
                        'X-CSRF-TOKEN': 'sycpiano',
                    },
                },
            );
            const loadedStripe = await stripe;
            if (loadedStripe === null) {
                throw new Error('Stripe JS failed to load');
            }
            const { error } = await loadedStripe.redirectToCheckout({
                sessionId: response.data.sessionId,
            });
            if (error) {
                return thunkAPI.rejectWithValue({
                    message:
                        'Stripe redirect failed. Did your internet connection reset?',
                });
            }
        } catch (e) {
            const axiosError = e as AxiosError<{ skus: string[] }>;
            if (axiosError.response?.status === 422) {
                const prevPurchasedData = axiosError.response.data.skus;
                return thunkAPI.rejectWithValue({
                    message:
                        'The items marked in red below have been previously purchased. Please remove them to continue with checkout. To request previously purchased scores, visit the [FAQs](/shop/faqs).',
                    data: prevPurchasedData,
                });
            }
            console.error('Checkout Error.', e);
        }
    },
    {
        condition: (_, { getState }) => {
            return !getState().cart.isCheckingOut;
        },
    },
);

const initialState: CartStateShape = {
    items: [],
    isInit: false,
    visible: false,
    isCheckingOut: false,
    checkoutError: {
        message: '',
    },
    email: '',
};

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(initCartAction.rejected, (state, _) => {
                state.isInit = false;
            })
            .addCase(initCartAction.fulfilled, (state, action) => {
                state.isInit = true;
                state.items = action.payload.items;
                state.email = action.payload.email;
            })
            .addCase(addItemToCart, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(removeItemFromCart, (state, action) => {
                const idx = state.items.findIndex(
                    (item) => item === action.payload,
                );
                if (idx !== -1) {
                    state.items.splice(idx, 1);
                }
            })
            .addCase(toggleCartList, (state, action) => {
                state.visible =
                    action.payload === undefined
                        ? !state.visible
                        : action.payload;
            })
            .addCase(checkoutAction.pending, (state, _) => {
                state.isCheckingOut = true;
            })
            .addCase(checkoutAction.rejected, (state, action) => {
                state.isCheckingOut = false;
                state.checkoutError = action.payload || {
                    message: '',
                    data: [],
                };
            })
            .addCase(checkoutAction.fulfilled, (state, _) => {
                state.isCheckingOut = false;
                state.checkoutError = {
                    message: '',
                    data: [],
                };
            })
            .addCase(clearCart, (state, _) => {
                state.items = [];
            })
            .addCase(clearErrors, (state, _) => {
                state.checkoutError = {
                    message: '',
                    data: [],
                };
            })
            .addDefaultCase((state) => state);
    },
});

export const cartReducer = cartSlice.reducer;
