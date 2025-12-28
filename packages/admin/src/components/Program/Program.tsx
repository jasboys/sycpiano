import IconCancel from '@mui/icons-material/Cancel';
import IconDelete from '@mui/icons-material/Delete';
import { DialogActions, DialogContent, Button as MuiButton } from '@mui/material';
import type * as React from 'react';
import {
    ArrayField,
    AutocompleteInput,
    Button,
    Create,
    type CreateProps,
    Datagrid,
    Edit,
    type EditProps,
    type Identifier,
    List,
    type ListProps,
    NumberInput,
    type RaRecord,
    ReferenceInput,
    SaveButton,
    Show,
    type ShowProps,
    SimpleForm,
    SimpleShowLayout,
    TextField,
    TextInput,
    useCreate,
    useDelete,
    useNotify,
    useRecordContext,
    useRefresh,
    useUpdate,
} from 'react-admin';
import { useFormContext, useFormState } from 'react-hook-form';
import type { AdminError, MutateForm } from 'src/types.js';
import { AddReferenceButton, ControlledInput, EditReferenceButton, Empty } from '../Shared.jsx';

const PieceList: React.FC<{
    id: Identifier;
    record: RaRecord;
    resource: string;
}> = () => {
    return (
        <ArrayField source="pieces">
            <Datagrid
                bulkActionButtons={false}
                rowClick={(_, __, record) => `/pieces/${record.id}`}
            >
                <TextField source="composer" />
                <TextField source="piece" />
            </Datagrid>
        </ArrayField>
    );
};

export const ProgramList = (props: ListProps) => (
    <List {...props} perPage={25}>
        <Datagrid rowClick="show" expand={(props) => <PieceList {...props} />}>
            <TextField source="id" />
            <TextField source="nickname" />
        </Datagrid>
    </List>
);

export const ProgramShow = (props: ShowProps) => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="nickname" />
            <ArrayField source="pieces">
                <Datagrid rowClick={(_, __, record) => `/pieces/${record.id}`}>
                    <TextField source="composer" />
                    <TextField source="piece" />
                </Datagrid>
            </ArrayField>
        </SimpleShowLayout>
    </Show>
);

export const AddProgramPieceForm: React.FC<{
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
                'program-pieces',
                {
                    data: {
                        programId: record.id,
                        order: values.order,
                        ...values.piece,
                    },
                },
                {
                    onSuccess: () => {
                        setShowDialog(false);
                        notify('Created program-piece.', {
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
                        label="Program ID"
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
            pieceId
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

    return record && (
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
    );
};

export const DeleteProgramPiece = () => {
    const refresh = useRefresh();
    const record = useRecordContext();
    const [deleteOne, { isLoading }] = useDelete<RaRecord<Identifier>, AdminError>();
    const notify = useNotify();

    const handleClick = () => {
        record && deleteOne(
            'program-pieces',
            {
                id: record.pivotId,
            },
            {
                onError: (error) => {
                    notify(error.message, { type: 'error' });
                },
                onSuccess: () => {
                    notify(
                        `Deleted program-piece ${record.pivotId}`,
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

export const ProgramEdit = (props: EditProps) => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="id" disabled fullWidth />
            <TextInput source="nickname" fullWidth />
            <ArrayField source="pieces">
                <Datagrid
                    empty={<Empty assoc="Pieces" />}
                    sx={{
                        marginBottom: '1rem',
                        '& .column-undefined': {
                            paddingRight: 0,
                            paddingLeft: 0,
                        },
                        '& .column-undefined:last-of-type': {
                            paddingLeft: 0,
                            paddingRight: '1rem',
                        },
                    }}
                    rowClick={false}
                >
                    <TextField source="composer" />
                    <TextField source="piece" />
                    <EditReferenceButton
                        reference="program-pieces"
                        Component={EditProgramPiece}
                    />
                    <DeleteProgramPiece />
                </Datagrid>
            </ArrayField>
            <AddReferenceButton reference="program-pieces" Component={AddProgramPieceForm} />
        </SimpleForm>
    </Edit>
);

export const ProgramCreate = (props: CreateProps) => {
    return (
        <Create {...props}>
            <SimpleForm>
                <TextInput source="nickname" fullWidth/>
            </SimpleForm>
        </Create>
    );
};