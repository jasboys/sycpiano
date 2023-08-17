import {
    DataProvider,
    GetListResult,
    HttpError,
    Identifier,
    RaRecord,
    useDataProvider,
    withLifecycleCallbacks,
} from 'react-admin';
import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';
import { omit } from 'lodash-es';
import { toUTC } from '../utils';
import { ADMIN_URI } from 'src/uris.js';

const ingestArrayTransformer = <RecordType extends RaRecord = RaRecord>(
    resource: string,
    data: RecordType[],
) => {
    if (resource !== 'calendars') return data;
    return data.map((v) => {
        return {
            ...v,
            dateTimeInput: formatInTimeZone(
                v.dateTime,
                v.timezone || 'America/Chicago',
                'yyyy-MM-dd HH:mm',
            ),
        };
    });
};

const ingestTransformer = <RecordType extends RaRecord = RaRecord>(
    resource: string,
    data: RecordType,
) => {
    if (resource !== 'calendars') return data;
    return {
        ...data,
        dateTimeInput: formatInTimeZone(
            data.dateTime,
            data.timezone || 'America/Chicago',
            'yyyy-MM-dd HH:mm',
        ),
    };
};

const egressParamTransformer = <RecordType extends RaRecord = RaRecord>(
    resource: string,
    params: RecordType,
) => {
    if (resource !== 'calendars') return params;
    // console.log(toUTC(params.dateTimeInput, params.timezone));
    return {
        ...omit(params, ['collaborators', 'pieces', 'dateTimeInput']),
        timezone: params.timezone || 'America/Chicago',
        dateTime: toUTC(params.dateTimeInput, params.timezone),
    };
};

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
                data: ingestArrayTransformer(resource, data),
                total: parseInt(headers['x-total-count'], 10),
            };
        },
        getOne: async (resource, params) => {
            const { data } = await axiosInstance.get(
                `/${resource}/${params.id}`,
            );
            return {
                data: ingestTransformer(resource, data),
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
                data: ingestArrayTransformer(resource, data),
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
                data: ingestArrayTransformer(resource, data),
                total: parseInt(headers['x-total-count'], 10),
            };
        },

        update: async (resource, params) => {
            const { data } = await axiosInstance.put(
                `/${resource}/${params.id}`,
                egressParamTransformer(resource, {
                    id: params.id,
                    ...params.data,
                }),
                {
                    headers: {
                        'X-CSRF-TOKEN': 'admin',
                    },
                },
            );
            return {
                data: ingestTransformer(resource, data),
            };
        },

        updateMany: async (resource, params) => {
            const responses = await Promise.all(
                params.ids.map((id) =>
                    axiosInstance.put(
                        `/${resource}/${id}`,
                        egressParamTransformer(resource, params.data),
                        {
                            headers: {
                                'X-CSRF-TOKEN': 'admin',
                            },
                        },
                    ),
                ),
            );

            return {
                data: responses.map(({ data }) => data.id),
            };
        },
        create: async (resource, params) => {
            const { data } = await axiosInstance.post(
                `/${resource}`,
                egressParamTransformer(resource, params.data),
                {
                    headers: {
                        'X-CSRF-TOKEN': 'admin',
                    },
                },
            );

            return {
                data: ingestTransformer(resource, data),
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
                data: ingestTransformer(resource, data),
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

        pull: async (resource: string, _params: {}) => {
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
                data: ingestArrayTransformer(resource, data),
                total: parseInt(headers['x-total-count'], 10),
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
                data: ingestArrayTransformer(resource, data),
                total: parseInt(headers['x-total-count'], 10),
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
                data: ingestArrayTransformer(resource, data),
                total: parseInt(headers['x-total-count'], 10),
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
                data: ingestArrayTransformer(resource, data),
                total: parseInt(headers['x-total-count'], 10),
            };
        },
    };
};

export interface AdminProvider<ResourceType extends string = string>
    extends DataProvider<ResourceType> {
    pull: <RecordType extends RaRecord>(
        resource: string,
        params: {},
    ) => Promise<GetListResult<RecordType>>;
    populateImageFields: <RecordType extends RaRecord>(
        resource: string,
        params: { ids?: Identifier[] },
    ) => Promise<GetListResult<RecordType>>;
    trim: <RecordType extends RaRecord>(
        resource: string,
        params: {},
    ) => Promise<GetListResult<RecordType>>;
    populateDateTaken: <RecordType extends RaRecord>(
        resource: string,
        params: {},
    ) => Promise<GetListResult<RecordType>>;
}

export const providerWithLifecycleCallbacks = withLifecycleCallbacks(
    provider(ADMIN_URI),
    [
        {
            resource: 'collaborators',
            beforeUpdate: async (params) => {
                const { calendars, ...restData } = params.data;
                return {
                    ...params,
                    data: restData,
                };
            },
        },
        {
            resource: 'pieces',
            beforeUpdate: async (params) => {
                const { calendars, ...restData } = params.data;
                return {
                    ...params,
                    data: restData,
                };
            },
        },
        {
            resource: 'calendars',
            beforeUpdate: async (params) => {
                const { calendarTrgmMatview, ...restData } = params.data;
                return {
                    ...params,
                    data: restData,
                };
            },
        },
        {
            resource: 'discs',
            beforeUpdate: async (params) => {
                const { discLinks, ...restData } = params.data;
                return {
                    ...params,
                    data: restData,
                };
            },
        },
        {
            resource: 'musics',
            beforeUpdate: async (params) => {
                const { musicFiles, ...restData } = params.data;
                return {
                    ...params,
                    data: restData,
                };
            },
        },
        {
            resource: 'music-files',
            beforeCreate: async ({ data, ...rest }, _dataProvider) => {
                console.log(data);
                const { audioFileBlob } = data;
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
                    ...rest,
                    data: {
                        audioFile: uploaded.fileName,
                        name: data.name,
                        music: data.music,
                        durationSeconds: uploaded.duration,
                    },
                };
            },
        },
        {
            resource: 'photos',
            beforeCreate: async ({ data, ...rest }, _dataProvider) => {
                console.log(data);
                const { photoBlob } = data;
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
                    ...rest,
                    data: {
                        file: uploaded.fileName,
                        width: uploaded.original.width,
                        height: uploaded.original.height,
                        thumbnailWidth: uploaded.thumbnail.width,
                        thumbnailHeight: uploaded.thumbnail.height,
                        dateTaken: uploaded.dateTaken,
                        credit: data.credit,
                    },
                };
            },
        },
        {
            resource: 'products',
            beforeUpdate: async ({ data, ...restParams }, _dataProvider) => {
                console.log(data);
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
                        ...restParams,
                        data: {
                            ...restData,
                            images,
                        },
                    };
                }
                const pdfRaw: File | undefined = pdf?.rawFile;
                const sampleRaws: File[] | undefined = newImages?.map(
                    (img: { rawFile: File }) => img.rawFile,
                );
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
                const mergedImages = [...images, ...(uploaded?.images ?? [])];
                const file = uploaded?.pdf ?? data.file;
                return {
                    ...restParams,
                    data: {
                        ...restData,
                        images: mergedImages,
                        file,
                    },
                };
            },
        },
    ],
);

export const useAppDataProvider: () => AdminProvider = useDataProvider;
