import type * as React from 'react';
import {
    ArrayField,
    Create,
    type CreateProps,
    Datagrid,
    DataTable,
    Edit,
    type EditProps,
    type Identifier,
    List,
    type ListProps,
    type RaRecord,
    Show,
    type ShowProps,
    SimpleForm,
    SimpleShowLayout,
    TextField,
    TextInput,
} from 'react-admin';
import { AddReferenceButton, EditReferenceButton, Empty } from '../Shared.jsx';
import { AddProgramPieceForm } from './AddProgramPiece.jsx';
import { DeleteProgramPiece } from './DeleteProgramPiece.jsx';
import { EditProgramPiece } from './EditProgramPiece.jsx';

const PieceList: React.FC<{
    id: Identifier;
    record: RaRecord;
    resource: string;
}> = () => {
    return (
        <ArrayField source="pieces">
            <Datagrid
                bulkActionButtons={false}
                rowClick={(_, __, record) => `/pieces/${record.id}`}
            >
                <TextField source="composer" />
                <TextField source="piece" />
            </Datagrid>
        </ArrayField>
    );
};

export const ProgramList = (props: ListProps) => (
    <List {...props} perPage={25}>
        <Datagrid rowClick="show" expand={(props) => <PieceList {...props} />}>
            <TextField source="id" />
            <TextField source="nickname" />
            <ArrayField source="pieces">
                <DataTable rowClick={(_, __, record) => `/pieces/${record.id}`} bulkActionButtons={false}>
                    <DataTable.Col source="order" />
                    <DataTable.Col source="composer" />
                    <DataTable.Col source="piece" />
                </DataTable>
            </ArrayField>
        </Datagrid>
    </List>
);

export const ProgramShow = (props: ShowProps) => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="nickname" />
            <ArrayField source="pieces">
                <Datagrid rowClick={(_, __, record) => `/pieces/${record.id}`}>
                    <DataTable.Col source="order" />
                    <TextField source="composer" />
                    <TextField source="piece" />
                </Datagrid>
            </ArrayField>
        </SimpleShowLayout>
    </Show>
);


export const ProgramEdit = (props: EditProps) => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="id" disabled fullWidth />
            <TextInput source="nickname" fullWidth />
            <ArrayField source="pieces">
                <Datagrid
                    empty={<Empty assoc="Pieces" />}
                    sx={{
                        marginBottom: '1rem',
                        '& .column-undefined': {
                            paddingRight: 0,
                            paddingLeft: 0,
                        },
                        '& .column-undefined:last-of-type': {
                            paddingLeft: 0,
                            paddingRight: '1rem',
                        },
                    }}
                    rowClick={false}
                >
                    <TextField source="composer" />
                    <TextField source="piece" />
                    <EditReferenceButton
                        reference="program-pieces"
                        Component={EditProgramPiece}
                    />
                    <DeleteProgramPiece />
                </Datagrid>
            </ArrayField>
            <AddReferenceButton reference="program-pieces" Component={AddProgramPieceForm} />
        </SimpleForm>
    </Edit>
);

export const ProgramCreate = (props: CreateProps) => {
    return (
        <Create {...props}>
            <SimpleForm>
                <TextInput source="nickname" fullWidth/>
            </SimpleForm>
        </Create>
    );
};