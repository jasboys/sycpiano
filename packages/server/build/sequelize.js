import { Sequelize } from "sequelize";
import * as Config from "./config/config";
const config = process.env.NODE_ENV === 'production' && process.env.SERVER_ENV !== 'test' ? Config.production : Config.development;
const { database , username , password , host , port , dialect , logging , define  } = config;
export const options = {
    database,
    username
};
export default new Sequelize(database, username, password, {
    host,
    port,
    dialect,
    dialectOptions: {
        charSet: 'utf8',
        collate: 'utf8_unicode_ci',
        client_encoding: 'utf8'
    },
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    define,
    logging
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXF1ZWxpemUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2VxdWVsaXplIH0gZnJvbSAnc2VxdWVsaXplJztcclxuaW1wb3J0ICogYXMgQ29uZmlnIGZyb20gJy4vY29uZmlnL2NvbmZpZyc7XHJcblxyXG5jb25zdCBjb25maWcgPSAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyAmJiBwcm9jZXNzLmVudi5TRVJWRVJfRU5WICE9PSAndGVzdCcpID8gQ29uZmlnLnByb2R1Y3Rpb24gOiBDb25maWcuZGV2ZWxvcG1lbnQ7XHJcblxyXG5jb25zdCB7XHJcbiAgICBkYXRhYmFzZSxcclxuICAgIHVzZXJuYW1lLFxyXG4gICAgcGFzc3dvcmQsXHJcbiAgICBob3N0LFxyXG4gICAgcG9ydCxcclxuICAgIGRpYWxlY3QsXHJcbiAgICBsb2dnaW5nLFxyXG4gICAgZGVmaW5lLFxyXG59ID0gY29uZmlnO1xyXG5cclxuZXhwb3J0IGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICBkYXRhYmFzZSxcclxuICAgIHVzZXJuYW1lLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgbmV3IFNlcXVlbGl6ZShkYXRhYmFzZSwgdXNlcm5hbWUsIHBhc3N3b3JkLCB7XHJcbiAgICBob3N0LFxyXG4gICAgcG9ydCxcclxuICAgIGRpYWxlY3QsXHJcbiAgICBkaWFsZWN0T3B0aW9uczoge1xyXG4gICAgICAgIGNoYXJTZXQ6ICd1dGY4JyxcclxuICAgICAgICBjb2xsYXRlOiAndXRmOF91bmljb2RlX2NpJyxcclxuICAgICAgICBjbGllbnRfZW5jb2Rpbmc6ICd1dGY4JyxcclxuICAgIH0sXHJcbiAgICBwb29sOiB7IG1heDogNSwgbWluOiAwLCBpZGxlOiAxMDAwMCB9LFxyXG4gICAgZGVmaW5lLFxyXG4gICAgbG9nZ2luZywgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSB0byBsb2cgdG8gb3V0cHV0XHJcbn0pO1xyXG4iXSwibmFtZXMiOlsiU2VxdWVsaXplIiwiQ29uZmlnIiwiY29uZmlnIiwicHJvY2VzcyIsImVudiIsIk5PREVfRU5WIiwiU0VSVkVSX0VOViIsInByb2R1Y3Rpb24iLCJkZXZlbG9wbWVudCIsImRhdGFiYXNlIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsImhvc3QiLCJwb3J0IiwiZGlhbGVjdCIsImxvZ2dpbmciLCJkZWZpbmUiLCJvcHRpb25zIiwiZGlhbGVjdE9wdGlvbnMiLCJjaGFyU2V0IiwiY29sbGF0ZSIsImNsaWVudF9lbmNvZGluZyIsInBvb2wiLCJtYXgiLCJtaW4iLCJpZGxlIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxTQUFTLFFBQVEsWUFBWTtBQUN0QyxZQUFZQyxZQUFZLGtCQUFrQjtBQUUxQyxNQUFNQyxTQUFTLEFBQUNDLFFBQVFDLEdBQUcsQ0FBQ0MsUUFBUSxLQUFLLGdCQUFnQkYsUUFBUUMsR0FBRyxDQUFDRSxVQUFVLEtBQUssU0FBVUwsT0FBT00sVUFBVSxHQUFHTixPQUFPTyxXQUFXO0FBRXBJLE1BQU0sRUFDRkMsU0FBUSxFQUNSQyxTQUFRLEVBQ1JDLFNBQVEsRUFDUkMsS0FBSSxFQUNKQyxLQUFJLEVBQ0pDLFFBQU8sRUFDUEMsUUFBTyxFQUNQQyxPQUFNLEVBQ1QsR0FBR2Q7QUFFSixPQUFPLE1BQU1lLFVBQVU7SUFDbkJSO0lBQ0FDO0FBQ0osRUFBRTtBQUVGLGVBQWUsSUFBSVYsVUFBVVMsVUFBVUMsVUFBVUMsVUFBVTtJQUN2REM7SUFDQUM7SUFDQUM7SUFDQUksZ0JBQWdCO1FBQ1pDLFNBQVM7UUFDVEMsU0FBUztRQUNUQyxpQkFBaUI7SUFDckI7SUFDQUMsTUFBTTtRQUFFQyxLQUFLO1FBQUdDLEtBQUs7UUFBR0MsTUFBTTtJQUFNO0lBQ3BDVDtJQUNBRDtBQUNKLEdBQUcifQ==