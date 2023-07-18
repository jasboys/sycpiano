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
import { DiscLink } from "./DiscLink.js";
export let Disc = class Disc {
    [OptionalProps];
    id;
    title;
    description;
    label;
    releaseDate;
    thumbnailFile;
    discLinks = new Collection(this);
};
_ts_decorate([
    PrimaryKey({
        columnType: 'uuid',
        defaultRaw: `gen_random_uuid()`
    }),
    _ts_metadata("design:type", String)
], Disc.prototype, "id", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Disc.prototype, "title", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Disc.prototype, "description", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Disc.prototype, "label", void 0);
_ts_decorate([
    Property({
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], Disc.prototype, "releaseDate", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Disc.prototype, "thumbnailFile", void 0);
_ts_decorate([
    OneToMany({
        entity: ()=>DiscLink,
        mappedBy: 'disc'
    })
], Disc.prototype, "discLinks", void 0);
Disc = _ts_decorate([
    Entity()
], Disc);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvRGlzYy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb2xsZWN0aW9uLCBFbnRpdHksIE9uZVRvTWFueSwgT3B0aW9uYWxQcm9wcywgUHJpbWFyeUtleSwgUHJvcGVydHkgfSBmcm9tICdAbWlrcm8tb3JtL2NvcmUnO1xuaW1wb3J0IHsgRGlzY0xpbmsgfSBmcm9tICcuL0Rpc2NMaW5rLmpzJztcblxuQEVudGl0eSgpXG5leHBvcnQgY2xhc3MgRGlzYyB7XG5cbiAgW09wdGlvbmFsUHJvcHNdPzogJ2lkJztcblxuICBAUHJpbWFyeUtleSh7IGNvbHVtblR5cGU6ICd1dWlkJywgZGVmYXVsdFJhdzogYGdlbl9yYW5kb21fdXVpZCgpYCB9KVxuICBpZCE6IHN0cmluZztcblxuICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gIHRpdGxlPzogc3RyaW5nO1xuXG4gIEBQcm9wZXJ0eSh7IGNvbHVtblR5cGU6ICd0ZXh0JywgbnVsbGFibGU6IHRydWUgfSlcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG5cbiAgQFByb3BlcnR5KHsgY29sdW1uVHlwZTogJ3RleHQnLCBudWxsYWJsZTogdHJ1ZSB9KVxuICBsYWJlbD86IHN0cmluZztcblxuICBAUHJvcGVydHkoeyBudWxsYWJsZTogdHJ1ZSB9KVxuICByZWxlYXNlRGF0ZT86IG51bWJlcjtcblxuICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gIHRodW1ibmFpbEZpbGU/OiBzdHJpbmc7XG5cbiAgQE9uZVRvTWFueSh7IGVudGl0eTogKCkgPT4gRGlzY0xpbmssIG1hcHBlZEJ5OiAnZGlzYycgfSlcbiAgZGlzY0xpbmtzID0gbmV3IENvbGxlY3Rpb248RGlzY0xpbms+KHRoaXMpO1xuXG59XG4iXSwibmFtZXMiOlsiQ29sbGVjdGlvbiIsIkVudGl0eSIsIk9uZVRvTWFueSIsIk9wdGlvbmFsUHJvcHMiLCJQcmltYXJ5S2V5IiwiUHJvcGVydHkiLCJEaXNjTGluayIsIkRpc2MiLCJpZCIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJsYWJlbCIsInJlbGVhc2VEYXRlIiwidGh1bWJuYWlsRmlsZSIsImRpc2NMaW5rcyIsImNvbHVtblR5cGUiLCJkZWZhdWx0UmF3IiwibnVsbGFibGUiLCJlbnRpdHkiLCJtYXBwZWRCeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsU0FBU0EsVUFBVSxFQUFFQyxNQUFNLEVBQUVDLFNBQVMsRUFBRUMsYUFBYSxFQUFFQyxVQUFVLEVBQUVDLFFBQVEsUUFBUSxrQkFBa0I7QUFDckcsU0FBU0MsUUFBUSxRQUFRLGdCQUFnQjtBQUd6QyxXQUFhQyxPQUFOO0lBRUwsQ0FBQ0osY0FBYyxDQUFRO0lBR3ZCSyxHQUFZO0lBR1pDLE1BQWU7SUFHZkMsWUFBcUI7SUFHckJDLE1BQWU7SUFHZkMsWUFBcUI7SUFHckJDLGNBQXVCO0lBR3ZCQyxZQUFZLElBQUlkLFdBQXFCLElBQUksRUFBRTtBQUU3Qzs7SUFyQkdJLFdBQVc7UUFBRVcsWUFBWTtRQUFRQyxZQUFZLENBQUMsaUJBQWlCLENBQUM7SUFBQzs7R0FKdkRUOztJQU9WRixTQUFTO1FBQUVVLFlBQVk7UUFBUUUsVUFBVTtJQUFLOztHQVBwQ1Y7O0lBVVZGLFNBQVM7UUFBRVUsWUFBWTtRQUFRRSxVQUFVO0lBQUs7O0dBVnBDVjs7SUFhVkYsU0FBUztRQUFFVSxZQUFZO1FBQVFFLFVBQVU7SUFBSzs7R0FicENWOztJQWdCVkYsU0FBUztRQUFFWSxVQUFVO0lBQUs7O0dBaEJoQlY7O0lBbUJWRixTQUFTO1FBQUVVLFlBQVk7UUFBUUUsVUFBVTtJQUFLOztHQW5CcENWOztJQXNCVkwsVUFBVTtRQUFFZ0IsUUFBUSxJQUFNWjtRQUFVYSxVQUFVO0lBQU87R0F0QjNDWjtBQUFBQTtJQURaTjtHQUNZTSJ9