import IconCancel from '@mui/icons-material/Cancel.js';
import IconDelete from '@mui/icons-material/Delete.js';
import IconRestore from '@mui/icons-material/Restore.js';
import {
    DialogActions,
    DialogContent,
    Button as MuiButton,
} from '@mui/material';
import type * as React from 'react';
import {
    ArrayField,
    Button,
    Create,
    Datagrid,
    Edit,
    FileField,
    FileInput,
    List,
    NumberField,
    NumberInput,
    SaveButton,
    SearchInput,
    SelectInput,
    Show,
    SimpleForm,
    SimpleShowLayout,
    TextField,
    TextInput,
    required,
    useCreate,
    useDelete,
    useNotify,
    useRecordContext,
    useRefresh,
    useUpdate,
    type CreateProps,
    type EditProps,
    type GetOneResult,
    type Identifier,
    type ListProps,
    type RaRecord,
    type ShowProps,
} from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import { useMutation } from 'react-query';
import { useAppDataProvider } from 'src/providers/restProvider.js';
import type { AdminError, MutateForm } from 'src/types.js';
import { AddReferenceButton, EditReferenceButton, Empty } from '../Shared.jsx';

/*
readonly id?: string;
    name: string;
    readonly audioFile: string;
    readonly waveformFile: string;
    readonly durationSeconds: number;
    readonly musicId?: string;
    hash?: string;
*/
const filters = [<SearchInput key="search" source="q" alwaysOn />];

const MusicPanel: React.FC<{
    id: Identifier;
    record: RaRecord;
    resource: string;
}> = () => {
    return (
        <ArrayField source="musicFiles" fieldKey="id" fullWidth>
            <Datagrid
                sx={{ marginBottom: '1rem' }}
                isRowSelectable={() => false}
                bulkActionButtons={false}
            >
                <TextField source="name" />
                <TextField source="audioFile" label="audio" />
                <TextField source="waveformFile" label="waveform" />
                <NumberField source="durationSeconds" label="duration" />
                <TextField source="hash" />
            </Datagrid>
        </ArrayField>
    );
};

export const MusicList = (props: ListProps) => (
    <List {...props} perPage={25} filters={filters}>
        <Datagrid
            rowClick="edit"
            expand={(props) => <MusicPanel {...props} />}
            sx={{
                '& .RaDatagrid-expandedPanel': {
                    th: {
                        backgroundColor: '#f8f8f8',
                    },
                    backgroundColor: '#f8f8f8',
                },
            }}
        >
            <TextField source="composer" />
            <TextField source="piece" />
            <TextField source="contributors" />
            <TextField source="type" />
            <NumberField source="year" options={{ useGrouping: false }} />
        </Datagrid>
    </List>
);

export const MusicShow = (props: ShowProps) => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="composer" />
            <TextField source="piece" />
            <TextField source="contributors" />
            <TextField source="type" />
            <NumberField source="year" options={{ useGrouping: false }} />
            <ArrayField source="musicFiles" fieldKey="id" fullWidth>
                <Datagrid isRowSelectable={() => false} bulkActionButtons={false}>
                    <TextField source="name" />
                    <TextField source="audioFile" label="audio" />
                    <TextField source="waveformFile" label="waveform" />
                    <NumberField source="durationSeconds" label="duration" />
                    <TextField source="hash" />
                </Datagrid>
            </ArrayField>
        </SimpleShowLayout>
    </Show>
);

