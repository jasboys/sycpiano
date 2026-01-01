import { Box, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import {
    ArrayInput,
    Button,
    Create,
    CreateButton,
    type CreateProps,
    Datagrid,
    Edit,
    type EditProps,
    FileField,
    FileInput,
    FilterButton,
    FunctionField,
    type GetListResult,
    ImageField,
    ImageInput,
    List,
    type ListProps,
    NumberField,
    NumberInput,
    SearchInput,
    SelectInput,
    Show,
    type ShowProps,
    SimpleForm,
    SimpleFormIterator,
    SimpleShowLayout,
    TextField,
    TextInput,
    TopToolbar,
    type UseRecordContextParams,
    useNotify,
    useRecordContext,
    useRefresh,
} from 'react-admin';
import { useWatch } from 'react-hook-form';
import { useAppDataProvider } from 'src/providers/restProvider.js';
import type { AdminError } from 'src/types.js';
import { IMAGES_URI } from 'src/uris';

export const ProductTypes = ['arrangement', 'cadenza', 'original'] as const;

const productTypeChoices = ProductTypes.map((v) => ({
    id: v,
    name: v,
}));

export interface ProductAttributes {
    id: string;
    file: string;
    name: string;
    permalink: string;
    description: string;
    sample: string;
    images: string[];
    pages: number;
    price: number; // in cents
    priceID: string;
    purchasedCount: number;
    type: (typeof ProductTypes)[number];
}

const ThumbnailField = ({ path }: { path: string }) => {
    return (
        <div css={{ width: 200, height: 200, position: 'relative' }}>
            <img
                src={`${IMAGES_URI}/products/thumbnails/${path}`}
                alt="thumbnail"
                css={{ objectFit: 'fill', height: '100%', width: '100%' }}
            />
        </div>
    );
};

const Thumbnails = (props: UseRecordContextParams) => {
    const { source } = props;
    const record = useRecordContext(props);
    return (
        record && (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {(record[source] as string[]).map((url: string, idx) => (
                    <li style={{ margin: '0.1em 0' }} key={url}>
                        <TextField
                            defaultValue={url}
                            source={`${source}[${idx}]`}
                        />
                        <ThumbnailField path={url} />
                    </li>
                ))}
            </ul>
        )
    );
};

const PullButton = () => {
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useAppDataProvider();
    const { mutate, isPending } = useMutation<GetListResult, AdminError>({
        mutationFn: () => dataProvider.pull('products', {}),

        onSuccess: () => {
            refresh();
            notify('Pull Succeeded');
        },
        onError: (error) =>
            notify(`Error: ${error.message}`, { type: 'warning' }),
    });
    return (
        <Button
            label="Pull From Stripe"
            onClick={() => mutate()}
            disabled={isPending}
        />
    );
};

const PurchasedCountButton = () => {
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useAppDataProvider();
    const { mutate, isPending } = useMutation<GetListResult, AdminError>({
        mutationFn: () => dataProvider.purchasedCount('products', {}),

        onSuccess: () => {
            refresh();
            notify('Purchased Count Population Succeeded');
        },
        onError: (error) =>
            notify(`Error: ${error.message}`, { type: 'warning' }),
    });
    return (
        <Button
            label="Populate Purchased"
            onClick={() => mutate()}
            disabled={isPending}
        />
    );
};

const Empty = () => {
    return (
        <Box textAlign="center" m={1}>
            <Typography variant="h4" paragraph>
                No products available
            </Typography>
            <Typography variant="body1">
                Create one or import from Stripe
            </Typography>
            <CreateButton />
            <PurchasedCountButton />
            <PullButton />
        </Box>
    );
};

const filters = [<SearchInput key="search" source="q" alwaysOn />];

const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
        <PurchasedCountButton />
        <PullButton />
    </TopToolbar>
);

export const ProductList = (props: ListProps) => (
    <List
        {...props}
        actions={<ListActions />}
        perPage={25}
        filters={filters}
        empty={<Empty />}
    >
        <Datagrid rowClick="edit">
            <NumberField source="purchasedCount" />
            <TextField source="name" />
            <TextField source="file" />
            <TextField source="permalink" />
            <NumberField source="pages" />
            <TextField source="sample" />
            <Thumbnails source="images" />
            <FunctionField
                label="price"
                render={(record?: Record<string, any>) =>
                    `$${(record?.price / 100).toFixed(2)}`
                }
            />
            <TextField source="type" />
        </Datagrid>
    </List>
);

export const ProductShow = (props: ShowProps) => (
    <Show {...props}>
        <SimpleShowLayout>
            <NumberField source="purchasedCount" />
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="file" />
            <TextField source="permalink" />
            <TextField source="description" />
            <NumberField source="pages" />
            <TextField source="sample" />
            <Thumbnails source="images" label="Images" addLabel={true} />
            <TextField source="price" label="Price in cents" />
            <FunctionField
                label="Price in dollars"
                render={(record?: Record<string, any>) =>
                    `$${(record?.price / 100).toFixed(2)}`
                }
            />
            <TextField source="type" />
            <TextField source="priceID" label="priceId" />
        </SimpleShowLayout>
    </Show>
);

const EditFields = () => {
    const pdfFile = useWatch({ name: 'pdf' });

    return (
        <>
            <TextInput source="name" fullWidth />
            <TextInput source="file" fullWidth />
            <TextInput
                source="fileName"
                defaultValue={pdfFile?.title}
                fullWidth
            />
            <FileInput source="pdf" fullWidth>
                <FileField source="src" title="title" />
            </FileInput>
            <TextInput source="permalink" fullWidth />
            <TextInput source="description" fullWidth multiline />
            <NumberInput source="pages" />
            <TextInput source="sample" fullWidth />
            <ArrayInput source="images">
                <SimpleFormIterator>
                    <TextInput source="" key={Math.random()} />
                </SimpleFormIterator>
            </ArrayInput>
            <TextInput source="imageBaseNameWithExt" fullWidth />
            <ImageInput source="newImages" multiple>
                <ImageField source="src" title="title" />
            </ImageInput>
            <NumberInput source="price" helperText="in cents" />
            <SelectInput source="type" choices={productTypeChoices} />
        </>
    );
};

export const ProductEdit = (props: EditProps) => (
    <Edit {...props}>
        <SimpleForm>
            <EditFields />
        </SimpleForm>
    </Edit>
);

const CreateFields = () => {
    const pdfFile = useWatch({ name: 'pdf' });

    return (
        <>
            <TextInput source="name" fullWidth />
            <TextInput
                source="fileName"
                defaultValue={pdfFile?.title}
                fullWidth
            />
            <FileInput source="pdf" fullWidth>
                <FileField source="src" title="title" />
            </FileInput>
            <TextInput source="permalink" fullWidth />
            <TextInput source="description" fullWidth multiline />
            <NumberInput source="pages" />
            <TextInput source="sample" fullWidth />
            <TextInput source="imageBaseNameWithExt" fullWidth />
            <ImageInput source="newImages" multiple>
                <ImageField source="src" title="title" />
            </ImageInput>
            <NumberInput source="price" helperText="in cents" />
            <SelectInput source="type" choices={productTypeChoices} />
        </>
    );
};

export const ProductCreate = (props: CreateProps) => (
    <Create {...props}>
        <SimpleForm>
            <CreateFields />
        </SimpleForm>
    </Create>
);
