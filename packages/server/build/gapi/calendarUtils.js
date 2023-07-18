import axios from "axios";
import { add, format, getUnixTime } from "date-fns";
import { JSDOM } from "jsdom";
import { getToken } from "./oauth.js";
// From google api console; use general dev or server prod keys for respective environments.
// Make sure it's set in .env
const gapiKey = process.env.GAPI_KEY_SERVER;
const calendarId = process.env.NODE_ENV === 'production' && process.env.SERVER_ENV !== 'test' ? 'qdoiu1uovuc05c4egu65vs9uck@group.calendar.google.com' : 'c7dolt217rdb9atggl25h4fspg@group.calendar.google.com';
const uriEncCalId = encodeURIComponent(calendarId);
export const getCalendarSingleEvent = async (id)=>{
    const token = await getToken();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${uriEncCalId}/events/${id}`;
    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};
export const getCalendarEvents = async (nextPageToken, syncToken)=>{
    const token = await getToken();
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
export const deleteCalendarEvent = async (id)=>{
    const token = await getToken();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${uriEncCalId}/events/${id}`;
    return axios.delete(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};
export const createCalendarEvent = async ({ summary , description , location , startDatetime , timeZone , allDay , endDate  })=>{
    const token = await getToken();
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
export const updateCalendar = async ({ id , summary , description , location , startDatetime , timeZone , allDay , endDate  })=>{
    const token = await getToken();
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
export const transformModelToGoogle = ()=>{
// const collaborators = c.collaborators.toArray();
// const pieces = c.pieces.toArray();
// const data: GoogleCalendarParams = {
//     summary: c.name,
//     location: c.location,
//     startDatetime: c.dateTime,
//     endDate: c.endDate ? new Date(c.endDate) : undefined,
//     allDay: c.allDay,
//     timeZone: c.timezone ?? '',
//     description: JSON.stringify({
//         collaborators: collaborators.map(({ name, instrument }) => ({
//             name,
//             instrument,
//         })),
//         pieces: pieces.map(({ composer, piece }) => ({
//             composer,
//             piece,
//         })),
//         type: c.type,
//         website: encodeURI(c.website ?? ''),
//         imageUrl: encodeURI(c.imageUrl ?? ''),
//         placeId: c.placeId,
//         photoReference: c.photoReference,
//     }),
// };
// if (!!c.id) {
//     data.id = c.id;
// }
// return data;
};
export const getImageFromMetaTag = async (website)=>{
    try {
        var _document_querySelector, _document_querySelector1;
        const page = await axios.get(website);
        const { document  } = new JSDOM(page.data).window;
        return ((_document_querySelector = document.querySelector('meta[name="twitter:image"]')) === null || _document_querySelector === void 0 ? void 0 : _document_querySelector.getAttribute('content')) ?? ((_document_querySelector1 = document.querySelector('meta[property="og:image"]')) === null || _document_querySelector1 === void 0 ? void 0 : _document_querySelector1.getAttribute('content')) ?? '';
    } catch (e) {
        // console.log(e);
        try {
            var _err_response, _document_querySelector2, _document_querySelector3;
            // Even if website doesn't exist anymore
            // Response could contain usable images.
            const err = e;
            const page = (_err_response = err.response) === null || _err_response === void 0 ? void 0 : _err_response.data;
            const { document  } = new JSDOM(page).window;
            return ((_document_querySelector2 = document.querySelector('meta[name="twitter:image"]')) === null || _document_querySelector2 === void 0 ? void 0 : _document_querySelector2.getAttribute('content')) ?? ((_document_querySelector3 = document.querySelector('meta[property="og:image"]')) === null || _document_querySelector3 === void 0 ? void 0 : _document_querySelector3.getAttribute('content')) ?? '';
        } catch (ee) {
            // Really can't use it.
            console.log(ee);
            return '';
        }
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9nYXBpL2NhbGVuZGFyVXRpbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGF4aW9zLCB7IEF4aW9zRXJyb3IsIEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcyc7XHJcbmltcG9ydCB7IGFkZCwgZm9ybWF0LCBnZXRVbml4VGltZSB9IGZyb20gJ2RhdGUtZm5zJztcclxuaW1wb3J0IHsgSlNET00gfSBmcm9tICdqc2RvbSc7XHJcblxyXG4vLyBpbXBvcnQgeyBDYWxlbmRhciB9IGZyb20gJy4uL21vZGVscy9vcm0vQ2FsZW5kYXIuanMnO1xyXG5pbXBvcnQgeyBHQ2FsRXZlbnQgfSBmcm9tICcuLi90eXBlcy5qcyc7XHJcbmltcG9ydCB7IGdldFRva2VuIH0gZnJvbSAnLi9vYXV0aC5qcyc7XHJcblxyXG4vLyBGcm9tIGdvb2dsZSBhcGkgY29uc29sZTsgdXNlIGdlbmVyYWwgZGV2IG9yIHNlcnZlciBwcm9kIGtleXMgZm9yIHJlc3BlY3RpdmUgZW52aXJvbm1lbnRzLlxyXG4vLyBNYWtlIHN1cmUgaXQncyBzZXQgaW4gLmVudlxyXG5jb25zdCBnYXBpS2V5ID0gcHJvY2Vzcy5lbnYuR0FQSV9LRVlfU0VSVkVSO1xyXG5cclxuY29uc3QgY2FsZW5kYXJJZCA9IChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nICYmIHByb2Nlc3MuZW52LlNFUlZFUl9FTlYgIT09ICd0ZXN0JylcclxuICAgID8gJ3Fkb2l1MXVvdnVjMDVjNGVndTY1dnM5dWNrQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20nXHJcbiAgICA6ICdjN2RvbHQyMTdyZGI5YXRnZ2wyNWg0ZnNwZ0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29tJztcclxuY29uc3QgdXJpRW5jQ2FsSWQgPSBlbmNvZGVVUklDb21wb25lbnQoY2FsZW5kYXJJZCk7XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0Q2FsZW5kYXJTaW5nbGVFdmVudCA9IGFzeW5jIChpZDogc3RyaW5nKTogUHJvbWlzZTxBeGlvc1Jlc3BvbnNlPGFueT4+ID0+IHtcclxuICAgIGNvbnN0IHRva2VuID0gYXdhaXQgZ2V0VG9rZW4oKTtcclxuICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9jYWxlbmRhci92My9jYWxlbmRhcnMvJHt1cmlFbmNDYWxJZH0vZXZlbnRzLyR7aWR9YDtcclxuICAgIHJldHVybiBheGlvcy5nZXQodXJsLCB7XHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7dG9rZW59YCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5pbnRlcmZhY2UgRXZlbnRzTGlzdFJlc3BvbnNlIHtcclxuICAgIGl0ZW1zOiBHQ2FsRXZlbnRbXTtcclxuICAgIG5leHRQYWdlVG9rZW46IHN0cmluZztcclxuICAgIG5leHRTeW5jVG9rZW46IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldENhbGVuZGFyRXZlbnRzID0gYXN5bmMgKG5leHRQYWdlVG9rZW4/OiBzdHJpbmcsIHN5bmNUb2tlbj86IHN0cmluZyk6IFByb21pc2U8QXhpb3NSZXNwb25zZTxFdmVudHNMaXN0UmVzcG9uc2U+PiA9PiB7XHJcbiAgICBjb25zdCB0b2tlbiA9IGF3YWl0IGdldFRva2VuKCk7XHJcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vY2FsZW5kYXIvdjMvY2FsZW5kYXJzLyR7dXJpRW5jQ2FsSWR9L2V2ZW50c2A7XHJcbiAgICByZXR1cm4gYXhpb3MuZ2V0KHVybCwge1xyXG4gICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICBzaW5nbGVFdmVudHM6IHRydWUsXHJcbiAgICAgICAgICAgIHBhZ2VUb2tlbjogbmV4dFBhZ2VUb2tlbixcclxuICAgICAgICAgICAgc3luY1Rva2VuLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7dG9rZW59YCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZGVsZXRlQ2FsZW5kYXJFdmVudCA9IGFzeW5jIChpZDogc3RyaW5nKTogUHJvbWlzZTxBeGlvc1Jlc3BvbnNlPGFueT4+ID0+IHtcclxuICAgIGNvbnN0IHRva2VuID0gYXdhaXQgZ2V0VG9rZW4oKTtcclxuICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9jYWxlbmRhci92My9jYWxlbmRhcnMvJHt1cmlFbmNDYWxJZH0vZXZlbnRzLyR7aWR9YDtcclxuICAgIHJldHVybiBheGlvcy5kZWxldGUodXJsLCB7XHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7dG9rZW59YCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEdvb2dsZUNhbGVuZGFyUGFyYW1zIHtcclxuICAgIGlkPzogc3RyaW5nO1xyXG4gICAgc3VtbWFyeTogc3RyaW5nO1xyXG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcclxuICAgIGxvY2F0aW9uOiBzdHJpbmc7XHJcbiAgICBzdGFydERhdGV0aW1lOiBEYXRlO1xyXG4gICAgdGltZVpvbmU6IHN0cmluZztcclxuICAgIGFsbERheTogYm9vbGVhbjtcclxuICAgIGVuZERhdGU/OiBEYXRlO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgY3JlYXRlQ2FsZW5kYXJFdmVudCA9IGFzeW5jICh7XHJcbiAgICBzdW1tYXJ5LFxyXG4gICAgZGVzY3JpcHRpb24sXHJcbiAgICBsb2NhdGlvbixcclxuICAgIHN0YXJ0RGF0ZXRpbWUsXHJcbiAgICB0aW1lWm9uZSxcclxuICAgIGFsbERheSxcclxuICAgIGVuZERhdGUsXHJcbn06IEdvb2dsZUNhbGVuZGFyUGFyYW1zKTogUHJvbWlzZTxBeGlvc1Jlc3BvbnNlPGFueT4+ID0+IHtcclxuICAgIGNvbnN0IHRva2VuID0gYXdhaXQgZ2V0VG9rZW4oKTtcclxuICAgIGNvbnN0IHVybCA9IGBodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9jYWxlbmRhci92My9jYWxlbmRhcnMvJHt1cmlFbmNDYWxJZH0vZXZlbnRzYDtcclxuICAgIGNvbnN0IGV2ZW50UmVzb3VyY2UgPSB7XHJcbiAgICAgICAgc3VtbWFyeSxcclxuICAgICAgICBkZXNjcmlwdGlvbixcclxuICAgICAgICBsb2NhdGlvbixcclxuICAgICAgICBzdGFydDogKGFsbERheSA/XHJcbiAgICAgICAgICAgIHsgZGF0ZTogZm9ybWF0KHN0YXJ0RGF0ZXRpbWUsICd5eXl5LU1NLWRkJykgfSA6XHJcbiAgICAgICAgICAgIHsgZGF0ZVRpbWU6IHN0YXJ0RGF0ZXRpbWUudG9JU09TdHJpbmcoKSwgdGltZVpvbmUgfSksXHJcbiAgICAgICAgZW5kOiAoZW5kRGF0ZSA/XHJcbiAgICAgICAgICAgIHsgZGF0ZTogZW5kRGF0ZSB9IDpcclxuICAgICAgICAgICAgKGFsbERheSA/XHJcbiAgICAgICAgICAgICAgICB7IGRhdGU6IGZvcm1hdChhZGQoc3RhcnREYXRldGltZSwgeyBkYXlzOiAxIH0pLCAneXl5eS1NTS1kZCcpIH0gOlxyXG4gICAgICAgICAgICAgICAgeyBkYXRlVGltZTogYWRkKHN0YXJ0RGF0ZXRpbWUsIHsgaG91cnM6IDIgfSkudG9JU09TdHJpbmcoKSwgdGltZVpvbmUgfVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKSxcclxuICAgIH07XHJcbiAgICByZXR1cm4gYXhpb3MucG9zdCh1cmwsIGV2ZW50UmVzb3VyY2UsIHtcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHt0b2tlbn1gLFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCB1cGRhdGVDYWxlbmRhciA9IGFzeW5jICh7XHJcbiAgICBpZCxcclxuICAgIHN1bW1hcnksXHJcbiAgICBkZXNjcmlwdGlvbixcclxuICAgIGxvY2F0aW9uLFxyXG4gICAgc3RhcnREYXRldGltZSxcclxuICAgIHRpbWVab25lLFxyXG4gICAgYWxsRGF5LFxyXG4gICAgZW5kRGF0ZSxcclxufTogR29vZ2xlQ2FsZW5kYXJQYXJhbXMpOiBQcm9taXNlPEF4aW9zUmVzcG9uc2U8YW55Pj4gPT4ge1xyXG4gICAgY29uc3QgdG9rZW4gPSBhd2FpdCBnZXRUb2tlbigpO1xyXG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2NhbGVuZGFyL3YzL2NhbGVuZGFycy8ke3VyaUVuY0NhbElkfS9ldmVudHMvJHtpZH1gO1xyXG4gICAgY29uc3QgZXZlbnRSZXNvdXJjZSA9IHtcclxuICAgICAgICBzdW1tYXJ5LFxyXG4gICAgICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgICAgIGxvY2F0aW9uLFxyXG4gICAgICAgIHN0YXJ0OiAoYWxsRGF5ID9cclxuICAgICAgICAgICAgeyBkYXRlOiBmb3JtYXQoc3RhcnREYXRldGltZSwgJ3l5eXktTU0tZGQnKSB9IDpcclxuICAgICAgICAgICAgeyBkYXRlVGltZTogc3RhcnREYXRldGltZS50b0lTT1N0cmluZygpLCB0aW1lWm9uZSB9KSxcclxuICAgICAgICBlbmQ6IChlbmREYXRlID9cclxuICAgICAgICAgICAgeyBkYXRlOiBlbmREYXRlIH0gOlxyXG4gICAgICAgICAgICAoYWxsRGF5ID9cclxuICAgICAgICAgICAgICAgIHsgZGF0ZTogZm9ybWF0KGFkZChzdGFydERhdGV0aW1lLCB7IGRheXM6IDEgfSksICd5eXl5LU1NLWRkJykgfSA6XHJcbiAgICAgICAgICAgICAgICB7IGRhdGVUaW1lOiBhZGQoc3RhcnREYXRldGltZSwgeyBob3VyczogMiB9KS50b0lTT1N0cmluZygpLCB0aW1lWm9uZSB9XHJcbiAgICAgICAgICAgIClcclxuICAgICAgICApLFxyXG4gICAgfTtcclxuICAgIHJldHVybiBheGlvcy5wdXQodXJsLCBldmVudFJlc291cmNlLCB7XHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7dG9rZW59YCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZXh0cmFjdEV2ZW50RGVzY3JpcHRpb24gPSAoZXZlbnQ6IEdDYWxFdmVudCk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZXZlbnQuZGVzY3JpcHRpb24pO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCc9PT09PT1FcnJvciBwYXJzaW5nIGV2ZW50IGRlc2NyaXB0aW9uIEpTT049PT09PT0nKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhldmVudC5kZXNjcmlwdGlvbik7XHJcbiAgICAgICAgcmV0dXJuIHt9O1xyXG4gICAgfVxyXG59O1xyXG5cclxuaW50ZXJmYWNlIEdlb2NvZGVSZXNwb25zZSB7XHJcbiAgICAgICAgcmVzdWx0czoge1xyXG4gICAgICAgICAgICBnZW9tZXRyeToge1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICBsYXQ6IG51bWJlcjtcclxuICAgICAgICAgICAgICAgICAgICBsbmc6IG51bWJlcjtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGZvcm1hdHRlZEFkZHJlc3M6IHN0cmluZztcclxuICAgICAgICB9W107XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnZXRMYXRMbmcgPSBhc3luYyAoYWRkcmVzczogc3RyaW5nKTogUHJvbWlzZTx7IGxhdGxuZzogeyBsYXQ6IG51bWJlcjsgbG5nOiBudW1iZXIgfTsgZm9ybWF0dGVkQWRkcmVzczogc3RyaW5nIH0+ID0+IHtcclxuICAgIGNvbnN0IGdlb2NvZGVVcmwgPSAnaHR0cHM6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL2dlb2NvZGUvanNvbic7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0PEdlb2NvZGVSZXNwb25zZT4oZ2VvY29kZVVybCwge1xyXG4gICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgIGFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICBrZXk6IGdhcGlLZXksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbGF0bG5nOiByZXNwb25zZS5kYXRhLnJlc3VsdHNbMF0uZ2VvbWV0cnkubG9jYXRpb24sXHJcbiAgICAgICAgICAgIGZvcm1hdHRlZEFkZHJlc3M6IHJlc3BvbnNlLmRhdGEucmVzdWx0c1swXS5mb3JtYXR0ZWRBZGRyZXNzLFxyXG4gICAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgdGhyb3cgZTtcclxuICAgIH1cclxufTtcclxuXHJcbmludGVyZmFjZSBUaW1lem9uZVJlc3BvbnNlIHtcclxuICAgIHRpbWVab25lSWQ6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdldFRpbWVab25lID0gYXN5bmMgKGxhdDogbnVtYmVyLCBsbmc6IG51bWJlciwgdGltZXN0YW1wPzogRGF0ZSk6IFByb21pc2U8c3RyaW5nPiA9PiB7XHJcbiAgICBjb25zdCBsb2MgPSBgJHtsYXQudG9TdHJpbmcoKX0sJHtsbmcudG9TdHJpbmcoKX1gO1xyXG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vbWFwcy5nb29nbGVhcGlzLmNvbS9tYXBzL2FwaS90aW1lem9uZS9qc29uYDtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQ8VGltZXpvbmVSZXNwb25zZT4odXJsLCB7XHJcbiAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb246IGxvYyxcclxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogZ2V0VW5peFRpbWUodGltZXN0YW1wIHx8IG5ldyBEYXRlKCkpLFxyXG4gICAgICAgICAgICAgICAga2V5OiBnYXBpS2V5LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhLnRpbWVab25lSWQ7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgdGhyb3cgZTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCB0cmFuc2Zvcm1Nb2RlbFRvR29vZ2xlID0gKCkgPT4ge1xyXG4gICAgLy8gY29uc3QgY29sbGFib3JhdG9ycyA9IGMuY29sbGFib3JhdG9ycy50b0FycmF5KCk7XHJcbiAgICAvLyBjb25zdCBwaWVjZXMgPSBjLnBpZWNlcy50b0FycmF5KCk7XHJcbiAgICAvLyBjb25zdCBkYXRhOiBHb29nbGVDYWxlbmRhclBhcmFtcyA9IHtcclxuICAgIC8vICAgICBzdW1tYXJ5OiBjLm5hbWUsXHJcbiAgICAvLyAgICAgbG9jYXRpb246IGMubG9jYXRpb24sXHJcbiAgICAvLyAgICAgc3RhcnREYXRldGltZTogYy5kYXRlVGltZSxcclxuICAgIC8vICAgICBlbmREYXRlOiBjLmVuZERhdGUgPyBuZXcgRGF0ZShjLmVuZERhdGUpIDogdW5kZWZpbmVkLFxyXG4gICAgLy8gICAgIGFsbERheTogYy5hbGxEYXksXHJcbiAgICAvLyAgICAgdGltZVpvbmU6IGMudGltZXpvbmUgPz8gJycsXHJcbiAgICAvLyAgICAgZGVzY3JpcHRpb246IEpTT04uc3RyaW5naWZ5KHtcclxuICAgIC8vICAgICAgICAgY29sbGFib3JhdG9yczogY29sbGFib3JhdG9ycy5tYXAoKHsgbmFtZSwgaW5zdHJ1bWVudCB9KSA9PiAoe1xyXG4gICAgLy8gICAgICAgICAgICAgbmFtZSxcclxuICAgIC8vICAgICAgICAgICAgIGluc3RydW1lbnQsXHJcbiAgICAvLyAgICAgICAgIH0pKSxcclxuICAgIC8vICAgICAgICAgcGllY2VzOiBwaWVjZXMubWFwKCh7IGNvbXBvc2VyLCBwaWVjZSB9KSA9PiAoe1xyXG4gICAgLy8gICAgICAgICAgICAgY29tcG9zZXIsXHJcbiAgICAvLyAgICAgICAgICAgICBwaWVjZSxcclxuICAgIC8vICAgICAgICAgfSkpLFxyXG4gICAgLy8gICAgICAgICB0eXBlOiBjLnR5cGUsXHJcbiAgICAvLyAgICAgICAgIHdlYnNpdGU6IGVuY29kZVVSSShjLndlYnNpdGUgPz8gJycpLFxyXG4gICAgLy8gICAgICAgICBpbWFnZVVybDogZW5jb2RlVVJJKGMuaW1hZ2VVcmwgPz8gJycpLFxyXG4gICAgLy8gICAgICAgICBwbGFjZUlkOiBjLnBsYWNlSWQsXHJcbiAgICAvLyAgICAgICAgIHBob3RvUmVmZXJlbmNlOiBjLnBob3RvUmVmZXJlbmNlLFxyXG4gICAgLy8gICAgIH0pLFxyXG4gICAgLy8gfTtcclxuICAgIC8vIGlmICghIWMuaWQpIHtcclxuICAgIC8vICAgICBkYXRhLmlkID0gYy5pZDtcclxuICAgIC8vIH1cclxuICAgIC8vIHJldHVybiBkYXRhO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldEltYWdlRnJvbU1ldGFUYWcgPSBhc3luYyAod2Vic2l0ZTogc3RyaW5nKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHBhZ2UgPSBhd2FpdCBheGlvcy5nZXQ8c3RyaW5nPih3ZWJzaXRlKTtcclxuICAgICAgICBjb25zdCB7IGRvY3VtZW50IH0gPSBuZXcgSlNET00ocGFnZS5kYXRhKS53aW5kb3c7XHJcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT1cInR3aXR0ZXI6aW1hZ2VcIl0nKT8uZ2V0QXR0cmlidXRlKCdjb250ZW50JylcclxuICAgICAgICAgICAgPz8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWV0YVtwcm9wZXJ0eT1cIm9nOmltYWdlXCJdJyk/LmdldEF0dHJpYnV0ZSgnY29udGVudCcpXHJcbiAgICAgICAgICAgID8/ICcnO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIEV2ZW4gaWYgd2Vic2l0ZSBkb2Vzbid0IGV4aXN0IGFueW1vcmVcclxuICAgICAgICAgICAgLy8gUmVzcG9uc2UgY291bGQgY29udGFpbiB1c2FibGUgaW1hZ2VzLlxyXG4gICAgICAgICAgICBjb25zdCBlcnIgPSBlIGFzIEF4aW9zRXJyb3I8c3RyaW5nPjtcclxuICAgICAgICAgICAgY29uc3QgcGFnZSA9IGVyci5yZXNwb25zZT8uZGF0YTtcclxuICAgICAgICAgICAgY29uc3QgeyBkb2N1bWVudCB9ID0gbmV3IEpTRE9NKHBhZ2UpLndpbmRvdztcclxuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT1cInR3aXR0ZXI6aW1hZ2VcIl0nKT8uZ2V0QXR0cmlidXRlKCdjb250ZW50JylcclxuICAgICAgICAgICAgICAgID8/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbcHJvcGVydHk9XCJvZzppbWFnZVwiXScpPy5nZXRBdHRyaWJ1dGUoJ2NvbnRlbnQnKVxyXG4gICAgICAgICAgICAgICAgPz8gJyc7XHJcbiAgICAgICAgfSBjYXRjaCAoZWUpIHtcclxuICAgICAgICAgICAgLy8gUmVhbGx5IGNhbid0IHVzZSBpdC5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coZWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59OyJdLCJuYW1lcyI6WyJheGlvcyIsImFkZCIsImZvcm1hdCIsImdldFVuaXhUaW1lIiwiSlNET00iLCJnZXRUb2tlbiIsImdhcGlLZXkiLCJwcm9jZXNzIiwiZW52IiwiR0FQSV9LRVlfU0VSVkVSIiwiY2FsZW5kYXJJZCIsIk5PREVfRU5WIiwiU0VSVkVSX0VOViIsInVyaUVuY0NhbElkIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiZ2V0Q2FsZW5kYXJTaW5nbGVFdmVudCIsImlkIiwidG9rZW4iLCJ1cmwiLCJnZXQiLCJoZWFkZXJzIiwiQXV0aG9yaXphdGlvbiIsImdldENhbGVuZGFyRXZlbnRzIiwibmV4dFBhZ2VUb2tlbiIsInN5bmNUb2tlbiIsInBhcmFtcyIsInNpbmdsZUV2ZW50cyIsInBhZ2VUb2tlbiIsImRlbGV0ZUNhbGVuZGFyRXZlbnQiLCJkZWxldGUiLCJjcmVhdGVDYWxlbmRhckV2ZW50Iiwic3VtbWFyeSIsImRlc2NyaXB0aW9uIiwibG9jYXRpb24iLCJzdGFydERhdGV0aW1lIiwidGltZVpvbmUiLCJhbGxEYXkiLCJlbmREYXRlIiwiZXZlbnRSZXNvdXJjZSIsInN0YXJ0IiwiZGF0ZSIsImRhdGVUaW1lIiwidG9JU09TdHJpbmciLCJlbmQiLCJkYXlzIiwiaG91cnMiLCJwb3N0IiwidXBkYXRlQ2FsZW5kYXIiLCJwdXQiLCJleHRyYWN0RXZlbnREZXNjcmlwdGlvbiIsImV2ZW50IiwiSlNPTiIsInBhcnNlIiwiZSIsImNvbnNvbGUiLCJsb2ciLCJnZXRMYXRMbmciLCJhZGRyZXNzIiwiZ2VvY29kZVVybCIsInJlc3BvbnNlIiwia2V5IiwibGF0bG5nIiwiZGF0YSIsInJlc3VsdHMiLCJnZW9tZXRyeSIsImZvcm1hdHRlZEFkZHJlc3MiLCJnZXRUaW1lWm9uZSIsImxhdCIsImxuZyIsInRpbWVzdGFtcCIsImxvYyIsInRvU3RyaW5nIiwiRGF0ZSIsInRpbWVab25lSWQiLCJ0cmFuc2Zvcm1Nb2RlbFRvR29vZ2xlIiwiZ2V0SW1hZ2VGcm9tTWV0YVRhZyIsIndlYnNpdGUiLCJkb2N1bWVudCIsInBhZ2UiLCJ3aW5kb3ciLCJxdWVyeVNlbGVjdG9yIiwiZ2V0QXR0cmlidXRlIiwiZXJyIiwiZWUiXSwibWFwcGluZ3MiOiJBQUFBLE9BQU9BLFdBQTBDLFFBQVE7QUFDekQsU0FBU0MsR0FBRyxFQUFFQyxNQUFNLEVBQUVDLFdBQVcsUUFBUSxXQUFXO0FBQ3BELFNBQVNDLEtBQUssUUFBUSxRQUFRO0FBSTlCLFNBQVNDLFFBQVEsUUFBUSxhQUFhO0FBRXRDLDRGQUE0RjtBQUM1Riw2QkFBNkI7QUFDN0IsTUFBTUMsVUFBVUMsUUFBUUMsR0FBRyxDQUFDQyxlQUFlO0FBRTNDLE1BQU1DLGFBQWEsQUFBQ0gsUUFBUUMsR0FBRyxDQUFDRyxRQUFRLEtBQUssZ0JBQWdCSixRQUFRQyxHQUFHLENBQUNJLFVBQVUsS0FBSyxTQUNsRix5REFDQSxzREFBc0Q7QUFDNUQsTUFBTUMsY0FBY0MsbUJBQW1CSjtBQUV2QyxPQUFPLE1BQU1LLHlCQUF5QixPQUFPQyxLQUE0QztJQUNyRixNQUFNQyxRQUFRLE1BQU1aO0lBQ3BCLE1BQU1hLE1BQU0sQ0FBQyxpREFBaUQsRUFBRUwsWUFBWSxRQUFRLEVBQUVHLEdBQUcsQ0FBQztJQUMxRixPQUFPaEIsTUFBTW1CLEdBQUcsQ0FBQ0QsS0FBSztRQUNsQkUsU0FBUztZQUNMQyxlQUFlLENBQUMsT0FBTyxFQUFFSixNQUFNLENBQUM7UUFDcEM7SUFDSjtBQUNKLEVBQUU7QUFRRixPQUFPLE1BQU1LLG9CQUFvQixPQUFPQyxlQUF3QkMsWUFBbUU7SUFDL0gsTUFBTVAsUUFBUSxNQUFNWjtJQUNwQixNQUFNYSxNQUFNLENBQUMsaURBQWlELEVBQUVMLFlBQVksT0FBTyxDQUFDO0lBQ3BGLE9BQU9iLE1BQU1tQixHQUFHLENBQUNELEtBQUs7UUFDbEJPLFFBQVE7WUFDSkMsY0FBYyxJQUFJO1lBQ2xCQyxXQUFXSjtZQUNYQztRQUNKO1FBQ0FKLFNBQVM7WUFDTEMsZUFBZSxDQUFDLE9BQU8sRUFBRUosTUFBTSxDQUFDO1FBQ3BDO0lB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