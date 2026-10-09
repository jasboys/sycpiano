interface CheckoutErrorObject {
    message: string;
    data?: string[];
}

export interface CartStateShape {
    isInit: boolean;
    visible: boolean;
    checkoutError: CheckoutErrorObject;
    isCheckingOut: boolean;
}
