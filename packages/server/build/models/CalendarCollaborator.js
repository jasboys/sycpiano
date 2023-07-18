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
import { Collaborator } from "./Collaborator.js";
const hook = async (args)=>{
    const cal = args.entity.calendar;
    const data = await transformModelToGoogle(cal);
    await updateCalendar(args.em, data);
};
export let CalendarCollaborator = class CalendarCollaborator {
    id;
    calendar;
    collaborator;
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
], CalendarCollaborator.prototype, "id", void 0);
_ts_decorate([
    ManyToOne({
        entity: ()=>Calendar,
        onDelete: 'cascade',
        primary: true,
        index: 'calendar_collaborator_calendar_idx'
    }),
    _ts_metadata("design:type", typeof Rel === "undefined" ? Object : Rel)
], CalendarCollaborator.prototype, "calendar", void 0);
_ts_decorate([
    ManyToOne({
        entity: ()=>Collaborator,
        onDelete: 'cascade',
        primary: true,
        index: 'calendar_collaborator_collaborator_idx'
    }),
    _ts_metadata("design:type", typeof Rel === "undefined" ? Object : Rel)
], CalendarCollaborator.prototype, "collaborator", void 0);
_ts_decorate([
    Property({
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], CalendarCollaborator.prototype, "order", void 0);
_ts_decorate([
    AfterCreate(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof EventArgs === "undefined" ? Object : EventArgs
    ])
], CalendarCollaborator.prototype, "afterCreate", null);
_ts_decorate([
    AfterUpdate(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof EventArgs === "undefined" ? Object : EventArgs
    ])
], CalendarCollaborator.prototype, "afterUpdate", null);
_ts_decorate([
    AfterDelete(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof EventArgs === "undefined" ? Object : EventArgs
    ])
], CalendarCollaborator.prototype, "afterDelete", null);
CalendarCollaborator = _ts_decorate([
    Entity()
], CalendarCollaborator);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvQ2FsZW5kYXJDb2xsYWJvcmF0b3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBFdmVudEFyZ3MsIFJlbCB9IGZyb20gJ0BtaWtyby1vcm0vY29yZSc7XG5pbXBvcnQgeyBBZnRlckNyZWF0ZSwgQWZ0ZXJEZWxldGUsIEFmdGVyVXBkYXRlLCBFbnRpdHksIE1hbnlUb09uZSwgUHJvcGVydHkgfSBmcm9tICdAbWlrcm8tb3JtL2NvcmUnO1xuaW1wb3J0IHsgdHJhbnNmb3JtTW9kZWxUb0dvb2dsZSwgdXBkYXRlQ2FsZW5kYXIgfSBmcm9tICcuLi9nYXBpL2NhbGVuZGFyLmpzJztcbmltcG9ydCB7IENhbGVuZGFyIH0gZnJvbSAnLi9DYWxlbmRhci5qcyc7XG5pbXBvcnQgeyBDb2xsYWJvcmF0b3IgfSBmcm9tICcuL0NvbGxhYm9yYXRvci5qcyc7XG5cbmNvbnN0IGhvb2sgPSBhc3luYyAoYXJnczogRXZlbnRBcmdzPENhbGVuZGFyQ29sbGFib3JhdG9yPikgPT4ge1xuICAgIGNvbnN0IGNhbCA9IGFyZ3MuZW50aXR5LmNhbGVuZGFyO1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0cmFuc2Zvcm1Nb2RlbFRvR29vZ2xlKGNhbCk7XG4gICAgYXdhaXQgdXBkYXRlQ2FsZW5kYXIoYXJncy5lbSwgZGF0YSk7XG59O1xuXG5ARW50aXR5KClcbmV4cG9ydCBjbGFzcyBDYWxlbmRhckNvbGxhYm9yYXRvciB7XG5cbiAgICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndXVpZCcsIGRlZmF1bHRSYXc6IGBnZW5fcmFuZG9tX3V1aWQoKWAgfSlcbiAgICBpZCE6IHN0cmluZztcblxuICAgIEBNYW55VG9PbmUoeyBlbnRpdHk6ICgpID0+IENhbGVuZGFyLCBvbkRlbGV0ZTogJ2Nhc2NhZGUnLCBwcmltYXJ5OiB0cnVlLCBpbmRleDogJ2NhbGVuZGFyX2NvbGxhYm9yYXRvcl9jYWxlbmRhcl9pZHgnIH0pXG4gICAgY2FsZW5kYXIhOiBSZWw8Q2FsZW5kYXI+O1xuXG4gICAgQE1hbnlUb09uZSh7IGVudGl0eTogKCkgPT4gQ29sbGFib3JhdG9yLCBvbkRlbGV0ZTogJ2Nhc2NhZGUnLCBwcmltYXJ5OiB0cnVlLCBpbmRleDogJ2NhbGVuZGFyX2NvbGxhYm9yYXRvcl9jb2xsYWJvcmF0b3JfaWR4JyB9KVxuICAgIGNvbGxhYm9yYXRvciE6IFJlbDxDb2xsYWJvcmF0b3I+O1xuXG4gICAgQFByb3BlcnR5KHsgbnVsbGFibGU6IHRydWUgfSlcbiAgICBvcmRlcj86IG51bWJlcjtcblxuICAgIEBBZnRlckNyZWF0ZSgpXG4gICAgYXN5bmMgYWZ0ZXJDcmVhdGUoYXJnczogRXZlbnRBcmdzPENhbGVuZGFyQ29sbGFib3JhdG9yPikge1xuICAgICAgICBhd2FpdCBob29rKGFyZ3MpO1xuICAgIH1cblxuICAgIEBBZnRlclVwZGF0ZSgpXG4gICAgYXN5bmMgYWZ0ZXJVcGRhdGUoYXJnczogRXZlbnRBcmdzPENhbGVuZGFyQ29sbGFib3JhdG9yPikge1xuICAgICAgICBhd2FpdCBob29rKGFyZ3MpO1xuICAgIH1cblxuICAgIEBBZnRlckRlbGV0ZSgpXG4gICAgYXN5bmMgYWZ0ZXJEZWxldGUoYXJnczogRXZlbnRBcmdzPENhbGVuZGFyQ29sbGFib3JhdG9yPikge1xuICAgICAgICBhd2FpdCBob29rKGFyZ3MpO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6WyJBZnRlckNyZWF0ZSIsIkFmdGVyRGVsZXRlIiwiQWZ0ZXJVcGRhdGUiLCJFbnRpdHkiLCJNYW55VG9PbmUiLCJQcm9wZXJ0eSIsInRyYW5zZm9ybU1vZGVsVG9Hb29nbGUiLCJ1cGRhdGVDYWxlbmRhciIsIkNhbGVuZGFyIiwiQ29sbGFib3JhdG9yIiwiaG9vayIsImFyZ3MiLCJjYWwiLCJlbnRpdHkiLCJjYWxlbmRhciIsImRhdGEiLCJlbSIsIkNhbGVuZGFyQ29sbGFib3JhdG9yIiwiaWQiLCJjb2xsYWJvcmF0b3IiLCJvcmRlciIsImFmdGVyQ3JlYXRlIiwiYWZ0ZXJVcGRhdGUiLCJhZnRlckRlbGV0ZSIsImNvbHVtblR5cGUiLCJkZWZhdWx0UmF3Iiwib25EZWxldGUiLCJwcmltYXJ5IiwiaW5kZXgiLCJudWxsYWJsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQ0EsU0FBU0EsV0FBVyxFQUFFQyxXQUFXLEVBQUVDLFdBQVcsRUFBRUMsTUFBTSxFQUFFQyxTQUFTLEVBQUVDLFFBQVEsUUFBUSxrQkFBa0I7QUFDckcsU0FBU0Msc0JBQXNCLEVBQUVDLGNBQWMsUUFBUSxzQkFBc0I7QUFDN0UsU0FBU0MsUUFBUSxRQUFRLGdCQUFnQjtBQUN6QyxTQUFTQyxZQUFZLFFBQVEsb0JBQW9CO0FBRWpELE1BQU1DLE9BQU8sT0FBT0M7SUFDaEIsTUFBTUMsTUFBTUQsS0FBS0UsTUFBTSxDQUFDQyxRQUFRO0lBQ2hDLE1BQU1DLE9BQU8sTUFBTVQsdUJBQXVCTTtJQUMxQyxNQUFNTCxlQUFlSSxLQUFLSyxFQUFFLEVBQUVEO0FBQ2xDO0FBR0EsV0FBYUUsdUJBQU47SUFHSEMsR0FBWTtJQUdaSixTQUF5QjtJQUd6QkssYUFBaUM7SUFHakNDLE1BQWU7SUFFZixNQUNNQyxZQUFZVixJQUFxQyxFQUFFO1FBQ3JELE1BQU1ELEtBQUtDO0lBQ2Y7SUFFQSxNQUNNVyxZQUFZWCxJQUFxQyxFQUFFO1FBQ3JELE1BQU1ELEtBQUtDO0lBQ2Y7SUFFQSxNQUNNWSxZQUFZWixJQUFxQyxFQUFFO1FBQ3JELE1BQU1ELEtBQUtDO0lBQ2Y7QUFDSjs7SUExQktOLFNBQVM7UUFBRW1CLFlBQVk7UUFBUUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDO0lBQUM7O0dBRnZEUjs7SUFLUmIsVUFBVTtRQUFFUyxRQUFRLElBQU1MO1FBQVVrQixVQUFVO1FBQVdDLFNBQVM7UUFBTUMsT0FBTztJQUFxQzt1Q0FDMUcsK0JBQUE7R0FORlg7O0lBUVJiLFVBQVU7UUFBRVMsUUFBUSxJQUFNSjtRQUFjaUIsVUFBVTtRQUFXQyxTQUFTO1FBQU1DLE9BQU87SUFBeUM7dUNBQzlHLCtCQUFBO0dBVE5YOztJQVdSWixTQUFTO1FBQUV3QixVQUFVO0lBQUs7O0dBWGxCWjs7SUFjUmpCOzs7ZUFDdUIscUNBQUE7O0dBZmZpQjs7SUFtQlJmOzs7ZUFDdUIscUNBQUE7O0dBcEJmZTs7SUF3QlJoQjs7O2VBQ3VCLHFDQUFBOztHQXpCZmdCO0FBQUFBO0lBRFpkO0dBQ1ljIn0=