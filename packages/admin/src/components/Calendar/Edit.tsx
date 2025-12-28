import { Stack } from '@mui/material';
import { default as MUITextField } from '@mui/material/TextField';
import {
    ArrayField,
    BooleanInput,
    Datagrid,
    Edit,
    type EditProps,
    FormDataConsumer,
    FormTab,
    TabbedForm,
    TextField,
    TextInput,
} from 'react-admin';
import { toUTC } from 'src/utils.js';
import {
    AddReferenceButton,
    CustomFormButton,
    EditReferenceButton,
    Empty,
} from '../Shared.jsx';
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
import { ExtractProgram } from './ExtractProgram.jsx';

export const CalendarEdit = (props: EditProps) => {
    return (
        <Edit {...props}>
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
                    <BooleanInput source="hidden" />
                    <EndDate sx={{ field: { width: 256 } }} />
                    <TextInput source="timezone" disabled />
                    <TextInput source="location" fullWidth />
                    <TextInput source="type" fullWidth />
                    <TextInput source="website" fullWidth />
                    <TextInput source="imageUrl" fullWidth />
                </FormTab>
                <FormTab label="Pieces" path="pieces">
                    <CustomFormButton
                        action="Extract"
                        description="Extract Pieces into Program"
                        Component={ExtractProgram}
                    />
                    <ArrayField source="pieces">
                        <Datagrid
                            empty={<Empty assoc="Pieces" />}
                            sx={{
                                marginTop: '1rem',
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
                            <TextField source="order" />
                            <TextField source="composer" />
                            <TextField source="piece" />
                            <EditReferenceButton
                                reference="calendar-pieces"
                                Component={EditCalendarPiece}
                            />
                            <DeleteCalendarPiece />
                        </Datagrid>
                    </ArrayField>
                    <AddReferenceButton
                        reference="calendar-pieces"
                        Component={AddCalendarPieceForm}
                    />
                </FormTab>
                <FormTab label="Collaborators" path="collaborators">
                    <ArrayField source="collaborators">
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
                            rowClick={false}
                        >
                            <TextField source="order" />
                            <TextField source="name" />
                            <TextField source="instrument" />
                            <EditReferenceButton
                                reference="calendar-collaborators"
                                Component={EditCalendarCollaborator}
                            />
                            <DeleteCalendarCollaborator />
                        </Datagrid>
                    </ArrayField>
                    <AddReferenceButton
                        reference="calendar-collaborators"
                        Component={AddCalendarCollaboratorForm}
                    />
                </FormTab>
            </TabbedForm>
        </Edit>
    );
};