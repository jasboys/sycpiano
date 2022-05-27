import axios, { AxiosError, AxiosResponse } from 'axios';
import { CartStateShape, CheckoutErrorObject } from 'src/components/Cart/types';
import { createSlice, createAction, createAsyncThunk, AnyAction } from '@reduxjs/toolkit';
import { ThunkAPIType } from 'src/types';
import { storageAvailable } from 'src/localStorage';
import { ThunkAction } from 'redux-thunk';
import { GlobalStateShape } from 'src/store';

const LOCAL_STORAGE_KEY = 'seanchenpiano_cart';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

export const toggleCartList = createAction<boolean | undefined>('cart/toggleCartList');
const addItemToCart = createAction<string>('cart/addItemToCart');
export const removeItemFromCart = createAction<string>('cart/removeItemFromCart');
export const clearCart = createAction<void>('cart/clearCart');
export const clearErrors = createAction<void>('cart/clearErrors');

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

export const initCartAction = createAsyncThunk<{ items: string[]; email: string }, void, ThunkAPIType>(
    'cart/initCart',
    async (_, _thunkAPI) => {
        if (storageAvailable()) {
            const cart: string[] = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? '[]');
            const email: string = JSON.parse(window.localStorage.getItem('customer_email') ?? '[]');
            if (cart.length !== 0) {
                // await dispatch(fetchItemsAction());
            }
            return {
                items: cart,
                email,
            };
        } else {
            return Promise.resolve({
                items: [],
                email: '',
            });
        }
    },
    {
        condition: (_, { getState }) => {
            return !getState().cart.isInit;
        },
    },
);

export const syncLocalStorage = (): ThunkAction<void, GlobalStateShape, void, AnyAction> =>
    (_, getState) => {
        // console.log('syncing');
        if (storageAvailable()) {
            window.localStorage.setItem(
                LOCAL_STORAGE_KEY,
                JSON.stringify(getState().cart.items)
            );
        }
    };

export const checkoutAction = createAsyncThunk<void, string, ThunkAPIType & { rejectValue: CheckoutErrorObject }>(
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
                { email: string; productIDs: string[]; },
                AxiosResponse<{ sessionId: string }>
            >('/api/shop/checkout', {
                email,
                productIDs: thunkAPI.getState().cart.items,
            });
            const { error } = await stripe.redirectToCheckout({
                sessionId: response.data.sessionId
            });
            if (error) {
                return thunkAPI.rejectWithValue({
                    message: 'Stripe redirect failed. Did your internet connection reset?',
                });
            }
        } catch (e) {
            const axiosError = e as AxiosError<{ skus: string[] }>;
            if (axiosError.response?.status === 422) {
                const prevPurchasedData = axiosError.response.data.skus;
                return thunkAPI.rejectWithValue({
                    message: `The items marked in red below have been previously purchased. Please remove them to continue with checkout.`,
                    data: prevPurchasedData,
                });
            } else {
                console.log("Checkout Error.", e);
            }
        }
    },
    {
        condition: (_, { getState }) => {
            return !getState().cart.isCheckingOut;
        }
    }
)

const initialState: CartStateShape = {
    items: [],
    isInit: false,
    visible: false,
    isCheckingOut: false,
    checkoutError: {
        message: '',
    },
    email: ''
};

const cartSlice = createSlice({
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
                const idx = state.items.findIndex(item => item === action.payload);
                if (idx !== -1) {
                    state.items.splice(idx, 1);
                }
            })
            .addCase(toggleCartList, (state, action) => {
                state.visible = (action.payload === undefined) ? !state.visible : action.payload;
            })
            .addCase(checkoutAction.pending, (state, _) => {
                state.isCheckingOut = true;
            })
            .addCase(checkoutAction.rejected, (state, action) => {
                state.isCheckingOut = false;
                state.checkoutError = action.payload || {
                    message: '',
                    data: []
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
            .addDefaultCase(state => state);
    },
});

export const cartReducer = cartSlice.reducer;

// export const cartReducer = (state: CartStateShape = {
//     items: [],
//     isInit: false,
//     visible: false,
//     isCheckingOut: false,
//     checkoutError: {
//         message: '',
//     },
//     email: ''
// }, action: ActionTypes.Types): CartStateShape => {
//     switch (action.type) {
//         case CART_ACTIONS.INIT_SUCCESS:
//             return {
//                 ...state,
//                 isInit: true,
//                 items: action.items,
//                 email: action.email,
//             };
//         case CART_ACTIONS.INIT_ERROR:
//             return {
//                 ...state,
//                 isInit: false,
//             };
//         case CART_ACTIONS.ADD_TO_CART: {
//             return {
//                 ...state,
//                 items: [action.skuId, ...state.items],
//             };
//         }
//         case CART_ACTIONS.REMOVE_FROM_CART: {
//             const retArray = state.items.filter((v: string) => v !== action.skuId);
//             return {
//                 ...state,
//                 items: retArray,
//             };
//         }
//         case CART_ACTIONS.CHECKOUT_REQUEST: {
//             return {
//                 ...state,
//                 isCheckingOut: true,
//             };
//         }
//         case CART_ACTIONS.CHECKOUT_ERROR: {
//             return {
//                 ...state,
//                 isCheckingOut: false,
//                 checkoutError: action.error,
//             };
//         }
//         case CART_ACTIONS.CHECKOUT_SUCCESS: {
//             return {
//                 ...state,
//                 isCheckingOut: false,
//                 checkoutError: { message: '', data: [] },
//             };
//         }
//         case CART_ACTIONS.TOGGLE_CARTLIST: {
//             return {
//                 ...state,
//                 visible: (action.visible === undefined) ? !state.visible : action.visible,
//             };
//         }
//         default:
//             return state;
//     }
// };


// export const setReferenceElement = (el: ReferenceObject): ActionTypes.PopperSetRef => ({
//     type: CART_ACTIONS.POPPER_SETREF,
//     el,
// });

// export const setPopperElement = (el: HTMLDivElement): ActionTypes.PopperSetPop => ({
//     type: CART_ACTIONS.POPPER_SETPOP,
//     el,
// });

// export const setArrowElement = (el: HTMLDivElement): ActionTypes.PopperSetArrow => ({
//     type: CART_ACTIONS.POPPER_SETARROW,
//     el,
// });

// export const setReferenceElementAction = (el: ReferenceObject): ThunkAction<void, GlobalStateShape, void, ActionTypes.PopperSetRef> => (
//     (dispatch) => dispatch(setReferenceElement(el))
// );

// export const setPopperElementAction = (el: HTMLDivElement): ThunkAction<void, GlobalStateShape, void, ActionTypes.PopperSetPop> => (
//     (dispatch) => dispatch(setPopperElement(el))
// );

// export const setArrowElementAction = (el: HTMLDivElement): ThunkAction<void, GlobalStateShape, void, ActionTypes.PopperSetArrow> => (
//     (dispatch) => dispatch(setArrowElement(el))
// );
