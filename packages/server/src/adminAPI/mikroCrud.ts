import {
    type EntityClass,
    type EntityData,
    type EntityName,
    type FilterQuery,
    type FindOptions,
    type FromEntityType,
    type IsSubset,
    type Loaded,
    type Populate,
    type Primary,
    wrap,
} from '@mikro-orm/core';
import orm from '../database.js';
import { type CrudActions, NotFoundError, type SearchParams } from './types.js';

interface CrudParams<R extends {}, K extends keyof R & string> {
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
            const name =
                typeof entity === 'string'
                    ? entity
                    : (entity as EntityClass<R>).name;
            const typeOfField = orm.em.getMetadata().get(name).properties[
                field
            ].type;
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
    populate?: Populate<R, string>,
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
    I extends NonNullable<Primary<R>>,
    R extends object,
    K extends keyof R & string,
>({
    entity,
    populate,
    searchableFields,
}: CrudParams<R, K>): CrudActions<I, R> => {
    return {
        create: async (body) => {
            console.log(body);
            const created = orm.em.create(entity, body);
            await orm.em.persist(created).flush();
            return created as R & { id: I };
        },
        update: async (id, body) => {
            const record = await orm.em.findOneOrFail(entity, { id } as R, {
                failHandler: () => new NotFoundError(),
            });
            wrap(record).assign(
                body as R &
                    IsSubset<
                        EntityData<
                            FromEntityType<Loaded<R, never, '*', never>>
                        >,
                        R
                    >,
                { mergeObjectProperties: true },
            );
            await orm.em.flush();
            return record;
        },
        updateMany: async (ids, body) => {
            const [records, count] = await orm.em.findAndCount(entity, {
                id: { $in: ids },
            } as R);
            for (const record of records) {
                wrap(record).assign(body, { mergeObjectProperties: true });
            }
            await orm.em.flush();
            return {
                count,
                rows: records,
            };
        },
        getOne: async (id) => {
            const record = await orm.em.findOneOrFail(entity, id, {
                populate,
                failHandler: () => new NotFoundError(),
            });
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
            const record = await orm.em.getReference(
                entity,
                id as NonNullable<Primary<R>>,
            );
            await orm.em.remove(record).flush();
            return { id };
        },
        search: mikroSearchFields(entity, searchableFields, populate),
    };
};
