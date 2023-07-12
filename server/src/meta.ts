import axios from 'axios';
import { createHash } from 'crypto';
import { isValid, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import * as dotenv from 'dotenv';
import { bind, startCase } from 'lodash';
import { ParamParseKey, PathMatch, PathPattern, matchPath } from 'react-router-dom';

import { literal, where } from 'sequelize';
import _ from 'lodash';
import { baseString, descriptions } from '../../common/src/common.js';
import orm from './database.js';
import { MusicFile } from './models/MusicFile.js';
import { Calendar } from './models/Calendar.js';
import { expr } from '@mikro-orm/core';

dotenv.config({ override: true });

const YoutubeAPIKey = process.env.GAPI_KEY_SERVER;
const YoutubeVideoUrl = 'https://www.googleapis.com/youtube/v3/playlistItems';
const playlistId = 'PLzauXr_FKIlhzArviStMMK08Xc4iuS0n9';

// const { gte, lt } = Op;

// const regex = regexp.pathToRegexp('/:first/:second?/(.*)?');

// const validFirst = ['', 'about', 'contact', 'schedule', 'media', 'press', 'store', 'shop'];
// const validSecond = ['', 'biography', 'discography', 'press', 'music', 'videos', 'photos', 'upcoming', 'archive', 'search', 'scores', 'FAQs', 'checkout-success'];

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
    title: baseString + '404: Not Found',
    description: descriptions.home,
};

type PartialPathMatch = <ParamKey extends ParamParseKey<Path>, Path extends string>(pattern: PathPattern<Path> | Path) => PathMatch<ParamKey> | null

class MatchException extends Error {
    constructor(public sanitize?: string) {
        super('MatchException');
    }
}

export const getMetaFromPathAndSanitize = async (url: string, query?: string): Promise<Meta> => {
    const matchInstance: PartialPathMatch = bind(matchPath, null, _, url);  // Make my typing easier
    let match: PathMatch<string> | null;
    if (!!(match = matchInstance('/'))) {
        return {
            title: baseString + 'Home',
            description: descriptions.home,
        };
    }
    if (!!(match = matchInstance('/contact'))) {
        return {
            title: baseString + 'Contact',
            description: descriptions.contact,
        };
    }
    if (!!(match = matchInstance('/about/:about'))) {
        const about = match.params.about;
        if (!about || !['biography', 'discography', 'press'].includes(about)) {
            return notFound;
        }
        return {
            title: baseString + 'About | ' + startCase(about),
            description: descriptions[about],
        };
    }
    if (!!(match = matchInstance('/shop/:shop'))) {
        const shop = match.params.shop;
        if (!shop || !['scores', 'faqs', 'checkout-success'].includes(shop)) {
            return notFound;
        }
        return {
            title: baseString + 'Shop | ' + startCase(shop),
            description: descriptions[shop]
        };
    }
    if (!!(match = matchInstance('/media/photos'))) {
        return {
            title: baseString + 'Media | Photos',
            description: descriptions.photos,
        };
    }
    if (!!(match = matchInstance('/media/music/*'))) {
        try {
            const { '*': music } = match.params;
            console.log(music);
            if (!music) {
                throw new MatchException(undefined);
            }

            const hash = createHash('sha1').update('/' + music).digest('base64');

            const musicFile = await orm.em.findOne(
                MusicFile,
                { hash },
                { populate: ['music'] });
            if (musicFile === null) {
                throw new MatchException(music);
            }

            const {
                composer,
                piece,
                contributors,
            } = musicFile.music;

            return {
                title: baseString + 'Music | '
                    + composer + ' ' + piece
                    + (musicFile.name ? ' - ' + musicFile.name : ''),
                description: descriptions.getMusic(
                    (
                        composer + ' ' + piece
                        + (musicFile.name ? ' - ' + musicFile.name : '')
                    )
                    , contributors),
            };
        } catch (e) {
            return {
                title: baseString + 'Media | Music',
                description: descriptions.music,
                sanitize: (e instanceof MatchException) ? e.sanitize : undefined,
            };
        }
    }
    if (!!(match = matchInstance('/media/videos/*'))) {
        try {
            const videoId = match.params['*'];
            if (!videoId) {
                throw new MatchException(undefined);
            }
            const playlistResponse = await axios.get<GetVideoResponse>(YoutubeVideoUrl, {
                params: {
                    key: YoutubeAPIKey,
                    maxResults: 1,
                    part: 'id, snippet',
                    playlistId,
                    videoId,
                },
            });
            const video = playlistResponse.data.items[0];
            return {
                title: baseString + 'Videos | ' + video.snippet.title,
                description: video.snippet.description,
                image: video.snippet.thumbnails.standard.url,
            };
        } catch (e) {
            return {
                title: baseString + 'Media | Videos',
                description: descriptions.videos,
                sanitize: (e instanceof MatchException) ? e.sanitize : undefined,
            };
        }
    }
    if (!!(match = matchInstance('/schedule/:type/*'))) {
        try {
            const { type, '*': eventISO } = match.params;
            if (!type || !['upcoming', 'archive', 'search', 'event'].includes(type)) {
                return notFound;
            }
            if (type === 'search') {
                return {
                    title: baseString + 'Schedule | ' + startCase(type),
                    description: query ? descriptions.searchResults(query) : descriptions.search,
                };
            }

            if (!eventISO) {
                if (type === 'event') {
                    throw new MatchException(type);
                }
                return {
                    title: baseString + 'Schedule | ' + startCase(type),
                    description: descriptions[type],
                }
            }
            const date = parseISO(eventISO);
            if (!isValid(date)) {
                throw new MatchException(eventISO);
            }
            const event = await orm.em.findOne(
                Calendar,
                { [expr('date_time::date')]: date.toISOString() }
            );
            if (event === null) {
                throw new MatchException(eventISO);
            }
            return {
                title: baseString + 'Schedule | ' + formatInTimeZone(event.dateTime, event.timezone, 'EEE, MMMM dd, yyyy, h:mmaaa z'),
                description: event.name + ' | ' + event.location,
            };
        } catch (e) {
            return {
                title: baseString + 'Schedule',
                description: descriptions.upcoming,
                sanitize: (e instanceof MatchException) ? e.sanitize : undefined,
            }
        }
    }
    return notFound;
}

