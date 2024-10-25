import { formatInTimeZone } from 'date-fns-tz';
import {
    BooleanField,
    Button,
    CreateButton,
    Datagrid,
    FilterButton,
    FunctionField,
    List,
    type RaRecord,
    SearchInput,
    TextField,
    TopToolbar,
    UrlField,
    useNotify,
    useRefresh,
    type Identifier,
    type ListProps,
    ArrayField,
    useCanAccess,
} from 'react-admin';

import { useMutation } from '@tanstack/react-query';
import { useAppDataProvider } from '../../providers/restProvider.js';

const filters = [<SearchInput key="search" source="q" alwaysOn />];

const PopulateImageFieldsButton = ({
    selectedIds,
}: { selectedIds?: Identifier[] }) => {
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useAppDataProvider();
    const { mutate, isPending } = useMutation({
        mutationFn: () =>
            dataProvider.populateImageFields(
                'calendars',
                selectedIds ? { ids: selectedIds } : {},
            ),

            onSuccess: () => {
                refresh();
                notify('Populating Succeeded');
            },
            onError: (error) => notify(`Error: ${error}`, { type: 'warning' }),
        },
    );
    return (
        <Button
            label="Populate Image Fields"
            onClick={() => mutate()}
            disabled={isPending}
        />
    );
};

const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
        <PopulateImageFieldsButton />
    </TopToolbar>
);

const BulkActionButtons = () => (
    <>
        <PopulateImageFieldsButton />
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

const CalendarPanel: React.FC<{
    id: Identifier;
    record: RaRecord;
    resource: string;
}> = () => {
    return (
        <ArrayField source="collaborators">
            <Datagrid
                sx={{ marginBottom: '1rem' }}
                isRowSelectable={() => false}
                bulkActionButtons={false}
            >
                <TextField source="name" />
                <TextField source="instrument" />
            </Datagrid>
        </ArrayField>
    );
};

export const CalendarList = (props: ListProps) => {
    const { canAccess } = useCanAccess({
        action: 'edit',
        resource: 'calendars',
    });
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
                    },
                }}
                style={{ tableLayout: 'fixed' }}
                rowClick={canAccess ? 'edit' : 'show'}
                bulkActionButtons={<BulkActionButtons />}
                expand={(props) => <CalendarPanel {...props} />}
            >
                <TextField source="id" />
                <TextField source="name" />
                <FunctionField
                    label="Date Time"
                    source="dateTime"
                    render={(record: Record<string, any>) =>
                        formatInTimeZone(
                            record?.dateTime,
                            record?.timezone || 'America/Chicago',
                            'yyyy-MM-dd HH:mm zzz',
                        )
                    }
                />
                <BooleanField source="allDay" />
                <TextField source="endDate" />
                <TextField source="timezone" />
                <TextField source="location" />
                <TextField source="type" />
                <FunctionField
                    source="website"
                    render={(record: Record<string, any>) =>
                        !record?.website ? (
                            'null'
                        ) : (
                            <a
                                href={record.website}
                                target="_blank"
                                rel="noopener noreferrer"
                            >{`${record.website.substring(0, 16)}\u2026`}</a>
                        )
                    }
                />
                <FunctionField
                    label="imageUrl"
                    render={(record: Record<string, any>) =>
                        record?.imageUrl === null
                            ? 'null'
                            : `${record?.imageUrl.substring(0, 16)}\u2026`
                    }
                />
            </Datagrid>
        </List>
    );
};