import { stat } from 'node:fs/promises';
import * as path from 'node:path';
import * as util from 'node:util';
import arp from 'app-root-path';
import express from 'express';

const root = arp.toString();

import { mkdirp } from 'mkdirp';
import Sharp from 'sharp';

const resized = express();

resized.get(
    '/*images',
    async (
        req: express.Request<
            { images: string[] },
            unknown,
            unknown,
            { width?: string; height?: string }
        >,
        res,
    ) => {
        try {
            let imgPath = req.params.images.join('/');
            if (!imgPath) {
                res.status(404).end();
            }
            if (process.env.IMAGE_ASSETS_DIR === undefined) {
                throw new Error('Missing env vars');
            }
            imgPath = path.join(process.env.IMAGE_ASSETS_DIR, imgPath);
            const w =
                req.query.width === undefined
                    ? undefined
                    : Number.parseInt(req.query.width, 10);
            const h =
                req.query.height === undefined
                    ? undefined
                    : Number.parseInt(req.query.height, 10);

            const sendFileAsync = util.promisify<
                string,
                Record<string, unknown>
            >(res.sendFile);

            if (!w && !h) {
                try {
                    await sendFileAsync.call(res, imgPath, {
                        dotfiles: 'allow',
                        maxAge: 31536000,
                    });
                    res.end();
                } catch (e) {
                    console.error(e);
                }
            } else {
                const parsedPath = path.parse(req.params.images.join('/'));
                const width = w ? `w${w}` : '';
                const height = h ? `h${h}` : '';
                const filename = `${parsedPath.name}.${width}${height}${parsedPath.ext}`;
                const newDir = path.join(
                    root,
                    '.resized-cache/',
                    parsedPath.dir,
                );
                try {
                    await mkdirp(newDir);
                    const newPath = path.join(newDir, filename);
                    try {
                        await stat(newPath);

                        try {
                            await sendFileAsync.call(res, newPath, {
                                dotfiles: 'allow',
                                maxAge: 31536000,
                            });
                            res.end();
                        } catch (e) {
                            console.error(e);
                        }
                    } catch (_) {
                        try {
                            await Sharp(imgPath)
                                .resize(w, h, {
                                    fit: 'inside',
                                    withoutEnlargement: true,
                                })
                                .toFile(newPath);
                        } catch (_e) {
                            const parsedImg = path.parse(imgPath);
                            const jpegPath = `${parsedImg.dir}/${parsedImg.name}.jpg`;
                            try {
                                await stat(jpegPath);
                                await Sharp(jpegPath)
                                    .resize(w, h, {
                                        fit: 'inside',
                                        withoutEnlargement: true,
                                    })
                                    .webp()
                                    .toFile(newPath);
                            } catch (e) {
                                console.error(e);
                            }
                        }

                        await sendFileAsync.call(res, newPath, {
                            dotfiles: 'allow',
                            maxAge: 31536000,
                        });
                        res.end();
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        } catch (e) {
            console.log(e);
        }
    },
);

export const Resized = resized;
