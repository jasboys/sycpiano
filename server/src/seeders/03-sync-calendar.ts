import { extractEventDescription, getCalendarEvents } from '../gapi/calendar';

import {
    GCalEvent,
    ModelMap,
} from 'types';

import db from '../models';
import { CalendarCreationAttributes } from '../models/calendar';
import { PieceAttributes } from 'models/piece';
import { CollaboratorAttributes } from 'models/collaborator';

export const up = async (models: ModelMap): Promise<void> => {
    try {
        let responseItems: GCalEvent[] = [];
        let nextPageToken: string | undefined;
        let syncToken: string | undefined;
        do {
            const response = await getCalendarEvents(db.sequelize, nextPageToken, syncToken);
            responseItems = responseItems.concat(response.data.items);
            nextPageToken = response.data.nextPageToken;
            syncToken = response.data.nextSyncToken;
        } while (!!nextPageToken && !syncToken);
        // console.log(syncToken);
        const calendarModel = models.calendar;
        const pieceModel = models.piece;
        const collaboratorModel = models.collaborator;
        const tokenModel = models.token;
        const items: Array<{
            [key: string]: any;
        }> = responseItems.map((event) => {
            const dateTime = event.start.dateTime ? event.start.dateTime : event.start.date;
            const timezone = event.start.dateTime ? event.start.timeZone : '';
            const {
                collaborators,
                pieces,
                type,
                website,
            } = extractEventDescription(event);

            const id = event.id;
            const name = event.summary;
            const location = event.location;

            return {
                id,
                name,
                dateTime,
                timezone,
                location,
                website,
                type,
                pieces,
                collaborators,
            };
        });

        await Promise.each(items, async (item) => {
            let currentItem: any;
            try {
                const { pieces, collaborators, ...attributes } = item;

                const itemInstance = await calendarModel.create(attributes as CalendarCreationAttributes);
                currentItem = itemInstance;
                await Promise.each<PieceAttributes>(pieces, async ({ composer, piece }, index: number) => {
                    currentItem = { composer, piece };
                    const [ pieceInstance ] = await pieceModel.findOrCreate({
                        where: { composer, piece },
                    });
                    await itemInstance.addPiece(pieceInstance, { through: { order: index }});
                });
                await Promise.each<CollaboratorAttributes>(collaborators, async ({ name, instrument }, index: number) => {
                    currentItem = { name, instrument };
                    const [collaboratorInstance] = await collaboratorModel.findOrCreate({
                        where: { name, instrument },
                    });
                    await itemInstance.addCollaborator(collaboratorInstance, { through: { order: index }}) ;
                });
            } catch (e) {
                console.log(`currentItem: ${currentItem}`);
                console.log(e);
            }
        });

        await tokenModel.create({ id: 'calendar_sync', token: syncToken, expires: undefined });
    } catch (e) {
        console.log(e);
        return;
    }
};

export const down = async (models: ModelMap): Promise<void> => {
    await Promise.all([
        models.calendar.destroy({ where: {}, cascade: true }),
        models.collaborator.destroy({ where: {}, cascade: true }),
        models.piece.destroy({ where: {}, cascade: true }),
        models.token.destroy({ where: {}, cascade: true }),
    ]);
};
