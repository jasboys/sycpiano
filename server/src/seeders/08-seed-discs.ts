import * as fs from 'fs';
import { DiscCreationAttributes } from '../models/disc';
import * as path from 'path';
import { ModelMap } from '../types';

export const up = async (models: ModelMap): Promise<void> => {
    const model = models.disc;
    const filePath = path.join(process.env.SEED_DATA_DIR, `discs.json`);
    try {
        const content = await fs.promises.readFile(filePath, { encoding: 'utf8' });
        const json: Array<{
            [key: string]: any;
        }> = JSON.parse(content);

        for (const item of json) {
            try {
                await model.create(item as DiscCreationAttributes, {
                    include: [models.discLink],
                });
            } catch (e) {
                console.log(e);
            }
        }
    } catch (e) {
        console.log(e);
    }
};

export const down = async (models: ModelMap): Promise<number> => {
    return models.disc.destroy({ where: {}, cascade: true });
};
