function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
export let Bio = class Bio {
    id;
    paragraph;
    text;
    createdAt;
    updatedAt;
};
_ts_decorate([
    PrimaryKey(),
    _ts_metadata("design:type", Number)
], Bio.prototype, "id", void 0);
_ts_decorate([
    Property(),
    _ts_metadata("design:type", Number)
], Bio.prototype, "paragraph", void 0);
_ts_decorate([
    Property({
        columnType: 'text'
    }),
    _ts_metadata("design:type", String)
], Bio.prototype, "text", void 0);
_ts_decorate([
    Property({
        length: 6,
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Bio.prototype, "createdAt", void 0);
_ts_decorate([
    Property({
        length: 6,
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Bio.prototype, "updatedAt", void 0);
Bio = _ts_decorate([
    Entity()
], Bio);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvQmlvLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVudGl0eSwgUHJpbWFyeUtleSwgUHJvcGVydHkgfSBmcm9tICdAbWlrcm8tb3JtL2NvcmUnO1xuXG5ARW50aXR5KClcbmV4cG9ydCBjbGFzcyBCaW8ge1xuXG4gIEBQcmltYXJ5S2V5KClcbiAgaWQhOiBudW1iZXI7XG5cbiAgQFByb3BlcnR5KClcbiAgcGFyYWdyYXBoITogbnVtYmVyO1xuXG4gIEBQcm9wZXJ0eSh7IGNvbHVtblR5cGU6ICd0ZXh0JyB9KVxuICB0ZXh0ITogc3RyaW5nO1xuXG4gIEBQcm9wZXJ0eSh7IGxlbmd0aDogNiwgbnVsbGFibGU6IHRydWUgfSlcbiAgY3JlYXRlZEF0PzogRGF0ZTtcblxuICBAUHJvcGVydHkoeyBsZW5ndGg6IDYsIG51bGxhYmxlOiB0cnVlIH0pXG4gIHVwZGF0ZWRBdD86IERhdGU7XG59XG4iXSwibmFtZXMiOlsiRW50aXR5IiwiUHJpbWFyeUtleSIsIlByb3BlcnR5IiwiQmlvIiwiaWQiLCJwYXJhZ3JhcGgiLCJ0ZXh0IiwiY3JlYXRlZEF0IiwidXBkYXRlZEF0IiwiY29sdW1uVHlwZSIsImxlbmd0aCIsIm51bGxhYmxlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxTQUFTQSxNQUFNLEVBQUVDLFVBQVUsRUFBRUMsUUFBUSxRQUFRLGtCQUFrQjtBQUcvRCxXQUFhQyxNQUFOO0lBR0xDLEdBQVk7SUFHWkMsVUFBbUI7SUFHbkJDLEtBQWM7SUFHZEMsVUFBaUI7SUFHakJDLFVBQWlCO0FBQ25COztJQWRHUDs7R0FGVUU7O0lBS1ZEOztHQUxVQzs7SUFRVkQsU0FBUztRQUFFTyxZQUFZO0lBQU87O0dBUnBCTjs7SUFXVkQsU0FBUztRQUFFUSxRQUFRO1FBQUdDLFVBQVU7SUFBSzt1Q0FDMUIsZ0NBQUE7R0FaRFI7O0lBY1ZELFNBQVM7UUFBRVEsUUFBUTtRQUFHQyxVQUFVO0lBQUs7dUNBQzFCLGdDQUFBO0dBZkRSO0FBQUFBO0lBRFpIO0dBQ1lHIn0=