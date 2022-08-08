import * as path from 'path';
import { SequelizeStorage, Umzug } from 'umzug';

import sequelize from './sequelize';

const umzug = new Umzug({
    storage: new SequelizeStorage({
        sequelize,
        modelName: 'migrations',
    }),
    migrations: {
        glob: path.join(__dirname, 'migrations', '*.js'),
        resolve: ({ name, path, context }) => {
            if (!path) {
                throw new Error('no path');
            }
            /* eslint-disable-next-line @typescript-eslint/no-var-requires */
            const migration = require(path);
            return {
                // adjust the parameters Umzug will
                // pass to migration methods when called
                name,
                up: async () => migration.up(context, sequelize.constructor),
                down: async () => migration.down(context, sequelize.constructor),
            }
        },
    },
    context: sequelize.getQueryInterface(),
    logger: console,
});

umzug.runAsCLI();
