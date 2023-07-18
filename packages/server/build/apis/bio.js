import { QueryOrder } from "@mikro-orm/core";
import { getAge } from "common";
import orm from "../database.js";
import { Bio } from "../models/Bio.js";
const getBio = async (_, res, __)=>{
    const bio = await orm.em.find(Bio, {}, {
        orderBy: [
            {
                paragraph: QueryOrder.ASC
            }
        ]
    });
    const age = getAge();
    const [firstOrig, ...rest] = bio;
    const first = {
        paragraph: firstOrig.paragraph,
        text: firstOrig.text.replace('##', age.toString())
    };
    const bioWithAge = [
        first,
        ...rest
    ];
    res.json(bioWithAge);
};
export default getBio;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGlzL2Jpby50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBRdWVyeU9yZGVyIH0gZnJvbSAnQG1pa3JvLW9ybS9jb3JlJztcclxuaW1wb3J0IHsgTmV4dEZ1bmN0aW9uLCBSZXF1ZXN0LCBSZXNwb25zZSB9IGZyb20gJ2V4cHJlc3MnO1xyXG5cclxuaW1wb3J0IHsgZ2V0QWdlIH0gZnJvbSAnY29tbW9uJztcclxuaW1wb3J0IG9ybSBmcm9tICcuLi9kYXRhYmFzZS5qcyc7XHJcbmltcG9ydCB7IEJpbyB9IGZyb20gJy4uL21vZGVscy9CaW8uanMnO1xyXG5cclxuY29uc3QgZ2V0QmlvID0gYXN5bmMgKF86IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIF9fOiBOZXh0RnVuY3Rpb24pOiBQcm9taXNlPHZvaWQ+ID0+IHtcclxuICAgIGNvbnN0IGJpbyA9IGF3YWl0IG9ybS5lbS5maW5kKEJpbywge30sIHsgb3JkZXJCeTogW3sgcGFyYWdyYXBoOiBRdWVyeU9yZGVyLkFTQyB9XSB9KTtcclxuXHJcbiAgICBjb25zdCBhZ2UgPSBnZXRBZ2UoKTtcclxuXHJcbiAgICBjb25zdCBbZmlyc3RPcmlnLCAuLi5yZXN0XSA9IGJpbztcclxuICAgIGNvbnN0IGZpcnN0ID0geyBwYXJhZ3JhcGg6IGZpcnN0T3JpZy5wYXJhZ3JhcGgsIHRleHQ6IGZpcnN0T3JpZy50ZXh0LnJlcGxhY2UoJyMjJywgYWdlLnRvU3RyaW5nKCkpIH07XHJcbiAgICBjb25zdCBiaW9XaXRoQWdlID0gW2ZpcnN0LCAuLi5yZXN0XTtcclxuICAgIHJlcy5qc29uKGJpb1dpdGhBZ2UpO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ2V0QmlvO1xyXG4iXSwibmFtZXMiOlsiUXVlcnlPcmRlciIsImdldEFnZSIsIm9ybSIsIkJpbyIsImdldEJpbyIsIl8iLCJyZXMiLCJfXyIsImJpbyIsImVtIiwiZmluZCIsIm9yZGVyQnkiLCJwYXJhZ3JhcGgiLCJBU0MiLCJhZ2UiLCJmaXJzdE9yaWciLCJyZXN0IiwiZmlyc3QiLCJ0ZXh0IiwicmVwbGFjZSIsInRvU3RyaW5nIiwiYmlvV2l0aEFnZSIsImpzb24iXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLFVBQVUsUUFBUSxrQkFBa0I7QUFHN0MsU0FBU0MsTUFBTSxRQUFRLFNBQVM7QUFDaEMsT0FBT0MsU0FBUyxpQkFBaUI7QUFDakMsU0FBU0MsR0FBRyxRQUFRLG1CQUFtQjtBQUV2QyxNQUFNQyxTQUFTLE9BQU9DLEdBQVlDLEtBQWVDO0lBQzdDLE1BQU1DLE1BQU0sTUFBTU4sSUFBSU8sRUFBRSxDQUFDQyxJQUFJLENBQUNQLEtBQUssQ0FBQyxHQUFHO1FBQUVRLFNBQVM7WUFBQztnQkFBRUMsV0FBV1osV0FBV2EsR0FBRztZQUFDO1NBQUU7SUFBQztJQUVsRixNQUFNQyxNQUFNYjtJQUVaLE1BQU0sQ0FBQ2MsV0FBVyxHQUFHQyxLQUFLLEdBQUdSO0lBQzdCLE1BQU1TLFFBQVE7UUFBRUwsV0FBV0csVUFBVUgsU0FBUztRQUFFTSxNQUFNSCxVQUFVRyxJQUFJLENBQUNDLE9BQU8sQ0FBQyxNQUFNTCxJQUFJTSxRQUFRO0lBQUk7SUFDbkcsTUFBTUMsYUFBYTtRQUFDSjtXQUFVRDtLQUFLO0lBQ25DVixJQUFJZ0IsSUFBSSxDQUFDRDtBQUNiO0FBRUEsZUFBZWpCLE9BQU8ifQ==