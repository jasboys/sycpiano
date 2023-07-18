import orm from "../database.js";
import { Disc } from "../models/Disc.js";
const discHandler = async (_, res, __)=>{
    const response = await orm.em.find(Disc, {}, {
        populate: [
            'discLinks'
        ],
        orderBy: {
            releaseDate: 'DESC'
        }
    });
    res.json(response);
};
export default discHandler;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGlzL2Rpc2MudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dEZ1bmN0aW9uLCBSZXF1ZXN0LCBSZXNwb25zZSB9IGZyb20gJ2V4cHJlc3MnO1xyXG5pbXBvcnQgb3JtIGZyb20gJy4uL2RhdGFiYXNlLmpzJztcclxuaW1wb3J0IHsgRGlzYyB9IGZyb20gJy4uL21vZGVscy9EaXNjLmpzJztcclxuXHJcblxyXG5jb25zdCBkaXNjSGFuZGxlciA9IGFzeW5jIChfOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlLCBfXzogTmV4dEZ1bmN0aW9uKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IG9ybS5lbS5maW5kKERpc2MsIHt9LCB7XHJcbiAgICAgICAgcG9wdWxhdGU6IFsnZGlzY0xpbmtzJ10sXHJcbiAgICAgICAgb3JkZXJCeTogeyByZWxlYXNlRGF0ZTogJ0RFU0MnIH1cclxuICAgIH0pO1xyXG4gICAgcmVzLmpzb24ocmVzcG9uc2UpO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGlzY0hhbmRsZXI7XHJcbiJdLCJuYW1lcyI6WyJvcm0iLCJEaXNjIiwiZGlzY0hhbmRsZXIiLCJfIiwicmVzIiwiX18iLCJyZXNwb25zZSIsImVtIiwiZmluZCIsInBvcHVsYXRlIiwib3JkZXJCeSIsInJlbGVhc2VEYXRlIiwianNvbiJdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBT0EsU0FBUyxpQkFBaUI7QUFDakMsU0FBU0MsSUFBSSxRQUFRLG9CQUFvQjtBQUd6QyxNQUFNQyxjQUFjLE9BQU9DLEdBQVlDLEtBQWVDO0lBQ2xELE1BQU1DLFdBQVcsTUFBTU4sSUFBSU8sRUFBRSxDQUFDQyxJQUFJLENBQUNQLE1BQU0sQ0FBQyxHQUFHO1FBQ3pDUSxVQUFVO1lBQUM7U0FBWTtRQUN2QkMsU0FBUztZQUFFQyxhQUFhO1FBQU87SUFDbkM7SUFDQVAsSUFBSVEsSUFBSSxDQUFDTjtBQUNiO0FBRUEsZUFBZUosWUFBWSJ9