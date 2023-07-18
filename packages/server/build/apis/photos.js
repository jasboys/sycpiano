import orm from "../database.js";
import { Photo } from "../models/Photo.js";
const photosHandler = async (_, res, __)=>{
    const response = await orm.em.find(Photo, {});
    res.json(response);
};
export default photosHandler;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGlzL3Bob3Rvcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0RnVuY3Rpb24sIFJlcXVlc3QsIFJlc3BvbnNlIH0gZnJvbSAnZXhwcmVzcyc7XHJcbmltcG9ydCBvcm0gZnJvbSAnLi4vZGF0YWJhc2UuanMnO1xyXG5pbXBvcnQgeyBQaG90byB9IGZyb20gJy4uL21vZGVscy9QaG90by5qcyc7XHJcblxyXG5jb25zdCBwaG90b3NIYW5kbGVyID0gYXN5bmMgKF86IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIF9fOiBOZXh0RnVuY3Rpb24pOiBQcm9taXNlPHZvaWQ+ID0+IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgb3JtLmVtLmZpbmQoUGhvdG8sIHt9KTtcclxuICAgIHJlcy5qc29uKHJlc3BvbnNlKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHBob3Rvc0hhbmRsZXI7XHJcbiJdLCJuYW1lcyI6WyJvcm0iLCJQaG90byIsInBob3Rvc0hhbmRsZXIiLCJfIiwicmVzIiwiX18iLCJyZXNwb25zZSIsImVtIiwiZmluZCIsImpzb24iXSwibWFwcGluZ3MiOiJBQUNBLE9BQU9BLFNBQVMsaUJBQWlCO0FBQ2pDLFNBQVNDLEtBQUssUUFBUSxxQkFBcUI7QUFFM0MsTUFBTUMsZ0JBQWdCLE9BQU9DLEdBQVlDLEtBQWVDO0lBQ3BELE1BQU1DLFdBQVcsTUFBTU4sSUFBSU8sRUFBRSxDQUFDQyxJQUFJLENBQUNQLE9BQU8sQ0FBQztJQUMzQ0csSUFBSUssSUFBSSxDQUFDSDtBQUNiO0FBRUEsZUFBZUosY0FBYyJ9