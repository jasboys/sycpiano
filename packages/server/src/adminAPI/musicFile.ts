import { statSync } from 'fs';
import { MusicFile } from 'models/MusicFile.js';
import multer from 'multer';
import { resolve } from 'path';
import { crud } from './crud.js';
import {
    genWaveformAndReturnDuration,
    getAudioDuration,
} from './genWaveform.js';
import { mikroCrud } from './mikroCrud.js';
import orm from 'database.js';
import { respondWithError } from './index.js';

const musicStorage = multer.diskStorage({
    destination: resolve(process.env.MUSIC_ASSETS_DIR),
    filename: (req, _file, cb) => {
        const fileName = req.body.fileName;
        const exists = statSync(
            resolve(process.env.MUSIC_ASSETS_DIR, fileName),
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

const musicFileUpload = multer({ storage: musicStorage });

const musicFileRouter = crud(
    '/music-files',
    mikroCrud({
        entity: MusicFile,
        searchableFields: ['audioFile', 'name'],
    }),
);

musicFileRouter.post(
    '/music-files/upload',
    musicFileUpload.single('audioFile'),
    async (req, res) => {
        try {
            const duration = await genWaveformAndReturnDuration(
                req.body.fileName,
            );

            res.json({ fileName: req.body.fileName, duration });
        } catch (e) {
            res.statusMessage = 'Error generating waveform';
            res.sendStatus(500);
        }
    },
);

musicFileRouter.post(
    '/actions/music-files/recalculate-duration/:id',
    async (req, res) => {
        const id = req.params.id;
        const musicFile = await orm.em.findOne(MusicFile, id);
        if (musicFile) {
            try {
                const dur = await getAudioDuration(musicFile.audioFile);
                musicFile.durationSeconds = dur;
                orm.em.flush();
                res.json(musicFile);
            } catch (e) {
                respondWithError(e as Error, res);
            }
        }
    },
);

export const musicFileHandler = musicFileRouter;
