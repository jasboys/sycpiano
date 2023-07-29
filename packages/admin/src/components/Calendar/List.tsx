import { formatInTimeZone } from "date-fns-tz";
import React from "react";
import {
	Identifier,
	useNotify,
	useRefresh,
	Button,
	TopToolbar,
	FilterButton,
	CreateButton,
	BulkActionProps,
	ListProps,
	List,
	Datagrid,
	TextField,
	FunctionField,
	RaRecord,
	BooleanField,
	UrlField,
	SearchInput,
} from "react-admin";

import { useMutation } from "react-query";
import { useAppDataProvider } from "../../providers/restProvider.js";

const filters = [<SearchInput key="search" source="q" alwaysOn />];

const PopulateImageFieldsButton = ({
	selectedIds,
}: { selectedIds?: Identifier[] }) => {
	const notify = useNotify();
	const refresh = useRefresh();
	const dataProvider = useAppDataProvider();
	const { mutate, isLoading } = useMutation(
		() =>
			dataProvider.populateImageFields(
				"calendars",
				selectedIds ? { ids: selectedIds } : {},
			),
		{
			onSuccess: () => {
				refresh();
				notify("Populating Succeeded");
			},
			onError: (error) => notify(`Error: ${error}`, { type: "warning" }),
		},
	);
	return (
		<Button
			label="Populate Image Fields"
			onClick={() => mutate()}
			disabled={isLoading}
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
			sort={{ field: "dateTime", order: "DESC" }}
			actions={<ListActions />}
		>
			<Datagrid
				sx={{
					"& .RaDatagrid-rowCell": {
						overflow: "hidden",
					},
				}}
				style={{ tableLayout: "fixed" }}
				rowClick="edit"
				bulkActionButtons={<PostBulkActionButtons />}
			>
				<TextField source="name" />
				<FunctionField
					label="Date Time"
					render={(record: RaRecord | undefined) =>
						formatInTimeZone(
							record?.dateTime,
							record?.timezone || "America/Chicago",
							"yyyy-MM-dd HH:mm zzz",
						)
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
						record?.imageUrl === null ? "null" : record?.imageUrl
					}
				/>
				<TextField source="photoReference" />
				<TextField source="placeId" />
			</Datagrid>
		</List>
	);
};