// (async () => (
//     console.log(
//         await getMetaFromPathAndSanitize('/schedule'),
//         await getMetaFromPathAndSanitize('/schedule/upcoming'),
//         await getMetaFromPathAndSanitize('/schedule/archive'),
//         await getMetaFromPathAndSanitize('/schedule/search'),
//         await getMetaFromPathAndSanitize('/schedule/search', 'mozart'),
//         await getMetaFromPathAndSanitize('/schedule/event'),
//         await getMetaFromPathAndSanitize('/schedule/event/20221127T193000'),
//     )
// ))();

// export const getMetaFromPathAndSanitize = async (url: string): Promise<Meta> => {
//     const parsed = regex.exec(url);
//     if (parsed === null) {
//         return {
//             title: baseString + 'Home',
//             description: descriptions.home,
//         };
//     }
//     if (!validFirst.includes(parsed[1])) {
//         return {
//             title: baseString + '404: Not Found',
//             description: descriptions.home,
//             notFound: true,
//         };
//     }
//     if (parsed[2] === undefined) {
//         return {
//             title: baseString + startCase(parsed[1]),
//             description: descriptions[parsed[1]],
//         };
//     }
//     if (!validSecond.includes(parsed[2]) && !/^\d{4}-\d{2}-\d{2}$/.test(parsed[2])) {
//         return {
//             title: baseString + '404: Not Found',
//             description: descriptions.home,
//             notFound: true,
//         };
//     }
//     if (parsed[3] === undefined) {
//         return {
//             title: baseString + startCase(parsed[1]) + ' | ' + startCase(parsed[2]),
//             description: descriptions[parsed[2]],
//         };
//     }
//     if (parsed[2] === 'music') {
//         const hash = createHash('sha1').update('/' + parsed[3]).digest('base64');
//         try {
//             const musicFile = (await models.musicFile.findAll({
//                 where: { hash },
//                 attributes: ['name'],
//                 include: [
//                     {
//                         model: db.models.music,
//                         attributes: ['composer', 'piece', 'contributors'],
//                     },
//                 ],
//             }))[0];
//             const {
//                 composer,
//                 piece,
//                 contributors,
//             } = musicFile.music;
//             return {
//                 title: baseString + startCase(parsed[2]) + ' | ' + composer + ' ' + piece + (musicFile.name ? ' - ' + musicFile.name : ''),
//                 description: descriptions.getMusic(composer + ' ' + piece + (musicFile.name ? ' - ' + musicFile.name : ''), contributors),
//             };
//         } catch (e) {
//             return {
//                 title: baseString + startCase(parsed[1]) + ' | ' + startCase(parsed[2]),
//                 description: descriptions[parsed[2]],
//                 sanitize: parsed[3],
//             };
//         }
//     }
//     if (parsed[2] === 'videos') {
//         const videoId = parsed[3];
//         try {
//             const playlistResponse = await axios.get<GetVideoResponse>(YoutubeVideoUrl, {
//                 params: {
//                     key: YoutubeAPIKey,
//                     maxResults: 1,
//                     part: 'id, snippet',
//                     playlistId,
//                     videoId,
//                 },
//             });
//             const video = playlistResponse.data.items[0];
//             return {
//                 title: baseString + startCase(parsed[2]) + ' | ' + video.snippet.title,
//                 description: video.snippet.description,
//                 image: video.snippet.thumbnails.standard.url,
//             };
//         } catch (e) {
//             return {
//                 title: baseString + startCase(parsed[1]) + ' | ' + startCase(parsed[2]),
//                 description: descriptions[parsed[2]],
//                 sanitize: videoId,
//             };
//         }
//     }
//     if (parsed[1] === 'schedule') {
//         try {
//             const date = parse(parsed[3], 'yyyy-MM-dd', new Date());
//             if (!isValid(date)) {
//                 return {
//                     title: baseString + startCase(parsed[1]),
//                     description: descriptions[parsed[1]],
//                 };
//             }
//             const event = (await models.calendar.findAll({
//                 where: {
//                     dateTime: {
//                         [gte]: format(startOfDay(date), 'yyyy-MM-dd'),
//                         [lt]: format(add(date, { days: 1 }), 'yyyy-MM-dd'),
//                     },
//                 },
//                 attributes: ['dateTime', 'name', 'type'],
//             }))[0];
//             return {
//                 title: baseString + formatInTimeZone(event.dateTime, event.timezone, 'MMM dd, yyyy, HH:mm zzz'),
//                 description: event.name,
//             };
//         } catch (e) {
//             return {
//                 title: baseString + startCase(parsed[1]),
//                 description: descriptions[parsed[1]],
//                 sanitize: parsed[3],
//             };
//         }
//     }
//     if (parsed[1] === 'shop') {
//         if (parsed[2] === 'checkout') {
//             return {
//                 title: baseString + startCase(parsed[1]) + ' | Checkout Success',
//                 description: descriptions[parsed[2]],
//             }
//         } else {
//             return {
//                 title: baseString + startCase(parsed[1]),
//                 description: descriptions[parsed[2]],
//             };
//         }
//     }
//     // Default, but shouldn't need it (just to make typescript happy).
//     return {
//         title: baseString + 'Home',
//         description: descriptions.home,
//     };
// };
