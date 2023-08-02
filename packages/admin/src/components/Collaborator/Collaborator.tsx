import { Box } from '@mui/material';
import { formatInTimeZone } from 'date-fns-tz';
import * as React from 'react';
import {
    ArrayField,
    Create,
    CreateProps,
    Datagrid,
    DateField,
    Edit,
    EditProps,
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
} from 'react-admin';

const filters = [<SearchInput key="search" source="q" alwaysOn />];

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
                        `/calendar-collaborators/${record.calendarCollaborator.id}`
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