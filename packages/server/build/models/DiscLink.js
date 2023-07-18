function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
import { Entity, ManyToOne, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { Disc } from "./Disc.js";
export let DiscLink = class DiscLink {
    [OptionalProps];
    id;
    type;
    url;
    disc;
};
_ts_decorate([
    PrimaryKey({
        columnType: 'uuid',
        defaultRaw: `gen_random_uuid()`
    }),
    _ts_metadata("design:type", String)
], DiscLink.prototype, "id", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], DiscLink.prototype, "type", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], DiscLink.prototype, "url", void 0);
_ts_decorate([
    ManyToOne({
        entity: ()=>Disc,
        onDelete: 'cascade',
        index: 'disc_link_disc_idx'
    }),
    _ts_metadata("design:type", typeof Rel === "undefined" ? Object : Rel)
], DiscLink.prototype, "disc", void 0);
DiscLink = _ts_decorate([
    Entity()
], DiscLink);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvRGlzY0xpbmsudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBSZWwgfSBmcm9tICdAbWlrcm8tb3JtL2NvcmUnO1xuaW1wb3J0IHsgRW50aXR5LCBNYW55VG9PbmUsIE9wdGlvbmFsUHJvcHMsIFByaW1hcnlLZXksIFByb3BlcnR5IH0gZnJvbSAnQG1pa3JvLW9ybS9jb3JlJztcbmltcG9ydCB7IERpc2MgfSBmcm9tICcuL0Rpc2MuanMnO1xuXG5ARW50aXR5KClcbmV4cG9ydCBjbGFzcyBEaXNjTGluayB7XG5cbiAgW09wdGlvbmFsUHJvcHNdPzogJ2lkJztcblxuICBAUHJpbWFyeUtleSh7IGNvbHVtblR5cGU6ICd1dWlkJywgZGVmYXVsdFJhdzogYGdlbl9yYW5kb21fdXVpZCgpYCB9KVxuICBpZCE6IHN0cmluZztcblxuICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gIHR5cGU/OiBzdHJpbmc7XG5cbiAgQFByb3BlcnR5KHsgY29sdW1uVHlwZTogJ3RleHQnLCBudWxsYWJsZTogdHJ1ZSB9KVxuICB1cmw/OiBzdHJpbmc7XG5cbiAgQE1hbnlUb09uZSh7IGVudGl0eTogKCkgPT4gRGlzYywgb25EZWxldGU6ICdjYXNjYWRlJywgaW5kZXg6ICdkaXNjX2xpbmtfZGlzY19pZHgnIH0pXG4gIGRpc2MhOiBSZWw8RGlzYz47XG5cbn1cbiJdLCJuYW1lcyI6WyJFbnRpdHkiLCJNYW55VG9PbmUiLCJPcHRpb25hbFByb3BzIiwiUHJpbWFyeUtleSIsIlByb3BlcnR5IiwiRGlzYyIsIkRpc2NMaW5rIiwiaWQiLCJ0eXBlIiwidXJsIiwiZGlzYyIsImNvbHVtblR5cGUiLCJkZWZhdWx0UmF3IiwibnVsbGFibGUiLCJlbnRpdHkiLCJvbkRlbGV0ZSIsImluZGV4Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFDQSxTQUFTQSxNQUFNLEVBQUVDLFNBQVMsRUFBRUMsYUFBYSxFQUFFQyxVQUFVLEVBQUVDLFFBQVEsUUFBUSxrQkFBa0I7QUFDekYsU0FBU0MsSUFBSSxRQUFRLFlBQVk7QUFHakMsV0FBYUMsV0FBTjtJQUVMLENBQUNKLGNBQWMsQ0FBUTtJQUd2QkssR0FBWTtJQUdaQyxLQUFjO0lBR2RDLElBQWE7SUFHYkMsS0FBaUI7QUFFbkI7O0lBWkdQLFdBQVc7UUFBRVEsWUFBWTtRQUFRQyxZQUFZLENBQUMsaUJBQWlCLENBQUM7SUFBQzs7R0FKdkROOztJQU9WRixTQUFTO1FBQUVPLFlBQVk7UUFBUUUsVUFBVTtJQUFLOztHQVBwQ1A7O0lBVVZGLFNBQVM7UUFBRU8sWUFBWTtRQUFRRSxVQUFVO0lBQUs7O0dBVnBDUDs7SUFhVkwsVUFBVTtRQUFFYSxRQUFRLElBQU1UO1FBQU1VLFVBQVU7UUFBV0MsT0FBTztJQUFxQjt1Q0FDM0UsK0JBQUE7R0FkSVY7QUFBQUE7SUFEWk47R0FDWU0ifQ==