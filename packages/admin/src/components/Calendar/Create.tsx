import { TextField as MUITextField } from '@mui/material';
import {
    BooleanInput,
    Create,
    type CreateProps,
    FormDataConsumer,
    required,
    SimpleForm,
    TextInput,
} from 'react-admin';
import { toUTC } from '../../utils.js';
import { EndDate } from './EndDate.jsx';

export const CalendarCreate = (props: CreateProps) => {
    return (
        <Create {...props}>
            <SimpleForm>
                <TextInput source="name" fullWidth/>
                <TextInput
                    source="dateTimeInput"
                    helperText="YYYY-MM-DD HH:MM"
                    validate={required()}
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
                <BooleanInput source="hidden" />
                <EndDate />
                <TextInput source="timezone" disabled />
                <TextInput source="location" fullWidth validate={required()} />
                <TextInput source="type" validate={required()} />
                <TextInput source="website" fullWidth />
                <TextInput source="imageUrl" fullWidth />
            </SimpleForm>
        </Create>
    );
};