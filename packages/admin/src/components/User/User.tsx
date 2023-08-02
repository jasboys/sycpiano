import * as React from 'react';
import {
    Datagrid,
    Identifier,
    List,
    ListProps,
    ShowProps,
    RaRecord,
    ArrayField,
    TextField,
    Show,
    SimpleShowLayout,
} from 'react-admin';

const ProductList: React.FC<{
    id: Identifier;
    record: RaRecord;
    resource: string;
}> = () => {
    return (
        <ArrayField source="products" fieldKey="id" fullWidth>
            <Datagrid>
                <TextField source="name" />
            </Datagrid>
        </ArrayField>
    );
};

export const UserList = (props: ListProps) => (
    <List {...props} perPage={25}>
        <Datagrid
            rowClick="show"
            expand={(props) => <ProductList {...props} />}
        >
            <TextField source="id" />
            <TextField source="username" />
            <TextField source="passHash" />
            <TextField source="role" />
            <TextField source="lastRequest" />
        </Datagrid>
    </List>
);

export const UserShow = (props: ShowProps) => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="username" />
            <TextField source="passHash" />
            <TextField source="role" />
            <TextField source="pasetoSecret" />
            <TextField source="resetToken" />
            <TextField source="session" />
            <TextField source="lastRequest" />
            <ArrayField source="products" fieldKey="id">
                <Datagrid>
                    <TextField source="name" />
                </Datagrid>
            </ArrayField>
        </SimpleShowLayout>
    </Show>
);
