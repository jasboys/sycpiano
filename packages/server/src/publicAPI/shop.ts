import { add, isBefore } from 'date-fns';
import * as express from 'express';
import { pick } from 'lodash-es';
import { Stripe } from 'stripe';

import orm from '../database.js';
import { Faq } from '../models/Faq.js';
import { mailer } from '../emails/index.js';
import { Product, ProductTypes } from '../models/Product.js';
import { User } from '../models/User.js';
import { UserProduct } from '../models/UserProduct.js';
import * as stripeClient from '../stripe.js';
import { ShopItem } from '../types.js';
import { csrfMiddleware } from '../csrf.js';

const shopRouter = express.Router();

// add webhook first because it needs raw body
shopRouter.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
        const sig = req.headers['stripe-signature'];

        if (sig === undefined) {
            return res
                .status(400)
                .send('Webhook Error: no stripe signature header.');
        }

        let event: Stripe.Event;
        // console.log(req.body, sig);

        try {
            event = stripeClient.constructEvent(req.body, sig);
        } catch (e) {
            console.error(e);
            const err = e as Error;
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            try {
                const customerId = session.customer as string;
                const productIds =
                    await stripeClient.getProductIDsFromPaymentIntent(
                        session.payment_intent as string,
                    );
                const email =
                    await stripeClient.getEmailFromCustomer(customerId);
                // Add associations to local model
                const user = await orm.em.findOne(User, {
                    $or: [{ id: customerId }, { username: email }],
                });
                if (user === null) {
                    throw new Error('no customer found');
                }
                let alreadyProcessed = false;
                for (const id of productIds) {
                    // check if userProduct exists
                    const existing = await orm.em.findOne(UserProduct, {
                        product: id,
                        user: customerId,
                    });
                    if (existing) {
                        alreadyProcessed = true;
                        break;
                    }

                    const items = orm.em.create(UserProduct, {
                        product: id,
                        user: customerId,
                    });
                    orm.em.persist(items);
                }
                orm.em.flush();
                if (!alreadyProcessed) {
                    await mailer.emailPDFs(
                        productIds,
                        email,
                        session.client_reference_id ?? '',
                    );
                }
            } catch (e) {
                console.error('Failed to send email: ', e);
            }
        }

        res.json({ received: true });
    },
);

shopRouter.use(express.json());

const productSortPredicate = (a: ShopItem, b: ShopItem) => {
    return a.name.localeCompare(b.name);
};

shopRouter.get('/items', async (_, res) => {
    const products = await orm.em.find(Product, {});
    const storeItems = ProductTypes.reduce(
        (acc, type) => {
            const prods = products
                .filter(({ type: t }) => t === type)
                .map((product) => {
                    return {
                        ...product,
                        format: 'pdf',
                    };
                })
                .sort(productSortPredicate);
            acc[type] = prods;
            return acc;
        },
        {} as Record<(typeof ProductTypes)[number], ShopItem[]>,
    );
    res.json(storeItems);
});

shopRouter.get('/faqs', async (_, res) => {
    const faqs = await orm.em.find(Faq, {});
    res.json(faqs);
});

const getOrCreateLocalCustomer = async (email: string) => {
    try {
        const stripeCustomer = await stripeClient.getOrCreateCustomer(email);

        const localCustomer = await orm.em.findOne(
            User,
            { $and: [{ username: email }, { role: 'customer' }] },
            { populate: ['products'] },
        );

        if (!localCustomer) {
            const user = orm.em.create(User, {
                id: stripeCustomer.id,
                username: email,
                role: 'customer',
            });
            await orm.em.persist(user).flush();
        }
        return {
            stripeId: stripeCustomer.id,
            ...localCustomer,
        };
    } catch (e) {
        console.log(e);
    }
};

shopRouter.get<unknown, unknown, unknown, { session_id: string }>(
    '/checkout-success',
    async (req, res) => {
        const { session_id: sessionId } = req.query;
        try {
            const { session, lineItems } =
                await stripeClient.getCheckoutSession(sessionId);

            res.json({
                session: pick(session, [
                    'customer_details',
                    'client_reference_id',
                ]),
                lineItems: lineItems.map((item) => item.description),
            });
        } catch (e) {
            res.sendStatus(400);
        }
    },
);

// Enforce csrf mitigation for post routes.
shopRouter.post('*', csrfMiddleware);

// new stripe API: old skus = new prices
// However, we are using the Product IDs in the front end, so have to fetch
// Price IDs;
shopRouter.post('/checkout', async (req, res) => {
    const {
        email,
        productIds,
    }: {
        email: string;
        productIds: string[];
    } = req.body;

    try {
        const customer = await getOrCreateLocalCustomer(email);
        if (customer === undefined) {
            throw new Error(`customer not found: ${email}`);
        }

        const previouslyPurchased = customer.products;
        const previouslyPurchasedIds = previouslyPurchased
            ? previouslyPurchased.toArray().map((prod) => prod.id)
            : undefined;

        const duplicates = productIds.reduce((acc, pID) => {
            if (previouslyPurchasedIds?.includes(pID)) {
                acc.push(pID);
                return acc;
            }
            return acc;
        }, [] as string[]);

        if (duplicates.length !== 0) {
            res.status(422).json({
                skus: duplicates,
            });
            return;
        }

        const prods = await orm.em.find(Product, { id: { $in: productIds } });

        const priceIds = prods.map((prod) => prod.priceId);

        const sessionId = await stripeClient.createCheckoutSession(
            productIds,
            priceIds,
            customer.stripeId,
        );
        res.json({
            sessionId,
        });
    } catch (e) {
        console.error('Checkout error', e);
        res.sendStatus(400);
    }
});

shopRouter.post('/get-purchased', async (req, res) => {
    const { email } = req.body;

    try {
        const localCustomer = await orm.em.findOneOrFail(
            User,
            { $and: [{ username: email }, { role: 'customer' }] },
            { populate: ['products'] },
        );

        const purchased = localCustomer.products;
        const purchasedIDs = purchased.toArray().map((prod) => prod.id);

        res.json({
            skus: purchasedIDs,
        });
    } catch (e) {
        console.error(`Failed to get skus of customer with email: ${email}`, e);
        res.sendStatus(400);
    }
});

shopRouter.post('/resend-purchased', async (req, res) => {
    const { email } = req.body;

    try {
        const localCustomer = await orm.em.findOneOrFail(
            User,
            { $and: [{ username: email }, { role: 'customer' }] },
            { populate: ['products'] },
        );
        const lastSent = localCustomer.lastRequest;
        if (lastSent) {
            const threshold = add(lastSent, { hours: 12 });
            if (isBefore(new Date(), threshold)) {
                throw Error('Resending too soon.');
            }
        }
        const purchased = localCustomer.products;
        if (purchased.length === 0) {
            throw Error('No products purchased');
        }
        const purchasedIDs = purchased.toArray().map((prod) => prod.id);
        await mailer.emailPDFs(purchasedIDs, email);
        localCustomer.lastRequest = new Date();
        orm.em.flush();
        res.sendStatus(200);
    } catch (e) {
        console.error(`Failed to resend purchased pdfs of email: ${email}`, e);
        res.sendStatus(200); // We don't want to give away whether email exists or not.
    }
});

export default shopRouter;
