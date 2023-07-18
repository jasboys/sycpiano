import arp from 'app-root-path';
import bluebird from 'bluebird-global';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';

globalThis.Promise = (bluebird as any);

const root = arp.toString();

import { OutgoingHttpHeaders } from 'http';
import { mkdirp } from 'mkdirp';
import Sharp from 'sharp';

const statAsync = Promise.promisify(fs.stat);

const resized = express();

resized.get('/*', async (req: express.Request<string[], any, any, { width?: string; height?: string }>, res) => {
    let imgPath = req.params[0];
    if (!imgPath) {
        res.status(404).end();
    }
    if (process.env.IMAGE_ASSETS_DIR === undefined) {
        throw new Error('Missing env vars');
    }
    imgPath = path.join(process.env.IMAGE_ASSETS_DIR, imgPath);

    const w = (req.query.width === undefined) ? undefined : parseInt(req.query.width, 10);
    const h = (req.query.height === undefined) ? undefined : parseInt(req.query.height, 10);

    const sendFileAsync = Promise.promisify<Promise<void>, string, OutgoingHttpHeaders>(res.sendFile);

    if (!w && !h) {
        try {
            await sendFileAsync.call(res, imgPath, { maxAge: 31536000 });
            res.end();
        } catch (e) {
            console.error(e);
        }

    } else {
        const parsedPath = path.parse(req.params[0]);
        const width = w ? `w${w}` : undefined;
        const height = h ? `h${h}` : undefined;
        const filename = `${parsedPath.name}.${width}${height}${parsedPath.ext}`;
        const newDir = path.join(root, '.resized-cache/', parsedPath.dir);
        try {
            await mkdirp(newDir);
            const newPath = path.join(newDir, filename);

            try {
                await statAsync(newPath);

                try {
                    await sendFileAsync.call(res, newPath, { maxAge: 31536000 });
                    res.end();
                } catch (e) {
                    console.error(e);
                }
            } catch (_) {
                try {
                    await Sharp(imgPath)
                        .resize(w, h, { fit: 'inside', withoutEnlargement: true })
                        .toFile(newPath);

                } catch (e) {
                    const parsedImg = path.parse(imgPath);
                    const jpegPath = `${parsedImg.dir}/${parsedImg.name}.jpg`;
                    try {
                        await statAsync(jpegPath);
                        await Sharp(jpegPath)
                            .resize(w, h, { fit: 'inside', withoutEnlargement: true })
                            .webp()
                            .toFile(newPath);
                    } catch (e) {
                        console.error(e);
                    }
                }

                await sendFileAsync.call(res, newPath, { maxAge: 31536000 });
                res.end();
            }
        } catch (e) {
            console.error(e);
        }
    }
});

export const Resized = resized;
