import IconCancel from '@mui/icons-material/Cancel.js';
import { DialogActions, DialogContent } from '@mui/material';
import {
    Button,
    Identifier,
    NumberInput,
    RaRecord,
    SaveButton,
    TextInput,
    useNotify,
    useRecordContext,
    useUpdate,
} from 'react-admin';
import { useFormContext, useFormState } from 'react-hook-form';
import { AdminError, MutateForm } from 'src/types.js';

export const EditCalendarPiece: MutateForm = ({ setShowDialog, onRefresh }) => {
    const [update, { isLoading }] = useUpdate<
        RaRecord<Identifier>,
        AdminError
    >();
    const { handleSubmit } = useFormContext();
    const { dirtyFields } = useFormState();
    const notify = useNotify();
    const record = useRecordContext();

    const onSubmit = async (values: Partial<RaRecord>) => {
        const { order, calendarPieces } = values;
        const id = calendarPieces[0].id;
        const data: Record<string, unknown> = {
            order: order,
        };
        if (dirtyFields.composer || dirtyFields.piece) {
            data.pieceId = values.id;
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
                mutationMode: 'pessimistic',
                onSuccess: () => {
                    setShowDialog(false);
                    notify(`Successfully updated calendar-piece ${id}.`, {
                        type: 'success',
                        undoable: true,
                    });
                    onRefresh();
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
                    source="calendarPieces[0].id"
                    defaultValue={record.calendarPieces[0].id}
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
    setShowDialog,
    onRefresh,
}) => {
    const [update, { isLoading }] = useUpdate<
        RaRecord<Identifier>,
        AdminError
    >();
    const { handleSubmit } = useFormContext();
    const { dirtyFields } = useFormState();
    const notify = useNotify();
    const record = useRecordContext();

    const onSubmit = async (values: Partial<RaRecord>) => {
        const { order, calendarCollaborators } = values;
        const id = calendarCollaborators[0].id;
        const data: Record<string, unknown> = {
            order: order,
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
                mutationMode: 'pessimistic',
                onSuccess: () => {
                    setShowDialog(false);
                    notify(
                        `Successfully updated calendar-collaborator ${id}.`,
                        {
                            type: 'success',
                            undoable: true,
                        },
                    );
                    onRefresh();
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
                    source="calendarCollaborators[0].id"
                    defaultValue={record.calendarCollaborators[0].id}
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