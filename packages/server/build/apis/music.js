import orm from "../database.js";
import { getLastName } from "../hash.js";
import { Music } from "../models/Music.js";
const musicCompare = (a, b)=>{
    let nameCompare = (getLastName(a.composer) ?? '').localeCompare(getLastName(b.composer) ?? '');
    if (nameCompare === 0) {
        return a.piece.localeCompare(b.piece);
    }
    return nameCompare;
};
const groupMusic = (musicList)=>{
    const accumulator = {};
    for (const m of musicList){
        const groupKey = m.type;
        if (accumulator[groupKey] === undefined) {
            accumulator[groupKey] = [
                m
            ];
        } else {
            accumulator[groupKey].push(m);
        }
    }
    return accumulator;
};
const musicHandler = async (_, res, __)=>{
    const results = await orm.em.find(Music, {}, {
        populate: [
            'musicFiles'
        ]
    });
    // const [solo, concerto, chamber, composition, videogame] = await Promise.all([
    //     getMusicInstancesOfType('solo'),
    //     getMusicInstancesOfType('concerto'),
    //     getMusicInstancesOfType('chamber'),
    //     getMusicInstancesOfType('composition'),
    //     getMusicInstancesOfType('videogame'),
    // ]);
    const groupedResults = groupMusic(results);
    Object.keys(groupedResults).map((k)=>{
        groupedResults[k].sort(musicCompare);
    });
    res.json(groupedResults);
};
export default musicHandler;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGlzL211c2ljLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExvYWRlZCB9IGZyb20gJ0BtaWtyby1vcm0vY29yZSc7XHJcbmltcG9ydCB7IE5leHRGdW5jdGlvbiwgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcclxuaW1wb3J0IG9ybSBmcm9tICcuLi9kYXRhYmFzZS5qcyc7XHJcbmltcG9ydCB7IGdldExhc3ROYW1lIH0gZnJvbSAnLi4vaGFzaC5qcyc7XHJcbmltcG9ydCB7IE11c2ljIH0gZnJvbSAnLi4vbW9kZWxzL011c2ljLmpzJztcclxuXHJcbmludGVyZmFjZSBHcm91cGVkTXVzaWMge1xyXG4gICAgW2tleTogc3RyaW5nXSA6IE11c2ljW107XHJcbn1cclxuXHJcbmNvbnN0IG11c2ljQ29tcGFyZSA9IChhOiBNdXNpYywgYjogTXVzaWMpID0+IHtcclxuICAgIGxldCBuYW1lQ29tcGFyZSA9IChnZXRMYXN0TmFtZShhLmNvbXBvc2VyKSA/PyAnJykubG9jYWxlQ29tcGFyZShnZXRMYXN0TmFtZShiLmNvbXBvc2VyKSA/PyAnJyk7XHJcbiAgICBpZiAobmFtZUNvbXBhcmUgPT09IDApIHtcclxuICAgICAgICByZXR1cm4gYS5waWVjZS5sb2NhbGVDb21wYXJlKGIucGllY2UpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5hbWVDb21wYXJlO1xyXG59XHJcblxyXG5jb25zdCBncm91cE11c2ljID0gKG11c2ljTGlzdDogTG9hZGVkPE11c2ljLCAnbXVzaWNGaWxlcyc+W10pOiBHcm91cGVkTXVzaWMgPT4ge1xyXG4gICAgY29uc3QgYWNjdW11bGF0b3I6IEdyb3VwZWRNdXNpYyA9IHt9O1xyXG4gICAgZm9yIChjb25zdCBtIG9mIG11c2ljTGlzdCkge1xyXG4gICAgICAgIGNvbnN0IGdyb3VwS2V5ID0gbS50eXBlO1xyXG4gICAgICAgIGlmIChhY2N1bXVsYXRvcltncm91cEtleV0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBhY2N1bXVsYXRvcltncm91cEtleV0gPSBbbV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYWNjdW11bGF0b3JbZ3JvdXBLZXldLnB1c2gobSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFjY3VtdWxhdG9yO1xyXG59O1xyXG5cclxuY29uc3QgbXVzaWNIYW5kbGVyID0gYXN5bmMgKF86IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIF9fOiBOZXh0RnVuY3Rpb24pOiBQcm9taXNlPHZvaWQ+ID0+IHtcclxuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBvcm0uZW0uZmluZChNdXNpYywge30sIHsgcG9wdWxhdGU6IFsnbXVzaWNGaWxlcyddIH0pO1xyXG5cclxuICAgIC8vIGNvbnN0IFtzb2xvLCBjb25jZXJ0bywgY2hhbWJlciwgY29tcG9zaXRpb24sIHZpZGVvZ2FtZV0gPSBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAvLyAgICAgZ2V0TXVzaWNJbnN0YW5jZXNPZlR5cGUoJ3NvbG8nKSxcclxuICAgIC8vICAgICBnZXRNdXNpY0luc3RhbmNlc09mVHlwZSgnY29uY2VydG8nKSxcclxuICAgIC8vICAgICBnZXRNdXNpY0luc3RhbmNlc09mVHlwZSgnY2hhbWJlcicpLFxyXG4gICAgLy8gICAgIGdldE11c2ljSW5zdGFuY2VzT2ZUeXBlKCdjb21wb3NpdGlvbicpLFxyXG4gICAgLy8gICAgIGdldE11c2ljSW5zdGFuY2VzT2ZUeXBlKCd2aWRlb2dhbWUnKSxcclxuICAgIC8vIF0pO1xyXG4gICAgY29uc3QgZ3JvdXBlZFJlc3VsdHMgPSBncm91cE11c2ljKHJlc3VsdHMpO1xyXG4gICAgT2JqZWN0LmtleXMoZ3JvdXBlZFJlc3VsdHMpLm1hcCgoazoga2V5b2YgR3JvdXBlZE11c2ljKSA9PiB7XHJcbiAgICAgICAgZ3JvdXBlZFJlc3VsdHNba10uc29ydChtdXNpY0NvbXBhcmUpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmVzLmpzb24oZ3JvdXBlZFJlc3VsdHMpO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgbXVzaWNIYW5kbGVyO1xyXG4iXSwibmFtZXMiOlsib3JtIiwiZ2V0TGFzdE5hbWUiLCJNdXNpYyIsIm11c2ljQ29tcGFyZSIsImEiLCJiIiwibmFtZUNvbXBhcmUiLCJjb21wb3NlciIsImxvY2FsZUNvbXBhcmUiLCJwaWVjZSIsImdyb3VwTXVzaWMiLCJtdXNpY0xpc3QiLCJhY2N1bXVsYXRvciIsIm0iLCJncm91cEtleSIsInR5cGUiLCJ1bmRlZmluZWQiLCJwdXNoIiwibXVzaWNIYW5kbGVyIiwiXyIsInJlcyIsIl9fIiwicmVzdWx0cyIsImVtIiwiZmluZCIsInBvcHVsYXRlIiwiZ3JvdXBlZFJlc3VsdHMiLCJPYmplY3QiLCJrZXlzIiwibWFwIiwiayIsInNvcnQiLCJqc29uIl0sIm1hcHBpbmdzIjoiQUFFQSxPQUFPQSxTQUFTLGlCQUFpQjtBQUNqQyxTQUFTQyxXQUFXLFFBQVEsYUFBYTtBQUN6QyxTQUFTQyxLQUFLLFFBQVEscUJBQXFCO0FBTTNDLE1BQU1DLGVBQWUsQ0FBQ0MsR0FBVUM7SUFDNUIsSUFBSUMsY0FBYyxBQUFDTCxDQUFBQSxZQUFZRyxFQUFFRyxRQUFRLEtBQUssRUFBQyxFQUFHQyxhQUFhLENBQUNQLFlBQVlJLEVBQUVFLFFBQVEsS0FBSztJQUMzRixJQUFJRCxnQkFBZ0IsR0FBRztRQUNuQixPQUFPRixFQUFFSyxLQUFLLENBQUNELGFBQWEsQ0FBQ0gsRUFBRUksS0FBSztJQUN4QztJQUNBLE9BQU9IO0FBQ1g7QUFFQSxNQUFNSSxhQUFhLENBQUNDO0lBQ2hCLE1BQU1DLGNBQTRCLENBQUM7SUFDbkMsS0FBSyxNQUFNQyxLQUFLRixVQUFXO1FBQ3ZCLE1BQU1HLFdBQVdELEVBQUVFLElBQUk7UUFDdkIsSUFBSUgsV0FBVyxDQUFDRSxTQUFTLEtBQUtFLFdBQVc7WUFDckNKLFdBQVcsQ0FBQ0UsU0FBUyxHQUFHO2dCQUFDRDthQUFFO1FBQy9CLE9BQU87WUFDSEQsV0FBVyxDQUFDRSxTQUFTLENBQUNHLElBQUksQ0FBQ0o7UUFDL0I7SUFDSjtJQUNBLE9BQU9EO0FBQ1g7QUFFQSxNQUFNTSxlQUFlLE9BQU9DLEdBQVlDLEtBQWVDO0lBQ25ELE1BQU1DLFVBQVUsTUFBTXRCLElBQUl1QixFQUFFLENBQUNDLElBQUksQ0FBQ3RCLE9BQU8sQ0FBQyxHQUFHO1FBQUV1QixVQUFVO1lBQUM7U0FBYTtJQUFDO0lBRXhFLGdGQUFnRjtJQUNoRix1Q0FBdUM7SUFDdkMsMkNBQTJDO0lBQzNDLDBDQUEwQztJQUMxQyw4Q0FBOEM7SUFDOUMsNENBQTRDO0lBQzVDLE1BQU07SUFDTixNQUFNQyxpQkFBaUJoQixXQUFXWTtJQUNsQ0ssT0FBT0MsSUFBSSxDQUFDRixnQkFBZ0JHLEdBQUcsQ0FBQyxDQUFDQztRQUM3QkosY0FBYyxDQUFDSSxFQUFFLENBQUNDLElBQUksQ0FBQzVCO0lBQzNCO0lBRUFpQixJQUFJWSxJQUFJLENBQUNOO0FBQ2I7QUFFQSxlQUFlUixhQUFhIn0=