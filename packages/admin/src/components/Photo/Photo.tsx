import {
    Create,
    CreateProps,
    Datagrid,
    Edit,
    EditProps,
    FunctionField,
    ImageField,
    ImageInput,
    List,
    ListProps,
    NumberInput,
    RaRecord,
    Show,
    ShowProps,
    SimpleForm,
    SimpleShowLayout,
    TextField,
    TextInput,
    useRecordContext,
    UseRecordContextParams,
} from 'react-admin';
import { useWatch } from 'react-hook-form';
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

export const PhotoList = (props: ListProps) => (
    <List {...props} perPage={25}>
        <Datagrid rowClick="edit">
            <TextField source="file" />
            <TextField source="credit" />
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
