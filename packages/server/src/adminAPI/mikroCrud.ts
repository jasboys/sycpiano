import {
    type EntityClass,
    type EntityName,
    type FilterQuery,
    type FindOptions,
    type Populate,
    type Primary,
    wrap,
} from '@mikro-orm/core';
import orm from '../database.js';
import {
    type CrudActions,
    type CrudUpdateData,
    NotFoundError,
    type SearchParams,
} from './types.js';

interface CrudParams<
    R extends { id: string | number },
    K extends keyof R & string = never,
> {
    entity: EntityClass<R>;
    populate?: FindOptions<R, any>['populate'];
    searchableFields?: K[];
}

const mapSearchFields =
    <R extends object, K extends keyof R & string>(
        entity: EntityName<R>,
        searchableFields: K[],
    ) =>
    (token: string) => {
        return searchableFields.map((field) => {
            const name = entity.name;
            const metaData =
                typeof name === 'string'
                    ? orm.em.getMetadata().getByClassName(name)
                    : orm.em.getMetadata().get(name);
            const typeOfField = metaData.properties[field].type;
            if (typeOfField === 'string') {
                return {
                    [field]: {
                        $ilike: `%${token}%`,
                    },
                };
            }
            return {
                [field]: token,
            };
        });
    };

const mikroSearchFields = <R extends {}, K extends keyof R & string>(
    entity: EntityName<R>,
    searchableFields?: K[],
    populate?: Populate<R, any>,
) => {
    const mappedFields =
        searchableFields && mapSearchFields(entity, searchableFields);
    return async ({ q, limit }: SearchParams) => {
        const matchArray = q.trim().match(/^id:(.*)$/i);
        let where: FilterQuery<R>;
        if (matchArray?.[1]) {
            where = {
                id: {
                    $ilike: `%${matchArray[1]}%`,
                },
            } as unknown as FilterQuery<R>;
        } else if (!mappedFields) {
            where = q.trim() as FilterQuery<R>;
        } else {
            const tokens = q.trim().replaceAll(', ', '|').replaceAll(' ', '&');
            const splitTokens = tokens.split('|').map((t) => t.split('&'));
            where = {
                $or: splitTokens.map((token) => {
                    return {
                        $and: token.map((v) => {
                            return {
                                $or: mappedFields(v),
                            };
                        }),
                    };
                }),
            } as FilterQuery<R>;
        }
        const results = await orm.em.findAndCount(entity, where, {
            limit,
            populate,
        });

        return { rows: results[0], count: results[1] };
    };
};

export const mikroCrud = <
    R extends { id: string | number },
    K extends keyof R & string = never,
>({
    entity,
    populate,
    searchableFields,
}: CrudParams<R, K>): CrudActions<R> => {
    return {
        create: async (body) => {
            console.log(body);
            const created = orm.em.create(entity, body);
            await orm.em.persist(created).flush();
            return created as R;
        },
        update: async (id, body) => {
            const record = await orm.em.findOneOrFail(
                entity,
                { id } as FilterQuery<R>,
                {
                    failHandler: () => new NotFoundError(),
                },
            );
            wrap(record).assign(body as CrudUpdateData<R>, {
                mergeObjectProperties: true,
            });
            await orm.em.flush();
            return record;
        },
        updateMany: async (ids, body) => {
            const { records, count } = await orm.em.transactional(
                async (forkedEm) => {
                    const [records, count] = await forkedEm.findAndCount(
                        entity,
                        {
                            id: { $in: ids },
                        } as unknown as FilterQuery<R>,
                    );
                    for (const record of records) {
                        wrap(record).assign(body as CrudUpdateData<R>, {
                            mergeObjectProperties: true,
                        });
                    }
                    return { records, count };
                },
            );

            return {
                count,
                rows: records,
            };
        },
        getOne: async (id) => {
            const record = await orm.em.findOneOrFail(
                entity,
                { id } as FilterQuery<R>,
                {
                    populate,
                    failHandler: () => new NotFoundError(),
                },
            );
            return record;
        },
        getList: async ({ filter, limit, offset, order }) => {
            const [rows, count] = await orm.em.findAndCount(entity, filter, {
                limit,
                offset,
                orderBy: order,
                populate,
            });
            return { rows, count };
        },
        destroy: async (id) => {
            const record = orm.em.getReference(
                entity,
                id as NonNullable<Primary<R>>,
            );
            await orm.em.remove(record).flush();
            return { id };
        },
        search: mikroSearchFields(entity, searchableFields, populate),
    };
};
