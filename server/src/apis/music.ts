import { Loaded } from '@mikro-orm/core';
import { SortedArray } from 'collections/sorted-array';
import { NextFunction, Request, Response } from 'express';
import orm from '../database.js';
import { getLastName } from '../hash.js';
import { Music } from '../models/Music.js';

interface GroupedMusic {
    [key: string] : SortedArray<Music>;
}

const musicEquals = (a: Music, b: Music) => a.id === b.id;

const musicCompare = (a: Music, b: Music) => {
    let nameCompare = (getLastName(a.composer) ?? '').localeCompare(getLastName(b.composer) ?? '');
    if (nameCompare === 0) {
        return a.piece.localeCompare(b.piece);
    }
    return nameCompare;
}

const groupMusic = (musicList: Loaded<Music, 'musicFiles'>[]): GroupedMusic => {
    const accumulator: GroupedMusic = {};
    for (const m of musicList) {
        const groupKey = m.type;
        if (accumulator[groupKey] === undefined) {
            accumulator[groupKey] = new SortedArray<Music>([ m ], musicEquals, musicCompare);
        } else {
            accumulator[groupKey].add(m);
        }
    }
    return accumulator;
};

const musicHandler = async (_: Request, res: Response, __: NextFunction): Promise<void> => {
    const results = await orm.em.find(Music, {}, { populate: ['musicFiles'] });

    // const [solo, concerto, chamber, composition, videogame] = await Promise.all([
    //     getMusicInstancesOfType('solo'),
    //     getMusicInstancesOfType('concerto'),
    //     getMusicInstancesOfType('chamber'),
    //     getMusicInstancesOfType('composition'),
    //     getMusicInstancesOfType('videogame'),
    // ]);
    const groupedResults = groupMusic(results);

    res.json(groupedResults);
};

export default musicHandler;
