import {
    Create,
    Edit,
    List,
    NumberField,
    NumberInput,
    Show,
    SimpleForm,
    SimpleList,
    SimpleShowLayout,
    TextField,
    TextInput,
    type CreateProps,
    type EditProps,
    type ListProps,
    type ShowProps,
} from 'react-admin';

export const FaqList = (props: ListProps) => (
    <List {...props} perPage={25} sort={{ field: 'order', order: 'ASC' }}>
        <SimpleList
            primaryText={<TextField source="answer" />}
            secondaryText={<TextField source="question" />}
            linkType="show"
        />
    </List>
);

export const FaqShow = (props: ShowProps) => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="id" fullWidth />
            <NumberField source="order" />
            <TextField source="question" fullWidth />
            <TextField source="answer" fullWidth />
        </SimpleShowLayout>
    </Show>
);

export const FaqEdit = (props: EditProps) => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="id" fullWidth disabled />
            <NumberInput source="order" />
            <TextInput source="question" fullWidth multiline />
            <TextInput source="answer" fullWidth multiline />
        </SimpleForm>
    </Edit>
);

export const FaqCreate = (props: CreateProps) => (
    <Create {...props}>
        <SimpleForm>
            <NumberInput source="order" />
            <TextInput source="question" fullWidth multiline />
            <TextInput source="answer" fullWidth multiline />
        </SimpleForm>
    </Create>
);
