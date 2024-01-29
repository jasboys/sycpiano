import orm from '../database.js';
import { format } from 'date-fns';
import express from 'express';
import { stat, rename } from 'fs/promises';
import { Product, ProductTypes } from '../models/Product.js';
import multer from 'multer';
import { parse, resolve } from 'path';
import * as stripeClient from '../stripe.js';
import { crud, setGetListHeaders } from './crud.js';
import { respondWithError } from './index.js';
import { mikroCrud } from './mikroCrud.js';

const productStorage = multer.diskStorage({
    destination: (_req, file, cb) => {
        let dest: string;
        if (file.fieldname === 'pdf') {
            dest = resolve(process.env.PRODUCTS_DIR);
        } else {
            dest = resolve(
                process.env.IMAGE_ASSETS_DIR,
                'products',
                'thumbnails',
            );
        }
        cb(null, dest);
    },
    filename: async (req, file, cb) => {
        if (file.fieldname === 'pdf') {
            const { name, ext } = parse(
                req.body.fileName.replace(/ - /g, '-').replace(/ /g, '_'),
            );
            try {
                const exists = await stat(
                    resolve(process.env.PRODUCTS_DIR, `${name}${ext}`),
                );
                const oldDate = exists.ctime;
                await rename(
                    resolve(process.env.PRODUCTS_DIR, `${name}${ext}`),
                    resolve(
                        process.env.PRODUCTS_DIR,
                        'oldversions',
                        `${name}_${format(oldDate, 'yyyyMMdd')}${ext}`,
                    ),
                );
            } catch (e) {
            } finally {
                cb(null, `${name}${ext}`);
            }
        } else {
            let fileName = req.body.imageBaseNameWithExt.replace(/ /g, '_');
            const { name, ext } = parse(fileName);
            let count = 1;
            fileName = `${name}${
                count ? `_${count.toString().padStart(2, '0')}` : ''
            }${ext}`;
            try {
                while (
                    await stat(
                        resolve(
                            process.env.IMAGE_ASSETS_DIR,
                            'products',
                            'thumbnails',
                            fileName,
                        ),
                    )
                ) {
                    fileName = `${name}${
                        count ? `_${count.toString().padStart(2, '0')}` : ''
                    }${ext}`;
                    count++;
                }
            } catch (e) {
            } finally {
                cb(null, fileName);
            }
        }
    },
});

const productUpload = multer({ storage: productStorage });

const productRouter = crud(
    '/products',
    mikroCrud({
        entity: Product,
        searchableFields: ['name', 'file', 'type'],
    }),
);

productRouter.post(
    '/products/upload',
    productUpload.fields([{ name: 'samples[]' }, { name: 'pdf', maxCount: 1 }]),
    async (req, res) => {
        if (Array.isArray(req.files)) {
            throw Error('unexpected array');
        }
        res.json({
            images: req.files?.['samples[]']?.map((f) => f.filename),
            pdf: req.files?.pdf?.[0].filename,
        });
    },
);

productRouter.post(
    '/actions/products/pull-from-stripe',
    async (_: express.Request, res: express.Response) => {
        try {
            const pricesAndProducts = await stripeClient.getPricesAndProducts();
            const data = pricesAndProducts.map((prod) => {
                if (!stripeClient.productIsObject(prod)) {
                    throw Error(
                        'Product expansion failed, or no product tied to Price.',
                    );
                }
                const {
                    id,
                    name,
                    description,
                    metadata: { type, sample, pages, permalink, file },
                    images,
                    default_price,
                } = prod;
                if (typeof default_price === 'string' || !default_price) {
                    throw Error('default_price not expanded');
                }

                return {
                    id,
                    name,
                    description: description ?? '',
                    price: default_price.unit_amount ?? 0,
                    pages: parseInt(pages),
                    file: file ?? '',
                    images:
                        images.length !== 0
                            ? images.map((v) =>
                                  v.replace(stripeClient.THUMBNAIL_STATIC, ''),
                              )
                            : undefined,
                    type: type as (typeof ProductTypes)[number],
                    sample,
                    priceId: default_price.id ?? '',
                    permalink: permalink ?? '',
                };
            });
            const products = await orm.em.upsertMany(Product, data);
            const count = await orm.em.count(Product, {});

            setGetListHeaders(res, count, products.length);
            res.status(201).json(products);
        } catch (e) {
            respondWithError(e as Error, res);
        }
    },
);

export const productHandler = productRouter;
