import IconCancel from '@mui/icons-material/Cancel';
import { DialogActions, DialogContent } from '@mui/material';

import { useMutation } from '@tanstack/react-query';
import {
    Button,
    type Identifier,
    type RaRecord,
    SaveButton,
    TextInput,
    useNotify,
    useRecordContext,
    useRefresh,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { useAppDataProvider } from '../../providers/restProvider.js';
import type { MutateForm } from '../../types.js';

export const ExtractProgram: MutateForm = ({ setShowDialog }) => {
    const dataProvider = useAppDataProvider();
    const { handleSubmit } = useFormContext();

    const notify = useNotify();
    const record = useRecordContext();
    const refresh = useRefresh();

    const { mutate, isPending } = useMutation({
        mutationFn: (data: { id: Identifier, nickname?: string }) => {
            return dataProvider.extractProgram('programs', data)
        },
        onSuccess: () => {
            setShowDialog(false);
            notify(
                `Successfully extracted program from calendar ${record?.id}.`,
                {
                    type: 'success',
                    undoable: false,
                },
            );
            refresh();
        },
        onError: (error) => {
            notify(error.message, { type: 'error' });
        },
    });

    const onSubmit = async (values: Partial<RaRecord>) => {
        const { nickname } = values;
        record?.id && mutate(
            {
                id: record.id,
                nickname,
            }
        );
    };

    return (
        record && (
            <>
                <DialogContent>
                    <TextInput
                        label="Calendar ID"
                        source="id"
                        defaultValue={record.id}
                        disabled
                        fullWidth
                    />
                    <TextInput label="nickname" source="nickname" fullWidth />
                </DialogContent>
                <DialogActions>
                    <Button
                        label="ra.action.cancel"
                        onClick={() => setShowDialog(false)}
                        disabled={isPending}
                    >
                        <IconCancel />
                    </Button>
                    <SaveButton
                        onClick={handleSubmit(onSubmit)}
                        type="button"
                        disabled={isPending}
                        alwaysEnable={true}
                    />
                </DialogActions>
            </>
        )
    );
};