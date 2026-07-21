import type {
    EntityData,
    FilterQuery,
    FromEntityType,
    IsSubset,
    Loaded,
    QueryOrderMap,
    RequiredEntityData,
} from '@mikro-orm/core';
import type { Request, Response } from 'express';

export interface FilterOptions<R extends object> {
    filters: FilterQuery<NoInfer<R>>;
    primaryKeyName?: string;
}

interface ListReturn<R extends object> {
    count: number;
    rows: EntityData<R>[];
}
interface GetListParams<R extends object> {
    filter: FilterQuery<NoInfer<R>>;
    limit?: number;
    offset?: number;
    order: QueryOrderMap<R>[];
}

export interface SearchParams {
    limit?: number;
    q: string;
}

export interface RequestResponse {
    req: Request;
    res: Response;
}

export class NotFoundError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'NotFound';
    }
}

export type CrudUpdateData<R extends object> = EntityData<
    FromEntityType<Loaded<R, never, never, never>>
>;

export type CrudId<R extends { id: string | number }> = R['id'];

export interface CrudActions<R extends { id: string | number }> {
    create:
        | ((
              body: RequiredEntityData<R>,
              opts: RequestResponse,
          ) => Promise<EntityData<R> & { id: CrudId<R> }>)
        | null;
    update:
        | (<ExtraParams extends Record<string, string>>(
              id: CrudId<R>,
              body: CrudUpdateData<R> & ExtraParams,
              opts: RequestResponse,
          ) => Promise<EntityData<R>>)
        | null;
    updateMany:
        | ((
              ids: CrudId<R>[],
              body: R &
                  IsSubset<
                      EntityData<FromEntityType<Loaded<R, never, '*', never>>>,
                      R
                  >,
              opts: RequestResponse,
          ) => Promise<ListReturn<R>>)
        | null;
    getOne:
        | ((id: CrudId<R>, opts: RequestResponse) => Promise<EntityData<R>>)
        | null;
    getList:
        | ((
              params: GetListParams<R>,
              opts: RequestResponse,
          ) => Promise<ListReturn<R>>)
        | null;
    destroy:
        | ((id: CrudId<R>, opts: RequestResponse) => Promise<{ id: CrudId<R> }>)
        | null;
    search:
        | ((
              params: SearchParams,
              opts: RequestResponse,
          ) => Promise<ListReturn<R>>)
        | null;
}
