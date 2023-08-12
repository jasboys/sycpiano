import { Box } from '@mui/material';
import { formatInTimeZone } from 'date-fns-tz';
import {
    ArrayField,
    Create,
    CreateButton,
    CreateProps,
    Datagrid,
    DateField,
    Edit,
    EditProps,
    FilterButton,
    FunctionField,
    List,
    ListProps,
    NumberField,
    RaRecord,
    SearchInput,
    Show,
    ShowProps,
    SimpleForm,
    Tab,
    TabbedShowLayout,
    TextField,
    TextInput,
    TopToolbar,
    useRedirect,
} from 'react-admin';
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
                        `/calendars/${record.id}/collaborators`
                    }
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

export const CollaboratorList = (props: ListProps) => {
    return (
        <List
            {...props}
            perPage={25}
            filters={filters}
            sort={{ field: 'name', order: 'ASC' }}
            actions={<ListActions />}
        >
            <Datagrid rowClick="edit" expand={<ExpandPanel />}>
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

export const CollaboratorEdit = (props: EditProps) => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="id" fullWidth disabled />
            <TextInput source="name" multiline={true} fullWidth={true} />
            <TextInput source="instrument" multiline={true} fullWidth={true} />
        </SimpleForm>
    </Edit>
);