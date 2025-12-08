// import { loadStripe } from '@stripe/stripe-js';
import axios, { type AxiosError, type AxiosResponse } from 'axios';
import { atom } from 'jotai';
import { atomWithImmer } from 'jotai-immer';
import type { CartStateShape } from 'src/components/Cart/types';
import { storageAvailable } from 'src/localStorage';
import { toAtoms } from 'src/store';

const LOCAL_STORAGE_KEY = 'seanchenpiano_cart';
// const apiKey = STRIPE_PUBLIC_KEY;
// const stripe = loadStripe(apiKey);

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

const cartStore = atomWithImmer(initialState);
export const cartAtoms = {
    ...toAtoms(cartStore),
    visible: atom(
        (get) => get(cartStore).visible,
        (_get, set, val: boolean) =>
            set(cartStore, (draft) => (draft.visible = val)),
    ),
};

const syncStorage = atom(null, (get, _set) => {
    if (storageAvailable()) {
        window.localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(get(cartAtoms.items)),
        );
    }
});

const addItem = atom(null, (_get, set, item: string) => {
    set(cartStore, (draft) => draft.items.push(item));
});

const removeItem = atom(null, (_get, set, itemToRemove: string) => {
    set(cartStore, (draft) => {
        const idx = draft.items.indexOf(itemToRemove);
        if (idx !== -1) {
            draft.items.splice(idx, 1);
        }
    });
});

const clearCart = atom(null, (_get, set) => {
    set(cartStore, (draft) => (draft.items = []));
});

const clearErrors = atom(null, (_get, set) => {
    set(cartStore, (draft) => {
        draft.checkoutError = {
            message: '',
            data: [],
        };
    });
});

const toggleCartVisible = atom(null, (_get, set, visible?: boolean) => {
    set(cartStore, (draft) => {
        draft.visible = visible === undefined ? !draft.visible : visible;
    });
});

const initCartFn = atom(null, async (get, set) => {
    if (storageAvailable() && !get(cartAtoms.isInit)) {
        const cart: string[] = JSON.parse(
            window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? '[]',
        );
        const email: string = JSON.parse(
            window.localStorage.getItem('customer_email') ?? '[]',
        );
        set(cartStore, (draft) => (draft.isInit = true));
        return {
            items: cart,
            email,
        };
    }
    set(cartStore, (draft) => (draft.isInit = true));

    return Promise.resolve({
        items: [],
        email: '',
    });
});

const checkoutFn = atom(null, async (get, set, email: string) => {
    try {
        if (storageAvailable()) {
            window.localStorage.setItem(
                'customer_email',
                JSON.stringify(email),
            );
        }
        // const response =
        await axios.post<
            { email: string; productIds: string[] },
            AxiosResponse<{ sessionId: string }>
        >(
            '/api/shop/checkout',
            {
                email,
                productIds: get(cartAtoms.items),
            },
            {
                headers: {
                    'X-CSRF-TOKEN': 'sycpiano',
                },
            },
        );
    } catch (e) {
        const axiosError = e as AxiosError<{ skus: string[] }>;
        if (axiosError.response?.status === 422) {
            const prevPurchasedData = axiosError.response.data.skus;
            set(
                cartStore,
                (draft) =>
                    (draft.checkoutError = {
                        message:
                            'The items marked in red below have been previously purchased. Please remove them to continue with checkout. To request previously purchased scores, visit the [FAQs](/shop/faqs).',
                        data: prevPurchasedData,
                    }),
            );
        }
        console.error('Checkout Error.', e);
        throw e;
    }
});

export const cartActions = {
    syncStorage,
    addItem,
    removeItem,
    clearCart,
    clearErrors,
    toggleCartVisible,
    initCartFn,
    checkoutFn,
};

// export const initCartFn = async () => {
//     if (storageAvailable() && !cartStore.get.isInit()) {
//         const cart: string[] = JSON.parse(
//             window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? '[]',
//         );
//         const email: string = JSON.parse(
//             window.localStorage.getItem('customer_email') ?? '[]',
//         );
//         cartStore.set.isInit(true);
//         return {
//             items: cart,
//             email,
//         };
//     }
//     cartStore.set.isInit(true);
//     return Promise.resolve({
//         items: [],
//         email: '',
//     });
// };

// export const checkoutFn = async (email: string) => {
//     try {
//         if (storageAvailable()) {
//             window.localStorage.setItem(
//                 'customer_email',
//                 JSON.stringify(email),
//             );
//         }
//         // const response =
//         await axios.post<
//             { email: string; productIds: string[] },
//             AxiosResponse<{ sessionId: string }>
//         >(
//             '/api/shop/checkout',
//             {
//                 email,
//                 productIds: cartStore.get.items(),
//             },
//             {
//                 headers: {
//                     'X-CSRF-TOKEN': 'sycpiano',
//                 },
//             },
//         );
//         // const loadedStripe = await stripe;
//         // if (loadedStripe === null) {
//         //     throw new Error('Stripe JS failed to load');
//         // }
//         // const { error } = await loadedStripe.redirectToCheckout({
//         //     sessionId: response.data.sessionId,
//         // });
//         // if (error) {
//         //     cartStore.set.checkoutError({
//         //         message:
//         //             'Stripe redirect failed. Did your internet connection reset?',
//         //     });
//         //     throw error;
//         // }
//     } catch (e) {
//         const axiosError = e as AxiosError<{ skus: string[] }>;
//         if (axiosError.response?.status === 422) {
//             const prevPurchasedData = axiosError.response.data.skus;
//             cartStore.set.checkoutError({
//                 message:
//                     'The items marked in red below have been previously purchased. Please remove them to continue with checkout. To request previously purchased scores, visit the [FAQs](/shop/faqs).',
//                 data: prevPurchasedData,
//             });
//         }
//         console.error('Checkout Error.', e);
//         throw e;
//     }
// };

// export const _cartStore = createStore('cart')(
//     initialState,
//     zustandMiddlewareOptions,
// ).extendActions((set, get, _api) => ({
//     syncStorage: () => {
//         if (storageAvailable()) {
//             window.localStorage.setItem(
//                 LOCAL_STORAGE_KEY,
//                 JSON.stringify(get.items()),
//             );
//         }
//     },
//     addItem: (item: string) => {
//         set.state((state) => {
//             state.items.push(item);
//         });
//     },
//     removeItem: (itemToRemove: string) => {
//         set.state((state) => {
//             const idx = state.items.indexOf(itemToRemove);
//             if (idx !== -1) {
//                 state.items.splice(idx, 1);
//             }
//         });
//     },
//     toggleCartVisible: (visible?: boolean) => {
//         set.state((state) => {
//             state.visible = visible === undefined ? !state.visible : visible;
//         });
//     },
//     clearCart: () => {
//         set.items([]);
//     },
//     clearErrors: () => {
//         set.state((state) => {
//             state.checkoutError = {
//                 message: '',
//                 data: [],
//             };
//         });
//     },
// }));
