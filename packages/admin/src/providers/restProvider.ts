import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';
import {
    HttpError,
    useDataProvider,
    withLifecycleCallbacks,
    type DataProvider,
    type GetListResult,
    type GetOneResult,
    type Identifier,
    type RaRecord,
} from 'react-admin';
import { ADMIN_URI } from 'src/uris.js';
import { toUTC } from '../utils';

class TotalCountError extends HttpError {
    constructor() {
        super('Total Count header missing', 200);
    }
}

const provider = (apiUrl: string): AdminProvider => {
    const axiosInstance = axios.create({
        baseURL: apiUrl,
    });

    return {
        getList: async (resource, params) => {
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;

            const rangeStart = (page - 1) * perPage;
            const rangeEnd = page * perPage - 1;

            const url = `/${resource}`;

            const fields = field.split(',');
            const orders = order.split(',');

            const { data, headers } = await axiosInstance.get(url, {
                params: {
                    sort: JSON.stringify(
                        fields.map((f, idx) => [f, orders[idx]]),
                    ),
                    range: JSON.stringify([rangeStart, rangeEnd]),
                    filter: JSON.stringify(params.filter),
                },
            });

            if (!headers?.['x-total-count']) {
                throw new TotalCountError();
            }
            return {
                data,
                total: Number.parseInt(headers['x-total-count'], 10),
            };
        },
        getOne: async (resource, params) => {
            const { data } = await axiosInstance.get(
                `/${resource}/${params.id}`,
            );
            return {
                data,
            };
        },
        getMany: async (resource, params) => {
            const { data } = await axiosInstance.get(`/${resource}`, {
                params: {
                    filter: {
                        id: params.ids,
                    },
                },
            });
            return {
                data,
            };
        },
        getManyReference: async (resource, params) => {
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;

            const rangeStart = (page - 1) * perPage;
            const rangeEnd = page * perPage - 1;

            const url = `/${resource}`;

            const fields = field.split(',');
            const orders = order.split(',');

            const { data, headers } = await axiosInstance.get(url, {
                params: {
                    sort: JSON.stringify(
                        fields.map((f, idx) => [f, orders[idx]]),
                    ),
                    range: JSON.stringify([rangeStart, rangeEnd]),
                    filter: JSON.stringify({
                        ...params.filter,
                        [params.target]: params.id,
                    }),
                },
            });
            if (!headers?.['x-total-count']) {
                throw new TotalCountError();
            }
            return {
                data,
                total: Number.parseInt(headers['x-total-count'], 10),
            };
        },

        update: async (resource, params) => {
            console.log(params);
            const { data } = await axiosInstance.put(
                `/${resource}/${params.id}`,
                {
                    id: params.id,
                    ...params.data,
                },
                {
                    headers: {
                        'X-CSRF-TOKEN': 'admin',
                    },
                },
            );
            return {
                data,
            };
        },

        updateMany: async (resource, params) => {
            const responses = await Promise.all(
                params.ids.map((id) =>
                    axiosInstance.put(`/${resource}/${id}`, params.data, {
                        headers: {
                            'X-CSRF-TOKEN': 'admin',
                        },
                    }),
                ),
            );

            return {
                data: responses.map(({ data }) => data.id),
            };
        },
        create: async (resource, params) => {
            console.log(params);

            const { data } = await axiosInstance.post(
                `/${resource}`,
                params.data,
                {
                    headers: {
                        'X-CSRF-TOKEN': 'admin',
                    },
                },
            );

            return {
                data,
            };
        },

        delete: async (resource, params) => {
            const { data } = await axiosInstance.delete(
                `/${resource}/${params.id}`,
                {
                    headers: {
                        'Content-Type': 'text/plain',
                        'X-CSRF-TOKEN': 'admin',
                    },
                },
            );
            return {
                data,
            };
        },

        // simple-rest doesn't handle filters on DELETE route, so we fallback to calling DELETE n times instead
        deleteMany: async (resource, params) => {
            const responses = await Promise.all(
                params.ids.map((id) =>
                    axiosInstance.delete(`/${resource}/${id}`, {
                        headers: {
                            'Content-Type': 'text/plain',
                            'X-CSRF-TOKEN': 'admin',
                        },
                    }),
                ),
            );
            return {
                data: responses.map(({ data }) => data.id),
            };
        },

        pull: async (resource: string, _params: unknown) => {
            if (resource !== 'products') {
                return Promise.reject('Pull called with incorrect resource.');
            }
            const { data, headers } = await axiosInstance.post(
                '/actions/products/pull-from-stripe',
                {},
                {
                    headers: {
                        'X-CSRF-TOKEN': 'admin',
                    },
                },
            );
            if (!headers?.['x-total-count']) {
                throw new TotalCountError();
            }
            return {
                data,
                total: Number.parseInt(headers['x-total-count'], 10),
            };
        },

        purchasedCount: async (resource: string, _params: unknown) => {
            if (resource !== 'products') {
                return Promise.reject('Pull called with incorrect resource.');
            }
            const { data, headers } = await axiosInstance.post(
                '/actions/products/populate-purchase-count',
                {},
                {
                    headers: {
                        'X-CSRF-TOKEN': 'admin',
                    },
                },
            );
            if (!headers?.['x-total-count']) {
                throw new TotalCountError();
            }
            return {
                data,
                total: Number.parseInt(headers['x-total-count'], 10),
            };
        },

        populateImageFields: async (
            resource: string,
            params: { ids?: Identifier[] },
        ) => {
            if (resource !== 'calendars') {
                return Promise.reject(
                    'Populate Image Fields called with incorrect resource.',
                );
            }
            const { data, headers } = await axiosInstance.post(
                '/actions/calendars/populate-image-fields',
                params,
                {
                    headers: {
                        'X-CSRF-TOKEN': 'admin',
                    },
                },
            );
            if (!headers?.['x-total-count']) {
                throw new TotalCountError();
            }
            return {
                data,
                total: Number.parseInt(headers['x-total-count'], 10),
            };
        },

        trim: async (resource: string) => {
            if (resource !== 'pieces' && resource !== 'collaborators') {
                return Promise.reject(
                    'Trim only applies to pieces or collaborators.',
                );
            }
            const { data, headers } = await axiosInstance.post(
                `/actions/${resource}/trim`,
                {},
                {
                    headers: {
                        'X-CSRF-TOKEN': 'admin',
                    },
                },
            );
            if (!headers?.['x-total-count']) {
                throw new TotalCountError();
            }
            return {
                data,
                total: Number.parseInt(headers['x-total-count'], 10),
            };
        },

        populateDateTaken: async (resource: string) => {
            if (resource !== 'photos') {
                return Promise.reject(
                    'Called on a resource that is not photos',
                );
            }
            const { data, headers } = await axiosInstance.post(
                '/actions/photos/populate-date-taken',
                {},
                {
                    headers: {
                        'X-CSRF-TOKEN': 'admin',
                    },
                },
            );
            if (!headers?.['x-total-count']) {
                throw new TotalCountError();
            }
            return {
                data,
                total: Number.parseInt(headers['x-total-count'], 10),
            };
        },

        recalculateDuration: async (
            resource: string,
            params: { id: Identifier },
        ) => {
            if (resource !== 'music-files') {
                return Promise.reject(
                    'Called on a resource that is not music-files',
                );
            }
            const { data } = await axiosInstance.post(
                `/actions/music-files/recalculate-duration/${params.id}`,
                {},
                {
                    headers: {
                        'X-CSRF-TOKEN': 'admin',
                    },
                },
            );
            return {
                data,
            };
        },

        mergeInto: async (resource: string, params: { id: Identifier }) => {
            if (resource !== 'pieces' && resource !== 'collaborators') {
                return Promise.reject(
                    'Called on a resource that is not pieces',
                );
            }
            const { data } = await axiosInstance.post(
                `/actions/${resource}/merge-into/${params.id}`,
                {},
                {
                    headers: {
                        'X-CSRF-TOKEN': 'admin',
                    },
                },
            );
            return {
                data,
            };
        },

        merge: async (resource: string, params: { ids: Identifier[] }) => {
            if (resource !== 'pieces' && resource !== 'collaborators') {
                return Promise.reject(
                    'Called on a resource that is not pieces or collaborators',
                );
            }
            console.log(params);
            const { data } = await axiosInstance.post(
                `/actions/${resource}/merge`,
                {
                    ids: params.ids,
                },
                {
                    headers: {
                        'X-CSRF-TOKEN': 'admin',
                    },
                },
            );
            return {
                data,
            };
        },
    };
};

