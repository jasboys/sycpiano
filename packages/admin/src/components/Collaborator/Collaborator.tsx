import { Box } from '@mui/material';
import { formatInTimeZone } from 'date-fns-tz';
import {
    ArrayField,
    BulkActionProps,
    Button,
    Create,
    CreateButton,
    CreateProps,
    Datagrid,
    DateField,
    Edit,
    EditProps,
    FilterButton,
    FunctionField,
    GetOneResult,
    Identifier,
    List,
    ListButton,
    ListProps,
    NumberField,
    RaRecord,
    SearchInput,
    Show,
    ShowButton,
    ShowProps,
    SimpleForm,
    Tab,
    TabbedShowLayout,
    TextField,
    TextInput,
    TopToolbar,
    useNotify,
    useRecordContext,
    useRefresh,
} from 'react-admin';
import { TrimButton } from '../Shared.jsx';
import { useMutation } from 'react-query';
import { useAppDataProvider } from 'src/providers/restProvider.js';
import { AdminError } from 'src/types.js';
import IconMerge from '@mui/icons-material/Merge.js';

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
                        `/calendars/${record.id}/collaborators`
                    }
                    bulkActionButtons={false}
                >
                    <TextField source="name" />
                    <FunctionField
                        label="Date Time"
                        render={(record: RaRecord | undefined) =>
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


const MergeAction = ({
    selectedIds,
}: { selectedIds?: Identifier[] }) => {
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useAppDataProvider();
    const { mutate, isLoading } = useMutation(
        () =>
            dataProvider.merge(
                'collaborators',
                {
                    ids: selectedIds ?? [],
                },
            ),
        {
            onSuccess: () => {
                refresh();
                notify('Merging of collaborators succeeded.', { undoable: true });
            },
            onError: (error) => notify(`Error: ${error}`, { type: 'warning' }),
        },
    );
    return (
        <Button
            label={"Merge"}
            onClick={() => mutate()}
            disabled={isLoading}
        >
            <IconMerge />
        </Button>
    );
};

const BulkActions = (props: BulkActionProps) => (
    <>
        <MergeAction {...props} />
    </>
)

export const CollaboratorList = (props: ListProps) => {
    return (
        <List
            {...props}
            perPage={25}
            filters={filters}
            sort={{ field: 'name', order: 'ASC' }}
            actions={<ListActions />}
        >
            <Datagrid rowClick="edit" expand={<ExpandPanel />} bulkActionButtons={<BulkActions />}>
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
                <DateField source="instrument" />
            </Tab>
        </TabbedShowLayout>
    </Show>
);


const MergeButton = () => {
    const record = useRecordContext();
    const dataProvider = useAppDataProvider();
    const refresh = useRefresh();
    const notify = useNotify();
    const { mutate, isLoading } = useMutation<GetOneResult, AdminError>(
        () =>
            dataProvider.mergeInto('collaborators', {
                id: record.id,
            }),
        {
            onError: (error) => {
                notify(error.message, { type: 'error' });
            },
            onSuccess: () => {
                notify(`Merged others into collaborator ${record.id}`);
                refresh();
            },
        },
    );

    return (
        <Button
            label="Merge Others"
            onClick={() => mutate()}
            disabled={isLoading}
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