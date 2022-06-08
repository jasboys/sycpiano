import { ModelMap } from '../types';
import { getHash } from '../hash';

export const up = async (models: ModelMap): Promise<void> => {
    const model = models.music;
    const musics = await model.findAll({
        attributes: ['id', 'composer', 'piece'],
    });
    try {
        for (const music of musics) {
            const {
                composer,
                piece,
            } = music;
            const musicFiles = await music.getMusicFiles({ attributes: ['id', 'name'] });
            for (const musicFile of musicFiles) {
                const hash = getHash(composer, piece, musicFile.name);
                await musicFile.update({ hash });
            }
        }
    } catch (e) {
        console.log(e);
    }
};

/* eslint-disable-next-line @typescript-eslint/no-empty-function */
export const down = (): void => { };
