import {
    DataProvider,
    GetListResult,
    HttpError,
    Identifier,
    RaRecord,
    useDataProvider,
} from 'react-admin';
import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';
import { omit } from 'lodash-es';
import { toUTC } from '../utils';

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
}

export const useAppDataProvider: () => AdminProvider = useDataProvider;

export default provider;
