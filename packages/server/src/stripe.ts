import * as dotenv from 'dotenv';
import Stripe from 'stripe';
import uniqid from 'uniqid';
import { Product } from './models/Product.js';

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
    apiVersion: '2022-11-15',
});

const stripeCustomerActive = (cr: CustomerReturn): cr is Stripe.Customer => {
    return cr.deleted !== true;
};

export const productIsObject = (pr: ProductReturn): pr is Stripe.Product => {
    return typeof pr !== 'string' && pr.deleted !== true;
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
        } else {
            return customers.data[0];
        }
    } catch (e) {
        console.error('Stripe create/get customer failed.', e);
        throw e;
    }
};

export const createCheckoutSession = async (
    productIDs: string[],
    priceIDs: string[],
    customerId: string,
): Promise<string> => {
    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            success_url: `https://${host}/shop/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://${host}/shop/scores`,
            payment_method_types: ['card'],
            line_items: priceIDs.map((id) => ({
                price: id,
                quantity: 1,
            })),
            customer: customerId,
            payment_intent_data: {
                metadata: productIDs.reduce(
                    (acc, pID, idx) => ({
                        ...acc,
                        [idx]: pID,
                    }),
                    {},
                ),
            },
            client_reference_id: uniqid.time(),
        });
        return session.id;
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
        } else {
            throw new Error('Customer not active, or email is empty');
        }
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
): Promise<Stripe.Response<Stripe.DeletedProduct>> => {
    try {
        return await stripe.products.del(id);
    } catch (e) {
        console.error(`Couldn't delete product. `, e);
        throw e;
    }
};

export const updateProduct = async (attributes: Product): Promise<string[]> => {
    try {
        let price: Stripe.Price | undefined = undefined;
        if (attributes.priceId) {
            price = await stripe.prices.retrieve(attributes.priceId);
        }
        if (price !== undefined && attributes.price !== price.unit_amount) {
            await stripe.prices.update(price.id, { active: false });
        }
        if (price === undefined || attributes.price !== price.unit_amount) {
            price = await stripe.prices.create({
                currency: CURRENCY,
                unit_amount: attributes.price,
                product: attributes.id,
            });
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
        const lineItems = await stripe.checkout.sessions.listLineItems(
            sessionId,
        );
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
