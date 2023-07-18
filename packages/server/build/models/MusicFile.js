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
import { Music } from "./Music.js";
export let MusicFile = class MusicFile {
    [OptionalProps];
    id;
    name;
    audioFile;
    waveformFile;
    durationSeconds;
    music;
    hash;
};
_ts_decorate([
    PrimaryKey({
        columnType: 'uuid',
        defaultRaw: `gen_random_uuid()`
    }),
    _ts_metadata("design:type", String)
], MusicFile.prototype, "id", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], MusicFile.prototype, "name", void 0);
_ts_decorate([
    Property({
        columnType: 'text'
    }),
    _ts_metadata("design:type", String)
], MusicFile.prototype, "audioFile", void 0);
_ts_decorate([
    Property({
        columnType: 'text'
    }),
    _ts_metadata("design:type", String)
], MusicFile.prototype, "waveformFile", void 0);
_ts_decorate([
    Property(),
    _ts_metadata("design:type", Number)
], MusicFile.prototype, "durationSeconds", void 0);
_ts_decorate([
    ManyToOne({
        entity: ()=>Music,
        onDelete: 'cascade',
        index: 'music_file_music_idx'
    }),
    _ts_metadata("design:type", typeof Rel === "undefined" ? Object : Rel)
], MusicFile.prototype, "music", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], MusicFile.prototype, "hash", void 0);
MusicFile = _ts_decorate([
    Entity()
], MusicFile);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvTXVzaWNGaWxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUmVsIH0gZnJvbSAnQG1pa3JvLW9ybS9jb3JlJztcbmltcG9ydCB7IEVudGl0eSwgTWFueVRvT25lLCBPcHRpb25hbFByb3BzLCBQcmltYXJ5S2V5LCBQcm9wZXJ0eSB9IGZyb20gJ0BtaWtyby1vcm0vY29yZSc7XG5pbXBvcnQgeyBNdXNpYyB9IGZyb20gJy4vTXVzaWMuanMnO1xuXG5ARW50aXR5KClcbmV4cG9ydCBjbGFzcyBNdXNpY0ZpbGUge1xuXG4gIFtPcHRpb25hbFByb3BzXT86ICdpZCc7XG5cbiAgQFByaW1hcnlLZXkoeyBjb2x1bW5UeXBlOiAndXVpZCcsIGRlZmF1bHRSYXc6IGBnZW5fcmFuZG9tX3V1aWQoKWAgfSlcbiAgaWQhOiBzdHJpbmc7XG5cbiAgQFByb3BlcnR5KHsgY29sdW1uVHlwZTogJ3RleHQnLCBudWxsYWJsZTogdHJ1ZSB9KVxuICBuYW1lPzogc3RyaW5nO1xuXG4gIEBQcm9wZXJ0eSh7IGNvbHVtblR5cGU6ICd0ZXh0JyB9KVxuICBhdWRpb0ZpbGUhOiBzdHJpbmc7XG5cbiAgQFByb3BlcnR5KHsgY29sdW1uVHlwZTogJ3RleHQnIH0pXG4gIHdhdmVmb3JtRmlsZSE6IHN0cmluZztcblxuICBAUHJvcGVydHkoKVxuICBkdXJhdGlvblNlY29uZHMhOiBudW1iZXI7XG5cbiAgQE1hbnlUb09uZSh7IGVudGl0eTogKCkgPT4gTXVzaWMsIG9uRGVsZXRlOiAnY2FzY2FkZScsIGluZGV4OiAnbXVzaWNfZmlsZV9tdXNpY19pZHgnIH0pXG4gIG11c2ljITogUmVsPE11c2ljPjtcblxuICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gIGhhc2ghOiBzdHJpbmc7XG5cbn1cbiJdLCJuYW1lcyI6WyJFbnRpdHkiLCJNYW55VG9PbmUiLCJPcHRpb25hbFByb3BzIiwiUHJpbWFyeUtleSIsIlByb3BlcnR5IiwiTXVzaWMiLCJNdXNpY0ZpbGUiLCJpZCIsIm5hbWUiLCJhdWRpb0ZpbGUiLCJ3YXZlZm9ybUZpbGUiLCJkdXJhdGlvblNlY29uZHMiLCJtdXNpYyIsImhhc2giLCJjb2x1bW5UeXBlIiwiZGVmYXVsdFJhdyIsIm51bGxhYmxlIiwiZW50aXR5Iiwib25EZWxldGUiLCJpbmRleCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQ0EsU0FBU0EsTUFBTSxFQUFFQyxTQUFTLEVBQUVDLGFBQWEsRUFBRUMsVUFBVSxFQUFFQyxRQUFRLFFBQVEsa0JBQWtCO0FBQ3pGLFNBQVNDLEtBQUssUUFBUSxhQUFhO0FBR25DLFdBQWFDLFlBQU47SUFFTCxDQUFDSixjQUFjLENBQVE7SUFHdkJLLEdBQVk7SUFHWkMsS0FBYztJQUdkQyxVQUFtQjtJQUduQkMsYUFBc0I7SUFHdEJDLGdCQUF5QjtJQUd6QkMsTUFBbUI7SUFHbkJDLEtBQWM7QUFFaEI7O0lBckJHVixXQUFXO1FBQUVXLFlBQVk7UUFBUUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDO0lBQUM7O0dBSnZEVDs7SUFPVkYsU0FBUztRQUFFVSxZQUFZO1FBQVFFLFVBQVU7SUFBSzs7R0FQcENWOztJQVVWRixTQUFTO1FBQUVVLFlBQVk7SUFBTzs7R0FWcEJSOztJQWFWRixTQUFTO1FBQUVVLFlBQVk7SUFBTzs7R0FicEJSOztJQWdCVkY7O0dBaEJVRTs7SUFtQlZMLFVBQVU7UUFBRWdCLFFBQVEsSUFBTVo7UUFBT2EsVUFBVTtRQUFXQyxPQUFPO0lBQXVCO3VDQUM3RSwrQkFBQTtHQXBCR2I7O0lBc0JWRixTQUFTO1FBQUVVLFlBQVk7UUFBUUUsVUFBVTtJQUFLOztHQXRCcENWO0FBQUFBO0lBRFpOO0dBQ1lNIn0=