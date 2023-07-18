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
export let Token = class Token {
    id;
    token;
    expires;
};
_ts_decorate([
    PrimaryKey({
        columnType: 'text'
    }),
    _ts_metadata("design:type", String)
], Token.prototype, "id", void 0);
_ts_decorate([
    Property({
        columnType: 'text'
    }),
    _ts_metadata("design:type", String)
], Token.prototype, "token", void 0);
_ts_decorate([
    Property({
        length: 6,
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Token.prototype, "expires", void 0);
Token = _ts_decorate([
    Entity()
], Token);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvVG9rZW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRW50aXR5LCBQcmltYXJ5S2V5LCBQcm9wZXJ0eSB9IGZyb20gJ0BtaWtyby1vcm0vY29yZSc7XG5cbkBFbnRpdHkoKVxuZXhwb3J0IGNsYXNzIFRva2VuIHtcblxuICBAUHJpbWFyeUtleSh7IGNvbHVtblR5cGU6ICd0ZXh0JyB9KVxuICBpZCE6IHN0cmluZztcblxuICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcgfSlcbiAgdG9rZW4hOiBzdHJpbmc7XG5cbiAgQFByb3BlcnR5KHsgbGVuZ3RoOiA2LCBudWxsYWJsZTogdHJ1ZSB9KVxuICBleHBpcmVzPzogRGF0ZTtcbn1cbiJdLCJuYW1lcyI6WyJFbnRpdHkiLCJQcmltYXJ5S2V5IiwiUHJvcGVydHkiLCJUb2tlbiIsImlkIiwidG9rZW4iLCJleHBpcmVzIiwiY29sdW1uVHlwZSIsImxlbmd0aCIsIm51bGxhYmxlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxTQUFTQSxNQUFNLEVBQUVDLFVBQVUsRUFBRUMsUUFBUSxRQUFRLGtCQUFrQjtBQUcvRCxXQUFhQyxRQUFOO0lBR0xDLEdBQVk7SUFHWkMsTUFBZTtJQUdmQyxRQUFlO0FBQ2pCOztJQVJHTCxXQUFXO1FBQUVNLFlBQVk7SUFBTzs7R0FGdEJKOztJQUtWRCxTQUFTO1FBQUVLLFlBQVk7SUFBTzs7R0FMcEJKOztJQVFWRCxTQUFTO1FBQUVNLFFBQVE7UUFBR0MsVUFBVTtJQUFLO3VDQUM1QixnQ0FBQTtHQVRDTjtBQUFBQTtJQURaSDtHQUNZRyJ9