import {
    DialogTitle,
    DialogContent,
    Dialog,
    DialogActions,
    Button as MuiButton,
    Typography,
    SxProps
} from '@mui/material';
import IconCancel from '@mui/icons-material/Cancel.js';
import IconDelete from '@mui/icons-material/Delete.js';
import EditIcon from '@mui/icons-material/Edit.js';
import { default as MUITextField } from '@mui/material/TextField';
import * as React from 'react';
import {
    ArrayField,
    AutocompleteInput,
    BooleanField,
    BooleanInput,
    BulkActionProps,
    Button,
    Create,
    CreateButton,
    CreateProps,
    Datagrid,
    DeleteButton,
    Edit,
    EditProps,
    FilterButton,
    FormDataConsumer,
    FormTab,
    Form,
    FunctionField,
    Identifier,
    List,
    ListProps,
    NumberInput,
    ReferenceInput,
    SaveButton,
    SearchInput,
    Show,
    ShowProps,
    SimpleForm,
    Tab,
    TabbedForm,
    TabbedShowLayout,
    TextField,
    TextInput,
    TextInputProps,
    TopToolbar,
    UrlField,
    useCreate,
    useDataProvider,
    useNotify,
    useRecordContext,
    UseRecordContextParams,
    useRefresh,
    useUpdate,
    RaRecord,
    useDeleteWithConfirmController,
    useDelete,
    useRedirect,
    useChoicesContext,
} from 'react-admin';
import { useMutation, useQueryClient } from 'react-query';
import { useLocation } from 'react-router';
import { formatInTimeZone } from 'date-fns-tz';
import { toUTC } from '../utils.js';
import { useForm, useFormContext, useFormState, useWatch } from 'react-hook-form';
import { useAppDataProvider } from '../providers/restProvider.js';

const GAPI_KEY = import.meta.env.PUBLIC_GAPI_KEY;

const getGooglePlacePhoto = (photoReference: string, maxHeight: number) =>
    `https://maps.googleapis.com/maps/api/place/photo?maxheight=${maxHeight}&photo_reference=${photoReference}&key=${GAPI_KEY}`;

const filters = [
    <SearchInput key="search" source="q" alwaysOn />
];

const PopulateImageFieldsButton = ({ selectedIds }: { selectedIds?: Identifier[] }) => {
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useAppDataProvider();
    const { mutate, isLoading } = useMutation(
        () => dataProvider.populateImageFields('calendars', selectedIds ? { ids: selectedIds } : {}),
        {
            onSuccess: () => {
                refresh();
                notify('Populating Succeeded');
            },
            onError: (error) => notify(`Error: ${error}`, { type: 'warning' }),
        });
    return <Button
        label="Populate Image Fields"
        onClick={() => mutate()}
        disabled={isLoading}
    />;
};

const ListActions = (_props: any) => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
        <PopulateImageFieldsButton />
    </TopToolbar>
);

const PostBulkActionButtons = (props: BulkActionProps) => (
    <>
        <PopulateImageFieldsButton {...props} />
    </>
);

/*    id?: string;
    name: string;
    dateTime: Date;
    allDay: boolean;
    endDate: Date;
    timezone: string;
    location: string;
    type: string;
    website: string;
    */

export const CalendarList = (props: ListProps) => {
    return (
        <List
            {...props}
            perPage={25}
            filters={filters}
            sort={{ field: 'dateTime', order: 'DESC' }}
            actions={<ListActions />}
        >
            <Datagrid
                sx={{
                    '& .RaDatagrid-rowCell': {
                        overflow: 'hidden',
                    }
                }}
                style={{ tableLayout: 'fixed' }}
                rowClick="edit"
                bulkActionButtons={<PostBulkActionButtons />}
            >
                <TextField source="name" />
                <FunctionField
                    label="Date Time"
                    render={(record: RaRecord | undefined) =>
                        formatInTimeZone(record?.dateTime, record?.timezone || 'America/Chicago', "yyyy-MM-dd HH:mm zzz")
                    }
                />
                <BooleanField source="allDay" />
                <TextField source="endDate" />
                <TextField source="timezone" />
                <TextField source="location" />
                <TextField source="type" />
                <UrlField source="website" target="_blank" rel="noopener noreferrer" />
                <BooleanField source="usePlacePhoto" />
                <FunctionField
                    label="imageUrl"
                    render={(record: RaRecord | undefined) =>
                        record?.imageUrl === null ? 'null' : record?.imageUrl
                    }
                />
                <TextField source="photoReference" />
                <TextField source="placeId" />
            </Datagrid>
        </List>
    )
};

