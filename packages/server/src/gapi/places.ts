import { Client, PlaceInputType } from '@googlemaps/google-maps-services-js';

// From google api console; use general dev or server prod keys for respective environments.
// Make sure it's set in .env
const gapiKey = process.env.GAPI_KEY_SERVER;

const mapsClient = new Client({});

export const getPhotos = async (search: string) => {
    if (!gapiKey) {
        throw Error('gapi key is undefined');
    }
    const place = await mapsClient.findPlaceFromText({
        params: {
            input: search,
            inputtype: PlaceInputType.textQuery,
            key: gapiKey,
        },
    });
    for (const can of place.data.candidates) {
        const placeId = can.place_id;
        let photos = can.photos;
        if (!photos && placeId) {
            photos = (
                await mapsClient.placeDetails({
                    params: {
                        place_id: placeId,
                        key: gapiKey,
                        fields: ['photos'],
                    },
                })
            ).data.result.photos;
        }
        if (!photos || photos.length === 0) {
            console.log('testing next place');
            continue;
        }
        return {
            photoReference: photos[0].photo_reference,
            placeId,
        };
    }
    throw Error('Could not find any matches with photos');
};
