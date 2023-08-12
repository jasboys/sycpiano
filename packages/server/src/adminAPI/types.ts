import {
    EntityData,
    FilterQuery,
    Primary,
    QueryOrderMap,
    RequiredEntityData,
} from '@mikro-orm/core';
import type { Request, Response } from 'express';

export interface FilterOptions<R extends object> {
    filters: FilterQuery<R>;
    primaryKeyName?: string;
}

interface ListReturn<R extends object> {
    count: number;
    rows: EntityData<R>[];
}
interface GetListParams<R extends object> {
    filter: FilterQuery<R>;
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

export interface CrudActions<
    I extends NonNullable<Primary<R>>,
    R extends object,
> {
    create:
        | ((
              body: RequiredEntityData<R>,
              opts: RequestResponse,
          ) => Promise<EntityData<R> & { id: I | number | string }>)
        | null;
    update:
        | (<ExtraParams extends Record<string, string>>(
              id: I,
              body: EntityData<R> & ExtraParams,
              opts: RequestResponse,
          ) => Promise<EntityData<R>>)
        | null;
    updateMany:
        | ((
              ids: I[],
              body: EntityData<R>,
              opts: RequestResponse,
          ) => Promise<ListReturn<R>>)
        | null;
    getOne: ((id: I, opts: RequestResponse) => Promise<EntityData<R>>) | null;
    getList:
        | ((
              params: GetListParams<R>,
              opts: RequestResponse,
          ) => Promise<ListReturn<R>>)
        | null;
    destroy: ((id: I, opts: RequestResponse) => Promise<{ id: I }>) | null;
    search:
        | ((
              params: SearchParams,
              opts: RequestResponse,
          ) => Promise<ListReturn<R>>)
        | null;
}
