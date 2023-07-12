import { Actions as CrudActions } from 'express-crud-router';
import { Request, Response } from 'express';

export type UpdateMany<R> = (ids: string[], data: R, opts?: {
    req: Request;
    res: Response;
}) => Promise<any>

export interface Actions<I extends string, R> extends CrudActions<I, R> {
    updateMany: UpdateMany<R>;
}

export interface GCalEvent {
    readonly description: any;
    readonly id: string;
    readonly location: string;
    readonly start: {
        readonly dateTime?: Date;
        readonly date?: Date;
        readonly timeZone?: string;
    };
    readonly summary: string;
    readonly [key: string]: any; // other params
}

export interface ShopItem {
    readonly description?: string;
    readonly id: string;
    readonly name: string;
    readonly price: number;
    readonly images?: string[];
    readonly format?: string;
    readonly pages?: number;
    readonly sample?: string;
    readonly permalink?: string;
}
