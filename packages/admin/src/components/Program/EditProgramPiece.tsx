import IconCancel from '@mui/icons-material/Cancel';
import { DialogActions, DialogContent } from '@mui/material';
import {
    Button,
    type Identifier,
    NumberInput,
    type RaRecord,
    SaveButton,
    TextInput,
    useNotify,
    useRecordContext,
    useRefresh,
    useUpdate,
} from 'react-admin';
import { useFormContext, useFormState } from 'react-hook-form';
import type { AdminError, MutateForm } from '../../types.js';

export const EditProgramPiece: MutateForm = ({ setShowDialog }) => {
    const [update, { isLoading }] = useUpdate<
        RaRecord<Identifier>,
        AdminError
    >();
    const { handleSubmit } = useFormContext();
    const { dirtyFields } = useFormState();
    const notify = useNotify();
    const record = useRecordContext();
    const refresh = useRefresh();
    console.log(record);

    const onSubmit = async (values: Partial<RaRecord>) => {
        const { order, id: pieceId, pivotId: id } = values;
        const data: Record<string, unknown> = {
            order,
            pieceId,
        };
        if (dirtyFields.composer || dirtyFields.piece) {
            data.composer = values.composer;
            data.pieceName = values.piece;
        }
        update(
            'program-pieces',
            {
                id,
                data,
            },
            {
                onSuccess: () => {
                    setShowDialog(false);
                    notify(`Successfully updated program-piece ${id}.`, {
                        type: 'success',
                        undoable: true,
                    });
                    refresh();
                },
                onError: (error) => {
                    notify(error.message, { type: 'error' });
                },
            },
        );
    };

    return (
        record && (
            <>
                <DialogContent>
                    <TextInput
                        label="Program-Piece Id"
                        source="programPieceId"
                        defaultValue={record.pivotId}
                        disabled
                        fullWidth
                    />
                    <TextInput source="composer" fullWidth />
                    <TextInput source="piece" fullWidth />
                    <NumberInput source="order" defaultValue={record.order} />
                </DialogContent>
                <DialogActions>
                    <Button
                        label="ra.action.cancel"
                        onClick={() => setShowDialog(false)}
                        disabled={isLoading}
                    >
                        <IconCancel />
                    </Button>
                    <SaveButton
                        onClick={handleSubmit(onSubmit)}
                        type="button"
                        disabled={isLoading}
                    />
                </DialogActions>
            </>
        )
    );
};
