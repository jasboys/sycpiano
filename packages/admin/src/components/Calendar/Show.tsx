import {
	ShowProps,
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
	UseRecordContextParams,
	useRecordContext,
} from "react-admin";

const GAPI_KEY = import.meta.env.PUBLIC_GAPI_KEY;

const getGooglePlacePhoto = (photoReference: string, maxHeight: number) =>
	`https://maps.googleapis.com/maps/api/place/photo?maxheight=${maxHeight}&photo_reference=${photoReference}&key=${GAPI_KEY}`;

const PlacePhotoField = (props: UseRecordContextParams) => {
	const { source } = props;
	const record = useRecordContext(props);
	return (
		record[source] && (
			<div style={{ height: 200, width: 200, position: "relative" }}>
				<img
					src={getGooglePlacePhoto(record[source], 200)}
					alt="thumbnail"
					style={{ height: "100%" }}
				/>
			</div>
		)
	);
};

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
