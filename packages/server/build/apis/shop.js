import { add, isBefore } from "date-fns";
import * as express from "express";
import { pick } from "lodash-es";
import orm from "../database.js";
import { emailPDFs } from "../mailer.js";
import { Faq } from "../models/Faq.js";
import { Product, ProductTypes } from "../models/Product.js";
import { User } from "../models/User.js";
import { UserProduct } from "../models/UserProduct.js";
import * as stripeClient from "../stripe.js";
const shopRouter = express.Router();
// add webhook first because it needs raw body
shopRouter.post('/webhook', express.raw({
    type: 'application/json'
}), async (req, res)=>{
    const sig = req.headers['stripe-signature'];
    if (sig === undefined) {
        return res.status(400).send(`Webhook Error: no stripe signature header.`);
    }
    let event;
    // console.log(req.body, sig);
    try {
        event = stripeClient.constructEvent(req.body, sig);
    } catch (e) {
        console.error(e);
        const err = e;
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        try {
            const customerId = session.customer;
            const productIds = await stripeClient.getProductIDsFromPaymentIntent(session.payment_intent);
            const email = await stripeClient.getEmailFromCustomer(customerId);
            // Add associations to local model
            const user = await orm.em.findOne(User, {
                id: customerId
            });
            if (user === null) {
                throw new Error('no customer found');
            }
            for (const id of productIds){
                const items = orm.em.create(UserProduct, {
                    product: id,
                    user: customerId
                });
                orm.em.persist(items);
            }
            orm.em.flush();
            await emailPDFs(productIds, email, session.client_reference_id);
        } catch (e) {
            console.error('Failed to send email: ', e);
        }
    }
    res.json({
        received: true
    });
});
shopRouter.use(express.json());
const productSortPredicate = (a, b)=>{
    return a.name.localeCompare(b.name);
};
shopRouter.get('/items', async (_, res)=>{
    const products = await orm.em.find(Product, {});
    const storeItems = ProductTypes.reduce((acc, type)=>{
        const prods = products.filter(({ type: t })=>t === type).map((product)=>{
            return {
                ...product,
                format: 'pdf'
            };
        }).sort(productSortPredicate);
        return {
            ...acc,
            [type]: prods
        };
    }, {});
    res.json(storeItems);
});
shopRouter.get('/faqs', async (_, res)=>{
    const faqs = await orm.em.find(Faq, {});
    res.json(faqs);
});
const getOrCreateLocalCustomer = async (email)=>{
    try {
        const localCustomer = await orm.em.findOne(User, {
            username: email
        }, {
            populate: [
                'products'
            ]
        });
        if (localCustomer === null) {
            const stripeCustomer = await stripeClient.getOrCreateCustomer(email);
            const user = orm.em.create(User, {
                id: stripeCustomer.id,
                username: email,
                role: 'customer'
            });
            await orm.em.persist(user).flush();
        } else {
            return localCustomer;
        }
    } catch (e) {
        console.log(e);
    }
};
shopRouter.get('/checkout-success', async (req, res)=>{
    const { session_id: sessionId } = req.query;
    const { session, lineItems } = await stripeClient.getCheckoutSession(sessionId);
    res.json({
        session: pick(session, [
            'customer_details',
            'client_reference_id'
        ]),
        lineItems: lineItems.map((item)=>item.description)
    });
});
// new stripe API: old skus = new prices
// However, we are using the Product IDs in the front end, so have to fetch
// Price IDs;
shopRouter.post('/checkout', async (req, res)=>{
    const { email, productIds } = req.body;
    try {
        const customer = await getOrCreateLocalCustomer(email);
        if (customer === undefined) {
            throw new Error('customer not found');
        }
        const previouslyPurchased = customer.products;
        const previouslyPurchasedIds = previouslyPurchased.toArray().map((prod)=>prod.id);
        const duplicates = productIds.reduce((acc, pID)=>{
            if (previouslyPurchasedIds.includes(pID)) {
                return [
                    pID,
                    ...acc
                ];
            } else {
                return acc;
            }
        }, []);
        if (duplicates.length !== 0) {
            res.status(422).json({
                skus: duplicates
            });
            return;
        }
        const prods = await orm.em.find(Product, {
            id: {
                $in: productIds
            }
        });
        const priceIds = prods.map((prod)=>prod.priceId);
        const sessionId = await stripeClient.createCheckoutSession(productIds, priceIds, customer.id);
        res.json({
            sessionId
        });
    } catch (e) {
        console.error('Checkout error', e);
        res.sendStatus(400);
    }
});
shopRouter.post('/get-purchased', async (req, res)=>{
    const { email } = req.body;
    try {
        const localCustomer = await orm.em.findOneOrFail(User, {
            username: email
        }, {
            populate: [
                'products'
            ]
        });
        const purchased = localCustomer.products;
        const purchasedIDs = purchased.toArray().map((prod)=>prod.id);
        res.json({
            skus: purchasedIDs
        });
    } catch (e) {
        console.error(`Failed to get skus of customer with email: ${email}`, e);
        res.sendStatus(400);
    }
});
shopRouter.post('/resend-purchased', async (req, res)=>{
    const { email } = req.body;
    try {
        const localCustomer = await orm.em.findOneOrFail(User, {
            username: email
        }, {
            populate: [
                'products'
            ]
        });
        const lastSent = localCustomer.lastRequest;
        if (lastSent) {
            const threshold = add(lastSent, {
                hours: 12
            });
            if (isBefore(new Date(), threshold)) {
                throw Error('Resending too soon.');
            }
        }
        const purchased = localCustomer.products;
        if (purchased.length === 0) {
            throw Error('No products purchased');
        }
        const purchasedIDs = purchased.toArray().map((prod)=>prod.id);
        await emailPDFs(purchasedIDs, email);
        localCustomer.lastRequest = new Date();
        orm.em.flush();
        res.sendStatus(200);
    } catch (e) {
        console.error(`Failed to resend purchased pdfs of email: ${email}`, e);
        res.sendStatus(200); // We don't want to give away whether email exists or not.
    }
});
export default shopRouter;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGlzL3Nob3AudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXHJcbmltcG9ydCB7IGFkZCwgaXNCZWZvcmUgfSBmcm9tICdkYXRlLWZucyc7XHJcbmltcG9ydCAqIGFzIGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XHJcbmltcG9ydCB7IHBpY2sgfSBmcm9tICdsb2Rhc2gtZXMnO1xyXG5pbXBvcnQgeyBTdHJpcGUgfSBmcm9tICdzdHJpcGUnO1xyXG5cclxuaW1wb3J0IG9ybSBmcm9tICcuLi9kYXRhYmFzZS5qcyc7XHJcbmltcG9ydCB7IGVtYWlsUERGcyB9IGZyb20gJy4uL21haWxlci5qcyc7XHJcbmltcG9ydCB7IEZhcSB9IGZyb20gJy4uL21vZGVscy9GYXEuanMnO1xyXG5pbXBvcnQgeyBQcm9kdWN0LCBQcm9kdWN0VHlwZXMgfSBmcm9tICcuLi9tb2RlbHMvUHJvZHVjdC5qcyc7XHJcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuLi9tb2RlbHMvVXNlci5qcyc7XHJcbmltcG9ydCB7IFVzZXJQcm9kdWN0IH0gZnJvbSAnLi4vbW9kZWxzL1VzZXJQcm9kdWN0LmpzJztcclxuaW1wb3J0ICogYXMgc3RyaXBlQ2xpZW50IGZyb20gJy4uL3N0cmlwZS5qcyc7XHJcbmltcG9ydCB7IFNob3BJdGVtIH0gZnJvbSAnLi4vdHlwZXMuanMnO1xyXG5cclxuY29uc3Qgc2hvcFJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XHJcblxyXG4vLyBhZGQgd2ViaG9vayBmaXJzdCBiZWNhdXNlIGl0IG5lZWRzIHJhdyBib2R5XHJcbnNob3BSb3V0ZXIucG9zdCgnL3dlYmhvb2snLCBleHByZXNzLnJhdyh7IHR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyB9KSwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICBjb25zdCBzaWcgPSByZXEuaGVhZGVyc1snc3RyaXBlLXNpZ25hdHVyZSddO1xyXG5cclxuICAgIGlmIChzaWcgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuc2VuZChgV2ViaG9vayBFcnJvcjogbm8gc3RyaXBlIHNpZ25hdHVyZSBoZWFkZXIuYCk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGV2ZW50O1xyXG4gICAgLy8gY29uc29sZS5sb2cocmVxLmJvZHksIHNpZyk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBldmVudCA9IHN0cmlwZUNsaWVudC5jb25zdHJ1Y3RFdmVudChyZXEuYm9keSwgc2lnKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG4gICAgICAgIGNvbnN0IGVyciA9IGUgYXMgRXJyb3I7XHJcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5zZW5kKGBXZWJob29rIEVycm9yOiAke2Vyci5tZXNzYWdlfWApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChldmVudC50eXBlID09PSAnY2hlY2tvdXQuc2Vzc2lvbi5jb21wbGV0ZWQnKSB7XHJcbiAgICAgICAgY29uc3Qgc2Vzc2lvbiA9IGV2ZW50LmRhdGEub2JqZWN0IGFzIFN0cmlwZS5DaGVja291dC5TZXNzaW9uO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbWVySWQgPSBzZXNzaW9uLmN1c3RvbWVyIGFzIHN0cmluZztcclxuICAgICAgICAgICAgY29uc3QgcHJvZHVjdElkcyA9IGF3YWl0IHN0cmlwZUNsaWVudC5nZXRQcm9kdWN0SURzRnJvbVBheW1lbnRJbnRlbnQoc2Vzc2lvbi5wYXltZW50X2ludGVudCBhcyBzdHJpbmcpO1xyXG4gICAgICAgICAgICBjb25zdCBlbWFpbCA9IGF3YWl0IHN0cmlwZUNsaWVudC5nZXRFbWFpbEZyb21DdXN0b21lcihjdXN0b21lcklkKTtcclxuICAgICAgICAgICAgLy8gQWRkIGFzc29jaWF0aW9ucyB0byBsb2NhbCBtb2RlbFxyXG4gICAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgb3JtLmVtLmZpbmRPbmUoVXNlciwgeyBpZDogY3VzdG9tZXJJZCB9KTtcclxuICAgICAgICAgICAgaWYgKHVzZXIgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbm8gY3VzdG9tZXIgZm91bmQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIHByb2R1Y3RJZHMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1zID0gb3JtLmVtLmNyZWF0ZShVc2VyUHJvZHVjdCwgeyBwcm9kdWN0OiBpZCwgdXNlcjogY3VzdG9tZXJJZCB9KTtcclxuICAgICAgICAgICAgICAgIG9ybS5lbS5wZXJzaXN0KGl0ZW1zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcm0uZW0uZmx1c2goKTtcclxuXHJcbiAgICAgICAgICAgIGF3YWl0IGVtYWlsUERGcyhwcm9kdWN0SWRzLCBlbWFpbCwgc2Vzc2lvbi5jbGllbnRfcmVmZXJlbmNlX2lkISk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2VuZCBlbWFpbDogJywgZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlcy5qc29uKHsgcmVjZWl2ZWQ6IHRydWUgfSk7XHJcbn0pO1xyXG5cclxuc2hvcFJvdXRlci51c2UoZXhwcmVzcy5qc29uKCkpO1xyXG5cclxuY29uc3QgcHJvZHVjdFNvcnRQcmVkaWNhdGUgPSAoYTogU2hvcEl0ZW0sIGI6IFNob3BJdGVtKSA9PiB7XHJcbiAgICByZXR1cm4gYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lKTtcclxufVxyXG5cclxuc2hvcFJvdXRlci5nZXQoJy9pdGVtcycsIGFzeW5jIChfLCByZXMpID0+IHtcclxuICAgIGNvbnN0IHByb2R1Y3RzID0gYXdhaXQgb3JtLmVtLmZpbmQoUHJvZHVjdCwge30pO1xyXG4gICAgY29uc3Qgc3RvcmVJdGVtczogUGFydGlhbDxSZWNvcmQ8dHlwZW9mIFByb2R1Y3RUeXBlc1tudW1iZXJdLCBTaG9wSXRlbVtdPj4gPVxyXG4gICAgICAgIFByb2R1Y3RUeXBlcy5yZWR1Y2UoKGFjYywgdHlwZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBwcm9kcyA9XHJcbiAgICAgICAgICAgICAgICBwcm9kdWN0c1xyXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKHsgdHlwZTogdCB9KSA9PiB0ID09PSB0eXBlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKHByb2R1Y3QpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnByb2R1Y3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6ICdwZGYnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLnNvcnQocHJvZHVjdFNvcnRQcmVkaWNhdGUpO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgLi4uYWNjLFxyXG4gICAgICAgICAgICAgICAgW3R5cGVdOiBwcm9kcyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LCB7fSk7XHJcbiAgICByZXMuanNvbihzdG9yZUl0ZW1zKTtcclxufSk7XHJcblxyXG5zaG9wUm91dGVyLmdldCgnL2ZhcXMnLCBhc3luYyAoXywgcmVzKSA9PiB7XHJcbiAgICBjb25zdCBmYXFzID0gYXdhaXQgb3JtLmVtLmZpbmQoRmFxLCB7fSk7XHJcbiAgICByZXMuanNvbihmYXFzKTtcclxufSk7XHJcblxyXG5jb25zdCBnZXRPckNyZWF0ZUxvY2FsQ3VzdG9tZXIgPSBhc3luYyAoZW1haWw6IHN0cmluZykgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBsb2NhbEN1c3RvbWVyID0gYXdhaXQgb3JtLmVtLmZpbmRPbmUoVXNlciwgeyB1c2VybmFtZTogZW1haWwgfSwgeyBwb3B1bGF0ZTogWyAncHJvZHVjdHMnIF19KTtcclxuXHJcbiAgICAgICAgaWYgKGxvY2FsQ3VzdG9tZXIgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29uc3Qgc3RyaXBlQ3VzdG9tZXIgPSBhd2FpdCBzdHJpcGVDbGllbnQuZ2V0T3JDcmVhdGVDdXN0b21lcihlbWFpbCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHVzZXIgPSBvcm0uZW0uY3JlYXRlKFVzZXIsIHtcclxuICAgICAgICAgICAgICAgIGlkOiBzdHJpcGVDdXN0b21lci5pZCxcclxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiBlbWFpbCxcclxuICAgICAgICAgICAgICAgIHJvbGU6ICdjdXN0b21lcicsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBhd2FpdCBvcm0uZW0ucGVyc2lzdCh1c2VyKS5mbHVzaCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBsb2NhbEN1c3RvbWVyO1xyXG4gICAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgIH1cclxufTtcclxuXHJcbnNob3BSb3V0ZXIuZ2V0PHt9LCBhbnksIGFueSwgeyBzZXNzaW9uX2lkOiBzdHJpbmcgfT4oJy9jaGVja291dC1zdWNjZXNzJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICBjb25zdCB7XHJcbiAgICAgICAgc2Vzc2lvbl9pZDogc2Vzc2lvbklkXHJcbiAgICB9ID0gcmVxLnF1ZXJ5O1xyXG5cclxuICAgIGNvbnN0IHsgc2Vzc2lvbiwgbGluZUl0ZW1zIH0gPSBhd2FpdCBzdHJpcGVDbGllbnQuZ2V0Q2hlY2tvdXRTZXNzaW9uKHNlc3Npb25JZCk7XHJcblxyXG4gICAgcmVzLmpzb24oe1xyXG4gICAgICAgIHNlc3Npb246IHBpY2soc2Vzc2lvbiwgWydjdXN0b21lcl9kZXRhaWxzJywgJ2NsaWVudF9yZWZlcmVuY2VfaWQnXSksXHJcbiAgICAgICAgbGluZUl0ZW1zOiBsaW5lSXRlbXMubWFwKChpdGVtKSA9PiBpdGVtLmRlc2NyaXB0aW9uKSxcclxuICAgIH0pO1xyXG59KVxyXG5cclxuLy8gbmV3IHN0cmlwZSBBUEk6IG9sZCBza3VzID0gbmV3IHByaWNlc1xyXG4vLyBIb3dldmVyLCB3ZSBhcmUgdXNpbmcgdGhlIFByb2R1Y3QgSURzIGluIHRoZSBmcm9udCBlbmQsIHNvIGhhdmUgdG8gZmV0Y2hcclxuLy8gUHJpY2UgSURzO1xyXG5zaG9wUm91dGVyLnBvc3QoJy9jaGVja291dCcsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgY29uc3Qge1xyXG4gICAgICAgIGVtYWlsLFxyXG4gICAgICAgIHByb2R1Y3RJZHMsXHJcbiAgICB9OiB7XHJcbiAgICAgICAgZW1haWw6IHN0cmluZztcclxuICAgICAgICBwcm9kdWN0SWRzOiBzdHJpbmdbXTtcclxuICAgIH0gPSByZXEuYm9keTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGN1c3RvbWVyID0gYXdhaXQgZ2V0T3JDcmVhdGVMb2NhbEN1c3RvbWVyKGVtYWlsKTtcclxuICAgICAgICBpZiAoY3VzdG9tZXIgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2N1c3RvbWVyIG5vdCBmb3VuZCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcHJldmlvdXNseVB1cmNoYXNlZCA9IGN1c3RvbWVyLnByb2R1Y3RzO1xyXG4gICAgICAgIGNvbnN0IHByZXZpb3VzbHlQdXJjaGFzZWRJZHMgPSBwcmV2aW91c2x5UHVyY2hhc2VkLnRvQXJyYXkoKS5tYXAoKHByb2QpID0+IHByb2QuaWQpO1xyXG5cclxuICAgICAgICBjb25zdCBkdXBsaWNhdGVzID0gcHJvZHVjdElkcy5yZWR1Y2UoKGFjYywgcElEKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChwcmV2aW91c2x5UHVyY2hhc2VkSWRzLmluY2x1ZGVzKHBJRCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbcElELCAuLi5hY2NdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjYztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIFtdIGFzIHN0cmluZ1tdKTtcclxuXHJcbiAgICAgICAgaWYgKGR1cGxpY2F0ZXMubGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoNDIyKS5qc29uKHtcclxuICAgICAgICAgICAgICAgIHNrdXM6IGR1cGxpY2F0ZXMsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwcm9kcyA9IGF3YWl0IG9ybS5lbS5maW5kKFByb2R1Y3QsIHsgaWQ6IHsgJGluOiBwcm9kdWN0SWRzIH0gfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHByaWNlSWRzID0gcHJvZHMubWFwKChwcm9kKSA9PiBwcm9kLnByaWNlSWQpO1xyXG5cclxuICAgICAgICBjb25zdCBzZXNzaW9uSWQgPSBhd2FpdCBzdHJpcGVDbGllbnQuY3JlYXRlQ2hlY2tvdXRTZXNzaW9uKFxyXG4gICAgICAgICAgICBwcm9kdWN0SWRzLFxyXG4gICAgICAgICAgICBwcmljZUlkcyxcclxuICAgICAgICAgICAgY3VzdG9tZXIuaWQsXHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXMuanNvbih7XHJcbiAgICAgICAgICAgIHNlc3Npb25JZCxcclxuICAgICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdDaGVja291dCBlcnJvcicsIGUpO1xyXG4gICAgICAgIHJlcy5zZW5kU3RhdHVzKDQwMCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuc2hvcFJvdXRlci5wb3N0KCcvZ2V0LXB1cmNoYXNlZCcsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgY29uc3Qge1xyXG4gICAgICAgIGVtYWlsXHJcbiAgICB9ID0gcmVxLmJvZHk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBsb2NhbEN1c3RvbWVyID0gYXdhaXQgb3JtLmVtLmZpbmRPbmVPckZhaWwoVXNlciwgeyB1c2VybmFtZTogZW1haWwgfSwgeyBwb3B1bGF0ZTogWydwcm9kdWN0cyddIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBwdXJjaGFzZWQgPSBsb2NhbEN1c3RvbWVyLnByb2R1Y3RzO1xyXG4gICAgICAgIGNvbnN0IHB1cmNoYXNlZElEcyA9IHB1cmNoYXNlZC50b0FycmF5KCkubWFwKChwcm9kKSA9PiBwcm9kLmlkKTtcclxuXHJcbiAgICAgICAgcmVzLmpzb24oe1xyXG4gICAgICAgICAgICBza3VzOiBwdXJjaGFzZWRJRHMsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHRvIGdldCBza3VzIG9mIGN1c3RvbWVyIHdpdGggZW1haWw6ICR7ZW1haWx9YCwgZSk7XHJcbiAgICAgICAgcmVzLnNlbmRTdGF0dXMoNDAwKTtcclxuICAgIH1cclxuXHJcbn0pO1xyXG5cclxuc2hvcFJvdXRlci5wb3N0KCcvcmVzZW5kLXB1cmNoYXNlZCcsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgY29uc3Qge1xyXG4gICAgICAgIGVtYWlsXHJcbiAgICB9ID0gcmVxLmJvZHk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBsb2NhbEN1c3RvbWVyID0gYXdhaXQgb3JtLmVtLmZpbmRPbmVPckZhaWwoVXNlciwgeyB1c2VybmFtZTogZW1haWwgfSwgeyBwb3B1bGF0ZTogWydwcm9kdWN0cyddIH0pO1xyXG4gICAgICAgIGNvbnN0IGxhc3RTZW50ID0gbG9jYWxDdXN0b21lci5sYXN0UmVxdWVzdDtcclxuICAgICAgICBpZiAobGFzdFNlbnQpIHtcclxuICAgICAgICAgICAgY29uc3QgdGhyZXNob2xkID0gYWRkKGxhc3RTZW50LCB7IGhvdXJzOiAxMiB9KTtcclxuICAgICAgICAgICAgaWYgKGlzQmVmb3JlKG5ldyBEYXRlKCksIHRocmVzaG9sZCkpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IEVycm9yKCdSZXNlbmRpbmcgdG9vIHNvb24uJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcHVyY2hhc2VkID0gbG9jYWxDdXN0b21lci5wcm9kdWN0cztcclxuICAgICAgICBpZiAocHVyY2hhc2VkLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBFcnJvcignTm8gcHJvZHVjdHMgcHVyY2hhc2VkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHB1cmNoYXNlZElEcyA9IHB1cmNoYXNlZC50b0FycmF5KCkubWFwKChwcm9kKSA9PiBwcm9kLmlkKTtcclxuICAgICAgICBhd2FpdCBlbWFpbFBERnMocHVyY2hhc2VkSURzLCBlbWFpbCk7XHJcbiAgICAgICAgbG9jYWxDdXN0b21lci5sYXN0UmVxdWVzdCA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgb3JtLmVtLmZsdXNoKCk7XHJcbiAgICAgICAgcmVzLnNlbmRTdGF0dXMoMjAwKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gcmVzZW5kIHB1cmNoYXNlZCBwZGZzIG9mIGVtYWlsOiAke2VtYWlsfWAsIGUpO1xyXG4gICAgICAgIHJlcy5zZW5kU3RhdHVzKDIwMCk7ICAgIC8vIFdlIGRvbid0IHdhbnQgdG8gZ2l2ZSBhd2F5IHdoZXRoZXIgZW1haWwgZXhpc3RzIG9yIG5vdC5cclxuICAgIH1cclxufSk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBzaG9wUm91dGVyO1xyXG4iXSwibmFtZXMiOlsiYWRkIiwiaXNCZWZvcmUiLCJleHByZXNzIiwicGljayIsIm9ybSIsImVtYWlsUERGcyIsIkZhcSIsIlByb2R1Y3QiLCJQcm9kdWN0VHlwZXMiLCJVc2VyIiwiVXNlclByb2R1Y3QiLCJzdHJpcGVDbGllbnQiLCJzaG9wUm91dGVyIiwiUm91dGVyIiwicG9zdCIsInJhdyIsInR5cGUiLCJyZXEiLCJyZXMiLCJzaWciLCJoZWFkZXJzIiwidW5kZWZpbmVkIiwic3RhdHVzIiwic2VuZCIsImV2ZW50IiwiY29uc3RydWN0RXZlbnQiLCJib2R5IiwiZSIsImNvbnNvbGUiLCJlcnJvciIsImVyciIsIm1lc3NhZ2UiLCJzZXNzaW9uIiwiZGF0YSIsIm9iamVjdCIsImN1c3RvbWVySWQiLCJjdXN0b21lciIsInByb2R1Y3RJZHMiLCJnZXRQcm9kdWN0SURzRnJvbVBheW1lbnRJbnRlbnQiLCJwYXltZW50X2ludGVudCIsImVtYWlsIiwiZ2V0RW1haWxGcm9tQ3VzdG9tZXIiLCJ1c2VyIiwiZW0iLCJmaW5kT25lIiwiaWQiLCJFcnJvciIsIml0ZW1zIiwiY3JlYXRlIiwicHJvZHVjdCIsInBlcnNpc3QiLCJmbHVzaCIsImNsaWVudF9yZWZlcmVuY2VfaWQiLCJqc29uIiwicmVjZWl2ZWQiLCJ1c2UiLCJwcm9kdWN0U29ydFByZWRpY2F0ZSIsImEiLCJiIiwibmFtZSIsImxvY2FsZUNvbXBhcmUiLCJnZXQiLCJfIiwicHJvZHVjdHMiLCJmaW5kIiwic3RvcmVJdGVtcyIsInJlZHVjZSIsImFjYyIsInByb2RzIiwiZmlsdGVyIiwidCIsIm1hcCIsImZvcm1hdCIsInNvcnQiLCJmYXFzIiwiZ2V0T3JDcmVhdGVMb2NhbEN1c3RvbWVyIiwibG9jYWxDdXN0b21lciIsInVzZXJuYW1lIiwicG9wdWxhdGUiLCJzdHJpcGVDdXN0b21lciIsImdldE9yQ3JlYXRlQ3VzdG9tZXIiLCJyb2xlIiwibG9nIiwic2Vzc2lvbl9pZCIsInNlc3Npb25JZCIsInF1ZXJ5IiwibGluZUl0ZW1zIiwiZ2V0Q2hlY2tvdXRTZXNzaW9uIiwiaXRlbSIsImRlc2NyaXB0aW9uIiwicHJldmlvdXNseVB1cmNoYXNlZCIsInByZXZpb3VzbHlQdXJjaGFzZWRJZHMiLCJ0b0FycmF5IiwicHJvZCIsImR1cGxpY2F0ZXMiLCJwSUQiLCJpbmNsdWRlcyIsImxlbmd0aCIsInNrdXMiLCIkaW4iLCJwcmljZUlkcyIsInByaWNlSWQiLCJjcmVhdGVDaGVja291dFNlc3Npb24iLCJzZW5kU3RhdHVzIiwiZmluZE9uZU9yRmFpbCIsInB1cmNoYXNlZCIsInB1cmNoYXNlZElEcyIsImxhc3RTZW50IiwibGFzdFJlcXVlc3QiLCJ0aHJlc2hvbGQiLCJob3VycyIsIkRhdGUiXSwibWFwcGluZ3MiOiJBQUNBLFNBQVNBLEdBQUcsRUFBRUMsUUFBUSxRQUFRLFdBQVc7QUFDekMsWUFBWUMsYUFBYSxVQUFVO0FBQ25DLFNBQVNDLElBQUksUUFBUSxZQUFZO0FBR2pDLE9BQU9DLFNBQVMsaUJBQWlCO0FBQ2pDLFNBQVNDLFNBQVMsUUFBUSxlQUFlO0FBQ3pDLFNBQVNDLEdBQUcsUUFBUSxtQkFBbUI7QUFDdkMsU0FBU0MsT0FBTyxFQUFFQyxZQUFZLFFBQVEsdUJBQXVCO0FBQzdELFNBQVNDLElBQUksUUFBUSxvQkFBb0I7QUFDekMsU0FBU0MsV0FBVyxRQUFRLDJCQUEyQjtBQUN2RCxZQUFZQyxrQkFBa0IsZUFBZTtBQUc3QyxNQUFNQyxhQUFhVixRQUFRVyxNQUFNO0FBRWpDLDhDQUE4QztBQUM5Q0QsV0FBV0UsSUFBSSxDQUFDLFlBQVlaLFFBQVFhLEdBQUcsQ0FBQztJQUFFQyxNQUFNO0FBQW1CLElBQUksT0FBT0MsS0FBS0M7SUFDL0UsTUFBTUMsTUFBTUYsSUFBSUcsT0FBTyxDQUFDLG1CQUFtQjtJQUUzQyxJQUFJRCxRQUFRRSxXQUFXO1FBQ25CLE9BQU9ILElBQUlJLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUMsQ0FBQywwQ0FBMEMsQ0FBQztJQUM1RTtJQUVBLElBQUlDO0lBQ0osOEJBQThCO0lBRTlCLElBQUk7UUFDQUEsUUFBUWIsYUFBYWMsY0FBYyxDQUFDUixJQUFJ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