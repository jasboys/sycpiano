import { loadStripe } from '@stripe/stripe-js';
import axios, { type AxiosError, type AxiosResponse } from 'axios';
import { createStore } from 'zustand-x';

import type { CartStateShape } from 'src/components/Cart/types';
import { storageAvailable } from 'src/localStorage';
import { zustandMiddlewareOptions } from 'src/utils';

const LOCAL_STORAGE_KEY = 'seanchenpiano_cart';
const apiKey = STRIPE_PUBLIC_KEY;
const stripe = loadStripe(apiKey);

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

export const cartStore = createStore('cart')(
    initialState,
    zustandMiddlewareOptions,
).extendActions((set, get, _api) => ({
    syncStorage: () => {
        if (storageAvailable()) {
            window.localStorage.setItem(
                LOCAL_STORAGE_KEY,
                JSON.stringify(get.items()),
            );
        }
    },
    addItem: (item: string) => {
        set.state((state) => {
            state.items.push(item);
        });
    },
    removeItem: (itemToRemove: string) => {
        set.state((state) => {
            const idx = state.items.findIndex((item) => item === itemToRemove);
            if (idx !== -1) {
                state.items.splice(idx, 1);
            }
        });
    },
    toggleCartVisible: (visible?: boolean) => {
        set.state((state) => {
            state.visible = visible === undefined ? !state.visible : visible;
        });
    },
    clearCart: () => {
        set.items([]);
    },
    clearErrors: () => {
        set.state((state) => {
            state.checkoutError = {
                message: '',
                data: [],
            };
        });
    },
}));

export const initCartFn = async () => {
    if (storageAvailable() && !cartStore.get.isInit()) {
        const cart: string[] = JSON.parse(
            window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? '[]',
        );
        const email: string = JSON.parse(
            window.localStorage.getItem('customer_email') ?? '[]',
        );
        cartStore.set.isInit(true);
        return {
            items: cart,
            email,
        };
    }
    cartStore.set.isInit(true);
    return Promise.resolve({
        items: [],
        email: '',
    });
};

export const checkoutFn = async (email: string) => {
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
                productIds: cartStore.get.items(),
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
            cartStore.set.checkoutError({
                message:
                    'Stripe redirect failed. Did your internet connection reset?',
            });
            throw error;
        }
    } catch (e) {
        const axiosError = e as AxiosError<{ skus: string[] }>;
        if (axiosError.response?.status === 422) {
            const prevPurchasedData = axiosError.response.data.skus;
            cartStore.set.checkoutError({
                message:
                    'The items marked in red below have been previously purchased. Please remove them to continue with checkout. To request previously purchased scores, visit the [FAQs](/shop/faqs).',
                data: prevPurchasedData,
            });
        }
        console.error('Checkout Error.', e);
        throw e;
    }
};
