import IconDelete from '@mui/icons-material/Delete.js';
import { Button as MuiButton } from '@mui/material';
import React from 'react';
import {
    Identifier,
    RaRecord,
    useDelete,
    useEditContext,
    useNotify,
    useRecordContext,
} from 'react-admin';
import { AdminError } from 'src/types.js';

export const DeleteCalendarPiece: React.FC<{
    onRefresh: () => void;
}> = ({ onRefresh }) => {
    const record = useRecordContext();
    const { record: calendarRecord } = useEditContext();
    const [deleteOne] = useDelete<RaRecord<Identifier>, AdminError>();
    const notify = useNotify();

    const handleClick = () => {
        console.log(record);
        const calendarPiece = (
            record.calendarPieces as Array<{ calendar: string | { id: string }; id: string }>
        ).find((c) => {
            return typeof c.calendar === 'string'
                ? c.calendar === calendarRecord.id
                : c.calendar.id === calendarRecord.id;
        });
        console.log(calendarPiece);
        calendarPiece &&
            deleteOne(
                'calendar-pieces',
                {
                    id: calendarPiece.id,
                },
                {
                    mutationMode: 'pessimistic',
                    onError: (error) => {
                        notify(error.message, { type: 'error' });
                    },
                    onSuccess: () => {
                        notify(
                            `Deleted calendar-piece ${record.calendarPieces[0].id}`,
                        );
                        onRefresh();
                    },
                },
            );
    };

    return (
        <MuiButton onClick={handleClick}>
            <IconDelete sx={{ fill: '#d32f2f' }} />
        </MuiButton>
    );
};

export const DeleteCalendarCollaborator: React.FC<{
    onRefresh: () => void;
}> = ({ onRefresh }) => {
    const record = useRecordContext();
    const { record: calendarRecord } = useEditContext();
    const [deleteOne] = useDelete<RaRecord<Identifier>, AdminError>();
    const notify = useNotify();

    const handleClick = () => {
        console.log(record);
        const calendarCollaborator = (
            record.calendarCollaborators as Array<{
                calendar: string | { id: string };
                id: string;
            }>
        ).find((c) => {
            return typeof c.calendar === 'string'
                ? c.calendar === calendarRecord.id
                : c.calendar.id === calendarRecord.id;
        });
        console.log(calendarCollaborator);
        calendarCollaborator &&
            deleteOne(
                'calendar-collaborators',
                {
                    id: calendarCollaborator.id,
                },
                {
                    mutationMode: 'pessimistic',
                    onError: (error) => {
                        notify(error.message, { type: 'error' });
                    },
                    onSuccess: () => {
                        notify(
                            `Deleted calendar-collaborator ${record.calendarCollaborators[0].id}`,
                        );
                        onRefresh();
                    },
                },
            );
    };

    return (
        <MuiButton onClick={handleClick}>
            <IconDelete sx={{ fill: '#d32f2f' }} />
        </MuiButton>
    );
};