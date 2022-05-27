import * as fs from 'fs';
import * as path from 'path';
import { Sequelize, DataTypes, Model } from 'sequelize';

import sequelize from '../sequelize';
import { ModelMap, ModelExport, IndexedModelMap } from '../types';

/**
 * Loops through a list of model files, and transforms them into a map that
 * maps each model name to the corresponding sequelize model.
 */

const connections = {
    sycpiano: sequelize,
};

interface Accumulator {
    models: IndexedModelMap;
    associations: Array<(models: ModelMap) => void>;
}

const importModels = (seq: Sequelize): ModelMap => {
    const { models, associations } = fs.readdirSync(__dirname).filter((file) => {
        return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
    }).reduce((out, file) => {
        /* eslint-disable-next-line @typescript-eslint/no-var-requires */
        const { model, associate } = require(path.join(__dirname, file)).default(seq, DataTypes) as ModelExport<Model>;
        out.models[model.name] = model;
        if (!!associate) {
            out.associations.push(associate);
        }
        return out;
    }, { models: {}, associations: [] } as Accumulator);

    // execute associations
    associations.forEach((associateFn) => {
        associateFn(models as ModelMap);
    });

    return (models as ModelMap);
};

const db = {
    connections,
    objectMapping: Sequelize,
    sequelize,
    // Export the function, in case we ever want to use it with
    // a different DB connection.
    importModels,
    models: importModels(sequelize),
};

export default db;
