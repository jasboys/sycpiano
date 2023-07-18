function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
import { Collection, Entity, Index, ManyToMany, OneToMany, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { CalendarCollaborator } from "./CalendarCollaborator.js";
import { Calendar } from "./Calendar.js";
export let Collaborator = class Collaborator {
    [OptionalProps];
    id;
    name;
    instrument;
    Search;
    calendarCollaborators = new Collection(this);
    calendars = new Collection(this);
    order;
};
_ts_decorate([
    PrimaryKey({
        columnType: 'uuid',
        defaultRaw: `gen_random_uuid()`
    }),
    _ts_metadata("design:type", String)
], Collaborator.prototype, "id", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Collaborator.prototype, "name", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Collaborator.prototype, "instrument", void 0);
_ts_decorate([
    Index({
        name: 'collaborator_search'
    }),
    Property({
        fieldName: '_search',
        columnType: 'tsvector',
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], Collaborator.prototype, "Search", void 0);
_ts_decorate([
    OneToMany({
        entity: ()=>CalendarCollaborator,
        mappedBy: (cc)=>cc.collaborator
    })
], Collaborator.prototype, "calendarCollaborators", void 0);
_ts_decorate([
    ManyToMany({
        entity: ()=>Calendar,
        pivotEntity: ()=>CalendarCollaborator,
        mappedBy: (c)=>c.collaborators,
        orderBy: {
            'dateTime': 'DESC'
        }
    })
], Collaborator.prototype, "calendars", void 0);
_ts_decorate([
    Property({
        persist: false
    }),
    _ts_metadata("design:type", Number)
], Collaborator.prototype, "order", void 0);
Collaborator = _ts_decorate([
    Entity()
], Collaborator);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvQ29sbGFib3JhdG9yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbGxlY3Rpb24sIEVudGl0eSwgSW5kZXgsIE1hbnlUb01hbnksIE9uZVRvTWFueSwgT3B0aW9uYWxQcm9wcywgUHJpbWFyeUtleSwgUHJvcGVydHkgfSBmcm9tICdAbWlrcm8tb3JtL2NvcmUnO1xuaW1wb3J0IHsgQ2FsZW5kYXJDb2xsYWJvcmF0b3IgfSBmcm9tICcuL0NhbGVuZGFyQ29sbGFib3JhdG9yLmpzJztcbmltcG9ydCB7IENhbGVuZGFyIH0gZnJvbSAnLi9DYWxlbmRhci5qcyc7XG5cbkBFbnRpdHkoKVxuZXhwb3J0IGNsYXNzIENvbGxhYm9yYXRvciB7XG5cbiAgW09wdGlvbmFsUHJvcHNdPzogJ2lkJztcblxuICBAUHJpbWFyeUtleSh7IGNvbHVtblR5cGU6ICd1dWlkJywgZGVmYXVsdFJhdzogYGdlbl9yYW5kb21fdXVpZCgpYCB9KVxuICBpZCE6IHN0cmluZztcblxuICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gIG5hbWU/OiBzdHJpbmc7XG5cbiAgQFByb3BlcnR5KHsgY29sdW1uVHlwZTogJ3RleHQnLCBudWxsYWJsZTogdHJ1ZSB9KVxuICBpbnN0cnVtZW50Pzogc3RyaW5nO1xuXG4gIEBJbmRleCh7IG5hbWU6ICdjb2xsYWJvcmF0b3Jfc2VhcmNoJyB9KVxuICBAUHJvcGVydHkoeyBmaWVsZE5hbWU6ICdfc2VhcmNoJywgY29sdW1uVHlwZTogJ3RzdmVjdG9yJywgbnVsbGFibGU6IHRydWUgfSlcbiAgU2VhcmNoPzogdW5rbm93bjtcblxuICBAT25lVG9NYW55KHsgZW50aXR5OiAoKSA9PiBDYWxlbmRhckNvbGxhYm9yYXRvciwgbWFwcGVkQnk6IGNjID0+IGNjLmNvbGxhYm9yYXRvciB9KVxuICBjYWxlbmRhckNvbGxhYm9yYXRvcnMgPSBuZXcgQ29sbGVjdGlvbjxDYWxlbmRhckNvbGxhYm9yYXRvcj4odGhpcyk7XG5cbiAgQE1hbnlUb01hbnkoe1xuICAgIGVudGl0eTogKCkgPT4gQ2FsZW5kYXIsXG4gICAgcGl2b3RFbnRpdHk6ICgpID0+IENhbGVuZGFyQ29sbGFib3JhdG9yLFxuICAgIG1hcHBlZEJ5OiBjID0+IGMuY29sbGFib3JhdG9ycyxcbiAgICBvcmRlckJ5OiB7ICdkYXRlVGltZSc6ICdERVNDJyB9fSlcbiAgY2FsZW5kYXJzID0gbmV3IENvbGxlY3Rpb248Q2FsZW5kYXI+KHRoaXMpO1xuXG4gIEBQcm9wZXJ0eSh7IHBlcnNpc3Q6IGZhbHNlIH0pXG4gIG9yZGVyPzogbnVtYmVyO1xuXG59XG4iXSwibmFtZXMiOlsiQ29sbGVjdGlvbiIsIkVudGl0eSIsIkluZGV4IiwiTWFueVRvTWFueSIsIk9uZVRvTWFueSIsIk9wdGlvbmFsUHJvcHMiLCJQcmltYXJ5S2V5IiwiUHJvcGVydHkiLCJDYWxlbmRhckNvbGxhYm9yYXRvciIsIkNhbGVuZGFyIiwiQ29sbGFib3JhdG9yIiwiaWQiLCJuYW1lIiwiaW5zdHJ1bWVudCIsIlNlYXJjaCIsImNhbGVuZGFyQ29sbGFib3JhdG9ycyIsImNhbGVuZGFycyIsIm9yZGVyIiwiY29sdW1uVHlwZSIsImRlZmF1bHRSYXciLCJudWxsYWJsZSIsImZpZWxkTmFtZSIsImVudGl0eSIsIm1hcHBlZEJ5IiwiY2MiLCJjb2xsYWJvcmF0b3IiLCJwaXZvdEVudGl0eSIsImMiLCJjb2xsYWJvcmF0b3JzIiwib3JkZXJCeSIsInBlcnNpc3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLFNBQVNBLFVBQVUsRUFBRUMsTUFBTSxFQUFFQyxLQUFLLEVBQUVDLFVBQVUsRUFBRUMsU0FBUyxFQUFFQyxhQUFhLEVBQUVDLFVBQVUsRUFBRUMsUUFBUSxRQUFRLGtCQUFrQjtBQUN4SCxTQUFTQyxvQkFBb0IsUUFBUSw0QkFBNEI7QUFDakUsU0FBU0MsUUFBUSxRQUFRLGdCQUFnQjtBQUd6QyxXQUFhQyxlQUFOO0lBRUwsQ0FBQ0wsY0FBYyxDQUFRO0lBR3ZCTSxHQUFZO0lBR1pDLEtBQWM7SUFHZEMsV0FBb0I7SUFJcEJDLE9BQWlCO0lBR2pCQyx3QkFBd0IsSUFBSWYsV0FBaUMsSUFBSSxFQUFFO0lBT25FZ0IsWUFBWSxJQUFJaEIsV0FBcUIsSUFBSSxFQUFFO0lBRzNDaUIsTUFBZTtBQUVqQjs7SUExQkdYLFdBQVc7UUFBRVksWUFBWTtRQUFRQyxZQUFZLENBQUMsaUJBQWlCLENBQUM7SUFBQzs7R0FKdkRUOztJQU9WSCxTQUFTO1FBQUVXLFlBQVk7UUFBUUUsVUFBVTtJQUFLOztHQVBwQ1Y7O0lBVVZILFNBQVM7UUFBRVcsWUFBWTtRQUFRRSxVQUFVO0lBQUs7O0dBVnBDVjs7SUFhVlIsTUFBTTtRQUFFVSxNQUFNO0lBQXNCO0lBQ3BDTCxTQUFTO1FBQUVjLFdBQVc7UUFBV0gsWUFBWTtRQUFZRSxVQUFVO0lBQUs7O0dBZDlEVjs7SUFpQlZOLFVBQVU7UUFBRWtCLFFBQVEsSUFBTWQ7UUFBc0JlLFVBQVVDLENBQUFBLEtBQU1BLEdBQUdDLFlBQVk7SUFBQztHQWpCdEVmOztJQW9CVlAsV0FBVztRQUNWbUIsUUFBUSxJQUFNYjtRQUNkaUIsYUFBYSxJQUFNbEI7UUFDbkJlLFVBQVVJLENBQUFBLElBQUtBLEVBQUVDLGFBQWE7UUFDOUJDLFNBQVM7WUFBRSxZQUFZO1FBQU87SUFBQztHQXhCdEJuQjs7SUEyQlZILFNBQVM7UUFBRXVCLFNBQVM7SUFBTTs7R0EzQmhCcEI7QUFBQUE7SUFEWlQ7R0FDWVMifQ==