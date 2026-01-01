import IconDelete from '@mui/icons-material/Delete';
import {
    Button as MuiButton,
} from '@mui/material';
import {
    type Identifier,
    type RaRecord,
    useDelete,
    useNotify,
    useRecordContext,
    useRefresh,
} from 'react-admin';
import type { AdminError } from '../../types.js';

export const DeleteProgramPiece = () => {
    const refresh = useRefresh();
    const record = useRecordContext();
    const [deleteOne, { isLoading }] = useDelete<
        RaRecord<Identifier>,
        AdminError
    >();
    const notify = useNotify();

    const handleClick = () => {
        record &&
            deleteOne(
                'program-pieces',
                {
                    id: record.pivotId,
                },
                {
                    onError: (error) => {
                        notify(error.message, { type: 'error' });
                    },
                    onSuccess: () => {
                        notify(`Deleted program-piece ${record.pivotId}`);
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