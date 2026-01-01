import {
    ArrayField,
    BooleanField,
    Datagrid,
    FunctionField,
    type Identifier,
    List,
    type ListProps,
    type RaRecord,
    SearchInput,
    TextField,
    useCanAccess,
} from 'react-admin';
import { DateTime, Empty } from '../Shared.jsx';
import { BulkActionButtons, ListActions } from './Actions.jsx';

const filters = [<SearchInput key="search" source="q" alwaysOn />];

const CalendarPanel: React.FC<{
    id: Identifier;
    record: RaRecord;
    resource: string;
}> = () => {
    return (
        <>
            <ArrayField source="collaborators">
                <Datagrid
                    empty={<Empty assoc="collaborators" />}
                    sx={{ marginBottom: '1rem' }}
                    isRowSelectable={() => false}
                    bulkActionButtons={false}
                >
                    <TextField source="name" />
                    <TextField source="instrument" />
                </Datagrid>
            </ArrayField>
            <ArrayField source="pieces">
                <Datagrid
                    empty={<Empty assoc="pieces" />}
                    sx={{ marginBottom: '1rem' }}
                    isRowSelectable={() => false}
                    bulkActionButtons={false}
                >
                    <TextField source="composer" />
                    <TextField source="piece" />
                </Datagrid>
            </ArrayField>
        </>
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
                <DateTime />
                <BooleanField source="allDay" />
                <BooleanField source="hidden" />
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