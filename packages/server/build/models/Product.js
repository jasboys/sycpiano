function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
import { AfterDelete, BeforeCreate, BeforeUpdate, Collection, Entity, ManyToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { createProduct, deleteProduct, updateProduct } from "../stripe.js";
import { User } from "./User.js";
export const ProductTypes = [
    'arrangement',
    'cadenza',
    'original'
];
export let Product = class Product {
    id;
    name;
    file;
    description;
    sample;
    images;
    pages;
    price;
    type;
    priceId;
    createdAt;
    updatedAt;
    permalink;
    users = new Collection(this);
    async beforeCreate(args) {
        try {
            const [productId, priceId] = await createProduct(args.entity);
            args.entity.id = productId;
            args.entity.priceId = priceId;
        } catch (e) {
            console.log('Failed to get IDs for new product', e);
        }
    }
    async beforeUpdate(args) {
        try {
            const [productId, priceId] = await updateProduct(args.entity);
            args.entity.id = productId;
            args.entity.priceId = priceId;
        } catch (e) {
            console.log('Failed to get IDs for new product', e);
        }
    }
    async afterDelete(args) {
        try {
            await deleteProduct(args.entity.id);
        } catch (e) {
            console.log('Failed to call delete Stripe product API');
        }
    }
};
_ts_decorate([
    PrimaryKey({
        columnType: 'text'
    }),
    _ts_metadata("design:type", String)
], Product.prototype, "id", void 0);
_ts_decorate([
    Property({
        columnType: 'text'
    }),
    _ts_metadata("design:type", String)
], Product.prototype, "name", void 0);
_ts_decorate([
    Property({
        columnType: 'text'
    }),
    _ts_metadata("design:type", String)
], Product.prototype, "file", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Product.prototype, "description", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Product.prototype, "sample", void 0);
_ts_decorate([
    Property({
        nullable: true
    }),
    _ts_metadata("design:type", Array)
], Product.prototype, "images", void 0);
_ts_decorate([
    Property({
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], Product.prototype, "pages", void 0);
_ts_decorate([
    Property({}),
    _ts_metadata("design:type", Number)
], Product.prototype, "price", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Product.prototype, "type", void 0);
_ts_decorate([
    Property({
        columnType: 'text'
    }),
    _ts_metadata("design:type", String)
], Product.prototype, "priceId", void 0);
_ts_decorate([
    Property({
        length: 6,
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Product.prototype, "createdAt", void 0);
_ts_decorate([
    Property({
        length: 6,
        nullable: true
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Product.prototype, "updatedAt", void 0);
_ts_decorate([
    Property({
        columnType: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Product.prototype, "permalink", void 0);
_ts_decorate([
    ManyToMany({
        entity: ()=>User,
        mappedBy: (u)=>u.products
    })
], Product.prototype, "users", void 0);
_ts_decorate([
    BeforeCreate(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof EventArgs === "undefined" ? Object : EventArgs
    ])
], Product.prototype, "beforeCreate", null);
_ts_decorate([
    BeforeUpdate(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof EventArgs === "undefined" ? Object : EventArgs
    ])
], Product.prototype, "beforeUpdate", null);
_ts_decorate([
    AfterDelete(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof EventArgs === "undefined" ? Object : EventArgs
    ])
], Product.prototype, "afterDelete", null);
Product = _ts_decorate([
    Entity()
], Product);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvUHJvZHVjdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlckRlbGV0ZSwgQmVmb3JlQ3JlYXRlLCBCZWZvcmVVcGRhdGUsIENvbGxlY3Rpb24sIEVudGl0eSwgdHlwZSBFdmVudEFyZ3MsIE1hbnlUb01hbnksIFByaW1hcnlLZXksIFByb3BlcnR5IH0gZnJvbSAnQG1pa3JvLW9ybS9jb3JlJztcbmltcG9ydCB7IGNyZWF0ZVByb2R1Y3QsIGRlbGV0ZVByb2R1Y3QsIHVwZGF0ZVByb2R1Y3QgfSBmcm9tICcuLi9zdHJpcGUuanMnO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4vVXNlci5qcyc7XG5cbmV4cG9ydCBjb25zdCBQcm9kdWN0VHlwZXMgPSBbJ2FycmFuZ2VtZW50JywgJ2NhZGVuemEnLCAnb3JpZ2luYWwnXSBhcyBjb25zdDtcblxuQEVudGl0eSgpXG5leHBvcnQgY2xhc3MgUHJvZHVjdCB7XG5cbiAgICBAUHJpbWFyeUtleSh7IGNvbHVtblR5cGU6ICd0ZXh0JyB9KVxuICAgIGlkITogc3RyaW5nO1xuXG4gICAgQFByb3BlcnR5KHsgY29sdW1uVHlwZTogJ3RleHQnIH0pXG4gICAgbmFtZSE6IHN0cmluZztcblxuICAgIEBQcm9wZXJ0eSh7IGNvbHVtblR5cGU6ICd0ZXh0JyB9KVxuICAgIGZpbGUhOiBzdHJpbmc7XG5cbiAgICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG5cbiAgICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gICAgc2FtcGxlPzogc3RyaW5nO1xuXG4gICAgQFByb3BlcnR5KHsgbnVsbGFibGU6IHRydWUgfSlcbiAgICBpbWFnZXM/OiBzdHJpbmdbXTtcblxuICAgIEBQcm9wZXJ0eSh7IG51bGxhYmxlOiB0cnVlIH0pXG4gICAgcGFnZXM/OiBudW1iZXI7XG5cbiAgICBAUHJvcGVydHkoe30pXG4gICAgcHJpY2UhOiBudW1iZXI7XG5cbiAgICBAUHJvcGVydHkoeyBjb2x1bW5UeXBlOiAndGV4dCcsIG51bGxhYmxlOiB0cnVlIH0pXG4gICAgdHlwZT86IHN0cmluZztcblxuICAgIEBQcm9wZXJ0eSh7IGNvbHVtblR5cGU6ICd0ZXh0JyB9KVxuICAgIHByaWNlSWQhOiBzdHJpbmc7XG5cbiAgICBAUHJvcGVydHkoeyBsZW5ndGg6IDYsIG51bGxhYmxlOiB0cnVlIH0pXG4gICAgY3JlYXRlZEF0PzogRGF0ZTtcblxuICAgIEBQcm9wZXJ0eSh7IGxlbmd0aDogNiwgbnVsbGFibGU6IHRydWUgfSlcbiAgICB1cGRhdGVkQXQ/OiBEYXRlO1xuXG4gICAgQFByb3BlcnR5KHsgY29sdW1uVHlwZTogJ3RleHQnLCBudWxsYWJsZTogdHJ1ZSB9KVxuICAgIHBlcm1hbGluaz86IHN0cmluZztcblxuICAgIEBNYW55VG9NYW55KHsgZW50aXR5OiAoKSA9PiBVc2VyLCBtYXBwZWRCeTogdSA9PiB1LnByb2R1Y3RzIH0pXG4gICAgdXNlcnMgPSBuZXcgQ29sbGVjdGlvbjxVc2VyPih0aGlzKTtcblxuICAgIEBCZWZvcmVDcmVhdGUoKVxuICAgIGFzeW5jIGJlZm9yZUNyZWF0ZShhcmdzOiBFdmVudEFyZ3M8UHJvZHVjdD4pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IFtwcm9kdWN0SWQsIHByaWNlSWRdID0gYXdhaXQgY3JlYXRlUHJvZHVjdChhcmdzLmVudGl0eSk7XG4gICAgICAgICAgICBhcmdzLmVudGl0eS5pZCA9IHByb2R1Y3RJZDtcbiAgICAgICAgICAgIGFyZ3MuZW50aXR5LnByaWNlSWQgPSBwcmljZUlkO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRmFpbGVkIHRvIGdldCBJRHMgZm9yIG5ldyBwcm9kdWN0JywgZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBAQmVmb3JlVXBkYXRlKClcbiAgICBhc3luYyBiZWZvcmVVcGRhdGUoYXJnczogRXZlbnRBcmdzPFByb2R1Y3Q+KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBbcHJvZHVjdElkLCBwcmljZUlkXSA9IGF3YWl0IHVwZGF0ZVByb2R1Y3QoYXJncy5lbnRpdHkpO1xuICAgICAgICAgICAgYXJncy5lbnRpdHkuaWQgPSBwcm9kdWN0SWQ7XG4gICAgICAgICAgICBhcmdzLmVudGl0eS5wcmljZUlkID0gcHJpY2VJZDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0ZhaWxlZCB0byBnZXQgSURzIGZvciBuZXcgcHJvZHVjdCcsIGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQEFmdGVyRGVsZXRlKClcbiAgICBhc3luYyBhZnRlckRlbGV0ZShhcmdzOiBFdmVudEFyZ3M8UHJvZHVjdD4pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGRlbGV0ZVByb2R1Y3QoYXJncy5lbnRpdHkuaWQpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRmFpbGVkIHRvIGNhbGwgZGVsZXRlIFN0cmlwZSBwcm9kdWN0IEFQSScpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbIkFmdGVyRGVsZXRlIiwiQmVmb3JlQ3JlYXRlIiwiQmVmb3JlVXBkYXRlIiwiQ29sbGVjdGlvbiIsIkVudGl0eSIsIk1hbnlUb01hbnkiLCJQcmltYXJ5S2V5IiwiUHJvcGVydHkiLCJjcmVhdGVQcm9kdWN0IiwiZGVsZXRlUHJvZHVjdCIsInVwZGF0ZVByb2R1Y3QiLCJVc2VyIiwiUHJvZHVjdFR5cGVzIiwiUHJvZHVjdCIsImlkIiwibmFtZSIsImZpbGUiLCJkZXNjcmlwdGlvbiIsInNhbXBsZSIsImltYWdlcyIsInBhZ2VzIiwicHJpY2UiLCJ0eXBlIiwicHJpY2VJZCIsImNyZWF0ZWRBdCIsInVwZGF0ZWRBdCIsInBlcm1hbGluayIsInVzZXJzIiwiYmVmb3JlQ3JlYXRlIiwiYXJncyIsInByb2R1Y3RJZCIsImVudGl0eSIsImUiLCJjb25zb2xlIiwibG9nIiwiYmVmb3JlVXBkYXRlIiwiYWZ0ZXJEZWxldGUiLCJjb2x1bW5UeXBlIiwibnVsbGFibGUiLCJsZW5ndGgiLCJtYXBwZWRCeSIsInUiLCJwcm9kdWN0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsU0FBU0EsV0FBVyxFQUFFQyxZQUFZLEVBQUVDLFlBQVksRUFBRUMsVUFBVSxFQUFFQyxNQUFNLEVBQWtCQyxVQUFVLEVBQUVDLFVBQVUsRUFBRUMsUUFBUSxRQUFRLGtCQUFrQjtBQUNoSixTQUFTQyxhQUFhLEVBQUVDLGFBQWEsRUFBRUMsYUFBYSxRQUFRLGVBQWU7QUFDM0UsU0FBU0MsSUFBSSxRQUFRLFlBQVk7QUFFakMsT0FBTyxNQUFNQyxlQUFlO0lBQUM7SUFBZTtJQUFXO0NBQVcsQ0FBVTtBQUc1RSxXQUFhQyxVQUFOO0lBR0hDLEdBQVk7SUFHWkMsS0FBYztJQUdkQyxLQUFjO0lBR2RDLFlBQXFCO0lBR3JCQyxPQUFnQjtJQUdoQkMsT0FBa0I7SUFHbEJDLE1BQWU7SUFHZkMsTUFBZTtJQUdmQyxLQUFjO0lBR2RDLFFBQWlCO0lBR2pCQyxVQUFpQjtJQUdqQkMsVUFBaUI7SUFHakJDLFVBQW1CO0lBR25CQyxRQUFRLElBQUl4QixXQUFpQixJQUFJLEVBQUU7SUFFbkMsTUFDTXlCLGFBQWFDLElBQXdCLEVBQUU7UUFDekMsSUFBSTtZQUNBLE1BQU0sQ0FBQ0MsV0FBV1AsUUFBUSxHQUFHLE1BQU1mLGNBQWNxQixLQUFLRSxNQUFNO1lBQzVERixLQUFLRSxNQUFNLENBQUNqQixFQUFFLEdBQUdnQjtZQUNqQkQsS0FBS0UsTUFBTSxDQUFDUixPQUFPLEdBQUdBO1FBQzFCLEVBQUUsT0FBT1MsR0FBRztZQUNSQyxRQUFRQyxHQUFHLENBQUMscUNBQXFDRjtRQUNyRDtJQUNKO0lBRUEsTUFDTUcsYUFBYU4sSUFBd0IsRUFBRTtRQUN6QyxJQUFJO1lBQ0EsTUFBTSxDQUFDQyxXQUFXUCxRQUFRLEdBQUcsTUFBTWIsY0FBY21CLEtBQUtFLE1BQU07WUFDNURGLEtBQUtFLE1BQU0sQ0FBQ2pCLEVBQUUsR0FBR2dCO1lBQ2pCRCxLQUFLRSxNQUFNLENBQUNSLE9BQU8sR0FBR0E7UUFDMUIsRUFBRSxPQUFPUyxHQUFHO1lBQ1JDLFFBQVFDLEdBQUcsQ0FBQyxxQ0FBcUNGO1FBQ3JEO0lBQ0o7SUFFQSxNQUNNSSxZQUFZUCxJQUF3QixFQUFFO1FBQ3hDLElBQUk7WUFDQSxNQUFNcEIsY0FBY29CLEtBQUtFLE1BQU0sQ0FBQ2pCLEVBQUU7UUFDdEMsRUFBRSxPQUFPa0IsR0FBRztZQUNSQyxRQUFRQyxHQUFHLENBQUM7UUFDaEI7SUFDSjtBQUNKOztJQXhFSzVCLFdBQVc7UUFBRStCLFlBQVk7SUFBTzs7R0FGeEJ4Qjs7SUFLUk4sU0FBUztRQUFFOEIsWUFBWTtJQUFPOztHQUx0QnhCOztJQVFSTixTQUFTO1FBQUU4QixZQUFZO0lBQU87O0dBUnRCeEI7O0lBV1JOLFNBQVM7UUFBRThCLFlBQVk7UUFBUUMsVUFBVTtJQUFLOztHQVh0Q3pCOztJQWNSTixTQUFTO1FBQUU4QixZQUFZO1FBQVFDLFVBQVU7SUFBSzs7R0FkdEN6Qjs7SUFpQlJOLFNBQVM7UUFBRStCLFVBQVU7SUFBSzs7R0FqQmxCekI7O0lBb0JSTixTQUFTO1FBQUUrQixVQUFVO0lBQUs7O0dBcEJsQnpCOztJQXVCUk4sU0FBUyxDQUFDOztHQXZCRk07O0lBMEJSTixTQUFTO1FBQUU4QixZQUFZO1FBQVFDLFVBQVU7SUFBSzs7R0ExQnRDekI7O0lBNkJSTixTQUFTO1FBQUU4QixZQUFZO0lBQU87O0dBN0J0QnhCOztJQWdDUk4sU0FBUztRQUFFZ0MsUUFBUTtRQUFHRCxVQUFVO0lBQUs7dUNBQzFCLGdDQUFBO0dBakNIekI7O0lBbUNSTixTQUFTO1FBQUVnQyxRQUFRO1FBQUdELFVBQVU7SUFBSzt1Q0FDMUIsZ0NBQUE7R0FwQ0h6Qjs7SUFzQ1JOLFNBQVM7UUFBRThCLFlBQVk7UUFBUUMsVUFBVTtJQUFLOztHQXRDdEN6Qjs7SUF5Q1JSLFdBQVc7UUFBRTBCLFFBQVEsSUFBTXBCO1FBQU02QixVQUFVQyxDQUFBQSxJQUFLQSxFQUFFQyxRQUFRO0lBQUM7R0F6Q25EN0I7O0lBNENSWjs7O2VBQ3dCLHFDQUFBOztHQTdDaEJZOztJQXVEUlg7OztlQUN3QixxQ0FBQTs7R0F4RGhCVzs7SUFrRVJiOzs7ZUFDdUIscUNBQUE7O0dBbkVmYTtBQUFBQTtJQURaVDtHQUNZUyJ9