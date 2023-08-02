import IconDelete from '@mui/icons-material/Delete.js';
import { Button as MuiButton } from '@mui/material';
import React from 'react';
import { Identifier, RaRecord, useDelete, useNotify, useRecordContext } from 'react-admin';
import { AdminError } from 'src/types.js';

export const DeleteCalendarPiece: React.FC<{ onRefresh: () => void }> = ({
    onRefresh,
}) => {
    const record = useRecordContext();
    const [deleteOne] = useDelete<RaRecord<Identifier>, AdminError>();
    const notify = useNotify();

    const handleClick = () => {
        console.log(record);
        deleteOne(
            'calendar-pieces',
            {
                id: record.calendarPieces[0].id,
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

export const DeleteCalendarCollaborator: React.FC<{ onRefresh: () => void }> = ({
    onRefresh,
}) => {
    const record = useRecordContext();
    const [deleteOne] = useDelete<
        RaRecord<Identifier>,
        AdminError
    >();
    const notify = useNotify();

    const handleClick = () => {
        console.log(record);
        deleteOne(
            'calendar-collaborators',
            {
                id: record.calendarCollaborators[0].id,
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