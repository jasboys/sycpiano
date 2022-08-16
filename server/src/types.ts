import * as Sequelize from 'sequelize';
import { acclaim } from './models/acclaim';
import { bio } from './models/bio';
import { calendar } from './models/calendar';
import { calendarCollaborator } from './models/calendarCollaborator';
import { calendarPiece } from './models/calendarPiece';
import { collaborator } from './models/collaborator';
import { disc } from './models/disc';
import { discLink } from './models/discLink';
import { music } from './models/music';
import { musicFile } from './models/musicFile';
import { photo } from './models/photo';
import { piece } from './models/piece';
import { token } from './models/token';
import { product } from './models/product';
import { user } from './models/user';
import { userProduct } from './models/userProduct'
import { faq } from './models/faq';
import { Actions as CrudActions } from 'express-crud-router';
import { Request, Response } from 'express';

export type UpdateMany<R> = (ids: string[], data: R, opts?: {
    req: Request;
    res: Response;
}) => Promise<any>

export interface Actions<I extends string | number, R> extends CrudActions<I, R> {
    updateMany: UpdateMany<R>;
}

type Model = Sequelize.Model<any, any>
type ModelStatic<T extends Model> = Sequelize.ModelStatic<T>;

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

export type ModelExport<M extends Model> = {
    model: ModelStatic<M>;
    associate?: (models: ModelMap) => void;
}

export interface ModelMap {
    acclaim: ModelStatic<acclaim>;
    bio: ModelStatic<bio>;
    calendar: ModelStatic<calendar>;
    calendarCollaborator: ModelStatic<calendarCollaborator>;
    calendarPiece: ModelStatic<calendarPiece>;
    collaborator: ModelStatic<collaborator>;
    disc: ModelStatic<disc>;
    discLink: ModelStatic<discLink>;
    music: ModelStatic<music>;
    musicFile: ModelStatic<musicFile>;
    photo: ModelStatic<photo>;
    piece: ModelStatic<piece>;
    token: ModelStatic<token>;
    product: ModelStatic<product>;
    user: ModelStatic<user>;
    userProduct: ModelStatic<userProduct>;
    faq: ModelStatic<faq>;
}

export interface IndexedModelMap extends Partial<ModelMap> {
    [key: string]: ModelStatic<Model> | undefined;
}

export interface DB {
    readonly sequelize: Sequelize.Sequelize;
    importModels: (seq: Sequelize.Sequelize) => ModelMap;
    readonly models: ModelMap;
}

export interface ShopItem {
    readonly description: string;
    readonly id: string;
    readonly name: string;
    readonly price: number;
    readonly images: string[];
    readonly format?: string;
    readonly pages?: number;
    readonly sample?: string;
    readonly permalink?: string;
}
