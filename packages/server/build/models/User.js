function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
import { Collection, Entity, ManyToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Product } from "./Product.js";
import { UserProduct } from "./UserProduct.js";
export let User = class User {
    id;
    createdAt;
    updatedAt;
    username;
    passHash;
    pasetoSecret;
    resetToken;
    role;
    session;
    lastRequest;
    products = new Collection(this);
};
_ts_decorate([
    PrimaryKey({
        columnType: 'text'
    }),
    _ts_metadata("design:type", String)
], User.prototype, "id", void 0);
_ts_decorate([
    Property({
        length: 6,
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], User.prototype, "createdAt", void 0);
_ts_decorate([
    Property({
        length: 6,
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], User.prototype, "updatedAt", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], User.prototype, "username", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], User.prototype, "passHash", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], User.prototype, "pasetoSecret", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], User.prototype, "resetToken", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], User.prototype, "role", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], User.prototype, "session", void 0);
_ts_decorate([
    Property({
        length: 6,
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], User.prototype, "lastRequest", void 0);
_ts_decorate([
    ManyToMany({
        entity: ()=>Product,
        pivotEntity: ()=>UserProduct
    })
], User.prototype, "products", void 0);
User = _ts_decorate([
    Entity()
], User);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvVXNlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb2xsZWN0aW9uLCBFbnRpdHksIE1hbnlUb01hbnksIFByaW1hcnlLZXksIFByb3BlcnR5IH0gZnJvbSAnQG1pa3JvLW9ybS9jb3JlJztcbmltcG9ydCB7IFByb2R1Y3QgfSBmcm9tICcuL1Byb2R1Y3QuanMnO1xuaW1wb3J0IHsgVXNlclByb2R1Y3QgfSBmcm9tICcuL1VzZXJQcm9kdWN0LmpzJztcblxuQEVudGl0eSgpXG5leHBvcnQgY2xhc3MgVXNlciB7XG5cbiAgQFByaW1hcnlLZXkoeyBjb2x1bW5UeXBlOiAndGV4dCcgfSlcbiAgaWQhOiBzdHJpbmc7XG5cbiAgQFByb3BlcnR5KHsgbGVuZ3RoOiA2LCBudWxsYWJsZTogdHJ1ZSB9KVxuICBjcmVhdGVkQXQ/OiBEYXRlO1xuXG4gIEBQcm9wZXJ0eSh7IGxlbmd0aDogNiwgbnVsbGFibGU6IHRydWUgfSlcbiAgdXBkYXRlZEF0PzogRGF0ZTtcblxuICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gIHVzZXJuYW1lPzogc3RyaW5nO1xuXG4gIEBQcm9wZXJ0eSh7IGNvbHVtblR5cGU6ICd0ZXh0JywgbnVsbGFibGU6IHRydWUgfSlcbiAgcGFzc0hhc2g/OiBzdHJpbmc7XG5cbiAgQFByb3BlcnR5KHsgY29sdW1uVHlwZTogJ3RleHQnLCBudWxsYWJsZTogdHJ1ZSB9KVxuICBwYXNldG9TZWNyZXQ/OiBzdHJpbmc7XG5cbiAgQFByb3BlcnR5KHsgY29sdW1uVHlwZTogJ3RleHQnLCBudWxsYWJsZTogdHJ1ZSB9KVxuICByZXNldFRva2VuPzogc3RyaW5nO1xuXG4gIEBQcm9wZXJ0eSh7IGNvbHVtblR5cGU6ICd0ZXh0JywgbnVsbGFibGU6IHRydWUgfSlcbiAgcm9sZT86IHN0cmluZztcblxuICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gIHNlc3Npb24/OiBzdHJpbmc7XG5cbiAgQFByb3BlcnR5KHsgbGVuZ3RoOiA2LCBudWxsYWJsZTogdHJ1ZSB9KVxuICBsYXN0UmVxdWVzdD86IERhdGU7XG5cbiAgQE1hbnlUb01hbnkoeyBlbnRpdHk6ICgpID0+IFByb2R1Y3QsIHBpdm90RW50aXR5OiAoKSA9PiBVc2VyUHJvZHVjdCB9KVxuICBwcm9kdWN0cyA9IG5ldyBDb2xsZWN0aW9uPFByb2R1Y3Q+KHRoaXMpO1xuXG59XG4iXSwibmFtZXMiOlsiQ29sbGVjdGlvbiIsIkVudGl0eSIsIk1hbnlUb01hbnkiLCJQcmltYXJ5S2V5IiwiUHJvcGVydHkiLCJQcm9kdWN0IiwiVXNlclByb2R1Y3QiLCJVc2VyIiwiaWQiLCJjcmVhdGVkQXQiLCJ1cGRhdGVkQXQiLCJ1c2VybmFtZSIsInBhc3NIYXNoIiwicGFzZXRvU2VjcmV0IiwicmVzZXRUb2tlbiIsInJvbGUiLCJzZXNzaW9uIiwibGFzdFJlcXVlc3QiLCJwcm9kdWN0cyIsImNvbHVtblR5cGUiLCJsZW5ndGgiLCJudWxsYWJsZSIsImVudGl0eSIsInBpdm90RW50aXR5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxTQUFTQSxVQUFVLEVBQUVDLE1BQU0sRUFBRUMsVUFBVSxFQUFFQyxVQUFVLEVBQUVDLFFBQVEsUUFBUSxrQkFBa0I7QUFDdkYsU0FBU0MsT0FBTyxRQUFRLGVBQWU7QUFDdkMsU0FBU0MsV0FBVyxRQUFRLG1CQUFtQjtBQUcvQyxXQUFhQyxPQUFOO0lBR0xDLEdBQVk7SUFHWkMsVUFBaUI7SUFHakJDLFVBQWlCO0lBR2pCQyxTQUFrQjtJQUdsQkMsU0FBa0I7SUFHbEJDLGFBQXNCO0lBR3RCQyxXQUFvQjtJQUdwQkMsS0FBYztJQUdkQyxRQUFpQjtJQUdqQkMsWUFBbUI7SUFHbkJDLFdBQVcsSUFBSWxCLFdBQW9CLElBQUksRUFBRTtBQUUzQzs7SUFqQ0dHLFdBQVc7UUFBRWdCLFlBQVk7SUFBTzs7R0FGdEJaOztJQUtWSCxTQUFTO1FBQUVnQixRQUFRO1FBQUdDLFVBQVU7SUFBSzt1Q0FDMUIsZ0NBQUE7R0FORGQ7O0lBUVZILFNBQVM7UUFBRWdCLFFBQVE7UUFBR0MsVUFBVTtJQUFLO3VDQUMxQixnQ0FBQTtHQVREZDs7SUFXVkgsU0FBUztRQUFFZSxZQUFZO1FBQVFFLFVBQVU7SUFBSzs7R0FYcENkOztJQWNWSCxTQUFTO1FBQUVlLFlBQVk7UUFBUUUsVUFBVTtJQUFLOztHQWRwQ2Q7O0lBaUJWSCxTQUFTO1FBQUVlLFlBQVk7UUFBUUUsVUFBVTtJQUFLOztHQWpCcENkOztJQW9CVkgsU0FBUztRQUFFZSxZQUFZO1FBQVFFLFVBQVU7SUFBSzs7R0FwQnBDZDs7SUF1QlZILFNBQVM7UUFBRWUsWUFBWTtRQUFRRSxVQUFVO0lBQUs7O0dBdkJwQ2Q7O0lBMEJWSCxTQUFTO1FBQUVlLFlBQVk7UUFBUUUsVUFBVTtJQUFLOztHQTFCcENkOztJQTZCVkgsU0FBUztRQUFFZ0IsUUFBUTtRQUFHQyxVQUFVO0lBQUs7dUNBQ3hCLGdDQUFBO0dBOUJIZDs7SUFnQ1ZMLFdBQVc7UUFBRW9CLFFBQVEsSUFBTWpCO1FBQVNrQixhQUFhLElBQU1qQjtJQUFZO0dBaEN6REM7QUFBQUE7SUFEWk47R0FDWU0ifQ==