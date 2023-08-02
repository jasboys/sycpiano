import { default as MUITextField } from '@mui/material/TextField';
import * as React from 'react';
import {
    ArrayField,
    BooleanInput,
    Datagrid,
    Edit,
    EditProps,
    FormDataConsumer,
    FormTab,
    TabbedForm,
    TextField,
    TextInput,
    useRefresh,
} from 'react-admin';
import { toUTC } from 'src/utils.js';
import {
    AddCalendarCollaboratorForm,
    AddCalendarPieceForm,
} from './AddRelations.jsx';
import {
    DeleteCalendarCollaborator,
    DeleteCalendarPiece,
} from './DeleteRelations.jsx';
import {
    EditCalendarCollaborator,
    EditCalendarPiece,
} from './EditRelations.jsx';
import { EndDate } from './EndDate.jsx';
import { AddReferenceButton, EditReferenceButton, Empty } from '../Shared.jsx';

export const CalendarEdit = (props: EditProps) => {
    const [pieceVersion] = React.useState(0);
    const [collabVersion] = React.useState(0);
    const refresh = useRefresh();
    return (
        <Edit key={`${pieceVersion} ${collabVersion}`} {...props}>
            <TabbedForm>
                <FormTab label="Event Info">
                    <TextInput source="name" fullWidth />
                    {/* <DateTimeInput source="dateTime" /> */}
                    <TextInput
                        source="dateTimeInput"
                        helperText="YYYY-MM-DD HH:MM"
                    />
                    <FormDataConsumer>
                        {({ formData }) => (
                            <MUITextField
                                label="Date time UTC"
                                variant="filled"
                                value={
                                    toUTC(
                                        formData.dateTimeInput,
                                        formData.timezone,
                                    ) ||
                                    formData.dateTime ||
                                    ''
                                }
                                margin="dense"
                                helperText=" "
                                disabled
                                sx={{ width: 256 }}
                            />
                        )}
                    </FormDataConsumer>
                    <BooleanInput source="allDay" />
                    <EndDate sx={{ field: { width: 256 } }} />
                    <TextInput source="timezone" disabled />
                    <TextInput source="location" fullWidth />
                    <TextInput source="type" fullWidth />
                    <TextInput source="website" fullWidth />
                    <BooleanInput source="usePlacePhoto" />
                    <TextInput source="imageUrl" fullWidth />
                    <TextInput source="photoReference" fullWidth />
                    <TextInput source="placeId" disabled />
                </FormTab>
                <FormTab label="Pieces" path="pieces">
                    <ArrayField source="pieces" fieldKey="order">
                        <Datagrid
                            key={pieceVersion}
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
                        >
                            <TextField source="order" />
                            <TextField source="composer" />
                            <TextField source="piece" />
                            <EditReferenceButton
                                reference="calendar-pieces"
                                Component={EditCalendarPiece}
                                onRefresh={refresh}
                            />
                            <DeleteCalendarPiece onRefresh={refresh} />
                        </Datagrid>
                    </ArrayField>
                    <AddReferenceButton
                        reference="calendar-pieces"
                        Component={AddCalendarPieceForm}
                        onRefresh={refresh}
                    />
                </FormTab>
                <FormTab label="Collaborators" path="collaborators">
                    <ArrayField source="collaborators" fieldKey="order">
                        <Datagrid
                            empty={<Empty assoc="Collaborators" />}
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
                        >
                            <TextField source="order" />
                            <TextField source="name" />
                            <TextField source="instrument" />
                            <EditReferenceButton
                                reference="calendar-collaborators"
                                Component={EditCalendarCollaborator}
                                onRefresh={refresh}
                            />
                            <DeleteCalendarCollaborator onRefresh={refresh} />
                        </Datagrid>
                    </ArrayField>
                    <AddReferenceButton
                        reference="calendar-collaborators"
                        Component={AddCalendarCollaboratorForm}
                        onRefresh={refresh}
                    />
                </FormTab>
            </TabbedForm>
        </Edit>
    );
};