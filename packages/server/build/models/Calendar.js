function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
import { AfterDelete, BeforeCreate, BeforeUpdate, Collection, Entity, Index, ManyToMany, OneToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { isEmpty } from "lodash-es";
import { createCalendarEvent, deleteCalendarEvent, getImageFromMetaTag, getLatLng, getTimeZone, transformModelToGoogle, updateCalendar } from "../gapi/calendar.js";
import { getPhotos } from "../gapi/places.js";
import { CalendarCollaborator } from "./CalendarCollaborator.js";
import { CalendarPiece } from "./CalendarPiece.js";
import { CalendarSearchMatview } from "./CalendarSearchMatview.js";
import { Collaborator } from "./Collaborator.js";
import { Piece } from "./Piece.js";
async function beforeCreateHook(args) {
    console.log('[Hook: BeforeCreate] Start');
    const { dateTime, website, imageUrl, location } = args.entity;
    console.log(`[Hook: BeforeCreate] Fetching coord and tz for location: ${location}`);
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (location) {
        const { latlng } = await getLatLng(location);
        timezone = await getTimeZone(latlng.lat, latlng.lng, dateTime);
    }
    console.log(`[Hook: BeforeCreate] timezone: ${timezone}`);
    console.log(`[Hook: BeforeCreate] Fetching image url from tags`);
    if (!imageUrl && website) {
        const fetchedImageUrl = await getImageFromMetaTag(website);
        args.entity.imageUrl = fetchedImageUrl;
        args.entity.usePlacePhoto = fetchedImageUrl === '';
    }
    console.log(`[Hook: BeforeCreate] Finished image url from tags.`);
    console.log(`[Hook: BeforeCreate] Fetching photos from Places API`);
    if (location) {
        try {
            const otherCal = await args.em.findOne(Calendar, {
                $and: [
                    {
                        location
                    },
                    {
                        photoReference: {
                            $ne: null
                        }
                    }
                ]
            });
            if (!!otherCal) {
                console.log(`[Hook: BeforeCreate] Found existing photo.`);
                args.entity.photoReference = otherCal.photoReference;
                args.entity.placeId = otherCal.placeId;
            } else {
                const { photoReference, placeId } = await getPhotos(location);
                console.log(`[Hook: BeforeCreate]: Parsed photo from API.`);
                args.entity.photoReference = photoReference;
                args.entity.placeId = placeId;
            }
        } catch (e) {
            console.log(`[Hook: BeforeCreate] ${e}`);
            args.entity.photoReference = '';
            args.entity.placeId = '';
        }
    }
    console.log(`[Hook: BeforeCreate] Done with Places API`);
    /* eslint-disable require-atomic-updates */ args.entity.timezone = timezone;
    /* eslint-enable require-atomic-updates */ console.log(`[Hook: BeforeCreate] Creating google calendar event '${args.entity.name}' on ${args.entity.dateTime.toISOString()}`);
    const googleParams = transformModelToGoogle(args.entity);
    const createResponse = await createCalendarEvent(args.em, googleParams);
    const id = createResponse.data.id;
    console.log(`[Hook: BeforeCreate] Received response id: ${id}.`);
    /* eslint-disable require-atomic-updates */ args.entity.id = id;
    /* eslint-enable require-atomic-updates */ console.log(`[Hook: BeforeCreate] End`);
}
async function beforeUpdateHook(args) {
    var _args_changeSet_payload, _args_changeSet, _args_changeSet_payload1, _args_changeSet1, _args_changeSet2;
    console.log('[Hook: BeforeUpdate] Start');
    let timezone = args.entity.timezone;
    const locationChanged = !!((_args_changeSet = args.changeSet) === null || _args_changeSet === void 0 ? void 0 : (_args_changeSet_payload = _args_changeSet.payload) === null || _args_changeSet_payload === void 0 ? void 0 : _args_changeSet_payload.location) || timezone === null;
    const websiteChanged = !!((_args_changeSet1 = args.changeSet) === null || _args_changeSet1 === void 0 ? void 0 : (_args_changeSet_payload1 = _args_changeSet1.payload) === null || _args_changeSet_payload1 === void 0 ? void 0 : _args_changeSet_payload1.website);
    const dateTime = args.entity.dateTime;
    const location = args.entity.location;
    if (locationChanged || timezone === undefined) {
        console.log('[Hook: BeforeUpdate] Location changed or timezone was undefined, fetching timezone');
        const location = args.entity.location;
        const { latlng } = await getLatLng(location);
        timezone = await getTimeZone(latlng.lat, latlng.lng, dateTime);
        console.log(`[Hook: BeforeUpdate] Fetched timezone: ${timezone}`);
    }
    if (timezone !== args.entity.timezone) {
        args.changeSet.payload.timezone = timezone;
    }
    if (locationChanged) {
        console.log(`[Hook: BeforeUpdate] Fetching photos from Places API`);
        try {
            const otherCal = await args.em.findOne(Calendar, {
                $and: [
                    {
                        location
                    },
                    {
                        photoReference: {
                            $ne: null
                        }
                    }
                ]
            });
            if (!!otherCal) {
                console.log(`[Hook: BeforeUpdate] Found existing photo.`);
                args.changeSet.payload.photoReference = otherCal.photoReference;
                args.changeSet.payload.placeId = otherCal.placeId;
            } else {
                const { photoReference, placeId } = await getPhotos(location);
                console.log(`[Hook: BeforeUpdate]: Parsed photo from API.`);
                args.changeSet.payload.photoReference = photoReference;
                args.changeSet.payload.placeId = placeId;
            }
        } catch (e) {
            console.log(`[Hook: BeforeUpdate] ${e}`);
            args.changeSet.payload.photoReference = '';
            args.changeSet.payload.placeId = '';
        }
        console.log(`[Hook: BeforeUpdate] Done with Places API`);
    }
    if (websiteChanged && !args.entity.imageUrl && args.entity.website) {
        console.log(`[Hook: BeforeUpdate] Fetching image url from tags`);
        const fetchedImageUrl = await getImageFromMetaTag(args.entity.website);
        args.changeSet.payload.imageUrl = fetchedImageUrl;
        args.changeSet.payload.usePlacePhoto = fetchedImageUrl === '';
    }
    if (!isEmpty((_args_changeSet2 = args.changeSet) === null || _args_changeSet2 === void 0 ? void 0 : _args_changeSet2.payload)) {
        const data = transformModelToGoogle(args.entity);
        console.log(`[Hook: BeforeUpdate] Updating google calendar event: ${args.entity.id}`);
        await updateCalendar(args.em, data);
    }
    console.log(`[Hook: BeforeUpdate] End\n`);
}
export let Calendar = class Calendar {
    id;
    name;
    dateTime;
    timezone;
    location;
    type;
    website;
    allDay;
    endDate;
    imageUrl;
    photoReference;
    placeId;
    usePlacePhoto = true;
    pieces = new Collection(this);
    collaborators = new Collection(this);
    calendarSearchMatview;
    async beforeCreate(args) {
        beforeCreateHook(args);
    }
    async beforeUpdate(args) {
        beforeUpdateHook(args);
    }
    async AfterDelete(args) {
        console.log(`[Hook: AfterDelete] Start`);
        await deleteCalendarEvent(args.em, args.entity.id);
        console.log(`[Hook: AfterDelete] Deleted calendar id: ${args.entity.id}`);
    }
};
_ts_decorate([
    PrimaryKey({
        columnType: 'text'
    }),
    _ts_metadata("design:type", String)
], Calendar.prototype, "id", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Calendar.prototype, "name", void 0);
_ts_decorate([
    Index({
        name: 'calendar_time'
    }),
    Property({
        length: 6,
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Calendar.prototype, "dateTime", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Calendar.prototype, "timezone", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Calendar.prototype, "location", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Calendar.prototype, "type", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Calendar.prototype, "website", void 0);
_ts_decorate([
    Property({
        default: false
    }),
    _ts_metadata("design:type", Boolean)
], Calendar.prototype, "allDay", void 0);
_ts_decorate([
    Property({
        columnType: 'date',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Calendar.prototype, "endDate", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Calendar.prototype, "imageUrl", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Calendar.prototype, "photoReference", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Calendar.prototype, "placeId", void 0);
_ts_decorate([
    Property({
        nullable: true,
        default: true
    }),
    _ts_metadata("design:type", Boolean)
], Calendar.prototype, "usePlacePhoto", void 0);
_ts_decorate([
    ManyToMany({
        entity: ()=>Piece,
        pivotEntity: ()=>CalendarPiece,
        fixedOrderColumn: 'order'
    })
], Calendar.prototype, "pieces", void 0);
_ts_decorate([
    ManyToMany({
        entity: ()=>Collaborator,
        pivotEntity: ()=>CalendarCollaborator,
        fixedOrderColumn: 'order'
    })
], Calendar.prototype, "collaborators", void 0);
_ts_decorate([
    OneToOne({
        entity: ()=>CalendarSearchMatview,
        joinColumn: 'id'
    }),
    _ts_metadata("design:type", typeof CalendarSearchMatview === "undefined" ? Object : CalendarSearchMatview)
], Calendar.prototype, "calendarSearchMatview", void 0);
_ts_decorate([
    BeforeCreate(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof EventArgs === "undefined" ? Object : EventArgs
    ])
], Calendar.prototype, "beforeCreate", null);
_ts_decorate([
    BeforeUpdate(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof EventArgs === "undefined" ? Object : EventArgs
    ])
], Calendar.prototype, "beforeUpdate", null);
_ts_decorate([
    AfterDelete(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof EventArgs === "undefined" ? Object : EventArgs
    ])
], Calendar.prototype, "AfterDelete", null);
Calendar = _ts_decorate([
    Entity()
], Calendar);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvQ2FsZW5kYXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJEZWxldGUsIEJlZm9yZUNyZWF0ZSwgQmVmb3JlVXBkYXRlLCBDb2xsZWN0aW9uLCBFbnRpdHksIEluZGV4LCBNYW55VG9NYW55LCBPbmVUb09uZSwgUHJpbWFyeUtleSwgUHJvcGVydHkgfSBmcm9tICdAbWlrcm8tb3JtL2NvcmUnO1xuaW1wb3J0IHR5cGUgeyBFdmVudEFyZ3MsIFJlbCB9IGZyb20gJ0BtaWtyby1vcm0vY29yZSc7XG5pbXBvcnQgeyBpc0VtcHR5IH0gZnJvbSAnbG9kYXNoLWVzJztcblxuaW1wb3J0IHsgY3JlYXRlQ2FsZW5kYXJFdmVudCwgZGVsZXRlQ2FsZW5kYXJFdmVudCwgZ2V0SW1hZ2VGcm9tTWV0YVRhZywgZ2V0TGF0TG5nLCBnZXRUaW1lWm9uZSwgdHJhbnNmb3JtTW9kZWxUb0dvb2dsZSwgdXBkYXRlQ2FsZW5kYXIgfSBmcm9tICcuLi9nYXBpL2NhbGVuZGFyLmpzJztcbmltcG9ydCB7IGdldFBob3RvcyB9IGZyb20gJy4uL2dhcGkvcGxhY2VzLmpzJztcbmltcG9ydCB7IENhbGVuZGFyQ29sbGFib3JhdG9yIH0gZnJvbSAnLi9DYWxlbmRhckNvbGxhYm9yYXRvci5qcyc7XG5pbXBvcnQgeyBDYWxlbmRhclBpZWNlIH0gZnJvbSAnLi9DYWxlbmRhclBpZWNlLmpzJztcbmltcG9ydCB7IENhbGVuZGFyU2VhcmNoTWF0dmlldyB9IGZyb20gJy4vQ2FsZW5kYXJTZWFyY2hNYXR2aWV3LmpzJztcbmltcG9ydCB7IENvbGxhYm9yYXRvciB9IGZyb20gJy4vQ29sbGFib3JhdG9yLmpzJztcbmltcG9ydCB7IFBpZWNlIH0gZnJvbSAnLi9QaWVjZS5qcyc7XG5cblxuYXN5bmMgZnVuY3Rpb24gYmVmb3JlQ3JlYXRlSG9vayhhcmdzOiBFdmVudEFyZ3M8Q2FsZW5kYXI+KSB7XG4gICAgY29uc29sZS5sb2coJ1tIb29rOiBCZWZvcmVDcmVhdGVdIFN0YXJ0Jyk7XG4gICAgY29uc3Qge1xuICAgICAgICBkYXRlVGltZSxcbiAgICAgICAgd2Vic2l0ZSxcbiAgICAgICAgaW1hZ2VVcmwsXG4gICAgICAgIGxvY2F0aW9uXG4gICAgfSA9IGFyZ3MuZW50aXR5O1xuXG4gICAgY29uc29sZS5sb2coYFtIb29rOiBCZWZvcmVDcmVhdGVdIEZldGNoaW5nIGNvb3JkIGFuZCB0eiBmb3IgbG9jYXRpb246ICR7bG9jYXRpb259YCk7XG4gICAgbGV0IHRpbWV6b25lID0gSW50bC5EYXRlVGltZUZvcm1hdCgpLnJlc29sdmVkT3B0aW9ucygpLnRpbWVab25lO1xuICAgIGlmIChsb2NhdGlvbikge1xuICAgICAgICBjb25zdCB7IGxhdGxuZyB9ID0gYXdhaXQgZ2V0TGF0TG5nKGxvY2F0aW9uKTtcbiAgICAgICAgdGltZXpvbmUgPSBhd2FpdCBnZXRUaW1lWm9uZShsYXRsbmcubGF0LCBsYXRsbmcubG5nLCBkYXRlVGltZSk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGBbSG9vazogQmVmb3JlQ3JlYXRlXSB0aW1lem9uZTogJHt0aW1lem9uZX1gKTtcblxuICAgIGNvbnNvbGUubG9nKGBbSG9vazogQmVmb3JlQ3JlYXRlXSBGZXRjaGluZyBpbWFnZSB1cmwgZnJvbSB0YWdzYCk7XG4gICAgaWYgKCFpbWFnZVVybCAmJiB3ZWJzaXRlKSB7XG4gICAgICAgIGNvbnN0IGZldGNoZWRJbWFnZVVybCA9IGF3YWl0IGdldEltYWdlRnJvbU1ldGFUYWcod2Vic2l0ZSlcbiAgICAgICAgYXJncy5lbnRpdHkuaW1hZ2VVcmwgPSBmZXRjaGVkSW1hZ2VVcmw7XG4gICAgICAgIGFyZ3MuZW50aXR5LnVzZVBsYWNlUGhvdG8gPSAoZmV0Y2hlZEltYWdlVXJsID09PSAnJyk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGBbSG9vazogQmVmb3JlQ3JlYXRlXSBGaW5pc2hlZCBpbWFnZSB1cmwgZnJvbSB0YWdzLmApO1xuXG4gICAgY29uc29sZS5sb2coYFtIb29rOiBCZWZvcmVDcmVhdGVdIEZldGNoaW5nIHBob3RvcyBmcm9tIFBsYWNlcyBBUElgKTtcbiAgICBpZiAobG9jYXRpb24pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG90aGVyQ2FsID0gYXdhaXQgYXJncy5lbS5maW5kT25lKFxuICAgICAgICAgICAgICAgIENhbGVuZGFyLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgJGFuZDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgeyBsb2NhdGlvbiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBwaG90b1JlZmVyZW5jZTogeyAkbmU6IG51bGwgfSB9LFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKCEhb3RoZXJDYWwpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW0hvb2s6IEJlZm9yZUNyZWF0ZV0gRm91bmQgZXhpc3RpbmcgcGhvdG8uYCk7XG4gICAgICAgICAgICAgICAgYXJncy5lbnRpdHkucGhvdG9SZWZlcmVuY2UgPSBvdGhlckNhbC5waG90b1JlZmVyZW5jZTtcbiAgICAgICAgICAgICAgICBhcmdzLmVudGl0eS5wbGFjZUlkID0gb3RoZXJDYWwucGxhY2VJZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBwaG90b1JlZmVyZW5jZSwgcGxhY2VJZCB9ID0gYXdhaXQgZ2V0UGhvdG9zKGxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW0hvb2s6IEJlZm9yZUNyZWF0ZV06IFBhcnNlZCBwaG90byBmcm9tIEFQSS5gKTtcbiAgICAgICAgICAgICAgICBhcmdzLmVudGl0eS5waG90b1JlZmVyZW5jZSA9IHBob3RvUmVmZXJlbmNlO1xuICAgICAgICAgICAgICAgIGFyZ3MuZW50aXR5LnBsYWNlSWQgPSBwbGFjZUlkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW0hvb2s6IEJlZm9yZUNyZWF0ZV0gJHtlfWApO1xuICAgICAgICAgICAgYXJncy5lbnRpdHkucGhvdG9SZWZlcmVuY2UgPSAnJztcbiAgICAgICAgICAgIGFyZ3MuZW50aXR5LnBsYWNlSWQgPSAnJztcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zb2xlLmxvZyhgW0hvb2s6IEJlZm9yZUNyZWF0ZV0gRG9uZSB3aXRoIFBsYWNlcyBBUElgKTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIHJlcXVpcmUtYXRvbWljLXVwZGF0ZXMgKi9cbiAgICBhcmdzLmVudGl0eS50aW1lem9uZSA9IHRpbWV6b25lO1xuICAgIC8qIGVzbGludC1lbmFibGUgcmVxdWlyZS1hdG9taWMtdXBkYXRlcyAqL1xuICAgIGNvbnNvbGUubG9nKGBbSG9vazogQmVmb3JlQ3JlYXRlXSBDcmVhdGluZyBnb29nbGUgY2FsZW5kYXIgZXZlbnQgJyR7YXJncy5lbnRpdHkubmFtZX0nIG9uICR7YXJncy5lbnRpdHkuZGF0ZVRpbWUudG9JU09TdHJpbmcoKX1gKTtcbiAgICBjb25zdCBnb29nbGVQYXJhbXMgPSB0cmFuc2Zvcm1Nb2RlbFRvR29vZ2xlKGFyZ3MuZW50aXR5KTtcbiAgICBjb25zdCBjcmVhdGVSZXNwb25zZSA9IGF3YWl0IGNyZWF0ZUNhbGVuZGFyRXZlbnQoYXJncy5lbSwgZ29vZ2xlUGFyYW1zKTtcblxuICAgIGNvbnN0IGlkID0gY3JlYXRlUmVzcG9uc2UuZGF0YS5pZDtcbiAgICBjb25zb2xlLmxvZyhgW0hvb2s6IEJlZm9yZUNyZWF0ZV0gUmVjZWl2ZWQgcmVzcG9uc2UgaWQ6ICR7aWR9LmApO1xuICAgIC8qIGVzbGludC1kaXNhYmxlIHJlcXVpcmUtYXRvbWljLXVwZGF0ZXMgKi9cbiAgICBhcmdzLmVudGl0eS5pZCA9IGlkO1xuICAgIC8qIGVzbGludC1lbmFibGUgcmVxdWlyZS1hdG9taWMtdXBkYXRlcyAqL1xuICAgIGNvbnNvbGUubG9nKGBbSG9vazogQmVmb3JlQ3JlYXRlXSBFbmRgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gYmVmb3JlVXBkYXRlSG9vayhhcmdzOiBFdmVudEFyZ3M8Q2FsZW5kYXI+KSB7XG4gICAgY29uc29sZS5sb2coJ1tIb29rOiBCZWZvcmVVcGRhdGVdIFN0YXJ0Jyk7XG5cbiAgICBsZXQgdGltZXpvbmUgPSBhcmdzLmVudGl0eS50aW1lem9uZTtcblxuICAgIGNvbnN0IGxvY2F0aW9uQ2hhbmdlZCA9ICEhYXJncy5jaGFuZ2VTZXQ/LnBheWxvYWQ/LmxvY2F0aW9uIHx8IHRpbWV6b25lID09PSBudWxsO1xuICAgIGNvbnN0IHdlYnNpdGVDaGFuZ2VkID0gISFhcmdzLmNoYW5nZVNldD8ucGF5bG9hZD8ud2Vic2l0ZTtcbiAgICBjb25zdCBkYXRlVGltZSA9IGFyZ3MuZW50aXR5LmRhdGVUaW1lO1xuICAgIGNvbnN0IGxvY2F0aW9uID0gYXJncy5lbnRpdHkubG9jYXRpb247XG5cbiAgICBpZiAobG9jYXRpb25DaGFuZ2VkIHx8IHRpbWV6b25lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tIb29rOiBCZWZvcmVVcGRhdGVdIExvY2F0aW9uIGNoYW5nZWQgb3IgdGltZXpvbmUgd2FzIHVuZGVmaW5lZCwgZmV0Y2hpbmcgdGltZXpvbmUnKTtcblxuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGFyZ3MuZW50aXR5LmxvY2F0aW9uO1xuICAgICAgICBjb25zdCB7IGxhdGxuZyB9ID0gYXdhaXQgZ2V0TGF0TG5nKGxvY2F0aW9uKTtcbiAgICAgICAgdGltZXpvbmUgPSBhd2FpdCBnZXRUaW1lWm9uZShsYXRsbmcubGF0LCBsYXRsbmcubG5nLCBkYXRlVGltZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbSG9vazogQmVmb3JlVXBkYXRlXSBGZXRjaGVkIHRpbWV6b25lOiAke3RpbWV6b25lfWApO1xuICAgIH1cblxuICAgIGlmICh0aW1lem9uZSAhPT0gYXJncy5lbnRpdHkudGltZXpvbmUpIHtcbiAgICAgICAgYXJncy5jaGFuZ2VTZXQhLnBheWxvYWQudGltZXpvbmUgPSB0aW1lem9uZTtcbiAgICB9XG5cbiAgICBpZiAobG9jYXRpb25DaGFuZ2VkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbSG9vazogQmVmb3JlVXBkYXRlXSBGZXRjaGluZyBwaG90b3MgZnJvbSBQbGFjZXMgQVBJYCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBvdGhlckNhbCA9IGF3YWl0IGFyZ3MuZW0uZmluZE9uZShcbiAgICAgICAgICAgICAgICBDYWxlbmRhcixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICRhbmQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbG9jYXRpb24gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgcGhvdG9SZWZlcmVuY2U6IHsgJG5lOiBudWxsIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmICghIW90aGVyQ2FsKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtIb29rOiBCZWZvcmVVcGRhdGVdIEZvdW5kIGV4aXN0aW5nIHBob3RvLmApO1xuICAgICAgICAgICAgICAgIGFyZ3MuY2hhbmdlU2V0IS5wYXlsb2FkLnBob3RvUmVmZXJlbmNlID0gb3RoZXJDYWwucGhvdG9SZWZlcmVuY2U7XG4gICAgICAgICAgICAgICAgYXJncy5jaGFuZ2VTZXQhLnBheWxvYWQucGxhY2VJZCA9IG90aGVyQ2FsLnBsYWNlSWQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgcGhvdG9SZWZlcmVuY2UsIHBsYWNlSWQgfSA9IGF3YWl0IGdldFBob3Rvcyhsb2NhdGlvbik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtIb29rOiBCZWZvcmVVcGRhdGVdOiBQYXJzZWQgcGhvdG8gZnJvbSBBUEkuYCk7XG4gICAgICAgICAgICAgICAgYXJncy5jaGFuZ2VTZXQhLnBheWxvYWQucGhvdG9SZWZlcmVuY2UgPSBwaG90b1JlZmVyZW5jZTtcbiAgICAgICAgICAgICAgICBhcmdzLmNoYW5nZVNldCEucGF5bG9hZC5wbGFjZUlkID0gcGxhY2VJZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtIb29rOiBCZWZvcmVVcGRhdGVdICR7ZX1gKTtcbiAgICAgICAgICAgIGFyZ3MuY2hhbmdlU2V0IS5wYXlsb2FkLnBob3RvUmVmZXJlbmNlID0gJyc7XG4gICAgICAgICAgICBhcmdzLmNoYW5nZVNldCEucGF5bG9hZC5wbGFjZUlkID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFtIb29rOiBCZWZvcmVVcGRhdGVdIERvbmUgd2l0aCBQbGFjZXMgQVBJYCk7XG4gICAgfVxuXG4gICAgaWYgKHdlYnNpdGVDaGFuZ2VkICYmICFhcmdzLmVudGl0eS5pbWFnZVVybCAmJiBhcmdzLmVudGl0eS53ZWJzaXRlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbSG9vazogQmVmb3JlVXBkYXRlXSBGZXRjaGluZyBpbWFnZSB1cmwgZnJvbSB0YWdzYCk7XG4gICAgICAgIGNvbnN0IGZldGNoZWRJbWFnZVVybCA9IGF3YWl0IGdldEltYWdlRnJvbU1ldGFUYWcoYXJncy5lbnRpdHkud2Vic2l0ZSlcbiAgICAgICAgYXJncy5jaGFuZ2VTZXQhLnBheWxvYWQuaW1hZ2VVcmwgPSBmZXRjaGVkSW1hZ2VVcmw7XG4gICAgICAgIGFyZ3MuY2hhbmdlU2V0IS5wYXlsb2FkLnVzZVBsYWNlUGhvdG8gPSAoZmV0Y2hlZEltYWdlVXJsID09PSAnJyk7XG4gICAgfVxuXG4gICAgaWYgKCFpc0VtcHR5KGFyZ3MuY2hhbmdlU2V0Py5wYXlsb2FkKSkge1xuICAgICAgICBjb25zdCBkYXRhID0gdHJhbnNmb3JtTW9kZWxUb0dvb2dsZShhcmdzLmVudGl0eSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbSG9vazogQmVmb3JlVXBkYXRlXSBVcGRhdGluZyBnb29nbGUgY2FsZW5kYXIgZXZlbnQ6ICR7YXJncy5lbnRpdHkuaWR9YCk7XG4gICAgICAgIGF3YWl0IHVwZGF0ZUNhbGVuZGFyKGFyZ3MuZW0sIGRhdGEpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhgW0hvb2s6IEJlZm9yZVVwZGF0ZV0gRW5kXFxuYCk7XG59XG5cbkBFbnRpdHkoKVxuZXhwb3J0IGNsYXNzIENhbGVuZGFyIHtcblxuICAgIEBQcmltYXJ5S2V5KHsgY29sdW1uVHlwZTogJ3RleHQnIH0pXG4gICAgaWQhOiBzdHJpbmc7XG5cbiAgICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gICAgbmFtZSE6IHN0cmluZztcblxuICAgIEBJbmRleCh7IG5hbWU6ICdjYWxlbmRhcl90aW1lJyB9KVxuICAgIEBQcm9wZXJ0eSh7IGxlbmd0aDogNiwgbnVsbGFibGU6IHRydWUgfSlcbiAgICBkYXRlVGltZSE6IERhdGU7XG5cbiAgICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gICAgdGltZXpvbmUhOiBzdHJpbmc7XG5cbiAgICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gICAgbG9jYXRpb24hOiBzdHJpbmc7XG5cbiAgICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gICAgdHlwZSE6IHN0cmluZztcblxuICAgIEBQcm9wZXJ0eSh7IGNvbHVtblR5cGU6ICd0ZXh0JywgbnVsbGFibGU6IHRydWUgfSlcbiAgICB3ZWJzaXRlPzogc3RyaW5nO1xuXG4gICAgQFByb3BlcnR5KHsgZGVmYXVsdDogZmFsc2UgfSlcbiAgICBhbGxEYXkhOiBib29sZWFuO1xuXG4gICAgQFByb3BlcnR5KHsgY29sdW1uVHlwZTogJ2RhdGUnLCBudWxsYWJsZTogdHJ1ZSB9KVxuICAgIGVuZERhdGU/OiBzdHJpbmc7XG5cbiAgICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gICAgaW1hZ2VVcmw/OiBzdHJpbmc7XG5cbiAgICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gICAgcGhvdG9SZWZlcmVuY2U/OiBzdHJpbmc7XG5cbiAgICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gICAgcGxhY2VJZD86IHN0cmluZztcblxuICAgIEBQcm9wZXJ0eSh7IG51bGxhYmxlOiB0cnVlLCBkZWZhdWx0OiB0cnVlIH0pXG4gICAgdXNlUGxhY2VQaG90bz86IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQE1hbnlUb01hbnkoeyBlbnRpdHk6ICgpID0+IFBpZWNlLCBwaXZvdEVudGl0eTogKCkgPT4gQ2FsZW5kYXJQaWVjZSwgZml4ZWRPcmRlckNvbHVtbjogJ29yZGVyJyB9KVxuICAgIHBpZWNlcyA9IG5ldyBDb2xsZWN0aW9uPFBpZWNlPih0aGlzKTtcblxuICAgIEBNYW55VG9NYW55KHsgZW50aXR5OiAoKSA9PiBDb2xsYWJvcmF0b3IsIHBpdm90RW50aXR5OiAoKSA9PiBDYWxlbmRhckNvbGxhYm9yYXRvciwgZml4ZWRPcmRlckNvbHVtbjogJ29yZGVyJyB9KVxuICAgIGNvbGxhYm9yYXRvcnMgPSBuZXcgQ29sbGVjdGlvbjxDb2xsYWJvcmF0b3I+KHRoaXMpO1xuXG4gICAgQE9uZVRvT25lKHsgZW50aXR5OiAoKSA9PiBDYWxlbmRhclNlYXJjaE1hdHZpZXcsIGpvaW5Db2x1bW46ICdpZCcgfSlcbiAgICBjYWxlbmRhclNlYXJjaE1hdHZpZXchOiBDYWxlbmRhclNlYXJjaE1hdHZpZXc7XG5cbiAgICBAQmVmb3JlQ3JlYXRlKClcbiAgICBhc3luYyBiZWZvcmVDcmVhdGUoYXJnczogRXZlbnRBcmdzPENhbGVuZGFyPikge1xuICAgICAgICBiZWZvcmVDcmVhdGVIb29rKGFyZ3MpO1xuICAgIH1cblxuICAgIEBCZWZvcmVVcGRhdGUoKVxuICAgIGFzeW5jIGJlZm9yZVVwZGF0ZShhcmdzOiBFdmVudEFyZ3M8Q2FsZW5kYXI+KSB7XG4gICAgICAgIGJlZm9yZVVwZGF0ZUhvb2soYXJncyk7XG4gICAgfVxuXG4gICAgQEFmdGVyRGVsZXRlKClcbiAgICBhc3luYyBBZnRlckRlbGV0ZShhcmdzOiBFdmVudEFyZ3M8Q2FsZW5kYXI+KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbSG9vazogQWZ0ZXJEZWxldGVdIFN0YXJ0YCk7XG4gICAgICAgIGF3YWl0IGRlbGV0ZUNhbGVuZGFyRXZlbnQoYXJncy5lbSwgYXJncy5lbnRpdHkuaWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW0hvb2s6IEFmdGVyRGVsZXRlXSBEZWxldGVkIGNhbGVuZGFyIGlkOiAke2FyZ3MuZW50aXR5LmlkfWApO1xuICAgIH1cbn1cblxuIl0sIm5hbWVzIjpbIkFmdGVyRGVsZXRlIiwiQmVmb3JlQ3JlYXRlIiwiQmVmb3JlVXBkYXRlIiwiQ29sbGVjdGlvbiIsIkVudGl0eSIsIkluZGV4IiwiTWFueVRvTWFueSIsIk9uZVRvT25lIiwiUHJpbWFyeUtleSIsIlByb3BlcnR5IiwiaXNFbXB0eSIsImNyZWF0ZUNhbGVuZGFyRXZlbnQiLCJkZWxldGVDYWxlbmRhckV2ZW50IiwiZ2V0SW1hZ2VGcm9tTWV0YVRhZyIsImdldExhdExuZyIsImdldFRpbWVab25lIiwidHJhbnNmb3JtTW9kZWxUb0dvb2dsZSIsInVwZGF0ZUNhbGVuZGFyIiwiZ2V0UGhvdG9zIiwiQ2FsZW5kYXJDb2xsYWJvcmF0b3IiLCJDYWxlbmRhclBpZWNlIiwiQ2FsZW5kYXJTZWFyY2hNYXR2aWV3IiwiQ29sbGFib3JhdG9yIiwiUGllY2UiLCJiZWZvcmVDcmVhdGVIb29rIiwiYXJncyIsImNvbnNvbGUiLCJsb2ciLCJkYXRlVGltZSIsIndlYnNpdGUiLCJpbWFnZVVybCIsImxvY2F0aW9uIiwiZW50aXR5IiwidGltZXpvbmUiLCJJbnRsIiwiRGF0ZVRpbWVGb3JtYXQiLCJyZXNvbHZlZE9wdGlvbnMiLCJ0aW1lWm9uZSIsImxhdGxuZyIsImxhdCIsImxuZyIsImZldGNoZWRJbWFnZVVybCIsInVzZVBsYWNlUGhvdG8iLCJvdGhlckNhbCIsImVtIiwiZmluZE9uZSIsIkNhbGVuZGFyIiwiJGFuZCIsInBob3RvUmVmZXJlbmNlIiwiJG5lIiwicGxhY2VJZCIsImUiLCJuYW1lIiwidG9JU09TdHJpbmciLCJnb29nbGVQYXJhbXMiLCJjcmVhdGVSZXNwb25zZSIsImlkIiwiZGF0YSIsImJlZm9yZVVwZGF0ZUhvb2siLCJsb2NhdGlvbkNoYW5nZWQiLCJjaGFuZ2VTZXQiLCJwYXlsb2FkIiwid2Vic2l0ZUNoYW5nZWQiLCJ1bmRlZmluZWQiLCJ0eXBlIiwiYWxsRGF5IiwiZW5kRGF0ZSIsInBpZWNlcyIsImNvbGxhYm9yYXRvcnMiLCJjYWxlbmRhclNlYXJjaE1hdHZpZXciLCJiZWZvcmVDcmVhdGUiLCJiZWZvcmVVcGRhdGUiLCJjb2x1bW5UeXBlIiwibnVsbGFibGUiLCJsZW5ndGgiLCJkZWZhdWx0IiwicGl2b3RFbnRpdHkiLCJmaXhlZE9yZGVyQ29sdW1uIiwiam9pbkNvbHVtbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsU0FBU0EsV0FBVyxFQUFFQyxZQUFZLEVBQUVDLFlBQVksRUFBRUMsVUFBVSxFQUFFQyxNQUFNLEVBQUVDLEtBQUssRUFBRUMsVUFBVSxFQUFFQyxRQUFRLEVBQUVDLFVBQVUsRUFBRUMsUUFBUSxRQUFRLGtCQUFrQjtBQUVqSixTQUFTQyxPQUFPLFFBQVEsWUFBWTtBQUVwQyxTQUFTQyxtQkFBbUIsRUFBRUMsbUJBQW1CLEVBQUVDLG1CQUFtQixFQUFFQyxTQUFTLEVBQUVDLFdBQVcsRUFBRUMsc0JBQXNCLEVBQUVDLGNBQWMsUUFBUSxzQkFBc0I7QUFDcEssU0FBU0Ms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