import { createHash } from "crypto";
export const getLastName = (name)=>{
    var _exec;
    return (_exec = /([^\s]+)\s?(?:\(.*\))?$/.exec(name)) === null || _exec === void 0 ? void 0 : _exec[1];
};
const normalizeString = (str)=>{
    return str.normalize('NFD').replace(/[\u0300-\u036f":()',.-]/g, '').replace(/\s+/g, '-').replace(/_$/, '');
};
export const getHash = (composer, piece, name)=>{
    const str = `/${getLastName(composer)}/${normalizeString(piece)}${name ? '/' + normalizeString(name) : ''}`;
    return createHash('sha1').update(str).digest('base64');
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9oYXNoLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUhhc2ggfSBmcm9tICdjcnlwdG8nO1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldExhc3ROYW1lID0gKG5hbWU6IHN0cmluZykgPT4ge1xyXG4gICAgcmV0dXJuIC8oW15cXHNdKylcXHM/KD86XFwoLipcXCkpPyQvLmV4ZWMobmFtZSk/LlsxXTtcclxufTtcclxuXHJcbmNvbnN0IG5vcm1hbGl6ZVN0cmluZyA9IChzdHI6IHN0cmluZykgPT4ge1xyXG4gICAgcmV0dXJuIHN0ci5ub3JtYWxpemUoJ05GRCcpLnJlcGxhY2UoL1tcXHUwMzAwLVxcdTAzNmZcIjooKScsLi1dL2csICcnKS5yZXBsYWNlKC9cXHMrL2csICctJykucmVwbGFjZSgvXyQvLCAnJyk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0SGFzaCA9IChjb21wb3Nlcjogc3RyaW5nLCBwaWVjZTogc3RyaW5nLCBuYW1lPzogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuICAgIGNvbnN0IHN0ciA9IGAvJHtnZXRMYXN0TmFtZShjb21wb3Nlcil9LyR7bm9ybWFsaXplU3RyaW5nKHBpZWNlKX0ke25hbWUgPyAnLycgKyBub3JtYWxpemVTdHJpbmcobmFtZSkgOiAnJ31gO1xyXG4gICAgcmV0dXJuIGNyZWF0ZUhhc2goJ3NoYTEnKS51cGRhdGUoc3RyKS5kaWdlc3QoJ2Jhc2U2NCcpO1xyXG59O1xyXG4iXSwibmFtZXMiOlsiY3JlYXRlSGFzaCIsImdldExhc3ROYW1lIiwibmFtZSIsImV4ZWMiLCJub3JtYWxpemVTdHJpbmciLCJzdHIiLCJub3JtYWxpemUiLCJyZXBsYWNlIiwiZ2V0SGFzaCIsImNvbXBvc2VyIiwicGllY2UiLCJ1cGRhdGUiLCJkaWdlc3QiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLFVBQVUsUUFBUSxTQUFTO0FBRXBDLE9BQU8sTUFBTUMsY0FBYyxDQUFDQztRQUNqQjtJQUFQLFFBQU8sUUFBQSwwQkFBMEJDLElBQUksQ0FBQ0QsbUJBQS9CLDRCQUFBLEtBQXNDLENBQUMsRUFBRTtBQUNwRCxFQUFFO0FBRUYsTUFBTUUsa0JBQWtCLENBQUNDO0lBQ3JCLE9BQU9BLElBQUlDLFNBQVMsQ0FBQyxPQUFPQyxPQUFPLENBQUMsNEJBQTRCLElBQUlBLE9BQU8sQ0FBQyxRQUFRLEtBQUtBLE9BQU8sQ0FBQyxNQUFNO0FBQzNHO0FBRUEsT0FBTyxNQUFNQyxVQUFVLENBQUNDLFVBQWtCQyxPQUFlUjtJQUNyRCxNQUFNRyxNQUFNLENBQUMsQ0FBQyxFQUFFSixZQUFZUSxVQUFVLENBQUMsRUFBRUwsZ0JBQWdCTSxPQUFPLEVBQUVSLE9BQU8sTUFBTUUsZ0JBQWdCRixRQUFRLEdBQUcsQ0FBQztJQUMzRyxPQUFPRixXQUFXLFFBQVFXLE1BQU0sQ0FBQ04sS0FBS08sTUFBTSxDQUFDO0FBQ2pELEVBQUUifQ==