function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
import { Entity, Index, OneToOne, PrimaryKey, Property, Type } from "@mikro-orm/core";
import { Calendar } from "./Calendar.js";
export class FullTextSearch extends Type {
    compareAsType() {
        return 'string';
    }
    getColumnType() {
        return 'tsvector';
    }
    convertToDatabaseValueSQL(key, _platform) {
        return `to_tsquery('en', ${key})`;
    }
}
export let CalendarSearchMatview = class CalendarSearchMatview {
    id;
    Search;
    Calendar;
};
_ts_decorate([
    PrimaryKey({
        columnType: 'text'
    }),
    _ts_metadata("design:type", String)
], CalendarSearchMatview.prototype, "id", void 0);
_ts_decorate([
    Index({
        name: 'search_idx'
    }),
    Property({
        fieldName: '_search',
        type: FullTextSearch
    }),
    _ts_metadata("design:type", String)
], CalendarSearchMatview.prototype, "Search", void 0);
_ts_decorate([
    OneToOne({
        entity: ()=>Calendar,
        joinColumn: 'id'
    }),
    _ts_metadata("design:type", typeof Rel === "undefined" ? Object : Rel)
], CalendarSearchMatview.prototype, "Calendar", void 0);
CalendarSearchMatview = _ts_decorate([
    Entity()
], CalendarSearchMatview);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvQ2FsZW5kYXJTZWFyY2hNYXR2aWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVudGl0eSwgSW5kZXgsIE9uZVRvT25lLCBQbGF0Zm9ybSwgUHJpbWFyeUtleSwgUHJvcGVydHksIFR5cGUgfSBmcm9tICdAbWlrcm8tb3JtL2NvcmUnO1xuaW1wb3J0IHR5cGUgeyBSZWwgfSBmcm9tICdAbWlrcm8tb3JtL2NvcmUnO1xuaW1wb3J0IHsgQ2FsZW5kYXIgfSBmcm9tICcuL0NhbGVuZGFyLmpzJztcblxuZXhwb3J0IGNsYXNzIEZ1bGxUZXh0U2VhcmNoIGV4dGVuZHMgVHlwZTxzdHJpbmcsIHN0cmluZz4ge1xuICAgIGNvbXBhcmVBc1R5cGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuICdzdHJpbmcnO1xuICAgIH1cblxuICAgIGdldENvbHVtblR5cGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuICd0c3ZlY3Rvcic7XG4gICAgfVxuXG4gICAgY29udmVydFRvRGF0YWJhc2VWYWx1ZVNRTChrZXk6IHN0cmluZywgX3BsYXRmb3JtOiBQbGF0Zm9ybSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgdG9fdHNxdWVyeSgnZW4nLCAke2tleX0pYDtcbiAgICB9XG59XG5cbkBFbnRpdHkoKVxuZXhwb3J0IGNsYXNzIENhbGVuZGFyU2VhcmNoTWF0dmlldyB7XG5cbiAgQFByaW1hcnlLZXkoeyBjb2x1bW5UeXBlOiAndGV4dCcgfSlcbiAgaWQhOiBzdHJpbmc7XG5cbiAgQEluZGV4KHsgbmFtZTogJ3NlYXJjaF9pZHgnIH0pXG4gIEBQcm9wZXJ0eSh7IGZpZWxkTmFtZTogJ19zZWFyY2gnLCB0eXBlOiBGdWxsVGV4dFNlYXJjaCB9KVxuICBTZWFyY2ghOiBzdHJpbmc7XG5cbiAgQE9uZVRvT25lKHsgZW50aXR5OiAoKSA9PiBDYWxlbmRhciwgam9pbkNvbHVtbjogJ2lkJyB9KVxuICBDYWxlbmRhciE6IFJlbDxDYWxlbmRhcj5cbn1cbiJdLCJuYW1lcyI6WyJFbnRpdHkiLCJJbmRleCIsIk9uZVRvT25lIiwiUHJpbWFyeUtleSIsIlByb3BlcnR5IiwiVHlwZSIsIkNhbGVuZGFyIiwiRnVsbFRleHRTZWFyY2giLCJjb21wYXJlQXNUeXBlIiwiZ2V0Q29sdW1uVHlwZSIsImNvbnZlcnRUb0RhdGFiYXNlVmFsdWVTUUwiLCJrZXkiLCJfcGxhdGZvcm0iLCJDYWxlbmRhclNlYXJjaE1hdHZpZXciLCJpZCIsIlNlYXJjaCIsImNvbHVtblR5cGUiLCJuYW1lIiwiZmllbGROYW1lIiwidHlwZSIsImVudGl0eSIsImpvaW5Db2x1bW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLFNBQVNBLE1BQU0sRUFBRUMsS0FBSyxFQUFFQyxRQUFRLEVBQVlDLFVBQVUsRUFBRUMsUUFBUSxFQUFFQyxJQUFJLFFBQVEsa0JBQWtCO0FBRWhHLFNBQVNDLFFBQVEsUUFBUSxnQkFBZ0I7QUFFekMsT0FBTyxNQUFNQyx1QkFBdUJGO0lBQ2hDRyxnQkFBd0I7UUFDcEIsT0FBTztJQUNYO0lBRUFDLGdCQUF3QjtRQUNwQixPQUFPO0lBQ1g7SUFFQUMsMEJBQTBCQyxHQUFXLEVBQUVDLFNBQW1CLEVBQVU7UUFDaEUsT0FBTyxDQUFDLGlCQUFpQixFQUFFRCxJQUFJLENBQUMsQ0FBQztJQUNyQztBQUNKO0FBR0EsV0FBYUUsd0JBQU47SUFHTEMsR0FBWTtJQUlaQyxPQUFnQjtJQUdoQlQsU0FBd0I7QUFDMUI7O0lBVEdILFdBQVc7UUFBRWEsWUFBWTtJQUFPOztHQUZ0Qkg7O0lBS1ZaLE1BQU07UUFBRWdCLE1BQU07SUFBYTtJQUMzQmIsU0FBUztRQUFFYyxXQUFXO1FBQVdDLE1BQU1aO0lBQWU7O0dBTjVDTTs7SUFTVlgsU0FBUztRQUFFa0IsUUFBUSxJQUFNZDtRQUFVZSxZQUFZO0lBQUs7dUNBQzFDLCtCQUFBO0dBVkFSO0FBQUFBO0lBRFpiO0dBQ1lhIn0=