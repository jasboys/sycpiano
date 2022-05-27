import { DataTypes, HasManyGetAssociationsMixin, HasManySetAssociationsMixin, Model, Optional, Sequelize } from 'sequelize';
import { ModelExport, ModelMap } from '../types';
import { musicFile } from './musicFile';

export interface MusicAttributes {
    id: string;
    composer: string;
    piece: string;
    contributors: string;
    type: string;
    year: number;
}

export interface MusicCreationAttributes extends Optional<Omit<MusicAttributes, 'id'>, 'contributors' | 'year'> {}

export class music extends Model<MusicAttributes, MusicCreationAttributes> implements MusicAttributes {
    declare id: string;
    declare composer: string;
    declare piece: string;
    declare contributors: string;
    declare type: string;
    declare year: number;
    declare readonly musicFiles: musicFile[];
    declare readonly createdAt?: Date | string;
    declare readonly updatedAt?: Date | string;

    declare readonly getMusicFiles: HasManyGetAssociationsMixin<musicFile>;
    declare readonly setMusicFiles: HasManySetAssociationsMixin<musicFile, musicFile['id']>;
}

const hookFn = async (m: music, _: any) => {
    console.log(`[Music Hook afterCreate/Update]\n`);
    const mFiles = await m.getMusicFiles();
    if (mFiles.length !== 0) {
        await Promise.each(mFiles, async (mFile) => {
            return await mFile.update({});
        });
    }
    console.log(`[End Hook]\n`);
};

export default (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelExport<music> => {
    music.init({
        id: {
            allowNull: false,
            defaultValue: dataTypes.UUIDV4,
            primaryKey: true,
            type: dataTypes.UUID,
            unique: true,
        },
        composer: dataTypes.STRING,
        piece: dataTypes.STRING,
        contributors: dataTypes.STRING,
        type: dataTypes.STRING,
        year: dataTypes.INTEGER,
    }, {
        hooks: {
            afterCreate: hookFn,
            afterUpdate: hookFn,
        },
        sequelize,
        tableName: 'music',
    });

    const associate = (models: ModelMap) => {
        music.hasMany(models.musicFile);
    };

    return {
        model: music,
        associate,
    };
};
