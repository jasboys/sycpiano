import * as fs from 'fs';
import { MusicCreationAttributes } from '../models/music';
import * as path from 'path';
import { ModelMap } from '../types';

const isDev = process.env.NODE_ENV !== 'production';

export const up = async (models: ModelMap): Promise<void> => {
    const model = models.music;
    const filePath = path.join(process.env.SEED_DATA_DIR, `music${isDev ? '_example' : ''}.json`);
    try {
        const content = await fs.promises.readFile(filePath, { encoding: 'utf8' });
        const json: Array<{
            [key: string]: any;
        }> = JSON.parse(content);

        json.forEach(async (item) => {
            try {
                await model.create(item as MusicCreationAttributes, {
                    include: [models.musicFile],
                });
            } catch (e) {
                console.log(e);
            }
        });
    } catch (err) {
        console.log(err);
    }
};

export const down = async (models: ModelMap): Promise<number> => {
    return models.music.destroy({ where: {}, cascade: true });
};
