import axios from "axios";
import { add, format, getUnixTime } from "date-fns";
import { JSDOM } from "jsdom";
import { getToken } from "./oauth.js";
// From google api console; use general dev or server prod keys for respective environments.
// Make sure it's set in .env
const gapiKey = process.env.GAPI_KEY_SERVER;
const calendarId = process.env.NODE_ENV === 'production' && process.env.SERVER_ENV !== 'test' ? 'qdoiu1uovuc05c4egu65vs9uck@group.calendar.google.com' : 'c7dolt217rdb9atggl25h4fspg@group.calendar.google.com';
const uriEncCalId = encodeURIComponent(calendarId);
export const getCalendarSingleEvent = async (em, id)=>{
    const token = await getToken(em);
    const url = `https://www.googleapis.com/calendar/v3/calendars/${uriEncCalId}/events/${id}`;
    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};
export const getCalendarEvents = async (em, nextPageToken, syncToken)=>{
    const token = await getToken(em);
    const url = `https://www.googleapis.com/calendar/v3/calendars/${uriEncCalId}/events`;
    return axios.get(url, {
        params: {
            singleEvents: true,
            pageToken: nextPageToken,
            syncToken
        },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};
export const deleteCalendarEvent = async (em, id)=>{
    const token = await getToken(em);
    const url = `https://www.googleapis.com/calendar/v3/calendars/${uriEncCalId}/events/${id}`;
    return axios.delete(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};
export const createCalendarEvent = async (em, { summary, description, location, startDatetime, timeZone, allDay, endDate })=>{
    const token = await getToken(em);
    const url = `https://www.googleapis.com/calendar/v3/calendars/${uriEncCalId}/events`;
    const eventResource = {
        summary,
        description,
        location,
        start: allDay ? {
            date: format(startDatetime, 'yyyy-MM-dd')
        } : {
            dateTime: startDatetime.toISOString(),
            timeZone
        },
        end: endDate ? {
            date: endDate
        } : allDay ? {
            date: format(add(startDatetime, {
                days: 1
            }), 'yyyy-MM-dd')
        } : {
            dateTime: add(startDatetime, {
                hours: 2
            }).toISOString(),
            timeZone
        }
    };
    return axios.post(url, eventResource, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};
export const updateCalendar = async (em, { id, summary, description, location, startDatetime, timeZone, allDay, endDate })=>{
    const token = await getToken(em);
    const url = `https://www.googleapis.com/calendar/v3/calendars/${uriEncCalId}/events/${id}`;
    const eventResource = {
        summary,
        description,
        location,
        start: allDay ? {
            date: format(startDatetime, 'yyyy-MM-dd')
        } : {
            dateTime: startDatetime.toISOString(),
            timeZone
        },
        end: endDate ? {
            date: endDate
        } : allDay ? {
            date: format(add(startDatetime, {
                days: 1
            }), 'yyyy-MM-dd')
        } : {
            dateTime: add(startDatetime, {
                hours: 2
            }).toISOString(),
            timeZone
        }
    };
    return axios.put(url, eventResource, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};
export const extractEventDescription = (event)=>{
    try {
        return JSON.parse(event.description);
    } catch (e) {
        console.log(e);
        console.log('======Error parsing event description JSON======');
        console.log(event.description);
        return {};
    }
};
export const getLatLng = async (address)=>{
    const geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    try {
        const response = await axios.get(geocodeUrl, {
            params: {
                address,
                key: gapiKey
            }
        });
        return {
            latlng: response.data.results[0].geometry.location,
            formattedAddress: response.data.results[0].formattedAddress
        };
    } catch (e) {
        console.log(e);
        throw e;
    }
};
export const getTimeZone = async (lat, lng, timestamp)=>{
    const loc = `${lat.toString()},${lng.toString()}`;
    const url = `https://maps.googleapis.com/maps/api/timezone/json`;
    try {
        const response = await axios.get(url, {
            params: {
                location: loc,
                timestamp: getUnixTime(timestamp || new Date()),
                key: gapiKey
            }
        });
        return response.data.timeZoneId;
    } catch (e) {
        console.log(e);
        throw e;
    }
};
export const transformModelToGoogle = (c)=>{
    const collaborators = c.collaborators.toArray();
    const pieces = c.pieces.toArray();
    const data = {
        summary: c.name,
        location: c.location,
        startDatetime: c.dateTime,
        endDate: c.endDate ? new Date(c.endDate) : undefined,
        allDay: c.allDay,
        timeZone: c.timezone ?? '',
        description: JSON.stringify({
            collaborators: collaborators.map(({ name, instrument })=>({
                    name,
                    instrument
                })),
            pieces: pieces.map(({ composer, piece })=>({
                    composer,
                    piece
                })),
            type: c.type,
            website: encodeURI(c.website ?? ''),
            imageUrl: encodeURI(c.imageUrl ?? ''),
            placeId: c.placeId,
            photoReference: c.photoReference
        })
    };
    if (!!c.id) {
        data.id = c.id;
    }
    return data;
};
export const getImageFromMetaTag = async (website)=>{
    try {
        var _document_querySelector, _document_querySelector1;
        const page = await axios.get(website);
        const { document } = new JSDOM(page.data).window;
        return ((_document_querySelector = document.querySelector('meta[name="twitter:image"]')) === null || _document_querySelector === void 0 ? void 0 : _document_querySelector.getAttribute('content')) ?? ((_document_querySelector1 = document.querySelector('meta[property="og:image"]')) === null || _document_querySelector1 === void 0 ? void 0 : _document_querySelector1.getAttribute('content')) ?? '';
    } catch (e) {
        // console.log(e);
        try {
            var _err_response, _document_querySelector2, _document_querySelector3;
            // Even if url doesn't exist anymore
            // Response could contain usable images.
            const err = e;
            const page = (_err_response = err.response) === null || _err_response === void 0 ? void 0 : _err_response.data;
            const { document } = new JSDOM(page).window;
            return ((_document_querySelector2 = document.querySelector('meta[name="twitter:image"]')) === null || _document_querySelector2 === void 0 ? void 0 : _document_querySelector2.getAttribute('content')) ?? ((_document_querySelector3 = document.querySelector('meta[property="og:image"]')) === null || _document_querySelector3 === void 0 ? void 0 : _document_querySelector3.getAttribute('content')) ?? '';
        } catch (ee) {
            // Really can't use it.
            console.log(ee);
            return '';
        }
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9nYXBpL2NhbGVuZGFyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBheGlvcywgeyBBeGlvc0Vycm9yLCBBeGlvc1Jlc3BvbnNlIH0gZnJvbSAnYXhpb3MnO1xyXG5pbXBvcnQgeyBhZGQsIGZvcm1hdCwgZ2V0VW5peFRpbWUgfSBmcm9tICdkYXRlLWZucyc7XHJcbmltcG9ydCB7IEpTRE9NIH0gZnJvbSAnanNkb20nO1xyXG5cclxuLy8gaW1wb3J0IHsgQ2FsZW5kYXIgfSBmcm9tICcuLi9tb2RlbHMvb3JtL0NhbGVuZGFyLmpzJztcclxuaW1wb3J0IHsgR0NhbEV2ZW50IH0gZnJvbSAnLi4vdHlwZXMuanMnO1xyXG5pbXBvcnQgeyBnZXRUb2tlbiB9IGZyb20gJy4vb2F1dGguanMnO1xyXG5pbXBvcnQgeyBFbnRpdHlNYW5hZ2VyIH0gZnJvbSAnQG1pa3JvLW9ybS9jb3JlJztcclxuaW1wb3J0IHsgQ2FsZW5kYXIgfSBmcm9tICcuLi9tb2RlbHMvQ2FsZW5kYXIuanMnO1xyXG5cclxuLy8gRnJvbSBnb29nbGUgYXBpIGNvbnNvbGU7IHVzZSBnZW5lcmFsIGRldiBvciBzZXJ2ZXIgcHJvZCBrZXlzIGZvciByZXNwZWN0aXZlIGVudmlyb25tZW50cy5cclxuLy8gTWFrZSBzdXJlIGl0J3Mgc2V0IGluIC5lbnZcclxuY29uc3QgZ2FwaUtleSA9IHByb2Nlc3MuZW52LkdBUElfS0VZX1NFUlZFUjtcclxuXHJcbmNvbnN0IGNhbGVuZGFySWQgPSAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyAmJiBwcm9jZXNzLmVudi5TRVJWRVJfRU5WICE9PSAndGVzdCcpXHJcbiAgICA/ICdxZG9pdTF1b3Z1YzA1YzRlZ3U2NXZzOXVja0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29tJ1xyXG4gICAgOiAnYzdkb2x0MjE3cmRiOWF0Z2dsMjVoNGZzcGdAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbSc7XHJcbmNvbnN0IHVyaUVuY0NhbElkID0gZW5jb2RlVVJJQ29tcG9uZW50KGNhbGVuZGFySWQpO1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldENhbGVuZGFyU2luZ2xlRXZlbnQgPSBhc3luYyAoZW06IEVudGl0eU1hbmFnZXIsIGlkOiBzdHJpbmcpOiBQcm9taXNlPEF4aW9zUmVzcG9uc2U8R0NhbEV2ZW50Pj4gPT4ge1xyXG4gICAgY29uc3QgdG9rZW4gPSBhd2FpdCBnZXRUb2tlbihlbSk7XHJcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vY2FsZW5kYXIvdjMvY2FsZW5kYXJzLyR7dXJpRW5jQ2FsSWR9L2V2ZW50cy8ke2lkfWA7XHJcbiAgICByZXR1cm4gYXhpb3MuZ2V0KHVybCwge1xyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3Rva2VufWAsXHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG59O1xyXG5cclxuaW50ZXJmYWNlIEV2ZW50c0xpc3RSZXNwb25zZSB7XHJcbiAgICBpdGVtczogR0NhbEV2ZW50W107XHJcbiAgICBuZXh0UGFnZVRva2VuOiBzdHJpbmc7XHJcbiAgICBuZXh0U3luY1Rva2VuOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRDYWxlbmRhckV2ZW50cyA9IGFzeW5jIChlbTogRW50aXR5TWFuYWdlciwgbmV4dFBhZ2VUb2tlbj86IHN0cmluZywgc3luY1Rva2VuPzogc3RyaW5nKTogUHJvbWlzZTxBeGlvc1Jlc3BvbnNlPEV2ZW50c0xpc3RSZXNwb25zZT4+ID0+IHtcclxuICAgIGNvbnN0IHRva2VuID0gYXdhaXQgZ2V0VG9rZW4oZW0pO1xyXG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2NhbGVuZGFyL3YzL2NhbGVuZGFycy8ke3VyaUVuY0NhbElkfS9ldmVudHNgO1xyXG4gICAgcmV0dXJuIGF4aW9zLmdldCh1cmwsIHtcclxuICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgc2luZ2xlRXZlbnRzOiB0cnVlLFxyXG4gICAgICAgICAgICBwYWdlVG9rZW46IG5leHRQYWdlVG9rZW4sXHJcbiAgICAgICAgICAgIHN5bmNUb2tlbixcclxuICAgICAgICB9LFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3Rva2VufWAsXHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGRlbGV0ZUNhbGVuZGFyRXZlbnQgPSBhc3luYyAoZW06IEVudGl0eU1hbmFnZXIsIGlkOiBzdHJpbmcpOiBQcm9taXNlPEF4aW9zUmVzcG9uc2U8YW55Pj4gPT4ge1xyXG4gICAgY29uc3QgdG9rZW4gPSBhd2FpdCBnZXRUb2tlbihlbSk7XHJcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vY2FsZW5kYXIvdjMvY2FsZW5kYXJzLyR7dXJpRW5jQ2FsSWR9L2V2ZW50cy8ke2lkfWA7XHJcbiAgICByZXR1cm4gYXhpb3MuZGVsZXRlKHVybCwge1xyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3Rva2VufWAsXHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG59O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBHb29nbGVDYWxlbmRhclBhcmFtcyB7XHJcbiAgICBpZD86IHN0cmluZztcclxuICAgIHN1bW1hcnk6IHN0cmluZztcclxuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XHJcbiAgICBsb2NhdGlvbjogc3RyaW5nO1xyXG4gICAgc3RhcnREYXRldGltZTogRGF0ZTtcclxuICAgIHRpbWVab25lOiBzdHJpbmc7XHJcbiAgICBhbGxEYXk6IGJvb2xlYW47XHJcbiAgICBlbmREYXRlPzogRGF0ZTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGNyZWF0ZUNhbGVuZGFyRXZlbnQgPSBhc3luYyAoXHJcbiAgICBlbTogRW50aXR5TWFuYWdlcixcclxuICAgIHtcclxuICAgICAgICBzdW1tYXJ5LFxyXG4gICAgICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgICAgIGxvY2F0aW9uLFxyXG4gICAgICAgIHN0YXJ0RGF0ZXRpbWUsXHJcbiAgICAgICAgdGltZVpvbmUsXHJcbiAgICAgICAgYWxsRGF5LFxyXG4gICAgICAgIGVuZERhdGUsXHJcbiAgICB9OiBHb29nbGVDYWxlbmRhclBhcmFtc1xyXG4pOiBQcm9taXNlPEF4aW9zUmVzcG9uc2U8YW55Pj4gPT4ge1xyXG4gICAgY29uc3QgdG9rZW4gPSBhd2FpdCBnZXRUb2tlbihlbSk7XHJcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vY2FsZW5kYXIvdjMvY2FsZW5kYXJzLyR7dXJpRW5jQ2FsSWR9L2V2ZW50c2A7XHJcbiAgICBjb25zdCBldmVudFJlc291cmNlID0ge1xyXG4gICAgICAgIHN1bW1hcnksXHJcbiAgICAgICAgZGVzY3JpcHRpb24sXHJcbiAgICAgICAgbG9jYXRpb24sXHJcbiAgICAgICAgc3RhcnQ6IChhbGxEYXkgP1xyXG4gICAgICAgICAgICB7IGRhdGU6IGZvcm1hdChzdGFydERhdGV0aW1lLCAneXl5eS1NTS1kZCcpIH0gOlxyXG4gICAgICAgICAgICB7IGRhdGVUaW1lOiBzdGFydERhdGV0aW1lLnRvSVNPU3RyaW5nKCksIHRpbWVab25lIH0pLFxyXG4gICAgICAgIGVuZDogKGVuZERhdGUgP1xyXG4gICAgICAgICAgICB7IGRhdGU6IGVuZERhdGUgfSA6XHJcbiAgICAgICAgICAgIChhbGxEYXkgP1xyXG4gICAgICAgICAgICAgICAgeyBkYXRlOiBmb3JtYXQoYWRkKHN0YXJ0RGF0ZXRpbWUsIHsgZGF5czogMSB9KSwgJ3l5eXktTU0tZGQnKSB9IDpcclxuICAgICAgICAgICAgICAgIHsgZGF0ZVRpbWU6IGFkZChzdGFydERhdGV0aW1lLCB7IGhvdXJzOiAyIH0pLnRvSVNPU3RyaW5nKCksIHRpbWVab25lIH1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICksXHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIGF4aW9zLnBvc3QodXJsLCBldmVudFJlc291cmNlLCB7XHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7dG9rZW59YCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgdXBkYXRlQ2FsZW5kYXIgPSBhc3luYyAoXHJcbiAgICBlbTogRW50aXR5TWFuYWdlcixcclxuICAgIHtcclxuICAgICAgICBpZCxcclxuICAgICAgICBzdW1tYXJ5LFxyXG4gICAgICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgICAgIGxvY2F0aW9uLFxyXG4gICAgICAgIHN0YXJ0RGF0ZXRpbWUsXHJcbiAgICAgICAgdGltZVpvbmUsXHJcbiAgICAgICAgYWxsRGF5LFxyXG4gICAgICAgIGVuZERhdGUsXHJcbiAgICB9OiBHb29nbGVDYWxlbmRhclBhcmFtc1xyXG4pOiBQcm9taXNlPEF4aW9zUmVzcG9uc2U8YW55Pj4gPT4ge1xyXG4gICAgY29uc3QgdG9rZW4gPSBhd2FpdCBnZXRUb2tlbihlbSk7XHJcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vY2FsZW5kYXIvdjMvY2FsZW5kYXJzLyR7dXJpRW5jQ2FsSWR9L2V2ZW50cy8ke2lkfWA7XHJcbiAgICBjb25zdCBldmVudFJlc291cmNlID0ge1xyXG4gICAgICAgIHN1bW1hcnksXHJcbiAgICAgICAgZGVzY3JpcHRpb24sXHJcbiAgICAgICAgbG9jYXRpb24sXHJcbiAgICAgICAgc3RhcnQ6IChhbGxEYXkgP1xyXG4gICAgICAgICAgICB7IGRhdGU6IGZvcm1hdChzdGFydERhdGV0aW1lLCAneXl5eS1NTS1kZCcpIH0gOlxyXG4gICAgICAgICAgICB7IGRhdGVUaW1lOiBzdGFydERhdGV0aW1lLnRvSVNPU3RyaW5nKCksIHRpbWVab25lIH0pLFxyXG4gICAgICAgIGVuZDogKGVuZERhdGUgP1xyXG4gICAgICAgICAgICB7IGRhdGU6IGVuZERhdGUgfSA6XHJcbiAgICAgICAgICAgIChhbGxEYXkgP1xyXG4gICAgICAgICAgICAgICAgeyBkYXRlOiBmb3JtYXQoYWRkKHN0YXJ0RGF0ZXRpbWUsIHsgZGF5czogMSB9KSwgJ3l5eXktTU0tZGQnKSB9IDpcclxuICAgICAgICAgICAgICAgIHsgZGF0ZVRpbWU6IGFkZChzdGFydERhdGV0aW1lLCB7IGhvdXJzOiAyIH0pLnRvSVNPU3RyaW5nKCksIHRpbWVab25lIH1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICksXHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIGF4aW9zLnB1dCh1cmwsIGV2ZW50UmVzb3VyY2UsIHtcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHt0b2tlbn1gLFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBleHRyYWN0RXZlbnREZXNjcmlwdGlvbiA9IChldmVudDogR0NhbEV2ZW50KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShldmVudC5kZXNjcmlwdGlvbik7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJz09PT09PUVycm9yIHBhcnNpbmcgZXZlbnQgZGVzY3JpcHRpb24gSlNPTj09PT09PScpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGV2ZW50LmRlc2NyaXB0aW9uKTtcclxuICAgICAgICByZXR1cm4ge307XHJcbiAgICB9XHJcbn07XHJcblxyXG5pbnRlcmZhY2UgR2VvY29kZVJlc3BvbnNlIHtcclxuICAgIHJlc3VsdHM6IHtcclxuICAgICAgICBnZW9tZXRyeToge1xyXG4gICAgICAgICAgICBsb2NhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgbGF0OiBudW1iZXI7XHJcbiAgICAgICAgICAgICAgICBsbmc6IG51bWJlcjtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGZvcm1hdHRlZEFkZHJlc3M6IHN0cmluZztcclxuICAgIH1bXTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldExhdExuZyA9IGFzeW5jIChhZGRyZXNzOiBzdHJpbmcpOiBQcm9taXNlPHsgbGF0bG5nOiB7IGxhdDogbnVtYmVyOyBsbmc6IG51bWJlciB9OyBmb3JtYXR0ZWRBZGRyZXNzOiBzdHJpbmcgfT4gPT4ge1xyXG4gICAgY29uc3QgZ2VvY29kZVVybCA9ICdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvZ2VvY29kZS9qc29uJztcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQ8R2VvY29kZVJlc3BvbnNlPihnZW9jb2RlVXJsLCB7XHJcbiAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgYWRkcmVzcyxcclxuICAgICAgICAgICAgICAgIGtleTogZ2FwaUtleSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBsYXRsbmc6IHJlc3BvbnNlLmRhdGEucmVzdWx0c1swXS5nZW9tZXRyeS5sb2NhdGlvbixcclxuICAgICAgICAgICAgZm9ybWF0dGVkQWRkcmVzczogcmVzcG9uc2UuZGF0YS5yZXN1bHRzWzBdLmZvcm1hdHRlZEFkZHJlc3MsXHJcbiAgICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICB0aHJvdyBlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuaW50ZXJmYWNlIFRpbWV6b25lUmVzcG9uc2Uge1xyXG4gICAgdGltZVpvbmVJZDogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0VGltZVpvbmUgPSBhc3luYyAobGF0OiBudW1iZXIsIGxuZzogbnVtYmVyLCB0aW1lc3RhbXA/OiBEYXRlKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcclxuICAgIGNvbnN0IGxvYyA9IGAke2xhdC50b1N0cmluZygpfSwke2xuZy50b1N0cmluZygpfWA7XHJcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL3RpbWV6b25lL2pzb25gO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldDxUaW1lem9uZVJlc3BvbnNlPih1cmwsIHtcclxuICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbjogbG9jLFxyXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBnZXRVbml4VGltZSh0aW1lc3RhbXAgfHwgbmV3IERhdGUoKSksXHJcbiAgICAgICAgICAgICAgICBrZXk6IGdhcGlLZXksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEudGltZVpvbmVJZDtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICB0aHJvdyBlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHRyYW5zZm9ybU1vZGVsVG9Hb29nbGUgPSAoYzogQ2FsZW5kYXIpID0+IHtcclxuICAgIGNvbnN0IGNvbGxhYm9yYXRvcnMgPSBjLmNvbGxhYm9yYXRvcnMudG9BcnJheSgpO1xyXG4gICAgY29uc3QgcGllY2VzID0gYy5waWVjZXMudG9BcnJheSgpO1xyXG4gICAgY29uc3QgZGF0YTogR29vZ2xlQ2FsZW5kYXJQYXJhbXMgPSB7XHJcbiAgICAgICAgc3VtbWFyeTogYy5uYW1lLFxyXG4gICAgICAgIGxvY2F0aW9uOiBjLmxvY2F0aW9uLFxyXG4gICAgICAgIHN0YXJ0RGF0ZXRpbWU6IGMuZGF0ZVRpbWUsXHJcbiAgICAgICAgZW5kRGF0ZTogYy5lbmREYXRlID8gbmV3IERhdGUoYy5lbmREYXRlKSA6IHVuZGVmaW5lZCxcclxuICAgICAgICBhbGxEYXk6IGMuYWxsRGF5LFxyXG4gICAgICAgIHRpbWVab25lOiBjLnRpbWV6b25lID8/ICcnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICAgIGNvbGxhYm9yYXRvcnM6IGNvbGxhYm9yYXRvcnMubWFwKCh7IG5hbWUsIGluc3RydW1lbnQgfSkgPT4gKHtcclxuICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICBpbnN0cnVtZW50LFxyXG4gICAgICAgICAgICB9KSksXHJcbiAgICAgICAgICAgIHBpZWNlczogcGllY2VzLm1hcCgoeyBjb21wb3NlciwgcGllY2UgfSkgPT4gKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvc2VyLFxyXG4gICAgICAgICAgICAgICAgcGllY2UsXHJcbiAgICAgICAgICAgIH0pKSxcclxuICAgICAgICAgICAgdHlwZTogYy50eXBlLFxyXG4gICAgICAgICAgICB3ZWJzaXRlOiBlbmNvZGVVUkkoYy53ZWJzaXRlID8/ICcnKSxcclxuICAgICAgICAgICAgaW1hZ2VVcmw6IGVuY29kZVVSSShjLmltYWdlVXJsID8/ICcnKSxcclxuICAgICAgICAgICAgcGxhY2VJZDogYy5wbGFjZUlkLFxyXG4gICAgICAgICAgICBwaG90b1JlZmVyZW5jZTogYy5waG90b1JlZmVyZW5jZSxcclxuICAgICAgICB9KSxcclxuICAgIH07XHJcbiAgICBpZiAoISFjLmlkKSB7XHJcbiAgICAgICAgZGF0YS5pZCA9IGMuaWQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGF0YTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRJbWFnZUZyb21NZXRhVGFnID0gYXN5bmMgKHdlYnNpdGU6IHN0cmluZykgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBwYWdlID0gYXdhaXQgYXhpb3MuZ2V0PHN0cmluZz4od2Vic2l0ZSk7XHJcbiAgICAgICAgY29uc3QgeyBkb2N1bWVudCB9ID0gbmV3IEpTRE9NKHBhZ2UuZGF0YSkud2luZG93O1xyXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9XCJ0d2l0dGVyOmltYWdlXCJdJyk/LmdldEF0dHJpYnV0ZSgnY29udGVudCcpXHJcbiAgICAgICAgICAgID8/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbcHJvcGVydHk9XCJvZzppbWFnZVwiXScpPy5nZXRBdHRyaWJ1dGUoJ2NvbnRlbnQnKVxyXG4gICAgICAgICAgICA/PyAnJztcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyBFdmVuIGlmIHVybCBkb2Vzbid0IGV4aXN0IGFueW1vcmVcclxuICAgICAgICAgICAgLy8gUmVzcG9uc2UgY291bGQgY29udGFpbiB1c2FibGUgaW1hZ2VzLlxyXG4gICAgICAgICAgICBjb25zdCBlcnIgPSBlIGFzIEF4aW9zRXJyb3I8c3RyaW5nPjtcclxuICAgICAgICAgICAgY29uc3QgcGFnZSA9IGVyci5yZXNwb25zZT8uZGF0YTtcclxuICAgICAgICAgICAgY29uc3QgeyBkb2N1bWVudCB9ID0gbmV3IEpTRE9NKHBhZ2UpLndpbmRvdztcclxuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT1cInR3aXR0ZXI6aW1hZ2VcIl0nKT8uZ2V0QXR0cmlidXRlKCdjb250ZW50JylcclxuICAgICAgICAgICAgICAgID8/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbcHJvcGVydHk9XCJvZzppbWFnZVwiXScpPy5nZXRBdHRyaWJ1dGUoJ2NvbnRlbnQnKVxyXG4gICAgICAgICAgICAgICAgPz8gJyc7XHJcbiAgICAgICAgfSBjYXRjaCAoZWUpIHtcclxuICAgICAgICAgICAgLy8gUmVhbGx5IGNhbid0IHVzZSBpdC5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coZWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59OyJdLCJuYW1lcyI6WyJheGlvcyIsImFkZCIsImZvcm1hdCIsImdldFVuaXhUaW1lIiwiSlNET00iLCJnZXRUb2tlbiIsImdhcGlLZXkiLCJwcm9jZXNzIiwiZW52IiwiR0FQSV9LRVlfU0VSVkVSIiwiY2FsZW5kYXJJZCIsIk5PREVfRU5WIiwiU0VSVkVSX0VOViIsInVyaUVuY0NhbElkIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiZ2V0Q2FsZW5kYXJTaW5nbGVFdmVudCIsImVtIiwiaWQiLCJ0b2tlbiIsInVybCIsImdldCIsImhlYWRlcnMiLCJBdXRob3JpemF0aW9uIiwiZ2V0Q2FsZW5kYXJFdmVudHMiLCJuZXh0UGFnZVRva2VuIiwic3luY1Rva2VuIiwicGFyYW1zIiwic2luZ2xlRXZlbnRzIiwicGFnZVRva2VuIiwiZGVsZXRlQ2FsZW5kYXJFdmVudCIsImRlbGV0ZSIsImNyZWF0ZUNhbGVuZGFyRXZlbnQiLCJzdW1tYXJ5IiwiZGVzY3JpcHRpb24iLCJsb2NhdGlvbiIsInN0YXJ0RGF0ZXRpbWUiLCJ0aW1lWm9uZSIsImFsbERheSIsImVuZERhdGUiLCJldmVudFJlc291cmNlIiwic3RhcnQiLCJkYXRlIiwiZGF0ZVRpbWUiLCJ0b0lTT1N0cmluZyIsImVuZCIsImRheXMiLCJob3VycyIsInBvc3QiLCJ1cGRhdGVDYWxlbmRhciIsInB1dCIsImV4dHJhY3RFdmVudERlc2NyaXB0aW9uIiwiZXZlbnQiLCJKU09OIiwicGFyc2UiLCJlIiwiY29uc29sZSIsImxvZyIsImdldExhdExuZyIsImFkZHJlc3MiLCJnZW9jb2RlVXJsIiwicmVzcG9uc2UiLCJrZXkiLCJsYXRsbmciLCJkYXRhIiwicmVzdWx0cyIsImdlb21ldHJ5IiwiZm9ybWF0dGVkQWRkcmVzcyIsImdldFRpbWVab25lIiwibGF0IiwibG5nIiwidGltZXN0YW1wIiwibG9jIiwidG9TdHJpbmciLCJEYXRlIiwidGltZVpvbmVJZCIsInRyYW5zZm9ybU1vZGVsVG9Hb29nbGUiLCJjIiwiY29sbGFib3JhdG9ycyIsInRvQXJyYXkiLCJwaWVjZXMiLCJuYW1lIiwidW5kZWZpbmVkIiwidGltZXpvbmUiLCJzdHJpbmdpZnkiLCJtYXAiLCJpbnN0cnVtZW50IiwiY29tcG9zZXIiLCJwaWVjZSIsInR5cGUiLCJ3ZWJzaXRlIiwiZW5jb2RlVVJJIiwiaW1hZ2VVcmwiLCJwbGFjZUlkIiwicGhvdG9SZWZlcmVuY2UiLCJnZXRJbWFnZUZyb21NZXRhVGFnIiwiZG9jdW1lbnQiLCJwYWdlIiwid2luZG93IiwicXVlcnlTZWxlY3RvciIsImdldEF0dHJpYnV0ZSIsImVyciIsImVlIl0sIm1hcHBpbmdzIjoiQUFBQSxPQUFPQSxXQUEwQyxRQUFRO0FBQ3pELFNBQVNDLEdBQUcsRUFBRUMsTUFBTSxFQUFFQyxXQUFXLFFBQVEsV0FBVztBQUNwRCxTQUFTQyxLQUFLLFFBQVEsUUFBUTtBQUk5QixTQUFTQyxRQUFRLFFBQVEsYUFBYTtBQUl0Qyw0RkFBNEY7QUFDNUYsNkJBQTZCO0FBQzdCLE1BQU1DLFVBQVVDLFFBQVFDLEdBQUcsQ0FBQ0MsZUFBZTtBQUUzQyxNQUFNQyxhQUFhLEFBQUNILFFBQVFDLEdBQUcsQ0FBQ0csUUFBUSxLQUFLLGdCQUFnQkosUUFBUUMsR0FBRyxDQUFDSSxVQUFVLEtBQUssU0FDbEYseURBQ0E7QUFDTixNQUFNQyxjQUFjQyxtQkFBbUJKO0FBRXZDLE9BQU8sTUFBTUsseUJBQXlCLE9BQU9DLElBQW1CQztJQUM1RCxNQUFNQyxRQUFRLE1BQU1iLFNBQVNXO0lBQzdCLE1BQU1HLE1BQU0sQ0FBQyxpREFBaUQsRUFBRU4sWUFBWSxRQUFR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