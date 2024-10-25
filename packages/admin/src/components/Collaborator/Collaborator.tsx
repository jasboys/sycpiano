import IconMerge from '@mui/icons-material/Merge.js';
import { Box } from '@mui/material';
import { formatInTimeZone } from 'date-fns-tz';
import {
    ArrayField,
    Button,
    Create,
    CreateButton,
    Datagrid,
    Edit,
    FilterButton,
    FunctionField,
    List,
    ListButton,
    NumberField,
    SearchInput,
    Show,
    ShowButton,
    SimpleForm,
    Tab,
    TabbedShowLayout,
    TextField,
    TextInput,
    TopToolbar,
    useCanAccess,
    useNotify,
    useRecordContext,
    useRefresh,
    type CreateProps,
    type EditProps,
    type GetOneResult,
    type Identifier,
    type ListProps,
    type ShowProps,
} from 'react-admin';
import { useMutation } from '@tanstack/react-query';
import { useAppDataProvider } from 'src/providers/restProvider.js';
import type { AdminError } from 'src/types.js';
import { TrimButton } from '../Shared.jsx';

const filters = [<SearchInput key="search" source="q" alwaysOn />];

const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
        <TrimButton resource="collaborators" />
    </TopToolbar>
);

export const CollaboratorCreate = (props: CreateProps) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="name" multiline={true} fullWidth={true} />
            <TextInput source="instrument" multiline={true} fullWidth={true} />
        </SimpleForm>
    </Create>
);

const ExpandPanel = () => {
    return (
        <Box mb={1}>
            <ArrayField source="calendars">
                <Datagrid
                    rowClick={(_id, _basePath, record) =>
                        `/calendars/${record.id}/show`
                    }
                    bulkActionButtons={false}
                >
                    <TextField source="name" />
                    <FunctionField
                        label="Date Time"
                        render={(record: Record<string, any>) =>
                            formatInTimeZone(
                                record?.dateTime,
                                record?.timezone || 'America/Chicago',
                                'yyyy-MM-dd HH:mm zzz',
                            )
                        }
                    />
                    <NumberField
                        label="Order"
                        source="collaboratorPiece.order"
                    />
                </Datagrid>
            </ArrayField>
        </Box>
    );
};

const MergeAction = ({ selectedIds }: { selectedIds?: Identifier[] }) => {
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useAppDataProvider();
    const { mutate, isPending } = useMutation({
        mutationFn: () =>
            dataProvider.merge('collaborators', {
                ids: selectedIds ?? [],
            }),

        onSuccess: () => {
            refresh();
            notify('Merging of collaborators succeeded.', { undoable: true });
        },
        onError: (error) => notify(`Error: ${error}`, { type: 'warning' }),
    });
    return (
        <Button label={'Merge'} onClick={() => mutate()} disabled={isPending}>
            <IconMerge />
        </Button>
    );
};

const BulkActions = () => (
    <>
        <MergeAction />
    </>
);

export const CollaboratorList = (props: ListProps) => {
    const { canAccess } = useCanAccess({
        action: 'edit',
        resource: 'collaborators',
    });
    return (
        <List
            {...props}
            perPage={25}
            filters={filters}
            sort={{ field: 'name', order: 'ASC' }}
            actions={<ListActions />}
        >
            <Datagrid
                rowClick={canAccess ? 'edit' : 'show'}
                expand={<ExpandPanel />}
                bulkActionButtons={<BulkActions />}
            >
                <TextField source="id" />
                <TextField source="name" />
                <TextField source="instrument" />
            </Datagrid>
        </List>
    );
};

export const CollaboratorShow = (props: ShowProps) => (
    <Show {...props}>
        <TabbedShowLayout>
            <Tab label="Info">
                <TextField source="id" />
                <TextField source="name" />
                <TextField source="instrument" />
            </Tab>
            <Tab label="Calendars">
                <ExpandPanel />
            </Tab>
        </TabbedShowLayout>
    </Show>
);

const MergeButton = () => {
    const record = useRecordContext();
    const dataProvider = useAppDataProvider();
    const refresh = useRefresh();
    const notify = useNotify();
    const { mutate, isPending } = useMutation<GetOneResult, AdminError>({
        mutationFn: () => {
            if (!record) {
                throw 'Record is undefined';
            }
            return dataProvider.mergeInto('collaborators', {
                id: record.id,
            });
        },

        onError: (error) => {
            notify(error.message, { type: 'error' });
        },
        onSuccess: () => {
            notify(`Merged others into collaborator ${record?.id}`);
            refresh();
        },
    });

    return (
        <Button
            label="Merge Others"
            onClick={() => mutate()}
            disabled={isPending}
        >
            <IconMerge />
        </Button>
    );
};

const EditActions = () => {
    return (
        <TopToolbar>
            <ShowButton />
            <MergeButton />
            <ListButton />
        </TopToolbar>
    );
};

export const CollaboratorEdit = (props: EditProps) => (
    <Edit actions={<EditActions />} {...props}>
        <SimpleForm>
            <TextInput source="id" fullWidth disabled />
            <TextInput source="name" multiline={true} fullWidth={true} />
            <TextInput source="instrument" multiline={true} fullWidth={true} />
        </SimpleForm>
    </Edit>
);