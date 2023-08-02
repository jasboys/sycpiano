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
                        `/calendar-pieces/${record.calendarPiece.id}`
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
                    <NumberField label="Order" source="calendarPiece.order" />
                </Datagrid>
            </ArrayField>
        </Box>
    );
};

export const PieceList = (props: ListProps) => {
    return (
        <List
            {...props}
            perPage={25}
            filters={filters}
            sort={{ field: 'composer,piece', order: 'ASC,ASC' }}
        >
            <Datagrid rowClick="edit" expand={<ExpandPanel />}>
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

export const PieceEdit = (props: EditProps) => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="id" fullWidth disabled />
            <TextInput source="composer" multiline={true} fullWidth={true} />
            <TextInput source="piece" multiline={true} fullWidth={true} />
        </SimpleForm>
    </Edit>
);