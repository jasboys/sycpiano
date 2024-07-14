import IconCancel from '@mui/icons-material/Cancel.js';
import IconDelete from '@mui/icons-material/Delete';
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
    List,
    NumberField,
    NumberInput,
    SaveButton,
    SearchInput,
    Show,
    SimpleForm,
    SimpleShowLayout,
    TextField,
    TextInput,
    UrlField,
    required,
    useCreate,
    useDelete,
    useNotify,
    useRecordContext,
    useRefresh,
    useUpdate,
    type CreateProps,
    type EditProps,
    type Identifier,
    type ListProps,
    type RaRecord,
    type ShowProps,
    type UseRecordContextParams,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import type { AdminError, MutateForm } from 'src/types.js';
import { DISC_THUMB_URI } from 'src/uris';
import { AddReferenceButton, EditReferenceButton, Empty } from '../Shared.jsx';

const DiscPanel: React.FC<{
    id: Identifier;
    record: RaRecord;
    resource: string;
}> = () => {
    return (
        <ArrayField source="discLinks">
            <Datagrid
                isRowSelectable={() => false}
                bulkActionButtons={false}
                sx={{ marginBottom: '1rem' }}
            >
                <TextField source="type" label="Distributor" />
                <UrlField
                    source="url"
                    label="Url"
                    target="_blank"
                    rel="noopener noreferrer"
                />
            </Datagrid>
        </ArrayField>
    );
};

const filters = [<SearchInput key="search" source="q" alwaysOn />];

export const DiscList = (props: ListProps) => (
    <List {...props} perPage={25} filters={filters}>
        <Datagrid rowClick="edit" expand={(props) => <DiscPanel {...props} />}>
            <TextField source="title" />
            <TextField source="description" />
            <TextField source="label" />
            <NumberField
                source="releaseDate"
                options={{ useGrouping: false }}
            />
            <TextField source="thumbnailFile" />
        </Datagrid>
    </List>
);

const ThumbnailField = (props: UseRecordContextParams) => {
    const { source } = props;
    const record = useRecordContext(props);
    return (
        record && (
            <div css={{ height: 200, width: 200, position: 'relative' }}>
                <img
                    css={{ height: '100%', width: '100%', objectFit: 'fill' }}
                    src={`${DISC_THUMB_URI}/${record[source]}`}
                    alt="thumbnail"
                />
            </div>
        )
    );
};

export const DiscShow = (props: ShowProps) => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="title" />
            <TextField source="description" />
            <TextField source="label" />
            <NumberField
                source="releaseDate"
                options={{ useGrouping: false }}
            />
            <TextField source="thumbnailFile" />
            <ThumbnailField source="thumbnailFile" />
            <ArrayField source="discLinks">
                <Datagrid>
                    <TextField source="type" label="Distributor" />
                    <UrlField
                        source="url"
                        label="Url"
                        target="_blank"
                        rel="noopener noreferrer"
                    />
                </Datagrid>
            </ArrayField>
        </SimpleShowLayout>
    </Show>
);

const DeleteDiscLink = () => {
    const record = useRecordContext();
    const [deleteOne] = useDelete<RaRecord<Identifier>, AdminError>();
    const notify = useNotify();
    const refresh = useRefresh();

    const handleClick = () => {
        console.log(record);
        record &&
            deleteOne(
                'disc-links',
                {
                    id: record.id,
                },
                {
                    onError: (error) => {
                        notify(error.message, { type: 'error' });
                    },
                    onSuccess: () => {
                        notify(`Deleted disc-link ${record.id}`);
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

const EditDiscLink: MutateForm = ({ setShowDialog }) => {
    const [update, { isLoading }] = useUpdate<
        RaRecord<Identifier>,
        AdminError
    >();
    const { handleSubmit } = useFormContext();
    const notify = useNotify();
    const record = useRecordContext();
    const refresh = useRefresh();

    const onSubmit = async (values: Partial<RaRecord>) => {
        const { disc, ...vals } = values;
        update(
            'disc-links',
            {
                id: values.id,
                data: vals,
            },
            {
                onSuccess: () => {
                    setShowDialog(false);
                    notify(`Successfully updated disc-link ${values.id}.`, {
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
                        source="id"
                        defaultValue={record.id}
                        fullWidth
                        disabled
                    />
                    <TextInput
                        source="disc"
                        label="Disc ID"
                        defaultValue={record.disc.id}
                        fullWidth
                        disabled
                    />
                    <TextInput
                        source="type"
                        validate={required()}
                        defaultValue={record.type}
                        fullWidth
                    />
                    <TextInput
                        source="url"
                        validate={required()}
                        defaultValue={record.url}
                        fullWidth
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
        )
    );
};

const AddDiscLink: React.FC<{
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
            'disc-links',
            {
                data: values,
            },
            {
                onSuccess: () => {
                    setShowDialog(false);
                    notify('Created disc-link.', {
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
                        source="disc"
                        label="Disc ID"
                        defaultValue={record.id}
                        fullWidth
                        disabled
                    />
                    <TextInput source="type" validate={required()} fullWidth />
                    <TextInput source="url" validate={required()} fullWidth />
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

export const DiscEdit = (props: EditProps) => {
    return (
        <Edit {...props}>
            <SimpleForm>
                <TextInput source="id" fullWidth disabled />
                <TextInput source="title" fullWidth />
                <TextInput source="description" fullWidth multiline />
                <TextInput source="label" />
                <NumberInput source="releaseDate" />
                <TextInput source="thumbnailFile" />
                <ArrayField source="discLinks">
                    <Datagrid
                        empty={<Empty assoc="Disc Links" />}
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
                        <TextField source="type" label="Distributor" />
                        <UrlField
                            source="url"
                            label="Url"
                            target="_blank"
                            rel="noopener noreferrer"
                        />
                        <EditReferenceButton
                            reference="disc-links"
                            Component={EditDiscLink}
                        />
                        <DeleteDiscLink />
                    </Datagrid>
                </ArrayField>
                <AddReferenceButton
                    reference="disc-links"
                    Component={AddDiscLink}
                />
            </SimpleForm>
        </Edit>
    );
};

export const DiscCreate = (props: CreateProps) => {
    return (
        <Create {...props}>
            <SimpleForm>
                <TextInput source="title" validate={required()} fullWidth />
                <TextInput
                    source="description"
                    validate={required()}
                    fullWidth
                />
                <TextInput source="label" validate={required()} />
                <NumberInput source="releaseDate" />
                <TextInput source="thumbnailFile" />
            </SimpleForm>
        </Create>
    );
};