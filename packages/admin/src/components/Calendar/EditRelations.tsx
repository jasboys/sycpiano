import IconCancel from '@mui/icons-material/Cancel.js';
import { DialogActions, DialogContent } from '@mui/material';
import {
    Button,
    NumberInput,
    SaveButton,
    TextInput,
    useNotify,
    useRecordContext,
    useRefresh,
    useUpdate,
    type Identifier,
    type RaRecord,
} from 'react-admin';
import { useFormContext, useFormState } from 'react-hook-form';
import type { AdminError, MutateForm } from 'src/types.js';

export const EditCalendarPiece: MutateForm = ({ setShowDialog }) => {
    const [update, { isLoading }] = useUpdate<
        RaRecord<Identifier>,
        AdminError
    >();
    const { handleSubmit } = useFormContext();
    const { dirtyFields } = useFormState();
    const notify = useNotify();
    const record = useRecordContext();
    const refresh = useRefresh();

    const onSubmit = async (values: Partial<RaRecord>) => {
        const { order, id: pieceId, pivotId: id } = values;
        const data: Record<string, unknown> = {
            order,
            pieceId
        };
        if (dirtyFields.composer || dirtyFields.piece) {
            data.composer = values.composer;
            data.pieceName = values.piece;
        }
        update(
            'calendar-pieces',
            {
                id,
                data,
            },
            {
                onSuccess: () => {
                    setShowDialog(false);
                    notify(`Successfully updated calendar-collaborator ${id}.`, {
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
        <>
            <DialogContent>
                <TextInput
                    label="Calendar-Piece Id"
                    source="calendarPieceId"
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
    );
};

export const EditCalendarCollaborator: MutateForm = ({
    setShowDialog
}) => {
    const [update, { isLoading }] = useUpdate<
        RaRecord<Identifier>,
        AdminError
    >();
    const { handleSubmit } = useFormContext();
    const { dirtyFields } = useFormState();
    const notify = useNotify();
    const record = useRecordContext();
    const refresh = useRefresh();

    const onSubmit = async (values: Partial<RaRecord>) => {
        const { order, id: collaboratorId, pivotId: id } = values;
        const data: Record<string, unknown> = {
            order,
            collaboratorId,
        };
        if (dirtyFields.name || dirtyFields.instrument) {
            data.collaboratorId = values.id;
            data.name = values.name;
            data.instrument = values.instrument;
        }
        update(
            'calendar-collaborators',
            {
                id,
                data,
            },
            {
                onSuccess: () => {
                    setShowDialog(false);
                    notify(
                        `Successfully updated calendar-collaborator ${id}.`,
                        {
                            type: 'success',
                            undoable: true,
                        },
                    );
                    refresh();
                },
                onError: (error) => {
                    notify(error.message, { type: 'error' });
                },
            },
        );
    };

    return (
        <>
            <DialogContent>
                <TextInput
                    label="Calendar-Collaborator Id"
                    source="calendarCollaboratorId"
                    defaultValue={record.pivotId}
                    disabled
                    fullWidth
                />
                <TextInput source="name" fullWidth />
                <TextInput source="instrument" fullWidth />
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
    );
};