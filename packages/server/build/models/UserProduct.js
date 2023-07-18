function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
import { Entity, ManyToOne } from "@mikro-orm/core";
import { Product } from "./Product.js";
import { User } from "./User.js";
export let UserProduct = class UserProduct {
    user;
    product;
};
_ts_decorate([
    ManyToOne({
        entity: ()=>User,
        onDelete: 'cascade',
        primary: true,
        index: 'user_product_user_idx'
    }),
    _ts_metadata("design:type", typeof Rel === "undefined" ? Object : Rel)
], UserProduct.prototype, "user", void 0);
_ts_decorate([
    ManyToOne({
        entity: ()=>Product,
        onDelete: 'cascade',
        primary: true,
        index: 'user_product_product_idx'
    }),
    _ts_metadata("design:type", typeof Rel === "undefined" ? Object : Rel)
], UserProduct.prototype, "product", void 0);
UserProduct = _ts_decorate([
    Entity()
], UserProduct);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvVXNlclByb2R1Y3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBSZWwgfSBmcm9tICdAbWlrcm8tb3JtL2NvcmUnO1xuaW1wb3J0IHsgRW50aXR5LCBNYW55VG9PbmUgfSBmcm9tICdAbWlrcm8tb3JtL2NvcmUnO1xuaW1wb3J0IHsgUHJvZHVjdCB9IGZyb20gJy4vUHJvZHVjdC5qcyc7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi9Vc2VyLmpzJztcblxuQEVudGl0eSgpXG5leHBvcnQgY2xhc3MgVXNlclByb2R1Y3Qge1xuXG4gIEBNYW55VG9PbmUoeyBlbnRpdHk6ICgpID0+IFVzZXIsIG9uRGVsZXRlOiAnY2FzY2FkZScsIHByaW1hcnk6IHRydWUsIGluZGV4OiAndXNlcl9wcm9kdWN0X3VzZXJfaWR4JyB9KVxuICB1c2VyITogUmVsPFVzZXI+O1xuXG4gIEBNYW55VG9PbmUoeyBlbnRpdHk6ICgpID0+IFByb2R1Y3QsIG9uRGVsZXRlOiAnY2FzY2FkZScsIHByaW1hcnk6IHRydWUsIGluZGV4OiAndXNlcl9wcm9kdWN0X3Byb2R1Y3RfaWR4JyB9KVxuICBwcm9kdWN0ITogUmVsPFByb2R1Y3Q+O1xuXG59XG4iXSwibmFtZXMiOlsiRW50aXR5IiwiTWFueVRvT25lIiwiUHJvZHVjdCIsIlVzZXIiLCJVc2VyUHJvZHVjdCIsInVzZXIiLCJwcm9kdWN0IiwiZW50aXR5Iiwib25EZWxldGUiLCJwcmltYXJ5IiwiaW5kZXgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUNBLFNBQVNBLE1BQU0sRUFBRUMsU0FBUyxRQUFRLGtCQUFrQjtBQUNwRCxTQUFTQyxPQUFPLFFBQVEsZUFBZTtBQUN2QyxTQUFTQyxJQUFJLFFBQVEsWUFBWTtBQUdqQyxXQUFhQyxjQUFOO0lBR0xDLEtBQWlCO0lBR2pCQyxRQUF1QjtBQUV6Qjs7SUFOR0wsVUFBVTtRQUFFTSxRQUFRLElBQU1KO1FBQU1LLFVBQVU7UUFBV0MsU0FBUztRQUFNQyxPQUFPO0lBQXdCO3VDQUM3RiwrQkFBQTtHQUhJTjs7SUFLVkgsVUFBVTtRQUFFTSxRQUFRLElBQU1MO1FBQVNNLFVBQVU7UUFBV0MsU0FBUztRQUFNQyxPQUFPO0lBQTJCO3VDQUNoRywrQkFBQTtHQU5DTjtBQUFBQTtJQURaSjtHQUNZSSJ9