function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
import { AfterCreate, AfterDelete, AfterUpdate, Entity, ManyToOne, Property } from "@mikro-orm/core";
import { transformModelToGoogle, updateCalendar } from "../gapi/calendar.js";
import { Calendar } from "./Calendar.js";
import { Piece } from "./Piece.js";
const hook = async (args)=>{
    const cal = args.entity.calendar;
    const data = await transformModelToGoogle(cal);
    await updateCalendar(args.em, data);
};
export let CalendarPiece = class CalendarPiece {
    id;
    calendar;
    piece;
    order;
    async afterCreate(args) {
        await hook(args);
    }
    async afterUpdate(args) {
        await hook(args);
    }
    async afterDelete(args) {
        await hook(args);
    }
};
_ts_decorate([
    Property({
        columnType: 'uuid',
        defaultRaw: `gen_random_uuid()`
    }),
    _ts_metadata("design:type", String)
], CalendarPiece.prototype, "id", void 0);
_ts_decorate([
    ManyToOne({
        entity: ()=>Calendar,
        onDelete: 'cascade',
        primary: true,
        index: 'calendar_piece_calendar_idx'
    }),
    _ts_metadata("design:type", typeof Rel === "undefined" ? Object : Rel)
], CalendarPiece.prototype, "calendar", void 0);
_ts_decorate([
    ManyToOne({
        entity: ()=>Piece,
        onDelete: 'cascade',
        primary: true,
        index: 'calendar_piece_piece_idx'
    }),
    _ts_metadata("design:type", typeof Rel === "undefined" ? Object : Rel)
], CalendarPiece.prototype, "piece", void 0);
_ts_decorate([
    Property({
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], CalendarPiece.prototype, "order", void 0);
_ts_decorate([
    AfterCreate(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof EventArgs === "undefined" ? Object : EventArgs
    ])
], CalendarPiece.prototype, "afterCreate", null);
_ts_decorate([
    AfterUpdate(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof EventArgs === "undefined" ? Object : EventArgs
    ])
], CalendarPiece.prototype, "afterUpdate", null);
_ts_decorate([
    AfterDelete(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof EventArgs === "undefined" ? Object : EventArgs
    ])
], CalendarPiece.prototype, "afterDelete", null);
CalendarPiece = _ts_decorate([
    Entity()
], CalendarPiece);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvQ2FsZW5kYXJQaWVjZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEV2ZW50QXJncywgUmVsIH0gZnJvbSAnQG1pa3JvLW9ybS9jb3JlJztcbmltcG9ydCB7IEFmdGVyQ3JlYXRlLCBBZnRlckRlbGV0ZSwgQWZ0ZXJVcGRhdGUsIEVudGl0eSwgTWFueVRvT25lLCBQcm9wZXJ0eSB9IGZyb20gJ0BtaWtyby1vcm0vY29yZSc7XG5pbXBvcnQgeyB0cmFuc2Zvcm1Nb2RlbFRvR29vZ2xlLCB1cGRhdGVDYWxlbmRhciB9IGZyb20gJy4uL2dhcGkvY2FsZW5kYXIuanMnO1xuaW1wb3J0IHsgQ2FsZW5kYXIgfSBmcm9tICcuL0NhbGVuZGFyLmpzJztcbmltcG9ydCB7IFBpZWNlIH0gZnJvbSAnLi9QaWVjZS5qcyc7XG5cbmNvbnN0IGhvb2sgPSBhc3luYyAoYXJnczogRXZlbnRBcmdzPENhbGVuZGFyUGllY2U+KSA9PiB7XG4gICAgY29uc3QgY2FsID0gYXJncy5lbnRpdHkuY2FsZW5kYXI7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRyYW5zZm9ybU1vZGVsVG9Hb29nbGUoY2FsKTtcbiAgICBhd2FpdCB1cGRhdGVDYWxlbmRhcihhcmdzLmVtLCBkYXRhKTtcbn07XG5cbkBFbnRpdHkoKVxuZXhwb3J0IGNsYXNzIENhbGVuZGFyUGllY2Uge1xuXG4gICAgQFByb3BlcnR5KHsgY29sdW1uVHlwZTogJ3V1aWQnLCBkZWZhdWx0UmF3OiBgZ2VuX3JhbmRvbV91dWlkKClgIH0pXG4gICAgaWQhOiBzdHJpbmc7XG5cbiAgICBATWFueVRvT25lKHsgZW50aXR5OiAoKSA9PiBDYWxlbmRhciwgb25EZWxldGU6ICdjYXNjYWRlJywgcHJpbWFyeTogdHJ1ZSwgaW5kZXg6ICdjYWxlbmRhcl9waWVjZV9jYWxlbmRhcl9pZHgnIH0pXG4gICAgY2FsZW5kYXIhOiBSZWw8Q2FsZW5kYXI+O1xuXG4gICAgQE1hbnlUb09uZSh7IGVudGl0eTogKCkgPT4gUGllY2UsIG9uRGVsZXRlOiAnY2FzY2FkZScsIHByaW1hcnk6IHRydWUsIGluZGV4OiAnY2FsZW5kYXJfcGllY2VfcGllY2VfaWR4JyB9KVxuICAgIHBpZWNlITogUmVsPFBpZWNlPjtcblxuICAgIEBQcm9wZXJ0eSh7IG51bGxhYmxlOiB0cnVlIH0pXG4gICAgb3JkZXI/OiBudW1iZXI7XG5cbiAgICBAQWZ0ZXJDcmVhdGUoKVxuICAgIGFzeW5jIGFmdGVyQ3JlYXRlKGFyZ3M6IEV2ZW50QXJnczxDYWxlbmRhclBpZWNlPikge1xuICAgICAgICBhd2FpdCBob29rKGFyZ3MpO1xuICAgIH1cblxuICAgIEBBZnRlclVwZGF0ZSgpXG4gICAgYXN5bmMgYWZ0ZXJVcGRhdGUoYXJnczogRXZlbnRBcmdzPENhbGVuZGFyUGllY2U+KSB7XG4gICAgICAgIGF3YWl0IGhvb2soYXJncyk7XG4gICAgfVxuXG4gICAgQEFmdGVyRGVsZXRlKClcbiAgICBhc3luYyBhZnRlckRlbGV0ZShhcmdzOiBFdmVudEFyZ3M8Q2FsZW5kYXJQaWVjZT4pIHtcbiAgICAgICAgYXdhaXQgaG9vayhhcmdzKTtcbiAgICB9XG59XG4iXSwibmFtZXMiOlsiQWZ0ZXJDcmVhdGUiLCJBZnRlckRlbGV0ZSIsIkFmdGVyVXBkYXRlIiwiRW50aXR5IiwiTWFueVRvT25lIiwiUHJvcGVydHkiLCJ0cmFuc2Zvcm1Nb2RlbFRvR29vZ2xlIiwidXBkYXRlQ2FsZW5kYXIiLCJDYWxlbmRhciIsIlBpZWNlIiwiaG9vayIsImFyZ3MiLCJjYWwiLCJlbnRpdHkiLCJjYWxlbmRhciIsImRhdGEiLCJlbSIsIkNhbGVuZGFyUGllY2UiLCJpZCIsInBpZWNlIiwib3JkZXIiLCJhZnRlckNyZWF0ZSIsImFmdGVyVXBkYXRlIiwiYWZ0ZXJEZWxldGUiLCJjb2x1bW5UeXBlIiwiZGVmYXVsdFJhdyIsIm9uRGVsZXRlIiwicHJpbWFyeSIsImluZGV4IiwibnVsbGFibGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUNBLFNBQVNBLFdBQVcsRUFBRUMsV0FBVyxFQUFFQyxXQUFXLEVBQUVDLE1BQU0sRUFBRUMsU0FBUyxFQUFFQyxRQUFRLFFBQVEsa0JBQWtCO0FBQ3JHLFNBQVNDLHNCQUFzQixFQUFFQyxjQUFjLFFBQVEsc0JBQXNCO0FBQzdFLFNBQVNDLFFBQVEsUUFBUSxnQkFBZ0I7QUFDekMsU0FBU0MsS0FBSyxRQUFRLGFBQWE7QUFFbkMsTUFBTUMsT0FBTyxPQUFPQztJQUNoQixNQUFNQyxNQUFNRCxLQUFLRSxNQUFNLENBQUNDLFFBQVE7SUFDaEMsTUFBTUMsT0FBTyxNQUFNVCx1QkFBdUJNO0lBQzFDLE1BQU1MLGVBQWVJLEtBQUtLLEVBQUUsRUFBRUQ7QUFDbEM7QUFHQSxXQUFhRSxnQkFBTjtJQUdIQyxHQUFZO0lBR1pKLFNBQXlCO0lBR3pCSyxNQUFtQjtJQUduQkMsTUFBZTtJQUVmLE1BQ01DLFlBQVlWLElBQThCLEVBQUU7UUFDOUMsTUFBTUQsS0FBS0M7SUFDZjtJQUVBLE1BQ01XLFlBQVlYLElBQThCLEVBQUU7UUFDOUMsTUFBTUQsS0FBS0M7SUFDZjtJQUVBLE1BQ01ZLFlBQVlaLElBQThCLEVBQUU7UUFDOUMsTUFBTUQsS0FBS0M7SUFDZjtBQUNKOztJQTFCS04sU0FBUztRQUFFbUIsWUFBWTtRQUFRQyxZQUFZLENBQUMsaUJBQWlCLENBQUM7SUFBQzs7R0FGdkRSOztJQUtSYixVQUFVO1FBQUVTLFFBQVEsSUFBTUw7UUFBVWtCLFVBQVU7UUFBV0MsU0FBUztRQUFNQyxPQUFPO0lBQThCO3VDQUNuRywrQkFBQTtHQU5GWDs7SUFRUmIsVUFBVTtRQUFFUyxRQUFRLElBQU1KO1FBQU9pQixVQUFVO1FBQVdDLFNBQVM7UUFBTUMsT0FBTztJQUEyQjt1Q0FDaEcsK0JBQUE7R0FUQ1g7O0lBV1JaLFNBQVM7UUFBRXdCLFVBQVU7SUFBSzs7R0FYbEJaOztJQWNSakI7OztlQUN1QixxQ0FBQTs7R0FmZmlCOztJQW1CUmY7OztlQUN1QixxQ0FBQTs7R0FwQmZlOztJQXdCUmhCOzs7ZUFDdUIscUNBQUE7O0dBekJmZ0I7QUFBQUE7SUFEWmQ7R0FDWWMifQ==