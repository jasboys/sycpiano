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
export let Acclaim = class Acclaim {
    [OptionalProps];
    id;
    quote;
    short;
    author;
    shortAuthor;
    website;
    hasFullDate = true;
    date;
};
_ts_decorate([
    PrimaryKey(),
    _ts_metadata("design:type", Number)
], Acclaim.prototype, "id", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Acclaim.prototype, "quote", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Acclaim.prototype, "short", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Acclaim.prototype, "author", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Acclaim.prototype, "shortAuthor", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Acclaim.prototype, "website", void 0);
_ts_decorate([
    Property({
        default: true
    }),
    _ts_metadata("design:type", Boolean)
], Acclaim.prototype, "hasFullDate", void 0);
_ts_decorate([
    Property({
        columnType: 'date',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Acclaim.prototype, "date", void 0);
Acclaim = _ts_decorate([
    Entity()
], Acclaim);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvQWNjbGFpbS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbnRpdHksIE9wdGlvbmFsUHJvcHMsIFByaW1hcnlLZXksIFByb3BlcnR5IH0gZnJvbSAnQG1pa3JvLW9ybS9jb3JlJztcclxuXHJcbkBFbnRpdHkoKVxyXG5leHBvcnQgY2xhc3MgQWNjbGFpbSB7XHJcblxyXG4gIFtPcHRpb25hbFByb3BzXT86ICdoYXNGdWxsRGF0ZSc7XHJcblxyXG4gIEBQcmltYXJ5S2V5KClcclxuICBpZCE6IG51bWJlcjtcclxuXHJcbiAgQFByb3BlcnR5KHsgY29sdW1uVHlwZTogJ3RleHQnLCBudWxsYWJsZTogdHJ1ZSB9KVxyXG4gIHF1b3RlPzogc3RyaW5nO1xyXG5cclxuICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXHJcbiAgc2hvcnQ/OiBzdHJpbmc7XHJcblxyXG4gIEBQcm9wZXJ0eSh7IGNvbHVtblR5cGU6ICd0ZXh0JywgbnVsbGFibGU6IHRydWUgfSlcclxuICBhdXRob3I/OiBzdHJpbmc7XHJcblxyXG4gIEBQcm9wZXJ0eSh7IGNvbHVtblR5cGU6ICd0ZXh0JywgbnVsbGFibGU6IHRydWUgfSlcclxuICBzaG9ydEF1dGhvcj86IHN0cmluZztcclxuXHJcbiAgQFByb3BlcnR5KHsgY29sdW1uVHlwZTogJ3RleHQnLCBudWxsYWJsZTogdHJ1ZSB9KVxyXG4gIHdlYnNpdGU/OiBzdHJpbmc7XHJcblxyXG4gIEBQcm9wZXJ0eSh7IGRlZmF1bHQ6IHRydWUgfSlcclxuICBoYXNGdWxsRGF0ZTogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gIEBQcm9wZXJ0eSh7IGNvbHVtblR5cGU6ICdkYXRlJywgbnVsbGFibGU6IHRydWUgfSlcclxuICBkYXRlPzogc3RyaW5nO1xyXG5cclxufVxyXG4iXSwibmFtZXMiOlsiRW50aXR5IiwiT3B0aW9uYWxQcm9wcyIsIlByaW1hcnlLZXkiLCJQcm9wZXJ0eSIsIkFjY2xhaW0iLCJpZCIsInF1b3RlIiwic2hvcnQiLCJhdXRob3IiLCJzaG9ydEF1dGhvciIsIndlYnNpdGUiLCJoYXNGdWxsRGF0ZSIsImRhdGUiLCJjb2x1bW5UeXBlIiwibnVsbGFibGUiLCJkZWZhdWx0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxTQUFTQSxNQUFNLEVBQUVDLGFBQWEsRUFBRUMsVUFBVSxFQUFFQyxRQUFRLFFBQVEsa0JBQWtCO0FBRzlFLFdBQWFDLFVBQU47SUFFTCxDQUFDSCxjQUFjLENBQWlCO0lBR2hDSSxHQUFZO0lBR1pDLE1BQWU7SUFHZkMsTUFBZTtJQUdmQyxPQUFnQjtJQUdoQkMsWUFBcUI7SUFHckJDLFFBQWlCO0lBR2pCQyxjQUF1QixLQUFLO0lBRzVCQyxLQUFjO0FBRWhCOztJQXhCR1Y7O0dBSlVFOztJQU9WRCxTQUFTO1FBQUVVLFlBQVk7UUFBUUMsVUFBVTtJQUFLOztHQVBwQ1Y7O0lBVVZELFNBQVM7UUFBRVUsWUFBWTtRQUFRQyxVQUFVO0lBQUs7O0dBVnBDVjs7SUFhVkQsU0FBUztRQUFFVSxZQUFZO1FBQVFDLFVBQVU7SUFBSzs7R0FicENWOztJQWdCVkQsU0FBUztRQUFFVSxZQUFZO1FBQVFDLFVBQVU7SUFBSzs7R0FoQnBDVjs7SUFtQlZELFNBQVM7UUFBRVUsWUFBWTtRQUFRQyxVQUFVO0lBQUs7O0dBbkJwQ1Y7O0lBc0JWRCxTQUFTO1FBQUVZLFNBQVM7SUFBSzs7R0F0QmZYOztJQXlCVkQsU0FBUztRQUFFVSxZQUFZO1FBQVFDLFVBQVU7SUFBSzs7R0F6QnBDVjtBQUFBQTtJQURaSjtHQUNZSSJ9