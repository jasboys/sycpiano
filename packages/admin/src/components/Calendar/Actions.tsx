import { useMutation } from '@tanstack/react-query';
import {
    BulkDeleteButton,
    Button,
    CreateButton,
    FilterButton,
    type Identifier,
    TopToolbar,
    useListContext,
    useNotify,
    useRedirect,
    useRefresh,
} from 'react-admin';
import { useAppDataProvider } from '../../providers/restProvider.js';


export const PopulateImageFieldsButton = () => {
    const context = useListContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useAppDataProvider();
    const { mutate, isPending } = useMutation({
        mutationFn: (ids?: Identifier[]) =>
            dataProvider.populateImageFields('calendars', ids ? { ids } : {}),

        onSuccess: () => {
            refresh();
            notify('Populating Succeeded');
        },
        onError: (error) => notify(`Error: ${error}`, { type: 'warning' }),
    });
    return (
        <Button
            label="Populate Image Fields"
            onClick={() => mutate(context.selectedIds)}
            disabled={isPending}
        />
    );
};

export const DuplicateButton = () => {
    const notify = useNotify();
    const context = useListContext();
    const dataProvider = useAppDataProvider();
    const redirect = useRedirect();
    const { mutate, isPending } = useMutation({
        mutationFn: (ids?: Identifier[]) => {
            console.log(ids);
            if (ids?.length !== 1) {
                return Promise.reject('Only select one event to duplicate');
            } else {
                return dataProvider.duplicate('calendars', { id: ids[0] });
            }
        },

        onSuccess: ({ data }) => {
            notify('Duplication Succeeded');
            redirect('edit', 'calendars', data.id);
        },
        onError: (error) => notify(`Error: ${error}`, { type: 'warning' }),
    });
    return (
        <Button
            label="Duplicated Selected Event"
            onClick={() => mutate(context.selectedIds)}
            disabled={isPending}
        />
    );
};

export const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
        <PopulateImageFieldsButton />
    </TopToolbar>
);

export const BulkActionButtons = () => (
    <>
        <PopulateImageFieldsButton />
        <DuplicateButton />
        <BulkDeleteButton />
    </>
);