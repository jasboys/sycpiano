import { statSync } from 'fs';
import { Photo } from 'models/Photo.js';
import multer from 'multer';
import { crud, setGetListHeaders } from './crud.js';
import { genThumbnail, getDateTaken } from './genThumbnail.js';
import { mikroCrud } from './mikroCrud.js';
import { resolve } from 'path';
import orm from 'database.js';

const photoStorage = multer.diskStorage({
    destination: resolve(process.env.IMAGE_ASSETS_DIR, 'gallery'),
    filename: (req, _file, cb) => {
        const fileName = req.body.fileName;
        const exists = statSync(
            resolve(process.env.IMAGE_ASSETS_DIR, 'gallery', fileName),
            {
                throwIfNoEntry: false,
            },
        );
        if (exists === undefined) {
            cb(null, req.body.fileName);
        } else {
            cb(Error('File already exists'), '');
        }
    },
});

const photoUpload = multer({ storage: photoStorage });

const photoRouter = crud('/photos', mikroCrud({ entity: Photo }));

photoRouter.post(
    '/photos/upload',
    photoUpload.single('photo'),
    async (req, res) => {
        try {
            const imageData = await genThumbnail(req.body.fileName);
            res.json({ fileName: req.body.fileName, ...imageData });
        } catch (e) {
            res.statusMessage = 'Error generating thumbnail';
            res.sendStatus(500);
        }
    },
);

photoRouter.post('/actions/photos/populate-date-taken', async (_req, res) => {
    const [photos, count] = await orm.em.findAndCount(Photo, {
        dateTaken: { $eq: null },
    });
    for (const p of photos) {
        const dateTaken = p.file ? await getDateTaken(p.file) : undefined;
        p.dateTaken = dateTaken;
    }
    await orm.em.flush();
    setGetListHeaders(res, count, photos.length);
    res.json({ count, rows: photos });
});

export const photoHandler = photoRouter;
