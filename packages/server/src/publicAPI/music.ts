import { type EntityDTO, type Loaded, wrap } from '@mikro-orm/core';
import type { NextFunction, Request, Response } from 'express';
import orm from '../database.js';
import { getLastName } from '../hash.js';
import { Music } from '../models/Music.js';

type MusicResponse = EntityDTO<Loaded<Music, 'musicFiles'>>;

interface GroupedMusic {
    [key: string]: MusicResponse[];
}

const musicCompare = (a: MusicResponse, b: MusicResponse) => {
    const nameCompare = (getLastName(a.composer) ?? '').localeCompare(
        getLastName(b.composer) ?? '',
    );
    if (nameCompare === 0) {
        return a.piece.localeCompare(b.piece);
    }
    return nameCompare;
};

const groupMusic = (musicList: MusicResponse[]): GroupedMusic => {
    const accumulator: GroupedMusic = {};
    for (const m of musicList) {
        const groupKey = m.type;
        if (accumulator[groupKey] === undefined) {
            accumulator[groupKey] = [m];
        } else {
            accumulator[groupKey].push(m);
        }
    }
    return accumulator;
};

const musicHandler = async (
    _: Request,
    res: Response,
    __: NextFunction,
): Promise<void> => {
    const results = await orm.em.find(Music, {}, { populate: ['musicFiles'] });
    const withGetter = results.map((m) => wrap(m).toJSON());

    // const [solo, concerto, chamber, composition, videogame] = await Promise.all([
    //     getMusicInstancesOfType('solo'),
    //     getMusicInstancesOfType('concerto'),
    //     getMusicInstancesOfType('chamber'),
    //     getMusicInstancesOfType('composition'),
    //     getMusicInstancesOfType('videogame'),
    // ]);
    const groupedResults = groupMusic(withGetter);
    Object.keys(groupedResults).forEach((k: keyof GroupedMusic) => {
        groupedResults[k].sort(musicCompare);
    });

    res.json(groupedResults);
};

export default musicHandler;
