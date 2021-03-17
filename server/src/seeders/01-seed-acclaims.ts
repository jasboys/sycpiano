import * as fs from 'fs';
import { omit } from 'lodash';
import * as path from 'path';
import { ModelMap } from 'types';

export const up = async (models: ModelMap): Promise<void> => {
    const model = models.acclaim;
    const filePath = path.join(process.env.SEED_DATA_DIR, 'acclaim.json');
    try {
        const content = await fs.promises.readFile(filePath, { encoding: 'utf8' });

        const json: Array<{
            [key: string]: any;
        }> = JSON.parse(content);

        const items = json.map((obj) => omit(obj, ['ID']));
        await model.bulkCreate(items);
    } catch (e) {
        console.log(e);
    }
};

export const down = async (models: ModelMap): Promise<number> => {
    return models.acclaim.destroy({ truncate: true });
};
