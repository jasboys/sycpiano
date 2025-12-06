import * as dotenv from 'dotenv';
import Stripe from 'stripe';
import uniqid from 'uniqid';
import type { Product } from './models/Product.js';

dotenv.config({ override: true, path: '../../.env' });

type CustomerReturn = Stripe.Customer | Stripe.DeletedCustomer;
type ProductReturn = string | Stripe.Product | Stripe.DeletedProduct;

const CURRENCY = 'USD';
export const THUMBNAIL_STATIC =
    'https://seanchenpiano.com/static/images/products/thumbnails/';

// const isDev = process.env.NODE_ENV === 'development';
const host = process.env.PUBLIC_HOST;

if (process.env.STRIPE_SECRET_KEY === undefined) {
    throw new Error('Stripe Secret Key undefined');
}
const stripe: Stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
});

const stripeCustomerActive = (cr: CustomerReturn): cr is Stripe.Customer => {
    return cr.deleted !== true;
};

export const productIsObject = (pr: ProductReturn): pr is Stripe.Product => {
    return typeof pr !== 'string' && pr.deleted !== true;
};

export const getPayments = async (): Promise<Stripe.PaymentIntent[]> => {
    try {
        let result: Stripe.PaymentIntent[] = [];
        let nextPage: string | undefined = undefined;
        do {
            const temp = await stripe.paymentIntents.search({
                query: 'status="succeeded"',
                limit: 100,
                page: nextPage,
            });
            nextPage = temp.next_page === null ? undefined : temp.next_page;
            result = [...result, ...temp.data];
        } while (nextPage);
        return result;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const getPricesAndProducts = async (): Promise<Stripe.Product[]> => {
    try {
        const result = await stripe.products.list({
            expand: ['data.default_price'],
        });
        return result.data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const getCustomer = async (email: string): Promise<Stripe.Customer> => {
    try {
        return (await stripe.customers.list({ email })).data[0];
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const createCustomer = async (
    email: string,
): Promise<Stripe.Customer> => {
    try {
        return await stripe.customers.create({ email });
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const getOrCreateCustomer = async (
    email: string,
): Promise<Stripe.Customer> => {
    try {
        const customers = await stripe.customers.list({ email });
        if (customers.data.length === 0) {
            const customer = await stripe.customers.create({ email });
            return customer;
        }
        return customers.data[0];
    } catch (e) {
        console.error('Stripe create/get customer failed.', e);
        throw e;
    }
};

const COUPON20 = '5+';
const COUPON10 = '2 <= count < 5';

export const createCheckoutSession = async (
    productIDs: string[],
    priceIDs: string[],
    customerId: string,
): Promise<Stripe.Checkout.Session> => {
    try {
        const coupons = await stripe.coupons.list();
        const couponName =
            productIDs.length >= 5
                ? COUPON20
                : productIDs.length >= 2
                  ? COUPON10
                  : undefined;
        const couponID = coupons.data.find((c) => c.name === couponName)?.id;
        const params: Stripe.Checkout.SessionCreateParams = {
            mode: 'payment',
            success_url: `${host}/shop/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${host}/shop/scores`,
            payment_method_types: ['card'],
            line_items: priceIDs.map((id) => ({
                price: id,
                quantity: 1,
            })),
            customer: customerId,
            payment_intent_data: {
                metadata: productIDs.reduce(
                    (acc, pID, idx) => {
                        acc[idx] = pID;
                        return acc;
                    },
                    {} as Record<number, string>,
                ),
            },
            client_reference_id: uniqid.time(),
        };
        if (couponID !== undefined) {
            params.discounts = [
                {
                    coupon: couponID,
                },
            ];
        }

        const session = await stripe.checkout.sessions.create(params);
        return session;
    } catch (e) {
        console.error('Checkout session creation failed.', e);
        throw e;
    }
};

// To be destroyed
export const getProductIDsFromPaymentIntent = async (
    paymentIntent: string,
): Promise<string[]> => {
    try {
        const intent = await stripe.paymentIntents.retrieve(paymentIntent);
        const metadata = Object.values(intent.metadata);
        return metadata;
    } catch (e) {
        console.error(`Couldn't get skus from paymentIntent.`, e);
        throw e;
    }
};

export const getEmailFromCustomer = async (cid: string): Promise<string> => {
    try {
        const customer = await stripe.customers.retrieve(cid);
        if (stripeCustomerActive(customer) && customer.email) {
            return customer.email;
        }
        throw new Error('Customer not active, or email is empty');
    } catch (e) {
        console.error(`Couldn't get email from customer.`, e);
        throw e;
    }
};

export const constructEvent = (
    body: string | Buffer,
    sig: string | string[],
): Stripe.Event => {
    if (process.env.STRIPE_WEBHOOK_KEY === undefined) {
        throw new Error('Stripe Webhook Key undefined');
    }
    const event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_KEY,
    );
    return event;
};

export const createProduct = async (attributes: Product): Promise<string[]> => {
    try {
        console.log('attributes', attributes);
        const product = await stripe.products.create({
            name: attributes.name,
            description: attributes.description,
            metadata: {
                format: 'pdf',
                file: attributes.file ?? null,
                pages: attributes.pages ?? null,
                sample: attributes.sample ?? null,
                permalink: attributes.permalink ?? null,
                type: attributes.type ?? null,
            },
            images: attributes.images?.map(
                (img) => `${THUMBNAIL_STATIC}${img}`,
            ),
            default_price_data: {
                currency: CURRENCY,
                unit_amount: attributes.price,
            },
        });
        const priceId =
            typeof product.default_price === 'string'
                ? product.default_price
                : product.default_price?.id;
        if (priceId === undefined) {
            throw Error('No Price ID');
        }
        return [product.id, priceId];
    } catch (e) {
        console.error(`Couldn't create product.`, e);
        throw e;
    }
};

export const deleteProduct = async (
    id: string,
): Promise<Stripe.Response<Stripe.DeletedProduct | Stripe.Product>> => {
    try {
        return await stripe.products.del(id);
    } catch (e) {
        try {
            return await stripe.products.update(id, { active: false });
        } catch (e) {
            console.error(`Couldn't delete product. `, e);
            throw e;
        }
    }
};

export const updateProduct = async (attributes: Product): Promise<string[]> => {
    try {
        let price: Stripe.Price | undefined = undefined;
        if (attributes.priceId) {
            price = await stripe.prices.retrieve(attributes.priceId);
        }
        let shouldArchiveOldPrice = false;
        if (price === undefined || attributes.price !== price.unit_amount) {
            // look for price to see if we already have
            price = (
                await stripe.prices.list({
                    product: attributes.id,
                })
            ).data.find((sp) => sp.unit_amount === attributes.price);
            if (!price) {
                // Else create new one
                price = await stripe.prices.create({
                    currency: CURRENCY,
                    unit_amount: attributes.price,
                    product: attributes.id,
                });
            } else {
                price = await stripe.prices.update(price.id, { active: true });
            }
            shouldArchiveOldPrice = true;
        }
        const product = await stripe.products.update(attributes.id, {
            name: attributes.name,
            description: attributes.description,
            metadata: {
                format: 'pdf',
                file: attributes.file ?? null,
                pages: attributes.pages ?? null,
                sample: attributes.sample ?? null,
                type: attributes.type ?? null,
                permalink: attributes.permalink ?? null,
            },
            images:
                attributes.images?.map((img) => `${THUMBNAIL_STATIC}${img}`) ??
                [],
            default_price: price.id,
        });
        if (shouldArchiveOldPrice) {
            await stripe.prices.update(attributes.priceId, { active: false });
        }
        return [product.id, price.id];
    } catch (e) {
        console.error(`Couldn't update product.`, e);
        throw e;
    }
};

export const getCheckoutSession = async (
    sessionId: string,
): Promise<{
    session: Stripe.Checkout.Session;
    lineItems: Stripe.LineItem[];
}> => {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const lineItems =
            await stripe.checkout.sessions.listLineItems(sessionId);
        // console.log(session);
        // console.log(lineItems);
        return {
            session,
            lineItems: lineItems.data,
        };
    } catch (e) {
        console.error(`Could not retrieve session with id ${sessionId}`);
        throw e;
    }
};
