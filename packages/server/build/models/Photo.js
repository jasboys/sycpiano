function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
import { Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
export let Photo = class Photo {
    [OptionalProps];
    id;
    file;
    width;
    height;
    thumbnailWidth;
    thumbnailHeight;
    createdAt;
    updatedAt;
    credit;
};
_ts_decorate([
    PrimaryKey({
        columnType: 'uuid',
        defaultRaw: `gen_random_uuid()`
    }),
    _ts_metadata("design:type", String)
], Photo.prototype, "id", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Photo.prototype, "file", void 0);
_ts_decorate([
    Property({
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], Photo.prototype, "width", void 0);
_ts_decorate([
    Property({
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], Photo.prototype, "height", void 0);
_ts_decorate([
    Property({
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], Photo.prototype, "thumbnailWidth", void 0);
_ts_decorate([
    Property({
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], Photo.prototype, "thumbnailHeight", void 0);
_ts_decorate([
    Property({
        length: 6,
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Photo.prototype, "createdAt", void 0);
_ts_decorate([
    Property({
        length: 6,
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Photo.prototype, "updatedAt", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Photo.prototype, "credit", void 0);
Photo = _ts_decorate([
    Entity()
], Photo);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvUGhvdG8udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRW50aXR5LCBPcHRpb25hbFByb3BzLCBQcmltYXJ5S2V5LCBQcm9wZXJ0eSB9IGZyb20gJ0BtaWtyby1vcm0vY29yZSc7XG5cbkBFbnRpdHkoKVxuZXhwb3J0IGNsYXNzIFBob3RvIHtcblxuICBbT3B0aW9uYWxQcm9wc10/OiAnaWQnO1xuXG4gIEBQcmltYXJ5S2V5KHsgY29sdW1uVHlwZTogJ3V1aWQnLCBkZWZhdWx0UmF3OiBgZ2VuX3JhbmRvbV91dWlkKClgIH0pXG4gIGlkITogc3RyaW5nO1xuXG4gIEBQcm9wZXJ0eSh7IGNvbHVtblR5cGU6ICd0ZXh0JywgbnVsbGFibGU6IHRydWUgfSlcbiAgZmlsZT86IHN0cmluZztcblxuICBAUHJvcGVydHkoeyBudWxsYWJsZTogdHJ1ZSB9KVxuICB3aWR0aD86IG51bWJlcjtcblxuICBAUHJvcGVydHkoeyBudWxsYWJsZTogdHJ1ZSB9KVxuICBoZWlnaHQ/OiBudW1iZXI7XG5cbiAgQFByb3BlcnR5KHsgbnVsbGFibGU6IHRydWUgfSlcbiAgdGh1bWJuYWlsV2lkdGg/OiBudW1iZXI7XG5cbiAgQFByb3BlcnR5KHsgbnVsbGFibGU6IHRydWUgfSlcbiAgdGh1bWJuYWlsSGVpZ2h0PzogbnVtYmVyO1xuXG4gIEBQcm9wZXJ0eSh7IGxlbmd0aDogNiwgbnVsbGFibGU6IHRydWUgfSlcbiAgY3JlYXRlZEF0PzogRGF0ZTtcblxuICBAUHJvcGVydHkoeyBsZW5ndGg6IDYsIG51bGxhYmxlOiB0cnVlIH0pXG4gIHVwZGF0ZWRBdD86IERhdGU7XG5cbiAgQFByb3BlcnR5KHsgY29sdW1uVHlwZTogJ3RleHQnLCBudWxsYWJsZTogdHJ1ZSB9KVxuICBjcmVkaXQ/OiBzdHJpbmc7XG5cbn1cbiJdLCJuYW1lcyI6WyJFbnRpdHkiLCJPcHRpb25hbFByb3BzIiwiUHJpbWFyeUtleSIsIlByb3BlcnR5IiwiUGhvdG8iLCJpZCIsImZpbGUiLCJ3aWR0aCIsImhlaWdodCIsInRodW1ibmFpbFdpZHRoIiwidGh1bWJuYWlsSGVpZ2h0IiwiY3JlYXRlZEF0IiwidXBkYXRlZEF0IiwiY3JlZGl0IiwiY29sdW1uVHlwZSIsImRlZmF1bHRSYXciLCJudWxsYWJsZSIsImxlbmd0aCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsU0FBU0EsTUFBTSxFQUFFQyxhQUFhLEVBQUVDLFVBQVUsRUFBRUMsUUFBUSxRQUFRLGtCQUFrQjtBQUc5RSxXQUFhQyxRQUFOO0lBRUwsQ0FBQ0gsY0FBYyxDQUFRO0lBR3ZCSSxHQUFZO0lBR1pDLEtBQWM7SUFHZEMsTUFBZTtJQUdmQyxPQUFnQjtJQUdoQkMsZUFBd0I7SUFHeEJDLGdCQUF5QjtJQUd6QkMsVUFBaUI7SUFHakJDLFVBQWlCO0lBR2pCQyxPQUFnQjtBQUVsQjs7SUEzQkdYLFdBQVc7UUFBRVksWUFBWTtRQUFRQyxZQUFZLENBQUMsaUJBQWlCLENBQUM7SUFBQzs7R0FKdkRYOztJQU9WRCxTQUFTO1FBQUVXLFlBQVk7UUFBUUUsVUFBVTtJQUFLOztHQVBwQ1o7O0lBVVZELFNBQVM7UUFBRWEsVUFBVTtJQUFLOztHQVZoQlo7O0lBYVZELFNBQVM7UUFBRWEsVUFBVTtJQUFLOztHQWJoQlo7O0lBZ0JWRCxTQUFTO1FBQUVhLFVBQVU7SUFBSzs7R0FoQmhCWjs7SUFtQlZELFNBQVM7UUFBRWEsVUFBVTtJQUFLOztHQW5CaEJaOztJQXNCVkQsU0FBUztRQUFFYyxRQUFRO1FBQUdELFVBQVU7SUFBSzt1Q0FDMUIsZ0NBQUE7R0F2QkRaOztJQXlCVkQsU0FBUztRQUFFYyxRQUFRO1FBQUdELFVBQVU7SUFBSzt1Q0FDMUIsZ0NBQUE7R0ExQkRaOztJQTRCVkQsU0FBUztRQUFFVyxZQUFZO1FBQVFFLFVBQVU7SUFBSzs7R0E1QnBDWjtBQUFBQTtJQURaSjtHQUNZSSJ9