export interface AdminProvider<ResourceType extends string = string>
    extends DataProvider<ResourceType> {
    pull: <RecordType extends RaRecord>(
        resource: string,
        params: unknown,
    ) => Promise<GetListResult<RecordType>>;
    purchasedCount: <RecordType extends RaRecord>(
        resource: string,
        params: unknown,
    ) => Promise<GetListResult<RecordType>>;
    populateImageFields: <RecordType extends RaRecord>(
        resource: string,
        params: { ids?: Identifier[] },
    ) => Promise<GetListResult<RecordType>>;
    trim: <RecordType extends RaRecord>(
        resource: string,
        params: unknown,
    ) => Promise<GetListResult<RecordType>>;
    populateDateTaken: <RecordType extends RaRecord>(
        resource: string,
        params: unknown,
    ) => Promise<GetListResult<RecordType>>;
    recalculateDuration: <RecordType extends RaRecord>(
        resource: string,
        params: { id: Identifier },
    ) => Promise<GetOneResult<RecordType>>;
    mergeInto: <RecordType extends RaRecord>(
        resource: string,
        params: { id: Identifier },
    ) => Promise<GetOneResult<RecordType>>;
    merge: <RecordType extends RaRecord>(
        resource: string,
        params: { ids: Identifier[] },
    ) => Promise<GetOneResult<RecordType>>;
}

