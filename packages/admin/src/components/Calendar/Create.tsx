import { TextField as MUITextField } from '@mui/material';
import {
    BooleanInput,
    Create,
    CreateProps,
    FormDataConsumer,
    SimpleForm,
    TextInput,
} from 'react-admin';
import { toUTC } from '../../utils.js';
import { EndDate } from './EndDate.jsx';

export const CalendarCreate = (props: CreateProps) => {
    return (
        <Create {...props}>
            <SimpleForm>
                <TextInput source="name" />
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
                                formData.dateTimeInput
                                    ? formData.timezone
                                        ? toUTC(
                                              formData.dateTimeInput,
                                              formData.timezone,
                                          )
                                        : toUTC(
                                              formData.dateTimeInput,
                                              Intl.DateTimeFormat().resolvedOptions()
                                                  .timeZone,
                                          )
                                    : ''
                            }
                            margin="dense"
                            helperText=" "
                            disabled
                        />
                    )}
                </FormDataConsumer>
                <BooleanInput source="allDay" />
                <EndDate />
                <TextInput source="timezone" disabled />
                <TextInput source="location" />
                <TextInput source="type" />
                <TextInput source="website" />
                <TextInput source="imageUrl" />
            </SimpleForm>
        </Create>
    );
};