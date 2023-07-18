function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
import { Collection, Entity, OneToMany, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { MusicFile } from "./MusicFile.js";
export let Music = class Music {
    [OptionalProps];
    id;
    composer;
    piece;
    contributors;
    type;
    year;
    musicFiles = new Collection(this);
};
_ts_decorate([
    PrimaryKey({
        columnType: 'uuid',
        defaultRaw: `gen_random_uuid()`
    }),
    _ts_metadata("design:type", String)
], Music.prototype, "id", void 0);
_ts_decorate([
    Property({
        columnType: 'text'
    }),
    _ts_metadata("design:type", String)
], Music.prototype, "composer", void 0);
_ts_decorate([
    Property({
        columnType: 'text'
    }),
    _ts_metadata("design:type", String)
], Music.prototype, "piece", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Music.prototype, "contributors", void 0);
_ts_decorate([
    Property({
        columnType: 'text'
    }),
    _ts_metadata("design:type", String)
], Music.prototype, "type", void 0);
_ts_decorate([
    Property({
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], Music.prototype, "year", void 0);
_ts_decorate([
    OneToMany({
        entity: ()=>MusicFile,
        mappedBy: 'music',
        orderBy: {
            'name': 'asc'
        }
    })
], Music.prototype, "musicFiles", void 0);
Music = _ts_decorate([
    Entity()
], Music);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvTXVzaWMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29sbGVjdGlvbiwgRW50aXR5LCBPbmVUb01hbnksIE9wdGlvbmFsUHJvcHMsIFByaW1hcnlLZXksIFByb3BlcnR5IH0gZnJvbSAnQG1pa3JvLW9ybS9jb3JlJztcbmltcG9ydCB7IE11c2ljRmlsZSB9IGZyb20gJy4vTXVzaWNGaWxlLmpzJztcblxuQEVudGl0eSgpXG5leHBvcnQgY2xhc3MgTXVzaWMge1xuXG4gIFtPcHRpb25hbFByb3BzXT86ICdpZCc7XG5cbiAgQFByaW1hcnlLZXkoeyBjb2x1bW5UeXBlOiAndXVpZCcsIGRlZmF1bHRSYXc6IGBnZW5fcmFuZG9tX3V1aWQoKWAgfSlcbiAgaWQhOiBzdHJpbmc7XG5cbiAgQFByb3BlcnR5KHsgY29sdW1uVHlwZTogJ3RleHQnIH0pXG4gIGNvbXBvc2VyITogc3RyaW5nO1xuXG4gIEBQcm9wZXJ0eSh7IGNvbHVtblR5cGU6ICd0ZXh0JyB9KVxuICBwaWVjZSE6IHN0cmluZztcblxuICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gIGNvbnRyaWJ1dG9ycz86IHN0cmluZztcblxuICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcgfSlcbiAgdHlwZSE6IHN0cmluZztcblxuICBAUHJvcGVydHkoeyBudWxsYWJsZTogdHJ1ZSB9KVxuICB5ZWFyPzogbnVtYmVyO1xuXG4gIEBPbmVUb01hbnkoeyBlbnRpdHk6ICgpID0+IE11c2ljRmlsZSwgbWFwcGVkQnk6ICdtdXNpYycsIG9yZGVyQnk6IHsgJ25hbWUnOiAnYXNjJyB9IH0pXG4gIG11c2ljRmlsZXMgPSBuZXcgQ29sbGVjdGlvbjxNdXNpY0ZpbGU+KHRoaXMpO1xuXG59XG4iXSwibmFtZXMiOlsiQ29sbGVjdGlvbiIsIkVudGl0eSIsIk9uZVRvTWFueSIsIk9wdGlvbmFsUHJvcHMiLCJQcmltYXJ5S2V5IiwiUHJvcGVydHkiLCJNdXNpY0ZpbGUiLCJNdXNpYyIsImlkIiwiY29tcG9zZXIiLCJwaWVjZSIsImNvbnRyaWJ1dG9ycyIsInR5cGUiLCJ5ZWFyIiwibXVzaWNGaWxlcyIsImNvbHVtblR5cGUiLCJkZWZhdWx0UmF3IiwibnVsbGFibGUiLCJlbnRpdHkiLCJtYXBwZWRCeSIsIm9yZGVyQnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLFNBQVNBLFVBQVUsRUFBRUMsTUFBTSxFQUFFQyxTQUFTLEVBQUVDLGFBQWEsRUFBRUMsVUFBVSxFQUFFQyxRQUFRLFFBQVEsa0JBQWtCO0FBQ3JHLFNBQVNDLFNBQVMsUUFBUSxpQkFBaUI7QUFHM0MsV0FBYUMsUUFBTjtJQUVMLENBQUNKLGNBQWMsQ0FBUTtJQUd2QkssR0FBWTtJQUdaQyxTQUFrQjtJQUdsQkMsTUFBZTtJQUdmQyxhQUFzQjtJQUd0QkMsS0FBYztJQUdkQyxLQUFjO0lBR2RDLGFBQWEsSUFBSWQsV0FBc0IsSUFBSSxFQUFFO0FBRS9DOztJQXJCR0ksV0FBVztRQUFFVyxZQUFZO1FBQVFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQztJQUFDOztHQUp2RFQ7O0lBT1ZGLFNBQVM7UUFBRVUsWUFBWTtJQUFPOztHQVBwQlI7O0lBVVZGLFNBQVM7UUFBRVUsWUFBWTtJQUFPOztHQVZwQlI7O0lBYVZGLFNBQVM7UUFBRVUsWUFBWTtRQUFRRSxVQUFVO0lBQUs7O0dBYnBDVjs7SUFnQlZGLFNBQVM7UUFBRVUsWUFBWTtJQUFPOztHQWhCcEJSOztJQW1CVkYsU0FBUztRQUFFWSxVQUFVO0lBQUs7O0dBbkJoQlY7O0lBc0JWTCxVQUFVO1FBQUVnQixRQUFRLElBQU1aO1FBQVdhLFVBQVU7UUFBU0MsU0FBUztZQUFFLFFBQVE7UUFBTTtJQUFFO0dBdEJ6RWI7QUFBQUE7SUFEWk47R0FDWU0ifQ==