import axios from 'axios';
import { createHash } from 'crypto';
import { add, differenceInCalendarYears, format, isValid, parse, startOfDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import * as dotenv from 'dotenv';
import { startCase } from 'lodash';
import * as regexp from 'path-to-regexp';

import { Op } from 'sequelize';
import db from './models';

dotenv.config();

const YoutubeAPIKey = process.env.GAPI_KEY_SERVER;
const YoutubeVideoUrl = 'https://www.googleapis.com/youtube/v3/playlistItems';
const playlistId = 'PLzauXr_FKIlhzArviStMMK08Xc4iuS0n9';
const models = db.models;

const { gte, lt } = Op;

const regex = regexp.pathToRegexp('/:first/:second?/(.*)?');
const baseString = 'Sean Chen: Pianist, Composer, Arranger | ';
const getAge = () => differenceInCalendarYears(new Date(), new Date(1988, 7, 27));
const descriptions: {
    home: string;
    biography: string;
    discography: string;
    contact: string;
    upcoming: string;
    archive: string;
    search: string;
    videos: string;
    music: string;
    photos: string;
    press: string;
    scores: string;
    faqs: string;
    getMusic: (piece: string, contributors?: string) => string;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    [key: string]: any;
} = {
    home: 'Welcome to the official website of pianist, composer, and arranger Sean Chen. Third Prize at the 2013 Van Cliburn, Christel DeHaan Classical Fellow of the 2013 American Pianists Awards, and Artist-in-Residence at University of Missouri, Kansas City.',
    biography: `Hailed as a charismatic rising star with “an exceptional ability to connect with an audience combined with an easy virtuosity” (Huffington Post), ${getAge}-year-old American pianist Sean Chen, third prize winner at the 2013 Van Cliburn International Piano Competition and recipient of the DeHaan Classical Fellowship as the winner of the 2013 American Pianists Awards, has continued to earn accolades for “alluring, colorfully shaded renditions” (New York Times) and “genuinely sensitive” (LA Times) playing.`,
    discography: 'Complete discography of Sean Chen',
    contact: `Contact information for Sean Chen and for booking performances.`,
    upcoming: 'Upcoming recitals, concerti, and masterclasses.',
    archive: 'Past recitals, concerti, and masterclasses.',
    search: 'Search recitals, concerti, and masterclasses,',
    videos: `A playlist of Sean Chen's YouTube clips.`,
    music: `A playlist of Sean Chen's live concert recordings, and a link to his Spotify musician page.`,
    getMusic: (piece: string, contributors?: string) =>
        `Listen to Sean Chen's live performance of ${piece}` + (contributors ? `, with ${contributors}` : '.'),
    photos: 'Publicity photos for browsing, and a link to a Dropbox folder for high-resolution images.',
    press: `Reviews of Sean Chen's performances.`,
    scores: `Online shop of Sean Chen's arrangements, cadenzas, and original compositions.`,
    faqs: `Information about Sean Chen Piano online shop.`,
};

const validFirst = ['', 'about', 'contact', 'schedule', 'media', 'press', 'store', 'shop'];
const validSecond = ['', 'biography', 'discography', 'press', 'music', 'videos', 'photos', 'upcoming', 'archive', 'search', 'scores', 'FAQs', 'checkout-success'];

interface Meta {
    title: string;
    description: string;
    notFound?: boolean
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

export const getMetaFromPathAndSanitize = async (url: string): Promise<Meta> => {
    const parsed = regex.exec(url);
    if (parsed === null) {
        return {
            title: baseString + 'Home',
            description: descriptions.home,
        };
    }
    if (!validFirst.includes(parsed[1])) {
        return {
            title: baseString + '404: Not Found',
            description: descriptions.home,
            notFound: true,
        };
    }
    if (parsed[2] === undefined) {
        return {
            title: baseString + startCase(parsed[1]),
            description: descriptions[parsed[1]],
        };
    }
    if (!validSecond.includes(parsed[2])) {
        return {
            title: baseString + '404: Not Found',
            description: descriptions.home,
            notFound: true,
        };
    }
    if (parsed[3] === undefined) {
        return {
            title: baseString + startCase(parsed[1]) + ' | ' + startCase(parsed[2]),
            description: descriptions[parsed[2]],
        };
    }
    if (parsed[2] === 'music') {
        const hash = createHash('sha1').update('/' + parsed[3]).digest('base64');
        try {
            const musicFile = (await models.musicFile.findAll({
                where: { hash },
                attributes: ['name'],
                include: [
                    {
                        model: db.models.music,
                        attributes: ['composer', 'piece', 'contributors'],
                    },
                ],
            }))[0];
            const {
                composer,
                piece,
                contributors,
            } = musicFile.music;
            return {
                title: baseString + startCase(parsed[2]) + ' | ' + composer + ' ' + piece + (musicFile.name ? ' - ' + musicFile.name : ''),
                description: descriptions.getMusic(composer + ' ' + piece + (musicFile.name ? ' - ' + musicFile.name : ''), contributors),
            };
        } catch (e) {
            return {
                title: baseString + startCase(parsed[1]) + ' | ' + startCase(parsed[2]),
                description: descriptions[parsed[2]],
                sanitize: parsed[3],
            };
        }
    }
    if (parsed[2] === 'videos') {
        const videoId = parsed[3];
        try {
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
                title: baseString + startCase(parsed[2]) + ' | ' + video.snippet.title,
                description: video.snippet.description,
                image: video.snippet.thumbnails.standard.url,
            };
        } catch (e) {
            return {
                title: baseString + startCase(parsed[1]) + ' | ' + startCase(parsed[2]),
                description: descriptions[parsed[2]],
                sanitize: videoId,
            };
        }
    }
    if (parsed[1] === 'schedule') {
        try {
            const date = parse(parsed[3], 'yyyy-MM-dd', new Date());
            if (!isValid(date)) {
                throw new Error('invalid date');
            }
            const event = (await models.calendar.findAll({
                where: {
                    dateTime: {
                        [gte]: format(startOfDay(date), 'yyyy-MM-dd'),
                        [lt]: format(add(date, { days: 1 }), 'yyyy-MM-dd'),
                    },
                },
                attributes: ['dateTime', 'name', 'type'],
            }))[0];
            return {
                title: baseString + formatInTimeZone(event.dateTime, event.timezone, 'MMM dd, yyyy, HH:mm zzz'),
                description: startCase(parsed[2]) + ' ' + event.type + ': ' + event.name,
            };
        } catch (e) {
            return {
                title: baseString + startCase(parsed[1]),
                description: descriptions[parsed[1]],
                sanitize: e === 'invalid date' ? parsed[3] : undefined,
            };
        }
    }
    if (parsed[1] === 'shop') {
        if (parsed[2] === 'checkout') {
            return {
                title: baseString + startCase(parsed[1]) + ' | Checkout Success',
                description: descriptions[parsed[2]],
            }
        } else {
            return {
                title: baseString + startCase(parsed[1]),
                description: descriptions[parsed[2]],
            };
        }
    }
    // Default, but shouldn't need it (just to make typescript happy).
    return {
        title: baseString + 'Home',
        description: descriptions.home,
    };
};
