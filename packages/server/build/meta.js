import axios from "axios";
import { createHash } from "crypto";
import { isValid, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import * as dotenv from "dotenv";
import { bind, startCase } from "lodash-es";
import { matchPath } from "@remix-run/router";
import { baseString, descriptions } from "common";
import orm from "./database.js";
import { MusicFile } from "./models/MusicFile.js";
import { Calendar } from "./models/Calendar.js";
import { expr } from "@mikro-orm/core";
dotenv.config({
    override: true
});
const YoutubeAPIKey = process.env.GAPI_KEY_SERVER;
const YoutubeVideoUrl = 'https://www.googleapis.com/youtube/v3/playlistItems';
const playlistId = 'PLzauXr_FKIlhzArviStMMK08Xc4iuS0n9';
const notFound = {
    title: baseString + '404: Not Found',
    description: descriptions.home
};
class MatchException extends Error {
    sanitize;
    constructor(sanitize){
        super('MatchException');
        this.sanitize = sanitize;
    }
}
export const getMetaFromPathAndSanitize = async (url, query)=>{
    const matchInstance = bind(matchPath, null, url); // Make my typing easier
    let match;
    if (!!(match = matchInstance('/'))) {
        return {
            title: baseString + 'Home',
            description: descriptions.home
        };
    }
    if (!!(match = matchInstance('/contact'))) {
        return {
            title: baseString + 'Contact',
            description: descriptions.contact
        };
    }
    if (!!(match = matchInstance('/about/:about'))) {
        const about = match.params.about;
        if (!about || ![
            'biography',
            'discography',
            'press'
        ].includes(about)) {
            return notFound;
        }
        return {
            title: baseString + 'About | ' + startCase(about),
            description: descriptions[about]
        };
    }
    if (!!(match = matchInstance('/shop/:shop'))) {
        const shop = match.params.shop;
        if (!shop || ![
            'scores',
            'faqs',
            'checkout-success'
        ].includes(shop)) {
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
            description: descriptions.photos
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
            const musicFile = await orm.em.findOne(MusicFile, {
                hash
            }, {
                populate: [
                    'music'
                ]
            });
            if (musicFile === null) {
                throw new MatchException(music);
            }
            const { composer, piece, contributors } = musicFile.music;
            return {
                title: baseString + 'Music | ' + composer + ' ' + piece + (musicFile.name ? ' - ' + musicFile.name : ''),
                description: descriptions.getMusic(composer + ' ' + piece + (musicFile.name ? ' - ' + musicFile.name : ''), contributors)
            };
        } catch (e) {
            return {
                title: baseString + 'Media | Music',
                description: descriptions.music,
                sanitize: e instanceof MatchException ? e.sanitize : undefined
            };
        }
    }
    if (!!(match = matchInstance('/media/videos/*'))) {
        try {
            const videoId = match.params['*'];
            if (!videoId) {
                throw new MatchException(undefined);
            }
            const playlistResponse = await axios.get(YoutubeVideoUrl, {
                params: {
                    key: YoutubeAPIKey,
                    maxResults: 1,
                    part: 'id, snippet',
                    playlistId,
                    videoId
                }
            });
            const video = playlistResponse.data.items[0];
            return {
                title: baseString + 'Videos | ' + video.snippet.title,
                description: video.snippet.description,
                image: video.snippet.thumbnails.standard.url
            };
        } catch (e) {
            return {
                title: baseString + 'Media | Videos',
                description: descriptions.videos,
                sanitize: e instanceof MatchException ? e.sanitize : undefined
            };
        }
    }
    if (!!(match = matchInstance('/schedule/:type/*'))) {
        try {
            const { type, '*': eventISO } = match.params;
            if (!type || ![
                'upcoming',
                'archive',
                'search',
                'event'
            ].includes(type)) {
                return notFound;
            }
            if (type === 'search') {
                return {
                    title: baseString + 'Schedule | ' + startCase(type),
                    description: query ? descriptions.searchResults(query) : descriptions.search
                };
            }
            if (!eventISO) {
                if (type === 'event') {
                    throw new MatchException(type);
                }
                return {
                    title: baseString + 'Schedule | ' + startCase(type),
                    description: descriptions[type]
                };
            }
            const date = parseISO(eventISO);
            if (!isValid(date)) {
                throw new MatchException(eventISO);
            }
            const event = await orm.em.findOne(Calendar, {
                [expr('date_time::date')]: date.toISOString()
            });
            if (event === null) {
                throw new MatchException(eventISO);
            }
            return {
                title: baseString + 'Schedule | ' + formatInTimeZone(event.dateTime, event.timezone, 'EEE, MMMM dd, yyyy, h:mmaaa z'),
                description: event.name + ' | ' + event.location
            };
        } catch (e) {
            return {
                title: baseString + 'Schedule',
                description: descriptions.upcoming,
                sanitize: e instanceof MatchException ? e.sanitize : undefined
            };
        }
    }
    return notFound;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZXRhLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XHJcbmltcG9ydCB7IGNyZWF0ZUhhc2ggfSBmcm9tICdjcnlwdG8nO1xyXG5pbXBvcnQgeyBpc1ZhbGlkLCBwYXJzZUlTTyB9IGZyb20gJ2RhdGUtZm5zJztcclxuaW1wb3J0IHsgZm9ybWF0SW5UaW1lWm9uZSB9IGZyb20gJ2RhdGUtZm5zLXR6JztcclxuaW1wb3J0ICogYXMgZG90ZW52IGZyb20gJ2RvdGVudic7XHJcbmltcG9ydCB7IGJpbmQsIHN0YXJ0Q2FzZSB9IGZyb20gJ2xvZGFzaC1lcyc7XHJcbmltcG9ydCB7IFBhcmFtUGFyc2VLZXksIFBhdGhNYXRjaCwgUGF0aFBhdHRlcm4sIG1hdGNoUGF0aCB9IGZyb20gJ0ByZW1peC1ydW4vcm91dGVyJztcclxuXHJcbmltcG9ydCB7IGJhc2VTdHJpbmcsIGRlc2NyaXB0aW9ucyB9IGZyb20gJ2NvbW1vbic7XHJcbmltcG9ydCBvcm0gZnJvbSAnLi9kYXRhYmFzZS5qcyc7XHJcbmltcG9ydCB7IE11c2ljRmlsZSB9IGZyb20gJy4vbW9kZWxzL011c2ljRmlsZS5qcyc7XHJcbmltcG9ydCB7IENhbGVuZGFyIH0gZnJvbSAnLi9tb2RlbHMvQ2FsZW5kYXIuanMnO1xyXG5pbXBvcnQgeyBleHByIH0gZnJvbSAnQG1pa3JvLW9ybS9jb3JlJztcclxuXHJcbmRvdGVudi5jb25maWcoeyBvdmVycmlkZTogdHJ1ZSB9KTtcclxuXHJcbmNvbnN0IFlvdXR1YmVBUElLZXkgPSBwcm9jZXNzLmVudi5HQVBJX0tFWV9TRVJWRVI7XHJcbmNvbnN0IFlvdXR1YmVWaWRlb1VybCA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS95b3V0dWJlL3YzL3BsYXlsaXN0SXRlbXMnO1xyXG5jb25zdCBwbGF5bGlzdElkID0gJ1BMemF1WHJfRktJbGh6QXJ2aVN0TU1LMDhYYzRpdVMwbjknO1xyXG5cclxuaW50ZXJmYWNlIE1ldGEge1xyXG4gICAgdGl0bGU6IHN0cmluZztcclxuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XHJcbiAgICBpbWFnZT86IHN0cmluZztcclxuICAgIHNhbml0aXplPzogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgR2V0VmlkZW9SZXNwb25zZSB7XHJcbiAgICBpdGVtczoge1xyXG4gICAgICAgIHNuaXBwZXQ6IHtcclxuICAgICAgICAgICAgdGl0bGU6IHN0cmluZztcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHN0cmluZztcclxuICAgICAgICAgICAgdGh1bWJuYWlsczoge1xyXG4gICAgICAgICAgICAgICAgc3RhbmRhcmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IHN0cmluZztcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfTtcclxuICAgIH1bXTtcclxufVxyXG5cclxuY29uc3Qgbm90Rm91bmQ6IE1ldGEgPSB7XHJcbiAgICB0aXRsZTogYmFzZVN0cmluZyArICc0MDQ6IE5vdCBGb3VuZCcsXHJcbiAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb25zLmhvbWUsXHJcbn07XHJcblxyXG50eXBlIFBhcnRpYWxQYXRoTWF0Y2ggPSA8UGFyYW1LZXkgZXh0ZW5kcyBQYXJhbVBhcnNlS2V5PFBhdGg+LCBQYXRoIGV4dGVuZHMgc3RyaW5nPihwYXR0ZXJuOiBQYXRoUGF0dGVybjxQYXRoPiB8IFBhdGgpID0+IFBhdGhNYXRjaDxQYXJhbUtleT4gfCBudWxsXHJcblxyXG5jbGFzcyBNYXRjaEV4Y2VwdGlvbiBleHRlbmRzIEVycm9yIHtcclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBzYW5pdGl6ZT86IHN0cmluZykge1xyXG4gICAgICAgIHN1cGVyKCdNYXRjaEV4Y2VwdGlvbicpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0TWV0YUZyb21QYXRoQW5kU2FuaXRpemUgPSBhc3luYyAodXJsOiBzdHJpbmcsIHF1ZXJ5Pzogc3RyaW5nKTogUHJvbWlzZTxNZXRhPiA9PiB7XHJcbiAgICBjb25zdCBtYXRjaEluc3RhbmNlOiBQYXJ0aWFsUGF0aE1hdGNoID0gYmluZChtYXRjaFBhdGgsIG51bGwsIHVybCk7ICAvLyBNYWtlIG15IHR5cGluZyBlYXNpZXJcclxuICAgIGxldCBtYXRjaDogUGF0aE1hdGNoPHN0cmluZz4gfCBudWxsO1xyXG4gICAgaWYgKCEhKG1hdGNoID0gbWF0Y2hJbnN0YW5jZSgnLycpKSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHRpdGxlOiBiYXNlU3RyaW5nICsgJ0hvbWUnLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb25zLmhvbWUsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGlmICghIShtYXRjaCA9IG1hdGNoSW5zdGFuY2UoJy9jb250YWN0JykpKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdGl0bGU6IGJhc2VTdHJpbmcgKyAnQ29udGFjdCcsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbnMuY29udGFjdCxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgaWYgKCEhKG1hdGNoID0gbWF0Y2hJbnN0YW5jZSgnL2Fib3V0LzphYm91dCcpKSkge1xyXG4gICAgICAgIGNvbnN0IGFib3V0ID0gbWF0Y2gucGFyYW1zLmFib3V0O1xyXG4gICAgICAgIGlmICghYWJvdXQgfHwgIVsnYmlvZ3JhcGh5JywgJ2Rpc2NvZ3JhcGh5JywgJ3ByZXNzJ10uaW5jbHVkZXMoYWJvdXQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBub3RGb3VuZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdGl0bGU6IGJhc2VTdHJpbmcgKyAnQWJvdXQgfCAnICsgc3RhcnRDYXNlKGFib3V0KSxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uc1thYm91dF0sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGlmICghIShtYXRjaCA9IG1hdGNoSW5zdGFuY2UoJy9zaG9wLzpzaG9wJykpKSB7XHJcbiAgICAgICAgY29uc3Qgc2hvcCA9IG1hdGNoLnBhcmFtcy5zaG9wO1xyXG4gICAgICAgIGlmICghc2hvcCB8fCAhWydzY29yZXMnLCAnZmFxcycsICdjaGVja291dC1zdWNjZXNzJ10uaW5jbHVkZXMoc2hvcCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5vdEZvdW5kO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0aXRsZTogYmFzZVN0cmluZyArICdTaG9wIHwgJyArIHN0YXJ0Q2FzZShzaG9wKSxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uc1tzaG9wXVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBpZiAoISEobWF0Y2ggPSBtYXRjaEluc3RhbmNlKCcvbWVkaWEvcGhvdG9zJykpKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdGl0bGU6IGJhc2VTdHJpbmcgKyAnTWVkaWEgfCBQaG90b3MnLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb25zLnBob3RvcyxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgaWYgKCEhKG1hdGNoID0gbWF0Y2hJbnN0YW5jZSgnL21lZGlhL211c2ljLyonKSkpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCB7ICcqJzogbXVzaWMgfSA9IG1hdGNoLnBhcmFtcztcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobXVzaWMpO1xyXG4gICAgICAgICAgICBpZiAoIW11c2ljKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWF0Y2hFeGNlcHRpb24odW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgaGFzaCA9IGNyZWF0ZUhhc2goJ3NoYTEnKS51cGRhdGUoJy8nICsgbXVzaWMpLmRpZ2VzdCgnYmFzZTY0Jyk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBtdXNpY0ZpbGUgPSBhd2FpdCBvcm0uZW0uZmluZE9uZShcclxuICAgICAgICAgICAgICAgIE11c2ljRmlsZSxcclxuICAgICAgICAgICAgICAgIHsgaGFzaCB9LFxyXG4gICAgICAgICAgICAgICAgeyBwb3B1bGF0ZTogWydtdXNpYyddIH0pO1xyXG4gICAgICAgICAgICBpZiAobXVzaWNGaWxlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWF0Y2hFeGNlcHRpb24obXVzaWMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgICAgICBjb21wb3NlcixcclxuICAgICAgICAgICAgICAgIHBpZWNlLFxyXG4gICAgICAgICAgICAgICAgY29udHJpYnV0b3JzLFxyXG4gICAgICAgICAgICB9ID0gbXVzaWNGaWxlLm11c2ljO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiBiYXNlU3RyaW5nICsgJ011c2ljIHwgJ1xyXG4gICAgICAgICAgICAgICAgICAgICsgY29tcG9zZXIgKyAnICcgKyBwaWVjZVxyXG4gICAgICAgICAgICAgICAgICAgICsgKG11c2ljRmlsZS5uYW1lID8gJyAtICcgKyBtdXNpY0ZpbGUubmFtZSA6ICcnKSxcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbnMuZ2V0TXVzaWMoXHJcbiAgICAgICAgICAgICAgICAgICAgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb3NlciArICcgJyArIHBpZWNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgKG11c2ljRmlsZS5uYW1lID8gJyAtICcgKyBtdXNpY0ZpbGUubmFtZSA6ICcnKVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAsIGNvbnRyaWJ1dG9ycyksXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6IGJhc2VTdHJpbmcgKyAnTWVkaWEgfCBNdXNpYycsXHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb25zLm11c2ljLFxyXG4gICAgICAgICAgICAgICAgc2FuaXRpemU6IChlIGluc3RhbmNlb2YgTWF0Y2hFeGNlcHRpb24pID8gZS5zYW5pdGl6ZSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoISEobWF0Y2ggPSBtYXRjaEluc3RhbmNlKCcvbWVkaWEvdmlkZW9zLyonKSkpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCB2aWRlb0lkID0gbWF0Y2gucGFyYW1zWycqJ107XHJcbiAgICAgICAgICAgIGlmICghdmlkZW9JZCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1hdGNoRXhjZXB0aW9uKHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgcGxheWxpc3RSZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldDxHZXRWaWRlb1Jlc3BvbnNlPihZb3V0dWJlVmlkZW9VcmwsIHtcclxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGtleTogWW91dHViZUFQSUtleSxcclxuICAgICAgICAgICAgICAgICAgICBtYXhSZXN1bHRzOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcnQ6ICdpZCwgc25pcHBldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWxpc3RJZCxcclxuICAgICAgICAgICAgICAgICAgICB2aWRlb0lkLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHZpZGVvID0gcGxheWxpc3RSZXNwb25zZS5kYXRhLml0ZW1zWzBdO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6IGJhc2VTdHJpbmcgKyAnVmlkZW9zIHwgJyArIHZpZGVvLnNuaXBwZXQudGl0bGUsXHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdmlkZW8uc25pcHBldC5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgIGltYWdlOiB2aWRlby5zbmlwcGV0LnRodW1ibmFpbHMuc3RhbmRhcmQudXJsLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiBiYXNlU3RyaW5nICsgJ01lZGlhIHwgVmlkZW9zJyxcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbnMudmlkZW9zLFxyXG4gICAgICAgICAgICAgICAgc2FuaXRpemU6IChlIGluc3RhbmNlb2YgTWF0Y2hFeGNlcHRpb24pID8gZS5zYW5pdGl6ZSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoISEobWF0Y2ggPSBtYXRjaEluc3RhbmNlKCcvc2NoZWR1bGUvOnR5cGUvKicpKSkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgdHlwZSwgJyonOiBldmVudElTTyB9ID0gbWF0Y2gucGFyYW1zO1xyXG4gICAgICAgICAgICBpZiAoIXR5cGUgfHwgIVsndXBjb21pbmcnLCAnYXJjaGl2ZScsICdzZWFyY2gnLCAnZXZlbnQnXS5pbmNsdWRlcyh0eXBlKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vdEZvdW5kO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnc2VhcmNoJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogYmFzZVN0cmluZyArICdTY2hlZHVsZSB8ICcgKyBzdGFydENhc2UodHlwZSksXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHF1ZXJ5ID8gZGVzY3JpcHRpb25zLnNlYXJjaFJlc3VsdHMocXVlcnkpIDogZGVzY3JpcHRpb25zLnNlYXJjaCxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghZXZlbnRJU08pIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnZXZlbnQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1hdGNoRXhjZXB0aW9uKHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogYmFzZVN0cmluZyArICdTY2hlZHVsZSB8ICcgKyBzdGFydENhc2UodHlwZSksXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uc1t0eXBlXSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBkYXRlID0gcGFyc2VJU08oZXZlbnRJU08pO1xyXG4gICAgICAgICAgICBpZiAoIWlzVmFsaWQoZGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNYXRjaEV4Y2VwdGlvbihldmVudElTTyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBhd2FpdCBvcm0uZW0uZmluZE9uZShcclxuICAgICAgICAgICAgICAgIENhbGVuZGFyLFxyXG4gICAgICAgICAgICAgICAgeyBbZXhwcignZGF0ZV90aW1lOjpkYXRlJyldOiBkYXRlLnRvSVNPU3RyaW5nKCkgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBpZiAoZXZlbnQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNYXRjaEV4Y2VwdGlvbihldmVudElTTyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiBiYXNlU3RyaW5nICsgJ1NjaGVkdWxlIHwgJyArIGZvcm1hdEluVGltZVpvbmUoZXZlbnQuZGF0ZVRpbWUsIGV2ZW50LnRpbWV6b25lLCAnRUVFLCBNTU1NIGRkLCB5eXl5LCBoOm1tYWFhIHonKSxcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBldmVudC5uYW1lICsgJyB8ICcgKyBldmVudC5sb2NhdGlvbixcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogYmFzZVN0cmluZyArICdTY2hlZHVsZScsXHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb25zLnVwY29taW5nLFxyXG4gICAgICAgICAgICAgICAgc2FuaXRpemU6IChlIGluc3RhbmNlb2YgTWF0Y2hFeGNlcHRpb24pID8gZS5zYW5pdGl6ZSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBub3RGb3VuZDtcclxufVxyXG4iXSwibmFtZXMiOlsiYXhpb3MiLCJjcmVhdGVIYXNoIiwiaXNWYWxpZCIsInBhcnNlSVNPIiwiZm9ybWF0SW5UaW1lWm9uZSIsImRvdGVudiIsImJpbmQiLCJzdGFydENhc2UiLCJtYXRjaFBhdGgiLCJiYXNlU3RyaW5nIiwiZGVzY3JpcHRpb25zIiwib3JtIiwiTXVzaWNGaWxlIiwiQ2FsZW5kYXIiLCJleHByIiwiY29uZmlnIiwib3ZlcnJpZGUiLCJZb3V0dWJlQVBJS2V5IiwicHJvY2VzcyIsImVudiIsIkdBUElfS0VZX1NFUlZFUiIsIllvdXR1YmVWaWRlb1VybCIsInBsYXlsaXN0SWQiLCJub3RGb3VuZCIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJob21lIiwiTWF0Y2hFeGNlcHRpb24iLCJFcnJvciIsInNhbml0aXplIiwiY29uc3RydWN0b3IiLCJnZXRNZXRhRnJvbVBhdGhBbmRTYW5pdGl6ZSIsInVybCIsInF1ZXJ5IiwibWF0Y2hJbnN0YW5jZSIsIm1hdGNoIiwiY29udGFjdCIsImFib3V0IiwicGFyYW1zIiwiaW5jbHVkZXMiLCJzaG9wIiwicGhvdG9zIiwibXVzaWMiLCJjb25zb2xlIiwibG9nIiwidW5kZWZpbmVkIiwiaGFzaCIsInVwZGF0ZSIsImRpZ2VzdCIsIm11c2ljRmlsZSIsImVtIiwiZmluZE9uZSIsInBvcHVsYXRlIiwiY29tcG9zZXIiLCJwaWVjZSIsImNvbnRyaWJ1dG9ycyIsIm5hbWUiLCJnZXRNdXNpYyIsImUiLCJ2aWRlb0lkIiwicGxheWxpc3RSZXNwb25zZSIsImdldCIsImtleSIsIm1heFJlc3VsdHMiLCJwYXJ0IiwidmlkZW8iLCJkYXRhIiwiaXRlbXMiLCJzbmlwcGV0IiwiaW1hZ2UiLCJ0aHVtYm5haWxzIiwic3RhbmRhcmQiLCJ2aWRlb3MiLCJ0eXBlIiwiZXZlbnRJU08iLCJzZWFyY2hSZXN1bHRzIiwic2VhcmNoIiwiZGF0ZSIsImV2ZW50IiwidG9JU09TdHJpbmciLCJkYXRlVGltZSIsInRpbWV6b25lIiwibG9jYXRpb24iLCJ1cGNvbWluZyJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBT0EsV0FBVyxRQUFRO0FBQzFCLFNBQVNDLFVBQVUsUUFBUSxTQUFTO0FBQ3BDLFNBQVNDLE9BQU8sRUFBRUMsUUFBUSxRQUFRLFdBQVc7QUFDN0MsU0FBU0MsZ0JBQWdCLFFBQVEsY0FBYztBQUMvQyxZQUFZQyxZQUFZLFNB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