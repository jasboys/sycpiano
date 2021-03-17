/* global Stripe */
import axios, { AxiosError } from 'axios';
import { ReferenceObject } from 'popper.js'
import { ThunkAction } from 'redux-thunk';
import { GlobalStateShape } from 'src/types';

import CART_ACTIONS from 'src/components/Cart/actionTypeKeys';
import * as ActionTypes from 'src/components/Cart/actionTypes';
import { fetchItemsAction } from 'src/components/Shop/actions';
import { storageAvailable } from 'src/localStorage';
import { CheckoutErrorObject } from './types';

const LOCAL_STORAGE_KEY = 'seanchenpiano_cart';

const stripe = Stripe(STRIPE_PUBLIC_KEY);

const isCheckingOut = (state: GlobalStateShape) =>
    state.cart.isCheckingOut;

export const toggleCartListAction = (visible?: boolean): ActionTypes.ToggleCartList => ({
    type: CART_ACTIONS.TOGGLE_CARTLIST,
    visible,
});

const addItemToCart = (skuId: string): ActionTypes.AddToCart => ({
    type: CART_ACTIONS.ADD_TO_CART,
    skuId,
});

export const addToCartAction = (skuId: string): ThunkAction<void, GlobalStateShape, void, ActionTypes.UpdateCartActions> => (
    (dispatch, getState) => {
        if (!isCheckingOut(getState())) {
            dispatch(addItemToCart(skuId))
        }
    }
);

const removeItemFromCart = (skuId: string): ActionTypes.RemoveFromCart => ({
    type: CART_ACTIONS.REMOVE_FROM_CART,
    skuId,
});

export const removeFromCartAction = (skuId: string): ThunkAction<void, GlobalStateShape, void, ActionTypes.UpdateCartActions> => (
    (dispatch, getState) => {
        if (!isCheckingOut(getState())) {
            dispatch(removeItemFromCart(skuId));
        }
    }
);

export const clearCartAction = (): ThunkAction<void, GlobalStateShape, void, ActionTypes.ClearCart> =>
    (dispatch) => dispatch({ type: CART_ACTIONS.CLEAR_CART });

const initCartSuccess = (items: string[], email: string): ActionTypes.InitCartSuccess => ({
    type: CART_ACTIONS.INIT_SUCCESS,
    items,
    email,
});

const shouldInitCart = (state: GlobalStateShape) => {
    return !state.cart.isInit;
};

export const initCartAction = (): ThunkAction<Promise<void>, GlobalStateShape, void, ActionTypes.InitCartActions> =>
    async (dispatch, getState) => {
        if (shouldInitCart(getState())) {
            if (storageAvailable()) {
                const cart: string[] = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? '[]');
                const email: string = JSON.parse(window.localStorage.getItem('customer_email') ?? '[]')
                if (cart.length !== 0) {
                    await dispatch(fetchItemsAction())
                }
                dispatch(initCartSuccess(cart, email));
                return Promise.resolve();
            } else {
                return Promise.resolve();
            }
        }
    }

export const syncLocalStorage = (): ThunkAction<void, GlobalStateShape, void, null> =>
    (_, getState) => {
        // console.log('syncing');
        if (storageAvailable()) {
            window.localStorage.setItem(
                LOCAL_STORAGE_KEY,
                JSON.stringify(getState().cart.items)
            );
        }
    };

export const checkoutErrorAction = (error: CheckoutErrorObject): ActionTypes.CheckoutError => ({
    type: CART_ACTIONS.CHECKOUT_ERROR,
    error,
});

export const checkoutAction = (email: string): ThunkAction<void, GlobalStateShape, void, ActionTypes.CheckCustomerActions> =>
    async (dispatch, getState) => {
        if (!isCheckingOut(getState())) {
            try {
                dispatch({
                    type: CART_ACTIONS.CHECKOUT_REQUEST,
                });
                if (storageAvailable()) {
                    window.localStorage.setItem(
                        'customer_email',
                        JSON.stringify(email),
                    );
                }
                const response = await axios.post<{ sessionId: string }>('/api/shop/checkout', {
                    email,
                    productIDs: getState().cart.items,
                });
                const { error } = await stripe.redirectToCheckout({
                    sessionId: response.data.sessionId
                });
                if (error) {
                    dispatch(checkoutErrorAction({
                        message: 'Stripe redirect failed. Did your internet connection reset?',
                    }));
                }
            } catch (e) {
                const axiosError = e as AxiosError<{ skus: string[] }>;
                if (axiosError.response?.status === 422) {
                    const prevPurchasedData = axiosError.response.data.skus;
                    dispatch(checkoutErrorAction({
                        message: `The items marked in red below have been previously purchased. Please remove them to continue with checkout.`,
                        data: prevPurchasedData,
                    }));
                } else {
                    console.log("Checkout Error.", e);
                }
            }
        }

    };

export const setReferenceElement = (el: ReferenceObject): ActionTypes.PopperSetRef => ({
    type: CART_ACTIONS.POPPER_SETREF,
    el,
});

export const setPopperElement = (el: HTMLDivElement): ActionTypes.PopperSetPop => ({
    type: CART_ACTIONS.POPPER_SETPOP,
    el,
});

export const setArrowElement = (el: HTMLDivElement): ActionTypes.PopperSetArrow => ({
    type: CART_ACTIONS.POPPER_SETARROW,
    el,
});

export const setReferenceElementAction = (el: ReferenceObject): ThunkAction<void, GlobalStateShape, void, ActionTypes.PopperSetRef> => (
    (dispatch) => dispatch(setReferenceElement(el))
);

export const setPopperElementAction = (el: HTMLDivElement): ThunkAction<void, GlobalStateShape, void, ActionTypes.PopperSetPop> => (
    (dispatch) => dispatch(setPopperElement(el))
);

export const setArrowElementAction = (el: HTMLDivElement): ThunkAction<void, GlobalStateShape, void, ActionTypes.PopperSetArrow> => (
    (dispatch) => dispatch(setArrowElement(el))
);
