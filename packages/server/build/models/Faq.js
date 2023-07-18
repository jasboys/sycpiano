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
export let Faq = class Faq {
    [OptionalProps];
    id;
    question;
    answer;
    createdAt;
    updatedAt;
    order;
};
_ts_decorate([
    PrimaryKey({
        columnType: 'uuid',
        defaultRaw: `gen_random_uuid()`
    }),
    _ts_metadata("design:type", String)
], Faq.prototype, "id", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Faq.prototype, "question", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Faq.prototype, "answer", void 0);
_ts_decorate([
    Property({
        length: 6,
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Faq.prototype, "createdAt", void 0);
_ts_decorate([
    Property({
        length: 6,
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Faq.prototype, "updatedAt", void 0);
_ts_decorate([
    Property({
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], Faq.prototype, "order", void 0);
Faq = _ts_decorate([
    Entity()
], Faq);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvRmFxLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVudGl0eSwgT3B0aW9uYWxQcm9wcywgUHJpbWFyeUtleSwgUHJvcGVydHkgfSBmcm9tICdAbWlrcm8tb3JtL2NvcmUnO1xuXG5ARW50aXR5KClcbmV4cG9ydCBjbGFzcyBGYXEge1xuXG4gIFtPcHRpb25hbFByb3BzXT86ICdpZCc7XG5cbiAgQFByaW1hcnlLZXkoeyBjb2x1bW5UeXBlOiAndXVpZCcsIGRlZmF1bHRSYXc6IGBnZW5fcmFuZG9tX3V1aWQoKWAgfSlcbiAgaWQhOiBzdHJpbmc7XG5cbiAgQFByb3BlcnR5KHsgY29sdW1uVHlwZTogJ3RleHQnLCBudWxsYWJsZTogdHJ1ZSB9KVxuICBxdWVzdGlvbj86IHN0cmluZztcblxuICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gIGFuc3dlcj86IHN0cmluZztcblxuICBAUHJvcGVydHkoeyBsZW5ndGg6IDYsIG51bGxhYmxlOiB0cnVlIH0pXG4gIGNyZWF0ZWRBdD86IERhdGU7XG5cbiAgQFByb3BlcnR5KHsgbGVuZ3RoOiA2LCBudWxsYWJsZTogdHJ1ZSB9KVxuICB1cGRhdGVkQXQ/OiBEYXRlO1xuXG4gIEBQcm9wZXJ0eSh7IG51bGxhYmxlOiB0cnVlIH0pXG4gIG9yZGVyPzogbnVtYmVyO1xuXG59XG4iXSwibmFtZXMiOlsiRW50aXR5IiwiT3B0aW9uYWxQcm9wcyIsIlByaW1hcnlLZXkiLCJQcm9wZXJ0eSIsIkZhcSIsImlkIiwicXVlc3Rpb24iLCJhbnN3ZXIiLCJjcmVhdGVkQXQiLCJ1cGRhdGVkQXQiLCJvcmRlciIsImNvbHVtblR5cGUiLCJkZWZhdWx0UmF3IiwibnVsbGFibGUiLCJsZW5ndGgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLFNBQVNBLE1BQU0sRUFBRUMsYUFBYSxFQUFFQyxVQUFVLEVBQUVDLFFBQVEsUUFBUSxrQkFBa0I7QUFHOUUsV0FBYUMsTUFBTjtJQUVMLENBQUNILGNBQWMsQ0FBUTtJQUd2QkksR0FBWTtJQUdaQyxTQUFrQjtJQUdsQkMsT0FBZ0I7SUFHaEJDLFVBQWlCO0lBR2pCQyxVQUFpQjtJQUdqQkMsTUFBZTtBQUVqQjs7SUFsQkdSLFdBQVc7UUFBRVMsWUFBWTtRQUFRQyxZQUFZLENBQUMsaUJBQWlCLENBQUM7SUFBQzs7R0FKdkRSOztJQU9WRCxTQUFTO1FBQUVRLFlBQVk7UUFBUUUsVUFBVTtJQUFLOztHQVBwQ1Q7O0lBVVZELFNBQVM7UUFBRVEsWUFBWTtRQUFRRSxVQUFVO0lBQUs7O0dBVnBDVDs7SUFhVkQsU0FBUztRQUFFVyxRQUFRO1FBQUdELFVBQVU7SUFBSzt1Q0FDMUIsZ0NBQUE7R0FkRFQ7O0lBZ0JWRCxTQUFTO1FBQUVXLFFBQVE7UUFBR0QsVUFBVTtJQUFLO3VDQUMxQixnQ0FBQTtHQWpCRFQ7O0lBbUJWRCxTQUFTO1FBQUVVLFVBQVU7SUFBSzs7R0FuQmhCVDtBQUFBQTtJQURaSjtHQUNZSSJ9