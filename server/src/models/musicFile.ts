import { BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { getHash } from '../hash';
import { ModelExport, ModelMap } from '../types';
import { music } from './music';

export interface MusicFileAttributes {
    id: string;
    name: string;
    audioFile: string;
    waveformFile: string;
    durationSeconds: number;
    musicId: string;
    hash: string;
}

export interface MusicFileCreationAttributes extends Optional<Omit<MusicFileAttributes, 'id'>, 'hash'> { }

export class musicFile extends Model<MusicFileAttributes, MusicFileCreationAttributes> implements MusicFileAttributes {
    declare id: string;
    declare name: string;
    declare audioFile: string;
    declare waveformFile: string;
    declare durationSeconds: number;
    declare musicId: string;
    declare hash: string;
    declare readonly createdAt?: Date | string;
    declare readonly updatedAt?: Date | string;

    declare readonly getMusic: BelongsToGetAssociationMixin<music>;
    declare readonly setMusic: BelongsToSetAssociationMixin<music, music['id']>;
    declare readonly music: music;
}

const hookFn = async (mFile: musicFile, _: any) => {
    console.log(`[musicFile Hook beforeCreate/Update]`);
    try {
        if (mFile.musicId) {
            const m: music = await mFile.getMusic();
            console.log(`Updating hash for ${mFile.id}.`);
            /* eslint-disable-next-line require-atomic-updates */
            mFile.hash = getHash(m.composer, m.piece, mFile.name);
        }
    } catch (error) {
        console.log('error beforecreate hook', error);
    }
    console.log(`[End Hook]\n`);
};

export default (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelExport<musicFile> => {
    musicFile.init({
        id: {
            allowNull: false,
            defaultValue: dataTypes.UUIDV4,
            primaryKey: true,
            type: dataTypes.UUID,
            unique: true,
        },
        name: dataTypes.STRING,
        audioFile: {
            type: dataTypes.STRING,
            field: 'audio_file',
        },
        waveformFile: {
            type: dataTypes.STRING,
            field: 'waveform_file',
        },
        durationSeconds: {
            type: dataTypes.INTEGER,
            field: 'duration_seconds',
        },
        musicId: {
            type: dataTypes.UUID,
            field: 'music_id',
        },
        hash: dataTypes.STRING,
    }, {
        hooks: {
            beforeCreate: hookFn,
            beforeUpdate: hookFn,
        },
        sequelize,
        tableName: 'music_file',
    });

    const associate = (models: ModelMap) => {
        musicFile.belongsTo(models.music);
    };

    return {
        model: musicFile,
        associate,
    };
};
