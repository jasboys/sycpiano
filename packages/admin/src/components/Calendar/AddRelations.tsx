import IconCancel from '@mui/icons-material/Cancel';
import { DialogActions, DialogContent } from '@mui/material';
import type React from 'react';
import {
    AutocompleteInput,
    Button,
    type Identifier,
    NumberInput,
    type RaRecord,
    ReferenceInput,
    SaveButton,
    TextInput,
    useCreate,
    useNotify,
    useRecordContext,
    useRefresh,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import type { AdminError } from 'src/types.js';
import { ControlledInput } from '../Shared.jsx';

export const AddCalendarPieceForm: React.FC<{
    setShowDialog: (t: boolean) => void;
}> = ({ setShowDialog }) => {
    const record = useRecordContext();
    const [create, { isLoading }] = useCreate<
        RaRecord<Identifier>,
        AdminError
    >();
    const { handleSubmit } = useFormContext();
    const notify = useNotify();
    const refresh = useRefresh();

    const onSubmit = async (values: Partial<RaRecord>) => {
        record &&
            create(
                'calendar-pieces',
                {
                    data: {
                        calendarId: record.id,
                        order: values.order,
                        ...values.piece,
                    },
                },
                {
                    onSuccess: () => {
                        setShowDialog(false);
                        notify('Created calendar-piece.', {
                            type: 'success',
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
                        label="Calendar ID"
                        source="id"
                        defaultValue={record.id}
                        disabled
                        fullWidth
                    />
                    <ReferenceInput source="piece.id" reference="pieces">
                        <AutocompleteInput
                            fullWidth
                            source="piece.id"
                            label="Existing Piece"
                            filterToQuery={(searchText) => ({
                                q: searchText
                                    .replaceAll(/[:-]/g, '')
                                    .replaceAll(/\s+/g, ' '),
                            })}
                            optionText={(record) =>
                                record
                                    ? `${record.composer}: ${record.piece}`
                                    : ''
                            }
                            shouldRenderSuggestions={(val: string) => {
                                return val.trim().length > 2;
                            }}
                            noOptionsText="No Results"
                        />
                        <ControlledInput
                            source="piece.composer"
                            property="composer"
                            fullWidth
                        />
                        <ControlledInput
                            source="piece.piece"
                            property="piece"
                            fullWidth
                        />
                    </ReferenceInput>
                    <NumberInput source="order" />
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

export const AddCalendarCollaboratorForm: React.FC<{
    setShowDialog: (t: boolean) => void;
}> = ({ setShowDialog }) => {
    const record = useRecordContext();
    const [create, { isLoading }] = useCreate<
        RaRecord<Identifier>,
        AdminError
    >();
    const { handleSubmit } = useFormContext();
    const notify = useNotify();
    const refresh = useRefresh();

    const onSubmit = async (values: Partial<RaRecord>) => {
        record &&
            create(
                'calendar-collaborators',
                {
                    data: {
                        calendarId: record.id,
                        order: values.order,
                        ...values.collaborator,
                    },
                },
                {
                    onSuccess: () => {
                        setShowDialog(false);
                        notify('Created calendar-collaborator.', {
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
                        label="Calendar ID"
                        source="id"
                        defaultValue={record.id}
                        disabled
                        fullWidth
                    />
                    <ReferenceInput
                        source="collaborator.id"
                        reference="collaborators"
                    >
                        <AutocompleteInput
                            fullWidth
                            source="collaborator.id"
                            label="Existing Collaborator"
                            filterToQuery={(searchText) => ({
                                q: searchText
                                    .replaceAll(/[:-]/g, '')
                                    .replaceAll(/\s+/g, ' '),
                            })}
                            optionText={(record) =>
                                record
                                    ? `${record.name}: ${record.instrument}`
                                    : ''
                            }
                            shouldRenderSuggestions={(val: string) => {
                                return val.trim().length > 2;
                            }}
                            noOptionsText="No Results"
                        />
                        <ControlledInput
                            source="collaborator.name"
                            property="name"
                            fullWidth
                        />
                        <ControlledInput
                            source="collaborator.instrument"
                            property="instrument"
                            fullWidth
                        />
                    </ReferenceInput>
                    <NumberInput source="order" />
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