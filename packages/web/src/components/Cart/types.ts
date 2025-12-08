export interface CheckoutErrorObject {
    message: string;
    data?: string[];
}

export interface CartStateShape {
    isInit: boolean;
    // items: string[];
    visible: boolean;
    checkoutError: CheckoutErrorObject;
    isCheckingOut: boolean;
    // email: string;
}
