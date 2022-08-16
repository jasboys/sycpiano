import * as dotenv from 'dotenv';
import Stripe from 'stripe';
import * as uniqid from 'uniqid';
import { ProductAttributes } from './models/product';

dotenv.config();

type CustomerReturn = Stripe.Customer | Stripe.DeletedCustomer;
type ProductReturn = string | Stripe.Product | Stripe.DeletedProduct;

const CURRENCY = 'USD';
const THUMBNAIL_STATIC = 'https://seanchenpiano.com/static/images/products/thumbnails/';

// const isDev = process.env.NODE_ENV === 'development';
const host = process.env.HOST;
const stripe: Stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2020-08-27' });

const stripeCustomerActive = (cr: CustomerReturn): cr is Stripe.Customer => {
    return cr.deleted !== true;
};

export const productIsObject = (pr: ProductReturn): pr is Stripe.Product => {
    return (typeof pr !== 'string') && pr.deleted !== true;
};

export const getPricesAndProducts = async (): Promise<Stripe.Price[]> => {
    try {
        const result = await stripe.prices.list({ expand: ['data.product'] });
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

export const createCustomer = async (email: string): Promise<Stripe.Customer> => {
    try {
        return await stripe.customers.create({ email });
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const getOrCreateCustomer = async (email: string): Promise<Stripe.Customer> => {
    try {
        const customers = await stripe.customers.list(
            { email }
        );
        if (customers.data.length === 0) {
            const customer = await stripe.customers.create(
                { email }
            );
            return customer;
        } else {
            return customers.data[0];
        }
    } catch (e) {
        console.error("Stripe create/get customer failed.", e);
        throw e;
    }
};

export const createCheckoutSession = async (productIDs: string[], priceIDs: string[], customerId: string): Promise<string> => {
    try {
        const session = await stripe.checkout.sessions.create(
            {
                mode: 'payment',
                success_url: `${host}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${host}/shop`,
                payment_method_types: ['card'],
                line_items: priceIDs.map((id) =>
                    ({
                        price: id,
                        quantity: 1
                    })
                ),
                customer: customerId,
                payment_intent_data: {
                    metadata: productIDs.reduce((acc, pID, idx) => ({
                        ...acc,
                        [idx]: pID,
                    }), {}),
                },
                client_reference_id: uniqid.time(),
            }
        );
        return session.id;
    } catch (e) {
        console.error('Checkout session creation failed.', e);
        throw e;
    }
}

export const getProductIDsFromPaymentIntent = async (paymentIntent: string): Promise<string[]> => {
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

export const constructEvent = (body: string | Buffer, sig: string | string[]): Stripe.Event => {
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_KEY);
    return event;
};

export const createProduct = async (attributes: Omit<ProductAttributes, 'createdAt' | 'updatedAt' | 'id'>): Promise<string[]> => {
    try {
        const product = await stripe.products.create({
            name: attributes.name,
            description: attributes.description,
            metadata: {
                format: 'pdf',
                pages: attributes.pages,
                sample: attributes.sample,
                permalink: attributes.permalink,
            },
            images: attributes.images.map((img) =>
                `${THUMBNAIL_STATIC}${img}`
            ),
        });
        const price = await stripe.prices.create({
            currency: CURRENCY,
            unit_amount: attributes.price,
            product: product.id,
        });
        return [product.id, price.id];
    } catch (e) {
        console.error(`Couldn't create product.`, e);
        throw e;
    }
};

export const deleteProduct = async (id: string): Promise<Stripe.Response<Stripe.DeletedProduct>> => {
    try {
        return await stripe.products.del(id);
    } catch (e) {
        console.error(`Couldn't delete product. `, e);
        throw e;
    }
};

export const updateProduct = async (attributes: Omit<ProductAttributes, 'createdAt' | 'updatedAt'>): Promise<string[]> => {
    try {
        console.log(attributes.id);
        const product = await stripe.products.update(
            attributes.id,
            {
                name: attributes.name,
                description: attributes.description,
                metadata: {
                    format: 'pdf',
                    pages: attributes.pages,
                    sample: attributes.sample,
                    type: attributes.type,
                    permalink: attributes.permalink,
                },
                images: attributes.images.map((img) =>
                    `${THUMBNAIL_STATIC}${img}`
                ),
            },
        );
        const oldPrice = await stripe.prices.retrieve(attributes.priceID);
        if (attributes.price !== oldPrice.unit_amount) {
            await stripe.prices.update(attributes.priceID, { active: false });
            const newPrice = await stripe.prices.create({
                currency: CURRENCY,
                unit_amount: attributes.price,
                product: product.id,
            });
            return [product.id, newPrice.id];
        }
        return [product.id, attributes.priceID];
    } catch (e) {
        console.error(`Couldn't update product.`, e);
        throw e;
    }
};

export const getCheckoutSession = async (sessionId: string): Promise<{ session: Stripe.Checkout.Session; lineItems: Stripe.LineItem[] } > => {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
        // console.log(session);
        // console.log(lineItems);
        return {
            session,
            lineItems: lineItems.data
        };
    } catch (e) {
        console.error(`Could not retrieve session with id ${sessionId}`);
        throw e;
    }
}