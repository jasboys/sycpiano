import IconCancel from '@mui/icons-material/Cancel.js';
import { DialogActions, DialogContent } from '@mui/material';
import type React from 'react';
import {
    AutocompleteInput,
    Button,
    NumberInput,
    ReferenceInput,
    SaveButton,
    TextInput,
    useChoicesContext,
    useCreate,
    useNotify,
    useRecordContext,
    useRefresh,
    type Identifier,
    type RaRecord,
    type TextInputProps,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import type { AdminError } from 'src/types.js';

interface ControllerInputProps extends TextInputProps {
    property: string;
}

const ControlledInput = ({
    source,
    property,
    ...rest
}: ControllerInputProps) => {
    const { selectedChoices } = useChoicesContext();

    return (
        <TextInput
            source={source}
            disabled={!!selectedChoices[0]}
            defaultValue={selectedChoices[0]?.[property]}
            {...rest}
        />
    );
};

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
                    <>
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
                    </>
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
                    <>
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
                    </>
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
    );
};