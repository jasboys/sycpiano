import IconDelete from '@mui/icons-material/Delete.js';
import { Button as MuiButton } from '@mui/material';
import {
    useDelete,
    useNotify,
    useRecordContext,
    useRefresh,
    type Identifier,
    type RaRecord,
} from 'react-admin';
import type { AdminError } from 'src/types.js';

export const DeleteCalendarPiece = () => {
    const refresh = useRefresh();
    const record = useRecordContext();
    const [deleteOne, { isLoading }] = useDelete<RaRecord<Identifier>, AdminError>();
    const notify = useNotify();

    const handleClick = () => {
        deleteOne(
            'calendar-pieces',
            {
                id: record.pivotId,
            },
            {
                onError: (error) => {
                    notify(error.message, { type: 'error' });
                },
                onSuccess: () => {
                    notify(
                        `Deleted calendar-piece ${record.pivotId}`,
                    );
                    refresh();
                },
            },
        );
    };

    return (
        <MuiButton onClick={handleClick} disabled={isLoading}>
            <IconDelete sx={{ fill: '#d32f2f' }} />
        </MuiButton>
    );
};

export const DeleteCalendarCollaborator = () => {
    const refresh = useRefresh();
    const record = useRecordContext();
    const [deleteOne, { isLoading }] = useDelete<RaRecord<Identifier>, AdminError>();
    const notify = useNotify();


    const handleClick = () => {
            deleteOne(
                'calendar-collaborators',
                {
                    id: record.pivotId,
                },
                {
                    onError: (error) => {
                        notify(error.message, { type: 'error' });
                    },
                    onSuccess: () => {
                        notify(
                            `Deleted calendar-collaborator ${record.pivotId}`,
                        );
                        refresh();
                    },
                },
            );
    };

    return (
        <MuiButton onClick={handleClick} disabled={isLoading}>
            <IconDelete sx={{ fill: '#d32f2f' }} />
        </MuiButton>
    );
};