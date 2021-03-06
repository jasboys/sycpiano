
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { Stripe } from 'stripe';
import { ParamsDictionary } from 'express-serve-static-core';

import { ShopItem } from 'types';
import * as stripeClient from '../stripe';
import { emailPDFs } from '../mailer';
import db from '../models';
import { Op } from 'sequelize';
import { ProductTypes } from '../models/product';
import { pick } from 'lodash';

const shopRouter = express.Router();

// add webhook first because it needs raw body
shopRouter.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    console.log(req.body, sig);

    try {
        event = stripeClient.constructEvent(req.body, sig);
    } catch (e) {
        console.error(e);
        return res.status(400).send(`Webhook Error: ${e.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        try {
            const customerID = session.customer as string;
            const productIDs = await stripeClient.getProductIDsFromPaymentIntent(session.payment_intent as string);
            const email = await stripeClient.getEmailFromCustomer(customerID);
            // Add associations to local model
            const customer = await db.models.customer.findOne({ where: { id: customerID } });
            customer.addProducts(productIDs);

            await emailPDFs(productIDs, email, session.client_reference_id);
        } catch (e) {
            console.error('Failed to send email: ', e);
        }
    }

    res.json({ received: true });
});

shopRouter.use(bodyParser.json());

shopRouter.get('/items', async (_, res) => {
    const products = await db.models.product.findAll();
    const storeItems: Partial<Record<typeof ProductTypes[number], ShopItem[]>> =
        ProductTypes.reduce((acc, type) => {
            const prods =
                products
                    .filter(({ type: t }) => t === type)
                    .map(({ dataValues: { createdAt, updatedAt, ...prod } }) => ({
                        ...prod,
                        format: 'pdf',
                    }));
            return {
                ...acc,
                [type]: prods,
            };
        }, {});
    res.json(storeItems);
});

shopRouter.get('/faqs', async (_, res) => {
    const faqs = await db.models.faq.findAll();
    res.json(faqs);
});

const getOrCreateLocalCustomer = async (email: string) => {
    try {
        const stripeCustomer = await stripeClient.getOrCreateCustomer(email);
        const localCustomer = await db.models.customer.findAll({
            where: {
                id: stripeCustomer.id,
            },
        });

        if (localCustomer.length === 0) {
            return await db.models.customer.create({
                id: stripeCustomer.id,
            })
        } else {
            return localCustomer[0];
        }
    } catch (e) {
        console.log(e);
    }
};

shopRouter.get<ParamsDictionary, any, any, { session_id: string }>('/checkoutSuccess', async (req, res) => {
    const {
        session_id: sessionId
    } = req.query;

    const { session, lineItems } = await stripeClient.getCheckoutSession(sessionId);

    res.json({
        session: pick(session, ['customer_details', 'client_reference_id']),
        lineItems: lineItems.map((item) => item.description),
    });
})

// new stripe API: old skus = new prices
// However, we are using the Product IDs in the front end, so have to fetch
// Price IDs;
shopRouter.post('/checkout', async (req, res) => {
    const {
        email,
        productIDs,
    }: {
        email: string;
        productIDs: string[];
    } = req.body;

    try {
        const customer = await getOrCreateLocalCustomer(email);

        const previouslyPurchased = await customer.getProducts();
        const previouslyPurchasedIDs = previouslyPurchased.map((prod) => prod.id);

        const duplicates = productIDs.reduce((acc, pID) => {
            if (previouslyPurchasedIDs.includes(pID)) {
                return [pID, ...acc];
            } else {
                return acc;
            }
        }, []);

        if (duplicates.length !== 0) {
            res.status(422).json({
                skus: duplicates,
            });
            return;
        }

        const priceIDs = (await db.models.product.findAll({
            where: {
                id: {
                    [Op.or]: productIDs,
                }
            },
            attributes: ['priceID'],
        })).map((prod) => prod.priceID);

        const sessionId = await stripeClient.createCheckoutSession(
            productIDs,
            priceIDs,
            customer.id,
        );
        res.json({
            sessionId
        });
    } catch (e) {
        console.error('Checkout error', e);
        res.sendStatus(400);
    }
});

shopRouter.post('/get-purchased', async (req, res) => {
    const {
        email
    } = req.body;

    try {
        const stripeCustomer = await stripeClient.getCustomer(email);
        const localCustomer = await db.models.customer.findAll({ where: { id: stripeCustomer.id } });
        const purchased = await localCustomer[0].getProducts();
        const purchasedIDs = purchased.map((prod) => prod.id);
        res.json({
            skus: purchasedIDs,
        });
    } catch (e) {
        console.error(`Failed to get skus of customer with email: ${email}`, e);
        res.sendStatus(400);
    }

});

shopRouter.post('/resend-purchased', async (req, res) => {
    const {
        email
    } = req.body;

    try {
        const stripeCustomer = await stripeClient.getCustomer(email);
        const localCustomer = await db.models.customer.findAll({ where: { id: stripeCustomer.id } });
        const purchased = await localCustomer[0].getProducts();
        const purchasedIDs = purchased.map((prod) => prod.id);
        await emailPDFs(purchasedIDs, email);
        res.sendStatus(200);
    } catch (e) {
        console.error(`Failed to resend purchased pdfs of email: ${email}`, e);
        res.sendStatus(200);    // We don't want to give away whether email exists or not.
    }
});

export default shopRouter;