const DeleteMusicFile = () => {
    const record = useRecordContext();
    const [deleteOne] = useDelete<RaRecord<Identifier>, AdminError>();
    const notify = useNotify();
    const refresh = useRefresh();

    const handleClick = () => {
        console.log(record);
        deleteOne(
            'music-files',
            {
                id: record.id,
            },
            {
                onError: (error) => {
                    notify(error.message, { type: 'error' });
                },
                onSuccess: () => {
                    notify(
                        `Deleted music-file ${record.id}`,
                    );
                    refresh();
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

export const EditMusicFile: MutateForm = ({ setShowDialog }) => {
    const refresh = useRefresh();
    const [update, { isLoading }] = useUpdate<
        RaRecord<Identifier>,
        AdminError
    >();
    const { handleSubmit } = useFormContext();
    const notify = useNotify();
    const record = useRecordContext();

    const onSubmit = async (values: Partial<RaRecord>) => {
        update(
            'music-files',
            {
                id: record.id,
                data: values,
            },
            {
                onSuccess: () => {
                    setShowDialog(false);
                    notify(`Successfully updated music-file ${record.id}.`, {
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
                    source="id"
                    defaultValue={record.id}
                    fullWidth
                    disabled
                />
                <TextInput
                    source="music"
                    label="Music ID"
                    defaultValue={record.music.id}
                    fullWidth
                    disabled
                />
                <TextInput source="name" defaultValue={record.name} fullWidth />
                <TextInput
                    source="audioFile"
                    defaultValue={record.audioFile}
                    fullWidth
                />
                <TextInput
                    source="waveformFile"
                    defaultValue={record.waveformFile}
                    fullWidth
                />
                <NumberInput
                    source="durationSeconds"
                    defaultValue={record.durationSeconds}
                    fullWidth
                    disabled
                />
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

export const AddMusicFile: React.FC<{
    setShowDialog: (t: boolean) => void;
}> = ({ setShowDialog }) => {
    const record = useRecordContext();
    const upload = useWatch({ name: 'audioFileBlob' });
    const [create, { isLoading }] = useCreate<
        RaRecord<Identifier>,
        AdminError
    >();
    const { handleSubmit } = useFormContext();
    const notify = useNotify();
    const refresh = useRefresh();

    const onSubmit = async (values: Partial<RaRecord>) => {
        create(
            'music-files',
            {
                data: values
            },
            {
                onSuccess: () => {
                    setShowDialog(false);
                    notify('Created music-file.', {
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
                    source="music"
                    label="Music ID"
                    defaultValue={record.id}
                    fullWidth
                    disabled
                />
                <TextInput source="name" fullWidth />
                <TextInput source="audioFile" defaultValue={upload?.title} fullWidth />
                <FileInput
                    accept="audio/*"
                    source="audioFileBlob"
                >
                    <FileField source="src" title="title" />
                </FileInput>
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

const RecalculateDuration = () => {
    const record = useRecordContext();
    const dataProvider = useAppDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();
    const { mutate, isLoading } = useMutation<GetOneResult, AdminError>(
        () => dataProvider.recalculateDuration(
            'music-files',
            {
                id: record.id,
            },
        ),
        {
            onError: (error) => {
                notify(error.message, { type: 'error' });
            },
            onSuccess: () => {
                notify(
                    `Recalculated duration of music-file ${record.id}`,
                );
                refresh();
            },
        },
    );

    return (
        <MuiButton onClick={() => mutate()} disabled={isLoading}>
            <IconRestore />
        </MuiButton>
    );
};

export const MusicEdit = (props: EditProps) => {
    return (
        <Edit {...props}>
            <SimpleForm>
                <TextInput source="id" fullWidth disabled />
                <TextInput source="composer" fullWidth />
                <TextInput source="piece" fullWidth />
                <TextInput source="contributors" fullWidth />
                <TextInput source="type" fullWidth />
                <NumberInput source="year" />
                <ArrayField source="musicFiles" fieldKey="id" fullWidth>
                    <Datagrid
                        empty={<Empty assoc="Music Files" />}
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
                    >
                        <TextField source="name" />
                        <TextField source="audioFile" label="audio" />
                        <TextField source="waveformFile" label="waveform" />
                        <NumberField
                            source="durationSeconds"
                            label="duration"
                        />
                        <TextField source="hash" />
                        <EditReferenceButton
                            reference="music-files"
                            Component={EditMusicFile}
                        />
                        <RecalculateDuration />
                        <DeleteMusicFile />
                    </Datagrid>
                </ArrayField>
                <AddReferenceButton
                    reference="music-files"
                    Component={AddMusicFile}
                />
            </SimpleForm>
        </Edit>
    );
};

export const MusicCreate = (props: CreateProps) => {
    return (
        <Create {...props}>
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="composer" validate={required()} fullWidth />
                <TextInput source="piece" validate={required()} fullWidth />
                <TextInput source="contributors" fullWidth />
                <SelectInput
                    source="type"
                    validate={required()}
                    fullWidth
                    choices={[
                        { id: 'solo', name: 'Solo' },
                        { id: 'concerto', name: 'Concerto' },
                        { id: 'chamber', name: 'Chamber' },
                        { id: 'composition', name: 'Composition' },
                        { id: 'videogame', name: 'Videogame' },
                    ]}
                />
                <NumberInput source="year" />
            </SimpleForm>
        </Create>
    );
};