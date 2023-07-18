import { expr } from "@mikro-orm/core";
import { isBefore, isValid, parseISO, startOfDay } from "date-fns";
import * as express from "express";
import orm from "../database.js";
import { Calendar } from "../models/Calendar.js";
function getEventsBefore(before, limit) {
    return orm.em.find(Calendar, {
        [expr('date_time::date')]: {
            $lt: before
        }
    }, {
        limit,
        populate: [
            'collaborators',
            'pieces'
        ],
        orderBy: [
            {
                dateTime: 'DESC'
            }
        ]
    });
}
// Includes the date specified (greater than)
function getEventsAfter(after, limit) {
    return orm.em.find(Calendar, {
        [expr('date_time::date')]: {
            $gte: after
        }
    }, {
        limit,
        populate: [
            'collaborators',
            'pieces'
        ],
        orderBy: [
            {
                dateTime: 'DESC'
            }
        ]
    });
}
// The interval is open right side.
function getEventsBetween(start, end, order) {
    return orm.em.find(Calendar, {
        $and: [
            {
                [expr('date_time::date')]: {
                    $gte: start
                }
            },
            {
                [expr('date_time::date')]: {
                    $lt: end
                }
            }
        ]
    }, {
        populate: [
            'collaborators',
            'pieces'
        ],
        orderBy: [
            {
                dateTime: order
            }
        ]
    });
}
function getEventAt(at) {
    orm.em.findOne(Calendar, {
        [expr('date_time::date')]: at
    }, {
        populate: [
            'collaborators',
            'pieces'
        ]
    });
}
// const AFTER = 2;
// const FUTURE = 1;
// const ALL = 0;
// const PAST = -1;
// const BEFORE = -2;
const calendarRouter = express.Router({
    mergeParams: true
});
// Hey, think about implementing before:[date] or after:[date], or even [month year] search.
calendarRouter.get('/search', async (req, res)=>{
    const str = req.query.q;
    if (str === undefined || str === '') {
        res.json([]);
        return;
    }
    console.log(str);
    const tokens = str.replaceAll(', ', '|').replaceAll(/ +/g, '&');
    const splitTokens = tokens.split('|').map((t)=>t.split('&'));
    console.log(tokens);
    console.log(splitTokens);
    const calendarResults = await orm.em.find(Calendar, {
        calendarSearchMatview: {
            Search: {
                $fulltext: tokens
            }
        }
    }, {
        populate: [
            'collaborators',
            'pieces'
        ],
        orderBy: [
            {
                dateTime: 'DESC'
            }
        ]
    });
    res.json(calendarResults);
});
calendarRouter.get('/', async (req, res)=>{
    const limit = !!req.query.limit && parseInt(req.query.limit) || undefined;
    const date = !!req.query.date && parseISO(req.query.date);
    const before = !!req.query.before && parseISO(req.query.before);
    const after = !!req.query.after && parseISO(req.query.after);
    const at = !!req.query.at && parseISO(req.query.at);
    // let type;
    const now = startOfDay(new Date());
    let response;
    let betweenEvents;
    let futureEvents;
    let pastEvents;
    console.log(req.query);
    if (at && isValid(at)) {
        response = [
            await getEventAt(at)
        ];
    } else if (!date || !isValid(date)) {
        if (before && isValid(before)) {
            // type = BEFORE;
            response = await getEventsBefore(before, limit);
        } else if (after && isValid(after)) {
            // type = AFTER;
            response = await getEventsAfter(after, limit);
        } else {
            // type = ALL;
            response = await orm.em.find(Calendar, {}, {
                populate: [
                    'collaborators',
                    'pieces'
                ],
                orderBy: [
                    {
                        dateTime: 'ASC'
                    }
                ]
            });
        }
    } else if (isBefore(now, date)) {
        // type = FUTURE;
        [betweenEvents, futureEvents] = await Promise.all([
            getEventsBetween(now, date, 'ASC'),
            getEventsAfter(date, 25)
        ]);
        response = [
            ...betweenEvents,
            ...futureEvents
        ];
    } else {
        // type = PAST;
        [betweenEvents, pastEvents] = await Promise.all([
            getEventsBetween(date, now, 'DESC'),
            getEventsBefore(date, 25)
        ]);
        response = [
            ...betweenEvents.reverse(),
            ...pastEvents
        ];
    }
    res.json(response);
});
export default calendarRouter;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGlzL2NhbGVuZGFyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV4cHIgfSBmcm9tICdAbWlrcm8tb3JtL2NvcmUnO1xyXG5pbXBvcnQgeyBpc0JlZm9yZSwgaXNWYWxpZCwgcGFyc2VJU08sIHN0YXJ0T2ZEYXkgfSBmcm9tICdkYXRlLWZucyc7XHJcbmltcG9ydCAqIGFzIGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XHJcblxyXG5pbXBvcnQgb3JtIGZyb20gJy4uL2RhdGFiYXNlLmpzJztcclxuaW1wb3J0IHsgQ2FsZW5kYXIgfSBmcm9tICcuLi9tb2RlbHMvQ2FsZW5kYXIuanMnO1xyXG5cclxuXHJcbmZ1bmN0aW9uIGdldEV2ZW50c0JlZm9yZShiZWZvcmU6IERhdGUsIGxpbWl0PzogbnVtYmVyKSB7XHJcbiAgICByZXR1cm4gb3JtLmVtLmZpbmQoXHJcbiAgICAgICAgQ2FsZW5kYXIsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBbZXhwcignZGF0ZV90aW1lOjpkYXRlJyldOiB7ICRsdDogYmVmb3JlIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGltaXQsXHJcbiAgICAgICAgICAgIHBvcHVsYXRlOiBbJ2NvbGxhYm9yYXRvcnMnLCAncGllY2VzJ10sXHJcbiAgICAgICAgICAgIG9yZGVyQnk6IFtcclxuICAgICAgICAgICAgICAgIHsgZGF0ZVRpbWU6ICdERVNDJyB9XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgfVxyXG4gICAgKTtcclxufVxyXG5cclxuLy8gSW5jbHVkZXMgdGhlIGRhdGUgc3BlY2lmaWVkIChncmVhdGVyIHRoYW4pXHJcbmZ1bmN0aW9uIGdldEV2ZW50c0FmdGVyKGFmdGVyOiBEYXRlLCBsaW1pdD86IG51bWJlcikge1xyXG4gICAgcmV0dXJuIG9ybS5lbS5maW5kKFxyXG4gICAgICAgIENhbGVuZGFyLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgW2V4cHIoJ2RhdGVfdGltZTo6ZGF0ZScpXTogeyAkZ3RlOiBhZnRlciB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxpbWl0LFxyXG4gICAgICAgICAgICBwb3B1bGF0ZTogWydjb2xsYWJvcmF0b3JzJywgJ3BpZWNlcyddLFxyXG4gICAgICAgICAgICBvcmRlckJ5OiBbXHJcbiAgICAgICAgICAgICAgICB7IGRhdGVUaW1lOiAnREVTQycgfVxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgIH1cclxuICAgICk7XHJcbn1cclxuXHJcbi8vIFRoZSBpbnRlcnZhbCBpcyBvcGVuIHJpZ2h0IHNpZGUuXHJcbmZ1bmN0aW9uIGdldEV2ZW50c0JldHdlZW4oc3RhcnQ6IERhdGUsIGVuZDogRGF0ZSwgb3JkZXI6ICdBU0MnIHwgJ0RFU0MnKSB7XHJcbiAgICByZXR1cm4gb3JtLmVtLmZpbmQoXHJcbiAgICAgICAgQ2FsZW5kYXIsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAkYW5kOiBbXHJcbiAgICAgICAgICAgICAgICB7IFtleHByKCdkYXRlX3RpbWU6OmRhdGUnKV06IHsgJGd0ZTogc3RhcnQgfSB9LFxyXG4gICAgICAgICAgICAgICAgeyBbZXhwcignZGF0ZV90aW1lOjpkYXRlJyldOiB7ICRsdDogZW5kIH0gfSxcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcG9wdWxhdGU6IFsnY29sbGFib3JhdG9ycycsICdwaWVjZXMnXSxcclxuICAgICAgICAgICAgb3JkZXJCeTogW1xyXG4gICAgICAgICAgICAgICAgeyBkYXRlVGltZTogb3JkZXIgfVxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgIH1cclxuICAgICk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEV2ZW50QXQoYXQ6IERhdGUpIHtcclxuICAgIG9ybS5lbS5maW5kT25lKFxyXG4gICAgICAgIENhbGVuZGFyLFxyXG4gICAgICAgIHsgW2V4cHIoJ2RhdGVfdGltZTo6ZGF0ZScpXTogYXQgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHBvcHVsYXRlOiBbJ2NvbGxhYm9yYXRvcnMnLCAncGllY2VzJ11cclxuICAgICAgICB9LFxyXG4gICAgKTtcclxufVxyXG5cclxuLy8gY29uc3QgQUZURVIgPSAyO1xyXG4vLyBjb25zdCBGVVRVUkUgPSAxO1xyXG4vLyBjb25zdCBBTEwgPSAwO1xyXG4vLyBjb25zdCBQQVNUID0gLTE7XHJcbi8vIGNvbnN0IEJFRk9SRSA9IC0yO1xyXG5cclxuY29uc3QgY2FsZW5kYXJSb3V0ZXIgPSBleHByZXNzLlJvdXRlcih7IG1lcmdlUGFyYW1zOiB0cnVlIH0pO1xyXG5cclxuaW50ZXJmYWNlIENhbGVuZGFyUXVlcnkge1xyXG4gICAgcT86IHN0cmluZztcclxuICAgIGJlZm9yZT86IHN0cmluZztcclxuICAgIGFmdGVyPzogc3RyaW5nO1xyXG4gICAgZGF0ZT86IHN0cmluZztcclxuICAgIGxpbWl0Pzogc3RyaW5nO1xyXG4gICAgYXQ/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8vIEhleSwgdGhpbmsgYWJvdXQgaW1wbGVtZW50aW5nIGJlZm9yZTpbZGF0ZV0gb3IgYWZ0ZXI6W2RhdGVdLCBvciBldmVuIFttb250aCB5ZWFyXSBzZWFyY2guXHJcblxyXG5jYWxlbmRhclJvdXRlci5nZXQoJy9zZWFyY2gnLCBhc3luYyAocmVxOiBleHByZXNzLlJlcXVlc3Q8YW55LCBhbnksIGFueSwgQ2FsZW5kYXJRdWVyeT4sIHJlcykgPT4ge1xyXG4gICAgY29uc3Qgc3RyID0gcmVxLnF1ZXJ5LnE7XHJcbiAgICBpZiAoc3RyID09PSB1bmRlZmluZWQgfHwgc3RyID09PSAnJykge1xyXG4gICAgICAgIHJlcy5qc29uKFtdKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2coc3RyKTtcclxuICAgIGNvbnN0IHRva2VucyA9IHN0ci5yZXBsYWNlQWxsKCcsICcsICd8JykucmVwbGFjZUFsbCgvICsvZywgJyYnKTtcclxuICAgIGNvbnN0IHNwbGl0VG9rZW5zID0gdG9rZW5zLnNwbGl0KCd8JykubWFwKHQgPT4gdC5zcGxpdCgnJicpKTtcclxuICAgIGNvbnNvbGUubG9nKHRva2Vucyk7XHJcbiAgICBjb25zb2xlLmxvZyhzcGxpdFRva2Vucyk7XHJcblxyXG5cclxuICAgIGNvbnN0IGNhbGVuZGFyUmVzdWx0cyA9IGF3YWl0IG9ybS5lbS5maW5kKFxyXG4gICAgICAgIENhbGVuZGFyLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2FsZW5kYXJTZWFyY2hNYXR2aWV3OiB7XHJcbiAgICAgICAgICAgICAgICBTZWFyY2g6IHtcclxuICAgICAgICAgICAgICAgICAgICAkZnVsbHRleHQ6IHRva2Vuc1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcG9wdWxhdGU6IFsnY29sbGFib3JhdG9ycycsICdwaWVjZXMnXSxcclxuICAgICAgICAgICAgb3JkZXJCeTogW1xyXG4gICAgICAgICAgICAgICAgeyBkYXRlVGltZTogJ0RFU0MnIH1cclxuICAgICAgICAgICAgXSxcclxuICAgICAgICB9XHJcblxyXG4gICAgKVxyXG5cclxuICAgIHJlcy5qc29uKGNhbGVuZGFyUmVzdWx0cyk7XHJcbn0pO1xyXG5cclxuY2FsZW5kYXJSb3V0ZXIuZ2V0KCcvJywgYXN5bmMgKHJlcTogZXhwcmVzcy5SZXF1ZXN0PGFueSwgYW55LCBhbnksIENhbGVuZGFyUXVlcnk+LCByZXMpID0+IHtcclxuICAgIGNvbnN0IGxpbWl0ID0gISFyZXEucXVlcnkubGltaXQgJiYgcGFyc2VJbnQocmVxLnF1ZXJ5LmxpbWl0KSB8fCB1bmRlZmluZWQ7XHJcbiAgICBjb25zdCBkYXRlID0gISFyZXEucXVlcnkuZGF0ZSAmJiBwYXJzZUlTTyhyZXEucXVlcnkuZGF0ZSk7XHJcbiAgICBjb25zdCBiZWZvcmUgPSAhIXJlcS5xdWVyeS5iZWZvcmUgJiYgcGFyc2VJU08ocmVxLnF1ZXJ5LmJlZm9yZSk7XHJcbiAgICBjb25zdCBhZnRlciA9ICEhcmVxLnF1ZXJ5LmFmdGVyICYmIHBhcnNlSVNPKHJlcS5xdWVyeS5hZnRlcik7XHJcbiAgICBjb25zdCBhdCA9ICEhcmVxLnF1ZXJ5LmF0ICYmIHBhcnNlSVNPKHJlcS5xdWVyeS5hdCk7XHJcblxyXG4gICAgLy8gbGV0IHR5cGU7XHJcbiAgICBjb25zdCBub3cgPSBzdGFydE9mRGF5KG5ldyBEYXRlKCkpO1xyXG5cclxuICAgIGxldCByZXNwb25zZTtcclxuICAgIGxldCBiZXR3ZWVuRXZlbnRzO1xyXG4gICAgbGV0IGZ1dHVyZUV2ZW50cztcclxuICAgIGxldCBwYXN0RXZlbnRzO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKHJlcS5xdWVyeSk7XHJcbiAgICBpZiAoYXQgJiYgaXNWYWxpZChhdCkpIHtcclxuICAgICAgICByZXNwb25zZSA9IFthd2FpdCBnZXRFdmVudEF0KGF0KV07XHJcbiAgICB9IGVsc2UgaWYgKCFkYXRlIHx8ICFpc1ZhbGlkKGRhdGUpKSB7XHJcbiAgICAgICAgaWYgKGJlZm9yZSAmJiBpc1ZhbGlkKGJlZm9yZSkpIHtcclxuICAgICAgICAgICAgLy8gdHlwZSA9IEJFRk9SRTtcclxuICAgICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBnZXRFdmVudHNCZWZvcmUoYmVmb3JlLCBsaW1pdCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhZnRlciAmJiBpc1ZhbGlkKGFmdGVyKSkge1xyXG4gICAgICAgICAgICAvLyB0eXBlID0gQUZURVI7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlID0gYXdhaXQgZ2V0RXZlbnRzQWZ0ZXIoYWZ0ZXIsIGxpbWl0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyB0eXBlID0gQUxMO1xyXG4gICAgICAgICAgICByZXNwb25zZSA9IGF3YWl0IG9ybS5lbS5maW5kKFxyXG4gICAgICAgICAgICAgICAgQ2FsZW5kYXIsXHJcbiAgICAgICAgICAgICAgICB7fSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBwb3B1bGF0ZTogWydjb2xsYWJvcmF0b3JzJywgJ3BpZWNlcyddLFxyXG4gICAgICAgICAgICAgICAgICAgIG9yZGVyQnk6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeyBkYXRlVGltZTogJ0FTQycgfVxyXG4gICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKGlzQmVmb3JlKG5vdywgZGF0ZSkpIHtcclxuICAgICAgICAvLyB0eXBlID0gRlVUVVJFO1xyXG4gICAgICAgIFtiZXR3ZWVuRXZlbnRzLCBmdXR1cmVFdmVudHNdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgICBnZXRFdmVudHNCZXR3ZWVuKG5vdywgZGF0ZSwgJ0FTQycpLFxyXG4gICAgICAgICAgICBnZXRFdmVudHNBZnRlcihkYXRlLCAyNSksXHJcbiAgICAgICAgXSk7XHJcbiAgICAgICAgcmVzcG9uc2UgPSBbLi4uYmV0d2VlbkV2ZW50cywgLi4uZnV0dXJlRXZlbnRzXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gdHlwZSA9IFBBU1Q7XHJcbiAgICAgICAgW2JldHdlZW5FdmVudHMsIHBhc3RFdmVudHNdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgICBnZXRFdmVudHNCZXR3ZWVuKGRhdGUsIG5vdywgJ0RFU0MnKSxcclxuICAgICAgICAgICAgZ2V0RXZlbnRzQmVmb3JlKGRhdGUsIDI1KSxcclxuICAgICAgICBdKTtcclxuICAgICAgICByZXNwb25zZSA9IFsuLi5iZXR3ZWVuRXZlbnRzLnJldmVyc2UoKSwgLi4ucGFzdEV2ZW50c107XHJcbiAgICB9XHJcblxyXG4gICAgcmVzLmpzb24ocmVzcG9uc2UpO1xyXG59KTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNhbGVuZGFyUm91dGVyO1xyXG4iXSwibmFtZXMiOlsiZXhwciIsImlzQmVmb3JlIiwiaXNWYWxpZCIsInBhcnNlSVNPIiwic3RhcnRPZkRheSIsImV4cHJlc3MiLCJvcm0iLCJDYWxlbmRhciIsImdldEV2ZW50c0JlZm9yZSIsImJlZm9yZSIsImxpbWl0IiwiZW0iLCJmaW5kIiwiJGx0IiwicG9wdWxhdGUiLCJvcmRlckJ5IiwiZGF0ZVRpbWUiLCJnZXRFdmVudHNBZnRlciIsImFmdGVyIiwiJGd0ZSIsImdldEV2ZW50c0JldHdlZW4iLCJzdGFydCIsImVuZCIsIm9yZGVyIiwiJGFuZCIsImdldEV2ZW50QXQiLCJhdCIsImZpbmRPbmUiLCJjYWxlbmRhclJvdXRlciIsIlJvdXRlciIsIm1lcmdlUGFyYW1zIiwiZ2V0IiwicmVxIiwicmVzIiwic3RyIiwicXVlcnkiLCJxIiwidW5kZWZpbmVkIiwianNvbiIsImNvbnNvbGUiLCJsb2ciLCJ0b2tlbnMiLCJyZXBsYWNlQWxsIiwic3BsaXRUb2tlbnMiLCJzcGxpdCIsIm1hcCIsInQiLCJjYWxlbmRhclJlc3VsdHMiLCJjYWxlbmRhclNlYXJjaE1hdHZpZXciLCJTZWFyY2giLCIkZnVsbHRleHQiLCJwYXJzZUludCIsImRhdGUiLCJub3ciLCJEYXRlIiwicmVzcG9uc2UiLCJiZXR3ZWVuRXZlbnRzIiwiZnV0dXJlRXZlbnRzIiwicGFzdEV2ZW50cyIsIlByb21pc2UiLCJhbGwiLCJyZXZlcnNlIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxJQUFJLFFBQVEsa0JBQWtCO0FBQ3ZDLFNBQVNDLFFBQVEsRUFBRUMsT0FBTyxFQUFFQyxRQUFRLEVBQUVDLFVBQVUsUUFBUSxXQUFXO0FBQ25FLFlBQVlDLGFBQWEsVUFBVTtBQUVuQyxPQUFPQyxTQUFTLGlCQUFpQjtBQUNqQyxTQUFTQyxRQUFRLFFBQVEsd0JBQXdCO0FBR2pELFNBQVNDLGdCQUFnQkMsTUFBWSxFQUFFQyxLQUFjO0lBQ2pELE9BQU9KLElBQUlLLEVBQUUsQ0FBQ0Ms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