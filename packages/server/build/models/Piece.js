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
import { CalendarPiece } from "./CalendarPiece.js";
import { Calendar } from "./Calendar.js";
export let Piece = class Piece {
    [OptionalProps];
    id;
    piece;
    composer;
    Search;
    calendarPieces = new Collection(this);
    calendars = new Collection(this);
    order;
};
_ts_decorate([
    PrimaryKey({
        columnType: 'uuid',
        defaultRaw: `gen_random_uuid()`
    }),
    _ts_metadata("design:type", String)
], Piece.prototype, "id", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Piece.prototype, "piece", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Piece.prototype, "composer", void 0);
_ts_decorate([
    Index({
        name: 'piece_search'
    }),
    Property({
        fieldName: '_search',
        columnType: 'tsvector',
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], Piece.prototype, "Search", void 0);
_ts_decorate([
    OneToMany({
        entity: ()=>CalendarPiece,
        mappedBy: (cp)=>cp.piece
    })
], Piece.prototype, "calendarPieces", void 0);
_ts_decorate([
    ManyToMany({
        entity: ()=>Calendar,
        pivotEntity: ()=>CalendarPiece,
        mappedBy: (c)=>c.pieces,
        orderBy: {
            'dateTime': 'DESC'
        }
    })
], Piece.prototype, "calendars", void 0);
_ts_decorate([
    Property({
        persist: false
    }),
    _ts_metadata("design:type", Number)
], Piece.prototype, "order", void 0);
Piece = _ts_decorate([
    Entity()
], Piece);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvUGllY2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29sbGVjdGlvbiwgRW50aXR5LCBJbmRleCwgTWFueVRvTWFueSwgT25lVG9NYW55LCBPcHRpb25hbFByb3BzLCBQcmltYXJ5S2V5LCBQcm9wZXJ0eSB9IGZyb20gJ0BtaWtyby1vcm0vY29yZSc7XG5pbXBvcnQgeyBDYWxlbmRhclBpZWNlIH0gZnJvbSAnLi9DYWxlbmRhclBpZWNlLmpzJztcbmltcG9ydCB7IENhbGVuZGFyIH0gZnJvbSAnLi9DYWxlbmRhci5qcyc7XG5cbkBFbnRpdHkoKVxuZXhwb3J0IGNsYXNzIFBpZWNlIHtcblxuICBbT3B0aW9uYWxQcm9wc10/OiAnaWQnO1xuXG4gIEBQcmltYXJ5S2V5KHsgY29sdW1uVHlwZTogJ3V1aWQnLCBkZWZhdWx0UmF3OiBgZ2VuX3JhbmRvbV91dWlkKClgIH0pXG4gIGlkITogc3RyaW5nO1xuXG4gIEBQcm9wZXJ0eSh7IGNvbHVtblR5cGU6ICd0ZXh0JywgbnVsbGFibGU6IHRydWUgfSlcbiAgcGllY2U/OiBzdHJpbmc7XG5cbiAgQFByb3BlcnR5KHsgY29sdW1uVHlwZTogJ3RleHQnLCBudWxsYWJsZTogdHJ1ZSB9KVxuICBjb21wb3Nlcj86IHN0cmluZztcblxuICBASW5kZXgoeyBuYW1lOiAncGllY2Vfc2VhcmNoJyB9KVxuICBAUHJvcGVydHkoeyBmaWVsZE5hbWU6ICdfc2VhcmNoJywgY29sdW1uVHlwZTogJ3RzdmVjdG9yJywgbnVsbGFibGU6IHRydWUgfSlcbiAgU2VhcmNoPzogdW5rbm93bjtcblxuICBAT25lVG9NYW55KHsgZW50aXR5OiAoKSA9PiBDYWxlbmRhclBpZWNlLCBtYXBwZWRCeTogY3AgPT4gY3AucGllY2UgfSlcbiAgY2FsZW5kYXJQaWVjZXMgPSBuZXcgQ29sbGVjdGlvbjxDYWxlbmRhclBpZWNlPih0aGlzKTtcblxuICBATWFueVRvTWFueSh7XG4gICAgZW50aXR5OiAoKSA9PiBDYWxlbmRhcixcbiAgICBwaXZvdEVudGl0eTogKCkgPT4gQ2FsZW5kYXJQaWVjZSxcbiAgICBtYXBwZWRCeTogYyA9PiBjLnBpZWNlcyxcbiAgICBvcmRlckJ5OiB7ICdkYXRlVGltZSc6ICdERVNDJyB9fSlcbiAgY2FsZW5kYXJzID0gbmV3IENvbGxlY3Rpb248Q2FsZW5kYXI+KHRoaXMpO1xuXG4gIEBQcm9wZXJ0eSh7IHBlcnNpc3Q6IGZhbHNlIH0pXG4gIG9yZGVyPzogbnVtYmVyO1xuXG59XG4iXSwibmFtZXMiOlsiQ29sbGVjdGlvbiIsIkVudGl0eSIsIkluZGV4IiwiTWFueVRvTWFueSIsIk9uZVRvTWFueSIsIk9wdGlvbmFsUHJvcHMiLCJQcmltYXJ5S2V5IiwiUHJvcGVydHkiLCJDYWxlbmRhclBpZWNlIiwiQ2FsZW5kYXIiLCJQaWVjZSIsImlkIiwicGllY2UiLCJjb21wb3NlciIsIlNlYXJjaCIsImNhbGVuZGFyUGllY2VzIiwiY2FsZW5kYXJzIiwib3JkZXIiLCJjb2x1bW5UeXBlIiwiZGVmYXVsdFJhdyIsIm51bGxhYmxlIiwibmFtZSIsImZpZWxkTmFtZSIsImVudGl0eSIsIm1hcHBlZEJ5IiwiY3AiLCJwaXZvdEVudGl0eSIsImMiLCJwaWVjZXMiLCJvcmRlckJ5IiwicGVyc2lzdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsU0FBU0EsVUFBVSxFQUFFQyxNQUFNLEVBQUVDLEtBQUssRUFBRUMsVUFBVSxFQUFFQyxTQUFTLEVBQUVDLGFBQWEsRUFBRUMsVUFBVSxFQUFFQyxRQUFRLFFBQVEsa0JBQWtCO0FBQ3hILFNBQVNDLGFBQWEsUUFBUSxxQkFBcUI7QUFDbkQsU0FBU0MsUUFBUSxRQUFRLGdCQUFnQjtBQUd6QyxXQUFhQyxRQUFOO0lBRUwsQ0FBQ0wsY0FBYyxDQUFRO0lBR3ZCTSxHQUFZO0lBR1pDLE1BQWU7SUFHZkMsU0FBa0I7SUFJbEJDLE9BQWlCO0lBR2pCQyxpQkFBaUIsSUFBSWYsV0FBMEIsSUFBSSxFQUFFO0lBT3JEZ0IsWUFBWSxJQUFJaEIsV0FBcUIsSUFBSSxFQUFFO0lBRzNDaUIsTUFBZTtBQUVqQjs7SUExQkdYLFdBQVc7UUFBRVksWUFBWTtRQUFRQyxZQUFZLENBQUMsaUJBQWlCLENBQUM7SUFBQzs7R0FKdkRUOztJQU9WSCxTQUFTO1FBQUVXLFlBQVk7UUFBUUUsVUFBVTtJQUFLOztHQVBwQ1Y7O0lBVVZILFNBQVM7UUFBRVcsWUFBWTtRQUFRRSxVQUFVO0lBQUs7O0dBVnBDVjs7SUFhVlIsTUFBTTtRQUFFbUIsTUFBTTtJQUFlO0lBQzdCZCxTQUFTO1FBQUVlLFdBQVc7UUFBV0osWUFBWTtRQUFZRSxVQUFVO0lBQUs7O0dBZDlEVjs7SUFpQlZOLFVBQVU7UUFBRW1CLFFBQVEsSUFBTWY7UUFBZWdCLFVBQVVDLENBQUFBLEtBQU1BLEdBQUdiLEtBQUs7SUFBQztHQWpCeERGOztJQW9CVlAsV0FBVztRQUNWb0IsUUFBUSxJQUFNZDtRQUNkaUIsYUFBYSxJQUFNbEI7UUFDbkJnQixVQUFVRyxDQUFBQSxJQUFLQSxFQUFFQyxNQUFNO1FBQ3ZCQyxTQUFTO1lBQUUsWUFBWTtRQUFPO0lBQUM7R0F4QnRCbkI7O0lBMkJWSCxTQUFTO1FBQUV1QixTQUFTO0lBQU07O0dBM0JoQnBCO0FBQUFBO0lBRFpUO0dBQ1lTIn0=