export const providerWithLifecycleCallbacks = withLifecycleCallbacks(
    provider(ADMIN_URI),
    [
        {
            resource: 'collaborators',
            beforeSave: async (params) => {
                const { calendars, ...restData } = params;
                return restData;
            },
        },
        {
            resource: 'pieces',
            beforeSave: async (params) => {
                console.log(params);
                const { calendars, ...restData } = params;
                return restData;
            },
        },
        {
            resource: 'calendars',
            beforeSave: async (params) => {
                const {
                    calendarTrgmMatview,
                    collaborators,
                    pieces,
                    ...restData
                } = params;
                return {
                    ...restData,
                    dateTime: toUTC(params.dateTimeInput, params.timezone),
                    timezone: params.timezone,
                };
            },
            afterRead: async (record, _dataProvider) => {
                return {
                    ...record,
                    dateTimeInput: formatInTimeZone(
                        record.dateTime,
                        record.timezone || 'America/Chicago',
                        'yyyy-MM-dd HH:mm',
                    ),
                };
            },
        },
        {
            resource: 'discs',
            beforeSave: async (params) => {
                const { discLinks, ...restData } = params;
                return restData;
            },
        },
        {
            resource: 'musics',
            beforeSave: async (params) => {
                const { musicFiles, ...restData } = params;
                return restData;
            },
        },
        {
            resource: 'music-files',
            beforeSave: async (data, _dataProvider) => {
                const { audioFileBlob, ...restData } = data;
                if (!audioFileBlob) {
                    return restData;
                }
                const audioFile: File = audioFileBlob.rawFile;
                const { data: uploaded } = await axios.postForm<{
                    fileName: string;
                    duration: number;
                }>(
                    `${ADMIN_URI}/music-files/upload`,
                    {
                        fileName: data.audioFile,
                        audioFile,
                    },
                    {
                        headers: {
                            'X-CSRF-TOKEN': 'admin',
                        },
                    },
                );
                return {
                    audioFile: uploaded.fileName,
                    name: data.name,
                    music: data.music,
                    durationSeconds: uploaded.duration,
                };
            },
        },
        {
            resource: 'photos',
            beforeSave: async (data, _dataProvider) => {
                const { photoBlob, ...restData } = data;
                if (!photoBlob) {
                    return restData;
                }
                const photo: File = photoBlob.rawFile;
                const { data: uploaded } = await axios.postForm<{
                    fileName: string;
                    original: { width: number; height: number };
                    thumbnail: { width: number; height: number };
                    dateTaken: string;
                }>(
                    `${ADMIN_URI}/photos/upload`,
                    {
                        fileName: data.file,
                        photo,
                    },
                    {
                        headers: {
                            'X-CSRF-TOKEN': 'admin',
                        },
                    },
                );
                return {
                    file: uploaded.fileName,
                    width: uploaded.original.width,
                    height: uploaded.original.height,
                    thumbnailWidth: uploaded.thumbnail.width,
                    thumbnailHeight: uploaded.thumbnail.height,
                    dateTaken: uploaded.dateTaken,
                    credit: data.credit,
                };
            },
        },
        {
            resource: 'users',
            beforeSave: async (params) => {
                const { products, ...restData } = params;
                return restData;
            },
        },
        {
            resource: 'products',
            beforeSave: async (data, _dataProvider) => {
                const {
                    newImages,
                    pdf,
                    fileName,
                    imageBaseNameWithExt,
                    images,
                    ...restData
                } = data;
                if (!pdf && !newImages) {
                    return {
                        ...restData,
                        file: fileName,
                        images: images ?? [imageBaseNameWithExt],
                    };
                }
                const pdfRaw: File | undefined = pdf?.rawFile;
                const sampleRaws: File[] | undefined = newImages?.map(
                    (img: { rawFile: File }) => img.rawFile,
                );
                if (sampleRaws) {
                    if (!imageBaseNameWithExt) {
                        throw new Error(
                            'No image base name supplied with new image uploads',
                        );
                    }
                }
                const { data: uploaded } = await axios.postForm<{
                    images?: string[];
                    pdf?: string;
                }>(
                    `${ADMIN_URI}/products/upload`,
                    {
                        fileName,
                        imageBaseNameWithExt,
                        pdf: pdfRaw,
                        samples: sampleRaws,
                    },
                    {
                        headers: {
                            'X-CSRF-TOKEN': 'admin',
                        },
                    },
                );
                const mergedImages = [
                    ...(images ?? []),
                    ...(uploaded?.images ?? []),
                ];
                const file = uploaded?.pdf ?? data.file;
                return {
                    ...restData,
                    images: mergedImages,
                    file,
                };
            },
        },
    ],
);

export const useAppDataProvider: () => AdminProvider = useDataProvider;
