import type * as React from 'react';
import {
    BooleanField,
    BooleanInput,
    Create,
    Datagrid,
    DateField,
    DateInput,
    Edit,
    FunctionField,
    List,
    Show,
    SimpleForm,
    SimpleShowLayout,
    TextField,
    TextInput,
    type CreateProps,
    type EditProps,
    type Identifier,
    type ListProps,
    type RaRecord,
    type ShowProps,
} from 'react-admin';

const AcclaimsPanel: React.FC<{
    id: Identifier;
    record: RaRecord;
    resource: string;
}> = ({ record }) => {
    return <div>{record.quote}</div>;
};

export const AcclaimCreate = (props: CreateProps) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="quote" multiline={true} fullWidth={true} />
            <TextInput source="short" multiline={true} fullWidth={true} />
            <TextInput source="author" fullWidth={true} />
            <TextInput source="short_author" fullWidth={true} />
            <TextInput source="website" />
            <BooleanInput source="has_full_date" />
            <DateInput source="date" />
        </SimpleForm>
    </Create>
);

export const AcclaimList = (props: ListProps) => {
    return (
        <List {...props} perPage={25}>
            <Datagrid
                rowClick="edit"
                expand={(props) => <AcclaimsPanel {...props} />}
            >
                <TextField source="id" />
                <FunctionField
                    label="Quote"
                    render={(record: RaRecord | undefined) =>
                        record
                            ? record.short
                                ? record.short
                                : record.quote
                            : ''
                    }
                />
                <FunctionField
                    label="Author"
                    render={(record: RaRecord | undefined) =>
                        record
                            ? record.short_author
                                ? record.short_author
                                : record.author
                            : ''
                    }
                />
                <TextField source="website" />
                <BooleanField source="has_full_date" />
                <DateField source="date" />
            </Datagrid>
        </List>
    );
};

export const AcclaimShow = (props: ShowProps) => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="quote" />
            <TextField source="short" />
            <TextField source="author" />
            <TextField source="short_author" />
            <TextField source="website" />
            <BooleanField source="has_full_date" />
            <DateField source="date" />
        </SimpleShowLayout>
    </Show>
);

export const AcclaimEdit = (props: EditProps) => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="id" disabled={true} fullWidth={true} />
            <TextInput source="quote" multiline={true} fullWidth={true} />
            <TextInput source="short" multiline={true} fullWidth={true} />
            <TextInput source="author" fullWidth={true} />
            <TextInput source="short_author" fullWidth={true} />
            <TextInput source="website" />
            <BooleanInput source="has_full_date" />
            <DateInput source="date" />
        </SimpleForm>
    </Edit>
);