const Empty = () => (
    <Typography>
        No associated collaborators found.
    </Typography>
);

const PlacePhotoField = (props: UseRecordContextParams) => {
    const { source } = props;
    const record = useRecordContext(props);
    return record[source] && (
        <div style={{ height: 200, width: 200, position: 'relative' }}>
            <img src={getGooglePlacePhoto(record[source], 200)} alt="thumbnail" style={{ height: '100%' }} />
        </div>
    );
};

const ImageField = (props: UseRecordContextParams) => {
    const { source } = props;
    const record = useRecordContext(props);
    return record[source] && (
        <div style={{ height: 200, width: 200, position: 'relative' }}>
            <img src={record[source]} alt="thumbnail" style={{ height: '100%' }} />
        </div>
    );
};

export const CalendarShow = (props: ShowProps) => (
    <Show {...props}>
        <TabbedShowLayout >
            <Tab label="Event Info">
                <TextField source="name" />
                <TextField source="dateTime" />
                <BooleanField source="allDay" />
                <TextField source="endDate" />
                <TextField source="timezone" />
                <TextField source="location" />
                <TextField source="type" />
                <UrlField source="website" target="_blank" rel="noopener noreferrer" />
                <BooleanField source="usePlacePhoto" />
                <UrlField source="imageUrl" target="_blank" rel="noopener noreferrer" />
                <ImageField source="imageUrl" />
                <TextField source="placeId" />
                <TextField source="photoReference" />
                <PlacePhotoField source="photoReference" />
            </Tab>
            <Tab label="Pieces">
                <ArrayField source="pieces" fieldKey="order" fullWidth>
                    <Datagrid empty={<Empty />}>
                        <TextField source="order" />
                        <TextField source="composer" />
                        <TextField source="piece" />
                    </Datagrid>
                </ArrayField>
            </Tab>
            <Tab label="Collaborators">
                <ArrayField source="collaborators" fieldKey="order" fullWidth>
                    <Datagrid empty={<Empty />}>
                        <TextField source="order" />
                        <TextField source="name" />
                        <TextField source="instrument" />
                    </Datagrid>
                </ArrayField>
            </Tab>
        </TabbedShowLayout>
    </Show>
);

const EndDate = ({ sx }: { sx?: SxProps }) => {
    const allDay = useWatch({ name: 'allDay' });
    const { setValue, resetField } = useFormContext();

    React.useEffect(() => {
        if (allDay === false) {
            setValue('endDate', null);
            resetField('endDate');
        }
    }, [allDay]);

    return (
        <TextInput source="endDate" disabled={!allDay} sx={sx} />
    )
};

interface ControllerInputProps extends TextInputProps {
    property: string;
}

const ControlledInput = ({ source, property, ...rest }: ControllerInputProps) => {
    const { selectedChoices } = useChoicesContext();

    // React.useEffect(() => {
    //     console.log(formState.values[controller]);
    //     if (formState.values[controller]) {
    //         setValue(source, null);
    //         resetField(source);
    //     }
    // }, [formState, form, controller, source]);

    return (
        <TextInput
            source={source}
            disabled={!!selectedChoices[0]}
            defaultValue={selectedChoices[0]?.[property]}
            {...rest}
        />
    )
};

// const useStyles = makeStyles({
//     createButton: {
//         '& span span': {
//             paddingRight: '0.5em'
//         }
//     },
// });

const DeleteCalendarPiece: React.FC<{ onRefresh: () => void; }> = ({ onRefresh }) => {
    const record = useRecordContext();
    const [deleteOne] = useDelete();
    const notify = useNotify();

    const handleClick = () => {
        console.log(record);
        deleteOne(
            'calendar-pieces',
            {
                id: record.calendarPieces[0].id
            },
            {
                mutationMode: 'pessimistic',
                onError: (error: any) => {
                    notify(error.message, { type: 'error' });
                },
                onSuccess: () => {
                    notify(`Deleted calendar-piece ${ record.calendarPieces[0].id }`);
                    onRefresh();
                }
            },
        )
    }

    return (
        <MuiButton
            onClick={handleClick}
        >
            <IconDelete sx={{ fill: '#d32f2f' }}/>
        </MuiButton>
    );
};

