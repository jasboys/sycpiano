import IconMerge from '@mui/icons-material/Merge.js';
import { Box } from '@mui/material';
import { formatInTimeZone } from 'date-fns-tz';
import {
    ArrayField,
    Button,
    Create,
    CreateButton,
    Datagrid,
    DateField,
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

const MergeAction = ({ selectedIds }: { selectedIds?: Identifier[] }) => {
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useAppDataProvider();
    const { mutate, isPending } = useMutation({
        mutationFn: () =>
            dataProvider.merge('pieces', {
                ids: selectedIds ?? [],
            }),

        onSuccess: () => {
            refresh();
            notify('Merging of pieces succeeded.');
        },
        onError: (error) => notify(`Error: ${error}`, { type: 'warning' }),
    });
    return (
        <Button label={'Merge'} onClick={() => mutate()} disabled={isPending}>
            <IconMerge />
        </Button>
    );
};

const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
        <TrimButton resource="pieces" />
    </TopToolbar>
);

export const PieceCreate = (props: CreateProps) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="composer" multiline={true} fullWidth={true} />
            <TextInput source="piece" multiline={true} fullWidth={true} />
        </SimpleForm>
    </Create>
);

const ExpandPanel = () => {
    return (
        <Box mb={1}>
            <ArrayField source="calendars">
                <Datagrid
                    rowClick={(_, __, record) =>
                        `/calendars/${record.id}/pieces`
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
                    <NumberField label="Order" source="calendarPiece.order" />
                </Datagrid>
            </ArrayField>
        </Box>
    );
};

const BulkActions = () => (
    <>
        <MergeAction />
    </>
);

export const PieceList = (props: ListProps) => {
    const { canAccess } = useCanAccess({
        action: 'edit',
        resource: 'pieces',
    });
    return (
        <List
            {...props}
            perPage={25}
            filters={filters}
            sort={{ field: 'composer,piece', order: 'ASC,ASC' as any }}
            actions={<ListActions />}
        >
            <Datagrid
                rowClick={canAccess ? "edit" : "show"}
                expand={<ExpandPanel />}
                bulkActionButtons={<BulkActions />}
            >
                <TextField source="id" />
                <TextField source="composer" />
                <TextField source="piece" />
            </Datagrid>
        </List>
    );
};

export const PieceShow = (props: ShowProps) => (
    <Show {...props}>
        <TabbedShowLayout>
            <Tab label="Info">
                <TextField source="id" />
                <TextField source="composer" />
                <DateField source="piece" />
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
            return dataProvider.mergeInto('pieces', {
                id: record.id,
            });
        },

        onError: (error) => {
            notify(error.message, { type: 'error' });
        },
        onSuccess: () => {
            notify(`Merged others into piece ${record?.id}`);
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

export const PieceEdit = (props: EditProps) => (
    <Edit actions={<EditActions />} {...props}>
        <SimpleForm>
            <TextInput source="id" fullWidth disabled />
            <TextInput source="composer" multiline={true} fullWidth={true} />
            <TextInput source="piece" multiline={true} fullWidth={true} />
        </SimpleForm>
    </Edit>
);