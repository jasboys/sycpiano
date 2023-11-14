import axios from 'axios';
import { createHash } from 'crypto';
import { isValid, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import * as dotenv from 'dotenv';
import { bind, startCase } from 'lodash-es';
import {
    ParamParseKey,
    PathMatch,
    PathPattern,
    matchPath,
} from '@remix-run/router';

import { baseString, descriptions } from 'common';
import orm from './database.js';
import { MusicFile } from './models/MusicFile.js';
import { Calendar } from './models/Calendar.js';
import { expr } from '@mikro-orm/core';

dotenv.config({ override: true });

const YoutubeAPIKey = process.env.GAPI_KEY_SERVER;
const YoutubeVideoUrl = 'https://www.googleapis.com/youtube/v3/playlistItems';
const playlistId = 'PLzauXr_FKIlhzArviStMMK08Xc4iuS0n9';

interface Meta {
    title: string;
    description: string;
    image?: string;
    sanitize?: string;
}

interface GetVideoResponse {
    items: {
        snippet: {
            title: string;
            description: string;
            thumbnails: {
                standard: {
                    url: string;
                };
            };
        };
    }[];
}

const notFound: Meta = {
    title: `${baseString}404: Not Found`,
    description: descriptions.home,
};

type PartialPathMatch = <
    ParamKey extends ParamParseKey<Path>,
    Path extends string,
>(
    pattern: PathPattern<Path> | Path,
) => PathMatch<ParamKey> | null;

class MatchException extends Error {
    constructor(public sanitize?: string) {
        super('MatchException');
    }
}

export const getMetaFromPathAndSanitize = async (
    url: string,
    query?: string,
): Promise<Meta> => {
    const matchInstance: PartialPathMatch = bind(
        matchPath,
        null,
        bind.placeholder,
        url,
    ); // Make my typing easier
    let match: PathMatch<string> | null;
    if ((match = matchInstance('/'))) {
        return {
            title: `${baseString}Home`,
            description: descriptions.home,
        };
    }
    if ((match = matchInstance('/contact'))) {
        return {
            title: `${baseString}Contact`,
            description: descriptions.contact,
        };
    }
    if ((match = matchInstance('/about/:about'))) {
        const about = match.params.about;
        if (!about || !['biography', 'discography', 'press'].includes(about)) {
            return notFound;
        }
        return {
            title: `${baseString}About | ${startCase(about)}`,
            description: descriptions[about],
        };
    }
    if ((match = matchInstance('/shop/:shop'))) {
        const shop = match.params.shop;
        if (!shop || !['scores', 'faqs', 'checkout-success'].includes(shop)) {
            return notFound;
        }
        return {
            title: `${baseString}Shop | ${startCase(shop)}`,
            description: descriptions[shop],
        };
    }
    if ((match = matchInstance('/media/photos'))) {
        return {
            title: `${baseString}Media | Photos`,
            description: descriptions.photos,
        };
    }
    if ((match = matchInstance('/media/music/*'))) {
        try {
            const { '*': music } = match.params;
            console.log(music);
            if (!music) {
                throw new MatchException(undefined);
            }

            const hash = createHash('sha1')
                .update(`/${music}`)
                .digest('base64');

            const musicFile = await orm.em.findOne(
                MusicFile,
                { hash },
                { populate: ['music'] },
            );
            if (musicFile === null) {
                throw new MatchException(music);
            }

            const { composer, piece, contributors } = musicFile.music;

            return {
                title: `${baseString}Music | ${composer} ${piece}${
                    musicFile.name ? ` - ${musicFile.name}` : ''
                }`,
                description: descriptions.getMusic(
                    `${composer} ${piece}${
                        musicFile.name ? ` - ${musicFile.name}` : ''
                    }`,
                    contributors,
                ),
            };
        } catch (e) {
            return {
                title: `${baseString}Media | Music`,
                description: descriptions.music,
                sanitize: e instanceof MatchException ? e.sanitize : undefined,
            };
        }
    }
    if ((match = matchInstance('/media/videos/*'))) {
        try {
            const videoId = match.params['*'];
            if (!videoId) {
                throw new MatchException(undefined);
            }
            const playlistResponse = await axios.get<GetVideoResponse>(
                YoutubeVideoUrl,
                {
                    params: {
                        key: YoutubeAPIKey,
                        maxResults: 1,
                        part: 'id, snippet',
                        playlistId,
                        videoId,
                    },
                },
            );
            const video = playlistResponse.data.items[0];
            return {
                title: `${baseString}Videos | ${video.snippet.title}`,
                description: video.snippet.description,
                image: video.snippet.thumbnails.standard.url,
            };
        } catch (e) {
            return {
                title: `${baseString}Media | Videos`,
                description: descriptions.videos,
                sanitize: e instanceof MatchException ? e.sanitize : undefined,
            };
        }
    }
    if ((match = matchInstance('/schedule/:type/*'))) {
        try {
            const { type, '*': eventISO } = match.params;
            if (
                !type ||
                !['upcoming', 'archive', 'search', 'event'].includes(type)
            ) {
                return notFound;
            }
            if (type === 'search') {
                return {
                    title: `${baseString}Schedule | ${startCase(type)}`,
                    description: query
                        ? descriptions.searchResults(query)
                        : descriptions.search,
                };
            }

            if (!eventISO) {
                if (type === 'event') {
                    throw new MatchException(type);
                }
                return {
                    title: `${baseString}Schedule | ${startCase(type)}`,
                    description: descriptions[type],
                };
            }
            const date = parseISO(eventISO);
            if (!isValid(date)) {
                throw new MatchException(eventISO);
            }
            const event = await orm.em.findOne(Calendar, {
                [expr('date_time::date')]: date.toISOString(),
            });
            if (event === null) {
                throw new MatchException(eventISO);
            }
            return {
                title: `${baseString}Schedule | ${formatInTimeZone(
                    event.dateTime,
                    event.timezone,
                    'EEE, MMMM dd, yyyy, h:mmaaa z',
                )}`,
                description: `${event.name} | ${event.location}`,
            };
        } catch (e) {
            return {
                title: `${baseString}Schedule`,
                description: descriptions.upcoming,
                sanitize: e instanceof MatchException ? e.sanitize : undefined,
            };
        }
    }
    return notFound;
};