const DeleteCalendarCollaborator: React.FC<{ onRefresh: () => void; }> = ({ onRefresh }) => {
    const record = useRecordContext();
    const [deleteOne] = useDelete();
    const notify = useNotify();

    const handleClick = () => {
        console.log(record);
        deleteOne(
            'calendar-collaborators',
            {
                id: record.calendarCollaborators[0].id
            },
            {
                mutationMode: 'pessimistic',
                onError: (error: any) => {
                    notify(error.message, { type: 'error' });
                },
                onSuccess: () => {
                    notify(`Deleted calendar-collaborator ${ record.calendarCollaborators[0].id }`);
                    onRefresh();
                }
            },
        )
    }

    return (
        <MuiButton
            onClick={handleClick}
        >
            <IconDelete sx={{ fill: '#d32f2f' }}/>
        </MuiButton>
    );
};

export const CalendarCreate = (props: CreateProps) => {
    return (
        <Create {...props}>
            <SimpleForm>
                <TextInput source="name" />
                <TextInput source="dateTimeInput" helperText="YYYY-MM-DD HH:MM" />
                <FormDataConsumer>
                    {({ formData }) => (
                        <MUITextField
                            label="Date time UTC"
                            variant="filled"
                            value={(formData.dateTimeInput) ? (
                                formData.timezone ?
                                    toUTC(formData.dateTimeInput, formData.timezone) :
                                    toUTC(formData.dateTimeInput, Intl.DateTimeFormat().resolvedOptions().timeZone)
                            ) : ''}
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

type MutateForm = React.FC<{ setShowDialog: (t: boolean) => void; onRefresh: () => void; }>;

const EditCalendarPiece: MutateForm = ({ setShowDialog, onRefresh }) => {
    const [update, { isLoading }] = useUpdate();
    const { handleSubmit } = useFormContext();
    const { dirtyFields } = useFormState();
    const notify = useNotify();
    const record = useRecordContext();

    const onSubmit = async (values: Partial<RaRecord>) => {
        const { order, calendarPieces } = values;
        const id = calendarPieces[0].id;
        const data: Record<string, unknown> = {
            order: order
        };
        if (dirtyFields['composer'] || dirtyFields['piece']) {
            data['pieceId'] = values.id;
            data['composer'] = values.composer;
            data['pieceName'] = values.piece;
        }
        update('calendar-pieces',
            {
                id,
                data,
            },
            {
                mutationMode: 'pessimistic',
                onSuccess: () => {
                    setShowDialog(false);
                    notify(`Successfully updated calendar-piece ${id}.`, {
                        type: 'success',
                        undoable: true,
                    });
                    onRefresh();
                },
                onError: (error: any) => {
                    notify(error.message, { type: 'error' });
                }
            }
        );
    };

    return (
        <>
            <DialogContent>
                <TextInput label="Calendar-Piece Id" source="calendarPieces[0].id" defaultValue={record.calendarPieces[0].id} disabled fullWidth />
                <TextInput source="composer" fullWidth />
                <TextInput source="piece" fullWidth />
                <NumberInput source="order" defaultValue={record.order} />
            </DialogContent>
            <DialogActions>
                <Button
                    label="ra.action.cancel"
                    onClick={() => setShowDialog(false)}
                    disabled={isLoading}
                >
                    <IconCancel />
                </Button>
                <SaveButton
                    onClick={handleSubmit(onSubmit)}
                    type="button"
                    disabled={isLoading}
                />
            </DialogActions>
        </>
    )
}

const EditCalendarCollaborator: MutateForm = ({ setShowDialog, onRefresh }) => {
    const [update, { isLoading }] = useUpdate();
    const { handleSubmit } = useFormContext();
    const { dirtyFields } = useFormState();
    const notify = useNotify();
    const record = useRecordContext();

    const onSubmit = async (values: Partial<RaRecord>) => {
        const { order, calendarCollaborators } = values;
        const id = calendarCollaborators[0].id;
        const data: Record<string, unknown> = {
            order: order
        };
        if (dirtyFields['name'] || dirtyFields['instrument']) {
            data['collaboratorId'] = values.id;
            data['name'] = values.name;
            data['instrument'] = values.instrument;
        }
        update('calendar-collaborators',
            {
                id,
                data,
            },
            {
                mutationMode: 'pessimistic',
                onSuccess: () => {
                    setShowDialog(false);
                    notify(`Successfully updated calendar-collaborator ${id}.`, {
                        type: 'success',
                        undoable: true,
                    });
                    onRefresh();
                },
                onError: (error: any) => {
                    notify(error.message, { type: 'error' });
                }
            }
        );
    };

    return (
        <>
            <DialogContent>
                <TextInput label="Calendar-Collaborator Id" source="calendarCollaborators[0].id" defaultValue={record.calendarCollaborators[0].id} disabled fullWidth />
                <TextInput source="name" fullWidth />
                <TextInput source="instrument" fullWidth />
                <NumberInput source="order" defaultValue={record.order} />
            </DialogContent>
            <DialogActions>
                <Button
                    label="ra.action.cancel"
                    onClick={() => setShowDialog(false)}
                    disabled={isLoading}
                >
                    <IconCancel />
                </Button>
                <SaveButton
                    onClick={handleSubmit(onSubmit)}
                    type="button"
                    disabled={isLoading}
                />
            </DialogActions>
        </>
    );
};

const EditReferenceButton: React.FC<{ reference: string, Component: MutateForm, onRefresh: () => void; }> = ({ reference, Component, onRefresh }) => {
    const [showDialog, setShowDialog] = React.useState(false);
    return (
        <>
            <MuiButton
                onClick={() => setShowDialog(true)}
            >
                <EditIcon />
            </MuiButton>
            <Dialog
                fullWidth
                open={showDialog}
                onClose={() => setShowDialog(true)}
            >
                <DialogTitle>{`Edit ${reference}`}</DialogTitle>
                <Form>
                    <Component setShowDialog={setShowDialog} onRefresh={onRefresh} />
                </Form>
            </Dialog>
        </>
    );
};


const AddCalendarPieceForm: React.FC<{ setShowDialog: (t: boolean) => void }> = ({ setShowDialog }) => {
    const record = useRecordContext();
    const [create, { isLoading }] = useCreate();
    const { handleSubmit, getValues } = useFormContext();
    const notify = useNotify();
    const refresh = useRefresh();

    const onSubmit = async (values: Partial<RaRecord>) => {
        create(
            'calendar-pieces',
            {
                data:
                {
                    calendarId: values.id,
                    order: values.order,
                    ...values.piece,
                }
            },
            {
                onSuccess: () => {
                    setShowDialog(false);
                    notify(`Created calendar-piece.`, {
                        type: 'success',
                    });
                    refresh();
                },
                onError: (error: any) => {
                    notify(error.message, { type: 'error' });
                }
            }
        );
    };

    return (
        <>
            <DialogContent>
                <TextInput label="Calendar ID" source="id" defaultValue={record.id} disabled fullWidth />
                <ReferenceInput
                    source="piece.id"
                    reference="pieces"
                >
                    <>
                        <AutocompleteInput
                            fullWidth
                            source="piece.id"
                            label="Existing Piece"
                            filterToQuery={searchText => ({ q: searchText.replaceAll(/[:-]/g, '').replaceAll(/\s+/g, ' ') })}
                            optionText={(record) => record ? `${record.composer}: ${record.piece}` : ''}
                            shouldRenderSuggestions={(val: string) => { return val.trim().length > 2 }}
                        />
                        <ControlledInput source="piece.composer" property="composer" fullWidth />
                        <ControlledInput source="piece.piece" property="piece" fullWidth />
                    </>
                </ReferenceInput>
                <NumberInput source="order" />
            </DialogContent>
            <DialogActions>
                <Button
                    label="ra.action.cancel"
                    onClick={() => setShowDialog(false)}
                    disabled={isLoading}
                >
                    <IconCancel />
                </Button>
                <SaveButton
                    onClick={handleSubmit(onSubmit)}
                    type="button"
                    disabled={isLoading}
                />
            </DialogActions>
        </>
    );
}

const AddCalendarCollaboratorForm: React.FC<{ setShowDialog: (t: boolean) => void }> = ({ setShowDialog }) => {
    const record = useRecordContext();
    const [create, { isLoading }] = useCreate();
    const { handleSubmit, getValues } = useFormContext();
    const notify = useNotify();
    const refresh = useRefresh();

    const onSubmit = async (values: Partial<RaRecord>) => {
        create(
            'calendar-collaborators',
            {
                data:
                {
                    calendarId: values.id,
                    order: values.order,
                    ...values.collaborator,
                }
            },
            {
                onSuccess: () => {
                    setShowDialog(false);
                    notify(`Created calendar-collaborator.`, {
                        type: 'success',
                        undoable: true,
                    });
                    refresh();
                },
                onError: (error: any) => {
                    notify(error.message, { type: 'error' });
                }
            }
        );
    };

    return (
        <>
            <DialogContent>
                <TextInput label="Calendar ID" source="id" defaultValue={record.id} disabled fullWidth />
                <ReferenceInput
                    source="collaborator.id"
                    reference="collaborators"
                >
                    <>
                        <AutocompleteInput
                            fullWidth
                            source="collaborator.id"
                            label="Existing Collaborator"
                            filterToQuery={searchText => ({ q: searchText.replaceAll(/[:-]/g, '').replaceAll(/\s+/g, ' ') })}
                            optionText={(record) => record ? `${record.name}: ${record.instrument}` : ''}
                            shouldRenderSuggestions={(val: string) => { return val.trim().length > 2 }}
                        />
                        <ControlledInput source="collaborator.name" property="name" fullWidth />
                        <ControlledInput source="collaborator.instrument" property="instrument" fullWidth />
                    </>
                </ReferenceInput>
                <NumberInput source="order" />
            </DialogContent>
            <DialogActions>
                <Button
                    label="ra.action.cancel"
                    onClick={() => setShowDialog(false)}
                    disabled={isLoading}
                >
                    <IconCancel />
                </Button>
                <SaveButton
                    onClick={handleSubmit(onSubmit)}
                    type="button"
                    disabled={isLoading}
                />
            </DialogActions>
        </>
    );
};

const AddReferenceButton: React.FC<{ reference: string; Component: MutateForm, onRefresh: () => void; }> = ({ reference, Component, onRefresh }) => {
    const [showDialog, setShowDialog] = React.useState(false);

    return (
        <>
            <Button
                onClick={() => setShowDialog(true)}
                label="ra.action.create"
                sx={{
                    '& span span': {
                        paddingRight: '0.5em'
                    }
                }}
                variant="outlined"
            />
            <Dialog
                fullWidth
                open={showDialog}
                onClose={() => setShowDialog(false)}
            >
                <DialogTitle>{`Create ${reference}`}</DialogTitle>
                <Form>
                    <Component setShowDialog={setShowDialog} onRefresh={onRefresh}/>
                </Form>
            </Dialog>
        </>
    );
};

const utcToZone = (dt: string, tz: string) => formatInTimeZone(dt, tz || 'America/Chicago', "yyyy-MM-dd HH:mm");

// const DateTimeInput = () => {
//     const record = useRecordContext();
//     const formState = useFormState();
//     const fieldState = useField('dateTimeInput', {
//         initialValue: utcToZone(record['dateTime'], ),
//     });
//     const form = useForm();
//     const [helper, setHelper] = React.useState(formState.values[source]);

//     React.useEffect(() => {
//         const newDate = startOfMinute(parse(formState.values['dateTimeInput'], "yyyy-MM-dd HH:mm", new Date())).toISOString();
//         console.log(newDate);
//         if ()
//     }, [formState, form, source, record, setHelper])

//     return (
//         <MUITextField
//             label="Date Time Input"
//             name="dateTimeInput"
//             variant="filled"
//             {...fieldState.input}
//             // format={(v: Date | string) => formatInTimeZone(v, record?.timezone || 'America/Chicago', "yyyy-MM-dd HH:mm")}
//         />
//     )
// }

export const CalendarEdit = (props: EditProps) => {
    const [pieceVersion, setPieceVersion] = React.useState(0);
    const [collabVersion, setCollabVersion] = React.useState(0);
    const refresh = useRefresh();
    return (
        <Edit key={`${pieceVersion} ${collabVersion}`} {...props}>
            <TabbedForm>
                <FormTab label="Event Info">
                    <TextInput source="name" fullWidth />
                    {/* <DateTimeInput source="dateTime" /> */}
                    <TextInput source="dateTimeInput" helperText="YYYY-MM-DD HH:MM" />
                    <FormDataConsumer>
                        {({ formData }) => (
                            <MUITextField
                                label="Date time UTC"
                                variant="filled"
                                value={toUTC(formData.dateTimeInput, formData.timezone) || formData.dateTime || ''}
                                margin="dense"
                                helperText=" "
                                disabled
                                sx={{ width: 256 }}
                            />
                        )}
                    </FormDataConsumer>
                    <BooleanInput source="allDay" />
                    <EndDate sx={{ field: { width: 256 }}} />
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
                            empty={<Empty />}
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
                                onRefresh={refresh}/>
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
                            empty={<Empty />}
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
                                onRefresh={refresh} />
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