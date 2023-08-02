import {
    EntityClass,
    EntityName,
    FilterQuery,
    Populate,
    Primary,
    wrap,
} from '@mikro-orm/core';
import orm from 'src/database.js';
import { CrudActions, NotFoundError, SearchParams } from './types.js';

interface CrudParams<R extends object, K extends keyof R & string> {
    entity: EntityClass<R>;
    populate?: string[];
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
            const typeOfField = orm.em.getMetadata().get<R>(name).properties[
                field
            ].type;
            if (typeOfField === 'string') {
                return {
                    [field]: {
                        $ilike: `%${token}%`,
                    },
                };
            } else {
                return {
                    [field]: token,
                };
            }
        });
    };

const mikroSearchFields = <R extends Object, K extends keyof R & string>(
    entity: EntityName<R>,
    searchableFields: K[],
    populate?: string[],
) => {
    const mappedFields = mapSearchFields(entity, searchableFields);
    return async ({ q, limit }: SearchParams) => {
        const tokens = q.trim().replaceAll(', ', '|').replaceAll(' ', '&');
        const splitTokens = tokens.split('|').map((t) => t.split('&'));

        const where = {
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

        const results = await orm.em.findAndCount(entity, where, {
            limit,
            populate: populate as Populate<R>,
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
            const created = orm.em.create(entity, body);
            await orm.em.persist(created).flush();
            return created as R & { id: I };
        },
        update: async (id, body) => {
            const record = await orm.em.findOneOrFail(entity, { id } as R, {
                failHandler: () => new NotFoundError(),
            });
            wrap(record).assign(body, { mergeObjects: true });
            await orm.em.flush();
            return record;
        },
        updateMany: async (ids, body) => {
            const [records, count] = await orm.em.findAndCount(entity, {
                id: { $in: ids },
            } as R);
            for (const record of records) {
                wrap(record).assign(body, { mergeObjects: true });
                // pojoRecords.push(wrap(record).toPOJO());
            }
            await orm.em.flush();
            return {
                count,
                rows: records,
            };
        },
        getOne: async (id) => {
            const record = await orm.em.findOneOrFail(entity, id, {
                populate: populate as Populate<R>,
                failHandler: () => new NotFoundError(),
            });
            return record;
        },
        getList: async ({ filter, limit, offset, order }) => {
            const [rows, count] = await orm.em.findAndCount(entity, filter, {
                limit,
                offset,
                orderBy: order,
                populate: populate as Populate<R>,
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
        search: searchableFields
            ? mikroSearchFields(entity, searchableFields, populate)
            : null,
    };
};
