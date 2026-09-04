import { access, rename, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { type EntityData, wrap } from '@mikro-orm/core';
import multer from 'multer';
import orm from '../database.js';
import { Photo } from '../models/Photo.js';
import { crud, setGetListHeaders } from './crud.js';
import { genThumbnail, getDateTaken } from './genThumbnail.js';
import { mikroCrud } from './mikroCrud.js';
import { NotFoundError } from './types.js';

const photoStorage = multer.diskStorage({
    destination: resolve(process.env.IMAGE_ASSETS_DIR, 'gallery'),
    filename: async (req, _file, cb) => {
        const fileName = req.body.fileName;
        try {
            await stat(
                resolve(process.env.IMAGE_ASSETS_DIR, 'gallery', fileName),
            );
            cb(Error('File already exists'), '');
        } catch (_e) {
            cb(null, req.body.fileName);
        }
    },
});

const renameFile = async (oldPath: string, newPath: string) => {
    try {
        await access(newPath);
        return false;
    } catch (e) {
        if (e instanceof Error && 'code' in e && e.code === 'ENOENT') {
            try {
                await rename(oldPath, newPath);
                return true;
            } catch (renameError) {
                console.error('Rename failed:', e.message);
                throw renameError;
            }
        }
    }
};

const photoUpload = multer({ storage: photoStorage });

const photoRouter = crud('/photos', {
    ...mikroCrud({ entity: Photo }),
    update: async (id, body) => {
        return await orm.em.transactional(async (forkedEm) => {
            const record = await forkedEm.findOneOrFail(
                Photo,
                { id },
                {
                    failHandler: () => new NotFoundError(),
                },
            );
            if (record.file && body.file && body.file !== record.file) {
                const oldPath = resolve(
                    process.env.IMAGE_ASSETS_DIR,
                    'gallery',
                    record.file,
                );
                const newPath = resolve(
                    process.env.IMAGE_ASSETS_DIR,
                    'gallery',
                    body.file,
                );
                let success = await renameFile(oldPath, newPath);
                if (!success) {
                    throw new Error('Cannot rename, file exists');
                }
                const oldThumb = resolve(
                    process.env.IMAGE_ASSETS_DIR,
                    'gallery',
                    'thumbnails',
                    record.file,
                );
                const newThumb = resolve(
                    process.env.IMAGE_ASSETS_DIR,
                    'gallery',
                    'thumbnails',
                    body.file,
                );
                success = await renameFile(oldThumb, newThumb);
                if (!success) {
                    throw new Error('Cannot rename, file exists');
                }
            }
            wrap(record).assign(body as EntityData<Photo>, {
                mergeObjectProperties: true,
            });

            return record;
        });
    },
});

photoRouter.post(
    '/photos/upload',
    photoUpload.single('photo'),
    async (req, res) => {
        try {
            const imageData = await genThumbnail(req.body.fileName);
            res.json({ fileName: req.body.fileName, ...imageData });
        } catch (_e) {
            res.statusMessage = 'Error generating thumbnail';
            res.sendStatus(500);
        }
    },
);

photoRouter.post('/actions/photos/populate-date-taken', async (_req, res) => {
    const { photos, count } = await orm.em.transactional(async (forkedEm) => {
        const [photos, count] = await forkedEm.findAndCount(Photo, {
            dateTaken: { $eq: null },
        });
        for (const p of photos) {
            const dateTaken = p.file ? await getDateTaken(p.file) : undefined;
            p.dateTaken = dateTaken;
        }

        return { photos, count };
    });
    setGetListHeaders(res, count, photos.length);
    res.json({ count, rows: photos });
});

export const photoHandler = photoRouter;
