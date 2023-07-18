import { Client, PlaceInputType } from "@googlemaps/google-maps-services-js";
// From google api console; use general dev or server prod keys for respective environments.
// Make sure it's set in .env
const gapiKey = process.env.GAPI_KEY_SERVER;
const mapsClient = new Client({});
export const getPhotos = async (search)=>{
    if (!gapiKey) {
        throw Error('gapi key is undefined');
    }
    const place = await mapsClient.findPlaceFromText({
        params: {
            input: search,
            inputtype: PlaceInputType.textQuery,
            key: gapiKey
        }
    });
    for (const can of place.data.candidates){
        const placeId = can.place_id;
        let photos = can.photos;
        if (!photos) {
            photos = (await mapsClient.placeDetails({
                params: {
                    place_id: placeId,
                    key: gapiKey,
                    fields: [
                        'photos'
                    ]
                }
            })).data.result.photos;
        }
        if (!photos || photos.length === 0) {
            console.log('testing next place');
            continue;
        }
        return {
            photoReference: photos[0].photo_reference,
            placeId
        };
    }
    throw Error('Could not find any matches with photos');
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9nYXBpL3BsYWNlcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDbGllbnQsIFBsYWNlSW5wdXRUeXBlIH0gZnJvbSAnQGdvb2dsZW1hcHMvZ29vZ2xlLW1hcHMtc2VydmljZXMtanMnO1xuXG4vLyBGcm9tIGdvb2dsZSBhcGkgY29uc29sZTsgdXNlIGdlbmVyYWwgZGV2IG9yIHNlcnZlciBwcm9kIGtleXMgZm9yIHJlc3BlY3RpdmUgZW52aXJvbm1lbnRzLlxuLy8gTWFrZSBzdXJlIGl0J3Mgc2V0IGluIC5lbnZcbmNvbnN0IGdhcGlLZXkgPSBwcm9jZXNzLmVudi5HQVBJX0tFWV9TRVJWRVI7XG5cbmNvbnN0IG1hcHNDbGllbnQgPSBuZXcgQ2xpZW50KHt9KTtcblxuZXhwb3J0IGNvbnN0IGdldFBob3RvcyA9IGFzeW5jIChzZWFyY2g6IHN0cmluZykgPT4ge1xuICAgIGlmICghZ2FwaUtleSkge1xuICAgICAgICB0aHJvdyBFcnJvcignZ2FwaSBrZXkgaXMgdW5kZWZpbmVkJyk7XG4gICAgfVxuICAgIGNvbnN0IHBsYWNlID0gYXdhaXQgbWFwc0NsaWVudC5maW5kUGxhY2VGcm9tVGV4dCh7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgaW5wdXQ6IHNlYXJjaCxcbiAgICAgICAgICAgIGlucHV0dHlwZTogUGxhY2VJbnB1dFR5cGUudGV4dFF1ZXJ5LFxuICAgICAgICAgICAga2V5OiBnYXBpS2V5LFxuICAgICAgICB9XG4gICAgfSk7XG4gICAgZm9yIChjb25zdCBjYW4gb2YgcGxhY2UuZGF0YS5jYW5kaWRhdGVzKSB7XG4gICAgICAgIGNvbnN0IHBsYWNlSWQgPSBjYW4ucGxhY2VfaWQhO1xuICAgICAgICBsZXQgcGhvdG9zID0gY2FuLnBob3RvcztcbiAgICAgICAgaWYgKCFwaG90b3MpIHtcbiAgICAgICAgICAgIHBob3RvcyA9IChhd2FpdCBtYXBzQ2xpZW50LnBsYWNlRGV0YWlscyh7XG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlX2lkOiBwbGFjZUlkLFxuICAgICAgICAgICAgICAgICAgICBrZXk6IGdhcGlLZXksXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkczogWydwaG90b3MnXSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSkuZGF0YS5yZXN1bHQucGhvdG9zO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcGhvdG9zIHx8IHBob3Rvcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0ZXN0aW5nIG5leHQgcGxhY2UnKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwaG90b1JlZmVyZW5jZTogcGhvdG9zWzBdLnBob3RvX3JlZmVyZW5jZSxcbiAgICAgICAgICAgIHBsYWNlSWQsXG4gICAgICAgIH07XG4gICAgfVxuICAgIHRocm93IEVycm9yKCdDb3VsZCBub3QgZmluZCBhbnkgbWF0Y2hlcyB3aXRoIHBob3RvcycpO1xufTtcbiJdLCJuYW1lcyI6WyJDbGllbnQiLCJQbGFjZUlucHV0VHlwZSIsImdhcGlLZXkiLCJwcm9jZXNzIiwiZW52IiwiR0FQSV9LRVlfU0VSVkVSIiwibWFwc0NsaWVudCIsImdldFBob3RvcyIsInNlYXJjaCIsIkVycm9yIiwicGxhY2UiLCJmaW5kUGxhY2VGcm9tVGV4dCIsInBhcmFtcyIsImlucHV0IiwiaW5wdXR0eXBlIiwidGV4dFF1ZXJ5Iiwia2V5IiwiY2FuIiwiZGF0YSIsImNhbmRpZGF0ZXMiLCJwbGFjZUlkIiwicGxhY2VfaWQiLCJwaG90b3MiLCJwbGFjZURldGFpbHMiLCJmaWVsZHMiLCJyZXN1bHQiLCJsZW5ndGgiLCJjb25zb2xlIiwibG9nIiwicGhvdG9SZWZlcmVuY2UiLCJwaG90b19yZWZlcmVuY2UiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLE1BQU0sRUFBRUMsY0FBYyxRQUFRLHNDQUFzQztBQUU3RSw0RkFBNEY7QUFDNUYsNkJBQTZCO0FBQzdCLE1BQU1DLFVBQVVDLFFBQVFDLEdBQUcsQ0FBQ0MsZUFBZTtBQUUzQyxNQUFNQyxhQUFhLElBQUlOLE9BQU8sQ0FBQztBQUUvQixPQUFPLE1BQU1PLFlBQVksT0FBT0M7SUFDNUIsSUFBSSxDQUFDTixTQUFTO1FBQ1YsTUFBTU8sTUFBTTtJQUNoQjtJQUNBLE1BQU1DLFFBQVEsTUFBTUosV0FBV0ssaUJBQWlCLENBQUM7UUFDN0NDLFFBQVE7WUFDSkMsT0FBT0w7WUFDUE0sV0FBV2IsZUFBZWMsU0FBUztZQUNuQ0MsS0FBS2Q7UUFDVDtJQUNKO0lBQ0EsS0FBSyxNQUFNZSxPQUFPUCxNQUFNUSxJQUFJLENBQUNDLFVBQVUsQ0FBRTtRQUNyQyxNQUFNQyxVQUFVSCxJQUFJSSxRQUFRO1FBQzVCLElBQUlDLFNBQVNMLElBQUlLLE1BQU07UUFDdkIsSUFBSSxDQUFDQSxRQUFRO1lBQ1RBLFNBQVMsQUFBQyxDQUFBLE1BQU1oQixXQUFXaUIsWUFBWSxDQUFDO2dCQUNwQ1gsUUFBUTtvQkFDSlMsVUFBVUQ7b0JBQ1ZKLEtBQUtkO29CQUNMc0IsUUFBUTt3QkFBQztxQkFBUztnQkFDdEI7WUFDSixFQUFDLEVBQUdOLElBQUksQ0FBQ08sTUFBTSxDQUFDSCxNQUFNO1FBQzFCO1FBQ0EsSUFBSSxDQUFDQSxVQUFVQSxPQUFPSSxNQUFNLEtBQUssR0FBRztZQUNoQ0MsUUFBUUMsR0FBRyxDQUFDO1lBQ1o7UUFDSjtRQUNBLE9BQU87WUFDSEMsZ0JBQWdCUCxNQUFNLENBQUMsRUFBRSxDQUFDUSxlQUFlO1lBQ3pDVjtRQUNKO0lBQ0o7SUFDQSxNQUFNWCxNQUFNO0FBQ2hCLEVBQUUifQ==