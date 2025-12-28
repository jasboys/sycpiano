import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import multer from 'multer';
import orm from '../database.js';
import { MusicFile } from '../models/MusicFile.js';
import { crud } from './crud.js';
import {
    genWaveformAndReturnDuration,
    getAudioDuration,
} from './genWaveform.js';
import { respondWithError } from './index.js';
import { mikroCrud } from './mikroCrud.js';

const musicStorage = multer.diskStorage({
    destination: resolve(process.env.MUSIC_ASSETS_DIR),
    filename: async (req, _file, cb) => {
        const fileName = req.body.fileName;
        try {
            await stat(resolve(process.env.MUSIC_ASSETS_DIR, fileName));
            cb(Error('File already exists'), '');
        } catch (_e) {
            cb(null, req.body.fileName);
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
        } catch (_e) {
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
