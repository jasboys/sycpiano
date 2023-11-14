import {
    Button,
    Create,
    CreateButton,
    CreateProps,
    Datagrid,
    DateField,
    Edit,
    EditProps,
    FunctionField,
    ImageField,
    ImageInput,
    List,
    ListProps,
    NumberInput,
    RaRecord,
    SelectInput,
    Show,
    ShowProps,
    SimpleForm,
    SimpleShowLayout,
    TextField,
    TextInput,
    TopToolbar,
    useNotify,
    useRecordContext,
    UseRecordContextParams,
    useRefresh,
} from 'react-admin';
import { useWatch } from 'react-hook-form';
import { useMutation } from 'react-query';
import { useAppDataProvider } from 'src/providers/restProvider.js';
import { IMAGES_URI } from 'src/uris.js';

const ThumbnailField = (props: UseRecordContextParams) => {
    const { source } = props;
    const record = useRecordContext(props);
    return (
        <img
            src={`${IMAGES_URI}/gallery/thumbnails/${record[source]}`}
            alt="thumbnail"
            height={record.thumbnailHeight / 2}
            width={record.thumbnailWidth / 2}
        />
    );
};

const FullImageField = (props: UseRecordContextParams) => {
    const { source } = props;
    const record = useRecordContext(props);
    return (
        <img
            src={`${IMAGES_URI}/gallery/${record[source]}`}
            alt="thumbnail"
            height={record.height / 2}
            width={record.width / 2}
        />
    );
};

export const DateTakenButton = () => {
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useAppDataProvider();
    const { mutate, isLoading } = useMutation(
        () => dataProvider.populateDateTaken('photos', {}),
        {
            onSuccess: () => {
                refresh();
                notify('Populating date_taken from EXIF succeeded');
            },
            onError: (error) => notify(`Error: ${error}`, { type: 'warning' }),
        },
    );
    return (
        <Button
            label={'Populate Photo Dates'}
            onClick={() => mutate()}
            disabled={isLoading}
        />
    );
};

const ListActions = () => (
    <TopToolbar>
        <CreateButton />
        <DateTakenButton />
    </TopToolbar>
);

export const PhotoList = (props: ListProps) => (
    <List {...props} perPage={25} actions={<ListActions />}>
        <Datagrid rowClick="edit">
            <TextField source="file" />
            <TextField source="credit" />
            <DateField source="dateTaken" />
            <FunctionField
                label="omitFromGallery"
                render={(record?: RaRecord) => {
                    const omit = record?.omitFromGallery;
                    return typeof omit === 'boolean' ? omit.toString() : 'null';
                }}
            />
            <FunctionField
                label="dimensions"
                render={(record?: RaRecord) =>
                    `${record?.width}x${record?.height}`
                }
            />
            <FunctionField
                label="thumbnail dimensions"
                render={(record?: RaRecord) =>
                    `${record?.thumbnailWidth}x${record?.thumbnailHeight}`
                }
            />
            <ThumbnailField source="file" />
        </Datagrid>
    </List>
);

export const PhotoShow = (props: ShowProps) => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="file" />
            <TextField source="credit" />
            <DateField source="dateTaken" />
            <FunctionField
                label="omitFromGallery"
                render={(record?: RaRecord) => {
                    const omit = record?.omitFromGallery;
                    return typeof omit === 'boolean' ? omit.toString() : 'null';
                }}
            />
            <FunctionField
                label="thumbnail dimensions"
                render={(record?: RaRecord) =>
                    `${record?.thumbnailWidth}x${record?.thumbnailHeight}`
                }
            />
            <ThumbnailField source="file" />
            <FunctionField
                label="dimensions"
                render={(record?: RaRecord) =>
                    `${record?.width}x${record?.height}`
                }
            />
            <FullImageField source="file" />
        </SimpleShowLayout>
    </Show>
);

export const PhotoEdit = (props: EditProps) => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="id" fullWidth disabled />
            <TextInput source="file" fullWidth />
            <TextInput source="credit" />
            <DateField source="dateTaken" disabled />
            <SelectInput
                source="omitFromGallery"
                choices={[
                    { id: true, name: 'true' },
                    { id: false, name: 'false' },
                    { id: null, name: 'null' },
                ]}
            />
            <NumberInput source="width" />
            <NumberInput source="height" />
            <NumberInput source="thumbnailWidth" />
            <NumberInput source="thumbnailHeight" />
        </SimpleForm>
    </Edit>
);

const PhotoFields = () => {
    const upload = useWatch({ name: 'photoBlob' });

    return (
        <>
            <TextInput source="file" defaultValue={upload?.title} fullWidth />
            <ImageInput accept="image/*" source="photoBlob">
                <ImageField source="src" title="title" />
            </ImageInput>
            <TextInput source="credit" />
            <SelectInput
                source="omitFromGallery"
                choices={[
                    { id: true, name: 'true' },
                    { id: false, name: 'false' },
                    { id: null, name: 'null' },
                ]}
            />
        </>
    );
};

export const PhotoCreate = (props: CreateProps) => {
    return (
        <Create {...props}>
            <SimpleForm>
                <PhotoFields />
            </SimpleForm>
        </Create>
    );
};
