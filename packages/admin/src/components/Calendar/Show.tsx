import {
    type ShowProps,
    Show,
    TabbedShowLayout,
    Tab,
    TextField,
    BooleanField,
    UrlField,
    ImageField,
    ArrayField,
    Datagrid,
    Empty,
} from 'react-admin';

export const CalendarShow = (props: ShowProps) => (
    <Show {...props}>
        <TabbedShowLayout>
            <Tab label="Event Info">
                <TextField source="name" />
                <TextField source="dateTime" />
                <BooleanField source="allDay" />
                <TextField source="endDate" />
                <TextField source="timezone" />
                <TextField source="location" />
                <TextField source="type" />
                <UrlField
                    source="website"
                    target="_blank"
                    rel="noopener noreferrer"
                />
                <UrlField
                    source="imageUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                />
                <ImageField source="imageUrl" />
            </Tab>
            <Tab label="Pieces">
                <ArrayField source="pieces">
                    <Datagrid empty={<Empty />}>
                        <TextField source="order" />
                        <TextField source="composer" />
                        <TextField source="piece" />
                    </Datagrid>
                </ArrayField>
            </Tab>
            <Tab label="Collaborators">
                <ArrayField source="collaborators">
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
