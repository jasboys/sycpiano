import * as fs from 'fs';
import * as path from 'path';
import { ModelMap } from 'types';

export const up = async (models: ModelMap): Promise<void> => {
    const model = models.photo;
    const filePath = path.join(process.env.SEED_DATA_DIR, 'photos.json');
    try {
        const content = await fs.promises.readFile(filePath, { encoding: 'utf8' });
        const json: Array<{
            [key: string]: any;
        }> = JSON.parse(content);

        await model.bulkCreate(json);
    } catch (e) {
        console.log(e);
    }
};

export const down = async (models: ModelMap): Promise<number> => {
    return models.photo.destroy({ truncate: true });
};
