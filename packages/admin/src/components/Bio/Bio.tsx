import {
    Create,
    type CreateProps,
    Edit,
    type EditProps,
    List,
    type ListProps,
    NumberField,
    NumberInput,
    Show,
    type ShowProps,
    SimpleForm,
    SimpleList,
    SimpleShowLayout,
    TextField,
    TextInput,
} from 'react-admin';

export const BioCreate = (props: CreateProps) => (
    <Create {...props}>
        <SimpleForm>
            <NumberInput source="paragraph" />
            <TextInput source="text" multiline={true} fullWidth={true} />
        </SimpleForm>
    </Create>
);

export const BioList = (props: ListProps) => {
    return (
        <List {...props} perPage={25} sort={{ field: 'paragraph', order: 'ASC' }}>
            <SimpleList
                primaryText={record => record.text}
                tertiaryText={record => record.paragraph}
            />
        </List>
    );
};

export const BioShow = (props: ShowProps) => (
    <Show {...props}>
        <SimpleShowLayout>
            <NumberField source="paragraph" />
            <TextField source="text" />
        </SimpleShowLayout>
    </Show>
);

export const BioEdit = (props: EditProps) => (
    <Edit {...props}>
        <SimpleForm>
            <NumberInput source="paragraph" />
            <TextInput
                source="text"
                multiline
                fullWidth
                size="medium"/>
        </SimpleForm>
    </Edit>
);